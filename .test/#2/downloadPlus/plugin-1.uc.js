console.log(this);
downloadPlus.extend(
/**
 * options
 */
{
  /**
   * init & uninit
   */
  init: function() {
    console.log(this);
    downloadPlus.MainWindow.console.log("Hello newDownloadPlus.uc.js User!");
  },
  uninit: function() {
    downloadPlus.MainWindow.console.log("Good Bye!");
  },

  /**
   * pref
   */
  pref: {
    key: "plugin_1",
    value: false
  },

  /**
   * UI
   */
  UI: {
    preference: {
      id: "plugin_1",
      type: "bool"
    },
    main: [
      '<checkbox label="插件1" preference="plugin_1"/>'
    ],
    script: []
  },
},

/**
  * controller
  */
function(subject, topic, data) {
  if (topic === "downloadPlus:run") {
    return subject.getPref();
  }
  if (topic === "downloadPlus:prefchanged") {
    return subject.getPref();
  }
});