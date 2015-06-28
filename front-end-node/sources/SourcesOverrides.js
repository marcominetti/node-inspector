/*jshint browser:true, nonew:false*/
/*global WebInspector:true*/
WebInspector.SourcesOverrides = function() {
  this._chromeSpecificsAreHidden = false;
  this._hideChromeSpecifics();
  this._overrideWatchExpression();
<<<<<<< HEAD
  this._hideContentsScript();
  this._disableAddFolderItem();
=======
  this._overrideShortcutsRegistering();
>>>>>>> 4df7074... front-end: Fix double sending of `togglePause`
};

WebInspector.SourcesOverrides.prototype = {
  _hideChromeSpecifics: function() {
    if (WebInspector.panels.sources) {
      this._hideSourcesTabSpecifics();
    } else {
      WebInspector.inspectorView._tabbedPane.addEventListener(
        WebInspector.TabbedPane.EventTypes.TabSelected,
        function(event) {
          if (event.data.tabId == 'sources') setTimeout(this._hideSourcesTabSpecifics.bind(this));
        }, this);
    }
  },

  _hideSourcesTabSpecifics: function() {
    if (this._chromeSpecificsAreHidden) return;

    var panes = WebInspector.panels.sources.sidebarPanes;
    [
      panes.domBreakpoints.element,
      panes.domBreakpoints.titleElement.parentNode,
      panes.eventListenerBreakpoints.element,
      panes.eventListenerBreakpoints.titleElement.parentNode,
      panes.xhrBreakpoints.element,
      panes.xhrBreakpoints.titleElement.parentNode
    ].forEach(function(element) {
      element.classList.add('hidden');
    });
    this._chromeSpecificsAreHidden = true;
  },

  _overrideWatchExpression: function() {
    // Patch the expression used as an initial value for a new watch.
    // DevTools' value "\n" breaks the debugger protocol.
    WebInspector.WatchExpressionsSection.NewWatchExpression = ' ';
  },
<<<<<<< HEAD
  
  _hideContentsScript: function(){
    if (WebInspector.SourcesPanel._instanceObject) {
      WebInspector.SourcesPanel._instanceObject.registerRequiredCSS('node/sources/SourcesPanelOverrides.css');
    } else {
      sourcespanel_proto = WebInspector.SourcesPanel.prototype;
      sourcespanel_proto.oldWasShown = sourcespanel_proto.wasShown;
      sourcespanel_proto.wasShown = function(){
        this.registerRequiredCSS('node/sources/SourcesPanelOverrides.css');
        sourcespanel_proto.wasShown = sourcespanel_proto.oldWasShown;
        sourcespanel_proto.oldWasShown.call(this);
      };
    }
  },
  
  _disableAddFolderItem: function(){
    WebInspector.NavigatorView.prototype._appendAddFolderItem = function(){};
=======

  _overrideShortcutsRegistering: function() {
    // TODO(3y3): Check this before next front-end update.
    // If it wasn't fixed we need to deprecate it anyway and search other way to fix.
    setTimeout(function() {
      WebInspector.SourcesPanel.prototype._createButtonAndRegisterShortcutsForAction =
        function(buttonId, buttonTitle, actionId) {
          function handler() {
            WebInspector.actionRegistry.execute(actionId);
            return true;
          }
          var shortcuts = WebInspector.shortcutRegistry.shortcutDescriptorsForAction(actionId);
          return this._createButtonAndRegisterShortcuts(buttonId, buttonTitle, handler, shortcuts);
        };
    });
>>>>>>> 4df7074... front-end: Fix double sending of `togglePause`
  }
};

new WebInspector.SourcesOverrides();
