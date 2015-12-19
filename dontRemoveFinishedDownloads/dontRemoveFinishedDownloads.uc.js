// ==UserScript==
// @name	dontRemoveFinishedDownloads.uc.js
// @description	重启浏览器下载面板不删除记录，此为临时版本日后转移到newDownloadPlus
// @author	Kelo
// @namespace	https://github.com/GH-Kelo/userChromeJS
// @include	main
// @charset	UTF-8
// ==/UserScript==
(function() {
  var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
  Cu.import("resource://gre/modules/Services.jsm");

  var dontRemoveFinishedDownloads = {
    _list: null,
    init: function(list) {
      this._list = list;
      
      Cu.import("resource://gre/modules/DownloadIntegration.jsm");
      var shouldPersistDownloadFix = this.shouldPersistDownloadFix.bind(DownloadIntegration);
      fixFunction(DownloadIntegration,
        "shouldPersistDownload",
        shouldPersistDownloadFix);

      var store = DownloadIntegration._store;
      fixFunction(store,
        "onsaveitem",
        shouldPersistDownloadFix);
    },
    shouldPersistDownloadFix: function(download) {
      // 默认
      if (download.hasPartialData || !download.succeeded) {
        return true;
      }
      // 最大保存时间
      var RetentionTime = Date.now() - MaxRetentionHours.get() *60*60*1000;
      return download.startTime > RetentionTime;
    }
  };

  var downloadUtil = (function() {
    Cu.import('resource://gre/modules/Downloads.jsm');
    var exports = {};
    exports.getList = function(cb) {
      Downloads
        .getList(Downloads.ALL)
        .then(function(list) {
          cb(list);
        })
    };
    return exports;
  })();
  
  function fixFunction(obj, prop, source) {
    if (obj && prop in obj &&
      !(("_" + prop) in obj)) {
      obj["_" + prop] = obj[prop];
      delete obj[prop];
      obj[prop] = source;
      console.log("fix", obj, prop, source)
    }
  }

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
        return this.branch.getBoolPref(this.key);
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
        this.branch.setBoolPref(this.key, value);
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
        fn.call(context || this, aSubject, aTopic, aData);
      }, false);
      return this;
    }
  };

  // Pref
  // 最大保存时间
  var MaxRetentionHours = new Pref("userChromeJS.downloadPlus.", "MaxRetentionHours");
  // 默认24H
  MaxRetentionHours.load(24);

  // init
  dontRemoveFinishedDownloads.init(null);
  downloadUtil.getList(function(list) {
    // 获得list
    dontRemoveFinishedDownloads.init(list);
  });
  
})();