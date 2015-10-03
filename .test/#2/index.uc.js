// ==UserScript==
// @name  newDownloadPlus.uc.js
// @author  Kelo
// @contributor w13998686967 ywzhaiqi 黒仪大螃蟹 Alice0775 紫云飞
// @charset UTF-8
// @include chrome://browser/content/browser.xul
// @include chrome://browser/content/places/places.xul
// @include chrome://mozapps/content/downloads/unknownContentType.xul
// @include chrome://mozapps/content/downloads/downloads.xul
// @inspect window.downloadPlus
// @startup window.downloadPlus.init();
// @shutdown  window.downloadPlus.onDestroy();
// @optionsURL  about:config?filter=userChromeJS.downloadPlus.
// @config  window.downloadPlus.openPref();
// ==/UserScript==
(function() {
  var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
  if (window.downloadPlus) {
    window.downloadPlus.onDestroy();
    delete window.downloadPlus;
  }
  if (!window.Services) {
    Cu.import("resource://gre/modules/Services.jsm");
  }

  /******************************************************************************/

  var config = {
    folder: "downloadPlus",
    token: "UChrm",
    branchRoot: "userChromeJS.downloadPlus."
  };

  /******************************************************************************/

  var Utils = {
    mix: function(target, options) {
      for (var i in options) {
        if (!(i in target)) {
          target[i] = options[i];
        }
      }
      return target;
    }
  };

  Utils.type = (function(context) {
    ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error", "Undefined"].forEach(function(name) {
      context['is' + name] = function(obj) {
        return Object.prototype.toString.call(obj) == '[object ' + name + ']';
      };
    });
    return function(obj) {
      var type = Object.prototype.toString.call(obj);
      return type.substring(8, type.length - 1);
    };
  })(Utils);

  /******************************************************************************/

  var downloadPlus = {
    get branchRoot() config.branchRoot,
    get branch() Services.prefs.getBranch(this.branchRoot),
    get Window() Services.wm.getMostRecentWindow("downloadPlus:Preferences"),
    get mainwin() Services.wm.getMostRecentWindow("navigator:browser"),
    get appVersion() Services.appinfo.version.split(".")[0],
    get config() config,

    init: function() {
      if (location.href == "chrome://browser/content/browser.xul") {
        this.branch.addObserver('', this, false);
      }
      this.rebuild();
      window.addEventListener("unload", function() {
        downloadPlus.onDestroy();
      }, false);
    },

    onDestroy: function() {
      var cache = this._cache;
      cache.forEach(function(item) {
        downloadPlus.notify(item, "downloadPlus:destroy");
      });
      this.branch.removeObserver('', this, false);
    },

    openPref: function() {
      window.openDialog("data:application/vnd.mozilla.xul+xml;charset=UTF-8," + this.UIManger.build(), '', 'chrome,titlebar,toolbar,centerscreen,dialog=no');
    },

    rebuild: function() {
      delete this._cache;
      this._cache = [];
      try {
        userChrome.import(this.config.folder, this.config.token);
      } catch (e) {}
    },

    observe: function(subject, topic, data) {
      if (topic === "nsPref:changed") {
        var cache = this._cache;
        cache.forEach(function(item) {
          if (item.pref === data) {
            downloadPlus.notify(item, "downloadPlus:prefchanged");
          }
        });
      }
    },

    notify: function(subject, topic, data) {
      this.async(function() {
        var run = subject.controlFn(subject, topic, data, subject.options);
        if (run === true) {
          subject.options.init();
        }
        else if (run === false) {
          subject.options.uninit();
        }
      });
    },

    _cache: [],
    store: function() {
      var args = Array.prototype.slice.call(arguments),
          cache = this._cache;
      return cache.push.apply(cache, args);
    },

    async: function(fn) {
      setTimeout(fn, 0);
    }
  };

  /******************************************************************************/

  downloadPlus.UIManger = {
    preference: [],
    main: [],
    script: [
    "function feedBack() {opener.gBrowser.selectedTab = opener.gBrowser.addTab('https://github.com/GH-Kelo/userChromeJS/issues');}"
    ],
    parsePreference: function(preference) {
      if (Utils.isObject(preference)) {
        var id = preference.id,
            type = preference.type;
        this.preference.push(
          '<preference id="' + id + '" type="' + type + '" name="userChromeJS.downloadPlus.' + id + '"/>'
        );
      }
      else if (Utils.isArray(preference) && preference.length > 0) {
        var item = preference.shift();
        return this.parsePreference(item)
      }
    },
    parseMain: function(main) {
      if (Utils.isString(main)) {
        this.main.push(main);
      }
      else if (Utils.isArray(main) && main.length > 0) {
        var item = main.shift();
        return this.parseMain(item)
      }
    },
    parseScript: function(script) {
      if (Utils.isString(script)) {
        this.script.push(script);
      }
      else if (Utils.isArray(script) && script.length > 0) {
        var item = script.shift();
        return this.parseScript(item)
      }
    },
    /**
     * @param {[Array | Object]} preference 参数
     * {
     *   id: String
     *   type: String
     * }
     * @param {[Array | String]} main       主要界面 直接
     * @param {[type]} script     [description]
     */
    add: function(preference, main, script) {
      this.parsePreference(preference);
      this.parseMain(preference);
      this.parseScript(script);
    },
    build: function() {
      var ret = [
          '<?xml version="1.0"?><?xml-stylesheet href="chrome://global/skin/" type="text/css"?>',
            '<prefwindow xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"',
                'id="downloadPlus_Settings"',
                'ignorekeys="true"',
                'title="downloadPlus 配置"',
                'onload="changeStatus();"',
                'buttons="accept,cancel,extra1"',
                'ondialogextra1="feedBack();',
                'windowtype="downloadPlus:Preferences">',
              '<prefpane id="main" flex="1">',
                '<preferences>',
                  this.preference.join("\n"),
                '</preferences>',
                '<script>',
                  this.script.join("\n"),
                '</script>',
                  this.main.join("\n"),
                '<hbox flex="1">',
                  '<button dlgtype="extra1" label="反馈"/>',
                  '<spacer flex="1"/>',
                  '<button dlgtype="accept"/>',
                  '<button dlgtype="cancel"/>',
                '</hbox>',
            '</prefpane>',
          '</prefwindow>'
          ].join("\n");
      return ret;
    },
  };

  /******************************************************************************/

  function Pref(branch, key) {
    this.branchName = branch;
    this.branch = Services.prefs.getBranch(branch);
    this.key = key;
  }
  Pref.prototype = {
    _PrefTypeMap: {
      [Ci.nsIPrefBranch.PREF_STRING]: "string",
      [Ci.nsIPrefBranch.PREF_INT]: "number",
      [Ci.nsIPrefBranch.PREF_BOOL]: "boolean"
    },
    get: function() {
      var type = this._PrefTypeMap
          [this.branch.getPrefType(this.key)];
      if (type === "string") {
        return this.branch.getComplexValue(this.key, Ci.nsISupportsString).data;
      }
      if (type === "number") {
        return this.branch.getIntPref(this.key);
      }
      if (type === "boolean") {
        return this.branch.getCharPref(this.key);
      }
    },
    set: function(value) {
      var type = typeof value;
      if (type === "string") {
        var string = Cc['@mozilla.org/supports-string;1'].createInstance(Ci.nsISupportsString);
        string.data = value;
        this.branch.setComplexValue(this.key, Ci.nsISupportsString, string);
      }
      if (type === "number") {
        this.branch.setIntPref(this.key, value);
      }
      if (type === "boolean") {
        this.branch.setCharPref(this.key, value);
      }
      return this;
    },
    load: function(value) {
      if (!this.branch.prefHasUserValue(this.key)) {
        this.set(value);
      }
      return this;
    },
    on: function(fn, context) {
      this.branch.addObserver(this.key, function(aSubject, aTopic, aData) {
        fn.call(context || this, aSubject, aTopic, aData)
      }, false);
      return this;
    }
  };

  downloadPlus.Pref = function(key) {
    return new Pref(downloadPlus.branchRoot, key);
  };

  /******************************************************************************/

  var defaultOptions = {
    include: "chrome://browser/content/browser.xul",
    pref: {
      key: new Date().getTime().toString(),
      value: false
    },
    UI: {
      preference: [],
      main: [],
      script: []
    }
  };

  /**
   * 主要添加接口
   * @param  {[Object]} options
   * {
   *   pref: Object,
   *   {
   *     key: String
   *     value: String
   *   }
   *   include: String,
   *   init: function() {},
   *   uninit: function() {},
   * }
   * @param  {[Function]} controlFn [description]
   * controlFn( subject, topic, data, [options])
   *   return true > init
   *   return false > uninit
   */
  downloadPlus.extend = function(options, controlFn) {
    options = Utils.mix(options, defaultOptions);

    var include = options.include;
    var pref = options.pref;
    var UI = options.UI;
    parsePref(pref);
    parseUI(UI);

    var storage = {
      include: include,
      pref: pref,
      UI: UI,
      options: options,
      controlFn: controlFn
    };
    this.store(storage);
    this.notify(storage, "downloadPlus:extend");

    var href = location.href;
    if (href === include) {
      this.notify(storage, "downloadPlus:run", href);
    }
  };

  function parsePref(pref) {
    var key = pref.key;
    var value = pref.value;
    console.log(key, value)
    downloadPlus.Pref(pref)
      .load(value);
  }

  function parseUI(UI) {
    console.log(UI);
    var preference = UI.preference;
    var main = UI.main;
    var script = UI.script;
    downloadPlus.UIManger.add(preference, main, script);
  }

  /******************************************************************************/

  window.downloadPlus = downloadPlus;
  downloadPlus.init();
})();