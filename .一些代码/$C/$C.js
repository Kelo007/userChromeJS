var $C = (function() {
	var $C = function(obj, context) {
		return new $C.fn.init(obj, context);
	}

	$C.fn = $C.prototype = {
		constructor: $C,
		init: function(obj, context) {
			this.obj = obj;
			this.context = context = context || window.document || null;
			if (!obj || obj.length == 0 || !context) {
				return this;
			}
			this.eltIds = {};
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
			let context = this.context || null;
			let elt = context.createElement(type);
			Object.keys(attrs).forEach(key => {
				let attr = attrs[key];
				elt.setAttribute(key, attr);
			});
			Object.keys(events).forEach(key => {
				let event = events[key];
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