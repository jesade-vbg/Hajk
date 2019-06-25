import React from "react";
import { createPortal } from "react-dom";
import LinearProgress from "@material-ui/core/LinearProgress";
import { withStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Observer from "react-event-observer";
import SearchWithTextInput from "./components/searchviews/SearchWithTextInput";
import SearchResultList from "./components/resultlist/SearchResultList.js";
import SearchBarStart from "./components/startview/SearchBarStart";
import SearchSettingsButton from "./components/shared/SearchSettingsButton";
import SearchWithRadiusInput from "./components/searchviews/SearchWithRadiusInput";
import SearchWithSelectionInput from "./components/searchviews/SearchWithSelectionInput";
import SearchWithPolygonInput from "./components/searchviews/SearchWithPolygonInput";
import SearchModel from "./SearchModel.js";
import PanelHeader from "./../../components/PanelHeader.js";
import { isMobile } from "../../utils/IsMobile.js";

const styles = theme => {
  return {
    center: {
      background: "white",
      borderRadius: "10px",
      margin: "0px 10px 10px 10px",
      //Boxshadow is the same as for card - Should maybe be changed to a card instead
      boxShadow:
        "0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0)",
      minWidth: "360px",
      pointerEvents: "all",
      [theme.breakpoints.up("sm")]: {
        maxWidth: "200px"
      },
      [theme.breakpoints.down("xs")]: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: "0 !important",
        border: "none",
        margin: 0,
        padding: 0,
        borderRadius: 0,
        boxShadow: "none"
      }
    },
    button: {
      margin: "4px"
    },
    panelHeader: {
      [theme.breakpoints.up("sm")]: {
        display: "none"
      }
    },
    panelBody: {
      padding: "8px",
      [theme.breakpoints.down("xs")]: {
        padding: "10px",
        overflowY: "auto !important",
        position: "absolute",
        bottom: 0,
        top: "46px",
        left: 0,
        right: 0
      }
    },
    searchButton: {
      borderRadius: 0,
      border: "solid"
    },
    searchContainer: {
      [theme.breakpoints.up("xs")]: {
        display: "flex",
        flex: "auto",
        alignItems: "center",
        backgroundColor: "#eee",
        borderRadius: theme.shape.borderRadius
      }
    },
    mainContainerButton: {
      display: "flex"
    },
    searchToolsContainer: {
      minHeight: "48px",
      display: "flex"
    },
    searchContainerTop: {
      display: "block",
      width: "330px",
      marginRight: "5px",
      [theme.breakpoints.down("sm")]: {
        display: "none",
        padding: "10px",
        position: "fixed",
        width: "calc(100vw - 20px)",
        left: 0,
        right: 0,
        top: 0,
        background: "white",
        bottom: 0,
        zIndex: 1,
        overflow: "auto"
      }
    },
    loader: {
      height: "4px",
      marginTop: "-5px",
      marginBottom: "4px",
      borderRadius: "4px",
      overflow: "hidden"
    },
    searchResults: {
      overflow: "visible",
      height: 0,
      [theme.breakpoints.down("xs")]: {
        height: "inherit"
      }
    },
    iconButtonHeader: {
      color: "black",
      padding: "3px",
      overflow: "visible",
      cursor: "pointer",
      [theme.breakpoints.up("md")]: {
        display: "none"
      }
    },
    iconButton: {
      color: "black",
      padding: "3px",
      overflow: "visible",
      cursor: "pointer",
      display: "none"
    },
    backIcon: {
      [theme.breakpoints.up("md")]: {
        display: "none"
      }
    }
  };
};

const POLYGON = "polygon";
const RADIUS = "radius";
const TEXTSEARCH = "textsearch";
const SELECTION = "selection";
const STARTVIEW = "startview";

class Search extends React.PureComponent {
  resolve = data => {
    this.setState({
      result: data
    });
  };

  constructor(props) {
    super(props);
    this.localObserver = Observer();
    this.searchModel = new SearchModel(
      props.options,
      props.map,
      props.app,
      this.localObserver
    );
    this.state = {
      visible: true,
      loading: false,
      activeSearchView: STARTVIEW
    };

    this.activeSpatialTools = {
      radiusSearch: this.props.options.radiusSearch,
      selectionSearch: this.props.options.selectionSearch,
      polygonSearch: this.props.options.polygonSearch
    };

    this.tooltip = props.options.tooltip;
    this.searchWithinButtonText = props.options.searchWithinButtonText;
    this.searchWithPolygonButtonText =
      props.options.searchWithPolygonButtonText;
    this.searchWithSelectionButtonText =
      props.options.searchWithSelectionButtonText;
    this.localObserver.on("searchStarted", () => {
      this.setState({
        loading: true,
        activeSearchView: TEXTSEARCH
      });
    });
    this.localObserver.on("spatialSearchStarted", () => {
      this.setState({
        loading: true
      });
    });
    this.localObserver.on("toolchanged", () => {
      this.setState({
        result: false
      });
    });
    this.localObserver.on("searchComplete", () => {
      this.setState({
        loading: false
      });
    });

    this.localObserver.on("minimizeWindow", () => {
      if (props.options.target === "header" && window.innerWidth < 960) {
        this.setState({
          visible: false
        });
      }
    });

    window.addEventListener("resize", e => {
      if (!isMobile) {
        this.setState({
          visible: true
        });
      }
    });
  }

  renderSearchResultList(target) {
    const { classes } = this.props;
    const { result } = this.state;
    if (!result) return null;
    return (
      <div className={classes.searchResults}>
        <SearchResultList
          localObserver={this.localObserver}
          result={result}
          renderAffectButton={this.activeSpatialTools.radiusSearch}
          model={this.searchModel}
          visible={true}
          target={target}
        />
      </div>
    );
  }

  renderLoader() {
    const { classes } = this.props;
    if (this.state.loading) {
      return (
        <div className={classes.loader}>
          <LinearProgress variant="query" />
        </div>
      );
    } else {
      return <div className={classes.loader} />;
    }
  }

  toggleSearch = () => {
    this.setState({
      visible: true
    });
    this.props.app.closePanels();
  };

  renderButton(target) {
    const { classes } = this.props;
    return (
      <SearchIcon
        className={
          target === "header" ? classes.iconButtonHeader : classes.iconButton
        }
        onClick={this.toggleSearch}
      />
    );
  }

  renderCenter() {
    const { classes } = this.props;
    var searchBar;

    if (this.state.activeSearchView === STARTVIEW) {
      searchBar = this.renderSearchBarStart();
    } else if (this.state.activeSearchView === TEXTSEARCH) {
      searchBar = this.renderSearchWithText();
    }

    return (
      <div
        className={classes.center}
        style={{
          display: this.state.visible ? "block" : "none",
          top: this.state.minimized ? "calc(100vh - 110px)" : "0"
        }}
      >
        <div className={classes.panelHeader}>
          <PanelHeader
            maximizable={false}
            localObserver={this.localObserver}
            title="Sök"
            onClose={() => {
              this.setState({
                visible: false
              });
            }}
            onMinimize={() => {
              this.setState({
                minimized: true
              });
            }}
            onMaximize={() => {
              this.setState({
                minimized: false
              });
            }}
          />
        </div>
        <div
          className={classes.panelBody}
          style={{
            height: this.state.minimized ? 0 : "auto",
            overflow: this.state.minimized ? "hidden" : "visible"
          }}
        >
          <div>{this.renderLoader()}</div>
          <div className={classes.searchToolsContainer}>
            <div className={classes.searchContainer}>
              {this.state.activeSearchView ? this.renderSpatialBar() : null}
              {searchBar}
            </div>
            {this.renderSearchSettingButton()}
          </div>
          {this.renderSearchResultList("center")}
        </div>
      </div>
    );
  }

  renderSearchSettingButton() {
    const { classes } = this.props;
    return (
      <div className={classes.mainContainerButton}>
        <SearchSettingsButton />
      </div>
    );
  }

  resetToStartView() {
    this.searchModel.abortSearches();
    this.searchModel.clearRecentSpatialSearch();
    this.setState({ activeSearchView: STARTVIEW });
  }
  renderSpatialBar() {
    switch (this.state.activeSearchView) {
      case POLYGON:
        return (
          <SearchWithPolygonInput
            model={this.searchModel}
            resetToStartView={() => {
              this.resetToStartView();
            }}
            localObserver={this.localObserver}
            onSearchDone={featureCollections => {
              this.resolve(featureCollections);
            }}
          />
        );
      case RADIUS: {
        return (
          <SearchWithRadiusInput
            localObserver={this.localObserver}
            resetToStartView={() => {
              this.resetToStartView();
            }}
            onSearchWithin={layerIds => {
              this.setState({
                result: layerIds
              });
              this.searchModel.clearRecentSpatialSearch();
            }}
            model={this.searchModel}
          />
        );
      }
      case SELECTION: {
        return (
          <SearchWithSelectionInput
            localObserver={this.localObserver}
            resetToStartView={() => {
              this.resetToStartView();
            }}
            model={this.searchModel}
            onSearchDone={featureCollections => {
              this.resolve(featureCollections);
            }}
          />
        );
      }

      default:
        return;
    }
  }

  renderSearchBarStart() {
    return (
      <SearchBarStart
        localObserver={this.localObserver}
        activeSpatialTools={this.activeSpatialTools}
        onToolChanged={toolType => {
          this.setState({
            activeSearchView: toolType
          });
        }}
        onMouseEnter={() => {
          this.setState({
            activeSearchView: TEXTSEARCH
          });
        }}
      />
    );
  }

  renderSearchWithText() {
    return (
      <SearchWithTextInput
        model={this.searchModel}
        forceSearch={this.searchModel.search}
        onClear={() => {
          this.searchModel.clear();
          this.localObserver.publish("clearInput");
          this.setState({
            result: false
          });
        }}
        resetToStartView={() => {
          this.searchModel.abortSearches();
          this.searchModel.clearRecentSpatialSearch();
          this.setState({ activeSearchView: STARTVIEW });
        }}
        onChange={this.searchModel.search}
        loading={this.state.loading}
        localObserver={this.localObserver}
        onComplete={this.resolve}
        tooltip={this.tooltip}
        activeTool={this.state.activeSearchView}
      />
    );
  }

  renderTop() {
    const { classes } = this.props;
    return (
      <div
        className={classes.searchContainerTop}
        style={{ display: this.state.visible ? "block" : "none" }}
      >
        <ArrowBackIcon
          className={classes.backIcon}
          onClick={() => {
            this.setState({
              visible: false
            });
          }}
        />
        <SearchWithTextInput
          model={this.searchModel}
          forceSearch={this.searchModel.search}
          onChange={this.searchModel.search}
          onComplete={this.resolve}
          localObserver={this.localObserver}
          tooltip={this.tooltip}
          target="top"
          loading={this.state.loading}
          onClear={() => {
            this.searchModel.clear();
            this.localObserver.publish("clearInput");
            this.setState({
              result: false
            });
          }}
        />
        <div>{this.renderSearchResultList("top")}</div>
      </div>
    );
  }

  render() {
    const { options } = this.props;
    const center = document.getElementById("center");
    if (options.target === "center" && center) {
      return <div>{createPortal(this.renderCenter(), center)}</div>;
    }
    if (options.target === "header") {
      return (
        <div>
          {this.renderButton(options.target)}
          {this.renderTop()}
        </div>
      );
    }
    return null;
  }
}

export default withStyles(styles)(Search);
