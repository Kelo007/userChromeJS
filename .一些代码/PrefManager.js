var PrefManager = (function () {
  const prefService = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService);
  var is = function(obj) {
    return (typeof obj === "string" && "string") ||
      (typeof obj === "object" && "object") ||
      (typeof obj === "boolean" && "boolean") ||
      (typeof obj === "function" && "function") ||
      (/^-?\d+$/.test(obj) && "int") ||
      (/^(-?\d+)(\.\d+)?$/.test(obj) && "float");
  };
  var Branch = {
    check: function(branch, type) {
      if (type === 'isString') {
        return typeof branch === 'string' && branch.charAt(branch.length - 1) === '.';
      } 
      else if (type === 'isService') {
        return typeof branch === 'object' && 'root' in branch && this.check(branch.root, 'isString');
      }
      return false;
    },
    set: function(branch) {
      if (this.check(branch, 'isString')) {
        return prefService.getBranch(branch);
      } 
      else if (this.check(branch, 'isService')) {
        return branch;
      } 
      else {
        throw 'Error: Branch cannot be setted'
      }
    }
  };
  var SupportsString = function(data) {
    var string = Cc['@mozilla.org/supports-string;1'].createInstance(Ci.nsISupportsString);
    string.data = data;
    return string;
  };
  var getPref = {
    'boolean': function(branch, pref) {
      branch = Branch.set(branch);
      return branch.getBoolPref(pref);
    },
    'string': function(branch, pref) {
      branch = Branch.set(branch);
      return branch.getComplexValue(pref, Ci.nsISupportsString).data;
    },
    'number': function(branch, pref) {
      branch = Branch.set(branch);
      return branch.getIntPref(pref);
    }
  };
  var setPref = {
    'boolean': function(branch, pref, value) {
      branch = Branch.set(branch);
      branch.setBoolPref(pref, value);
    },
    'string': function(branch, pref, value) {
      branch = Branch.set(branch);
      branch.setComplexValue(pref, Ci.nsISupportsString, SupportsString(value));
    },
    'number': function(branch, pref, value) {
      branch = Branch.set(branch);
      branch.setIntPref(pref, value);
    }
  };
  // TODO observer lists 回调队列
  var init = function(branch, pref, value) {
    this.branch = Branch.set(branch);
    this.pref = pref;
    this.value = value;
    this.type = typeof value;
  };
  init.prototype = {
    get: function() {
      return getPref[this.type](this.branch, this.pref);
    },
    set: function(value) {
      setPref[this.type](this.branch, this.pref, value);
      this.type = typeof value;
    },
    load: function() {
      this.branch.prefHasUserValue(this.pref) || this.set(this.pref);
    },
    // TODO
    remove: function() {},
    clear: function() {}
  };
  // TODO 意义不大...删除
  var initWithObject = function(branch, object) {
  //  this.branch = Branch.set(branch);
  //  this.list = {};
  //  for (let i in object) {
  //    this[i] = this.list[i] = new init(branch, object[i].pref, object[i].value);
  //  }
  };
  initWithObject.prototype = {
  //  each: function(action) {
  //    for (let i in this.list) {
  //      let pref = this.list[i];
  //      if (is(action) === "sring") {
  //        pref[action]()
  //     }
  //      else if (is(action) === "function") {
  //        action.call(pref);
  //      }
  //    }
  //  }
  };
  return {
    init: function(...args) {
        return new init(...args);
    },
    getBool: getPref['boolean'], setBool: setPref['boolean'],
    getString: getPref['string'], setString: setPref['string'],
    getInt: getPref['number'], setInt: setPref['number'],
  };
})();