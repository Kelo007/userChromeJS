// ==UserScript==
// @name  newDownloadPlus.uc.js
// @author  Kelo 再次修改整合  (w13998686967、ywzhaiqi、黒仪大螃蟹、Alice0775、紫云飞)
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

    var downloadPlus = {
        get prefs() Services.prefs.getBranch("userChromeJS.downloadPlus."),
        get Window() Services.wm.getMostRecentWindow("downloadPlus:Preferences"),
        get mainwin() Services.wm.getMostRecentWindow("navigator:browser"),
        get appVersion() Services.appinfo.version.split(".")[0],
        cache: {}
      };

      downloadPlus.extend = function(location, pref, fn, obj) {

      }

      function handlePref (pref) {

      }
      function handlelocation(location) {

      }
      function handleFn(fn) {
        
      }
      function handleUI(fn) {
        
      }

      window.downloadPlus = downloadPlus;
    })();