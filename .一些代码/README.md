一些收集到的代码或自写代码
==============
收集
-------
```js
// debug
function log() {
	Application.console.log("[test] " + Array.slice(arguments));
}

// getElement
function $(id, doc) {
	doc = doc || document;
	return doc.getElementById(id);
}

function $$(exp, doc) {
	return Array.prototype.slice.call((doc || document).querySelectorAll(exp));
}

// createElement
function $C(name, attr) {
	var el = document.createElement(name);
	if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
	return el;
}

// style
function addStyle(css) {
	var pi = document.createProcessingInstruction(
		'xml-stylesheet',
		'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"');
	return document.insertBefore(pi, document.documentElement);
}

// Notification
function alert(aMsg, aTitle, aCallback) {
	var callback = aCallback ? {
		observe: function(subject, topic, data) {
			if ("alertclickcallback" != topic)
				return;
			aCallback.call(null);
		}
	} : null;
	var alertsService = Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService);
	alertsService.showAlertNotification(
		"chrome://global/skin/icons/information-32.png", aTitle || "addMenu",
		aMsg + "", !!callback, "", callback);
}
```
自写
-------
```js
function cutString(str, len) {
	if (str.length > len) return str.substr(0, len) + "...";
	else return str;
}

function countObj(obj) {
	return Object.keys(obj).length;
}

// $C 增强版
var $C = (function() {
	var $C = function(obj) {
		return new $C.fn.init(obj);
	}

	$C.fn = $C.prototype = {
		constructor: $C,
		init: function(obj) {
			this.obj = obj;
			this.eltIds = {};
			if (!obj || obj.length == 0) {
				return this;
			}
			this.els = [].map.call(obj, prop => {
				return this.create(prop);
			});
			return this;
		},
		create: function(obj) {
			obj = obj || {};
			let id = obj.id || "";
			let type = obj.type || "menuseparator";
			let attrs = obj.attrs || {};
			let events = obj.events || {};
			let childs = obj.childs || [];
			let elt = document.createElement(type);
			[].forEach.call(attrs, (attr, key) => {
				elt.setAttribute(key, attr);
			});
			[].forEach.call(events, (event, key) => {
				if (typeof event == "function") {
					let fn = "(" + event.toSource() + ").call(this, event);"
					elt.setAttribute(key, fn);
				}
			});
			if (childs && childs.length != 0) {
				[].forEach.call(childs, child => {
					elt.appendChild(this.create(child));
				});
			}
			if (id) {
				this.eltIds[id] = elt;
			}
			return elt;
		},
		show: function(elt) {
			let els = !!elt ? [elt] : this.els;
			els.forEach(elt => {
				elt.setAttribute("hidden", false);
			});
			return this;
		},
		hide: function(elt) {
			let els = !!elt ? [elt] : this.els;
			els.forEach(elt => {
				elt.setAttribute("hidden", true);
			});
			return this;
		},
		append: function(appendElt, elt) {
			let els = !!elt ? [elt] : this.els;
			appendElt = appendElt || this.$("nav-bar", window.document).element;
			els.forEach(elt => {
				appendElt.appendChild(elt);
			});
			return this;
		},
		before: function(beforeElt, elt) {
			let els = !!elt ? [elt] : this.els;
			beforeElt = beforeElt || this.$("nav-bar", window.document).element;
			els.forEach(elt => {
				beforeElt.parentNode.insertBefore(elt, beforeElt);
			});
			return this;
		},
		after: function(afterElt, elt) {
			let els = !!elt ? [elt] : this.els;
			afterElt = afterElt || this.$("nav-bar", window.document).element;
			els.forEach(elt => {
				afterElt.parentNode.insertBefore(elt, afterElt.nextSibling);
			});
			return this;
		},
		$: function(selector, doc) {
			var elt;
			if (doc) {
				elt = doc.getElementById(selector);
			}
			else if (selector in this.eltIds) {
				elt = this.eltIds[selector]
			}
			else {
				elt = document.getElementById(selector);
			}
			return {
				show: () => this.show(elt),
				hide: () => this.hide(elt),
				append: (appendElt) => this.append(appendElt, elt),
				before: (beforeElt) => this.before(beforeElt, elt),
				after: (afterElt) => this.after(afterElt, elt),
				element: elt
			}
		},
	};

	$C.fn.init.prototype = $C.fn;

	return (window.$C = $C);
})();
```
