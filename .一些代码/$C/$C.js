var $C = (function() {
	var slice = Array.prototype.slice,
		concat = Array.prototype.concat,
		push = Array.prototype.push,
		indexOf = Array.prototype.indexOf,
		hasOwn = Object.prototype.hasOwnProperty,
		isArray = function(obj) {
			return obj instanceof Array;
		},
		isObject = function(obj) {
			return typeof obj === "object";
		},
		isString = function(obj) {
			return typeof obj === "string";
		},
		isArraylike = function(obj) {
			var length = "length" in obj && obj.length;
			return isArray(obj) || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
		},
		each = function(obj, callback, context) {
			if (isArraylike(obj)) {
				for (let i = 0; i < obj.length; i++) {
					callback.call(context || obj[i], i, obj[i]);
				}
			} else {
				for (let i in obj) {
					callback.call(context || obj[i], i, obj[i]);
				}
			}
			return obj;
		},
		$ = function(selector, context) {
			return (context || window.document).querySelectorAll(selector);
		};

	var $C = function(selector, context) {
		return new $C.fn.init(selector, context);
	};

	$C.fn = $C.prototype = {
		constructor: $C,
		init: function(selector, context) {
			this.selector = selector;
			this.context = context = context || window.document || null;
			if (!selector || !context) {
				return this;
			}
			if (isArray(selector)) {
				each(selector, function(i, obj) {
					push.call(this, this.createByObject(obj));
				}, this);
			}
			if (isString(selector)) {
				selector = selector.trim();
				if (selector.charAt(0) === "<") {
					push.call(this, this.createByHtml(selector));
				} else {
					push.call(this, this.createByString(selector));
				}
			}
			if (selector instanceof NodeList || selector instanceof this.constructor) {
				push.apply(this, slice.call(selector));
			}
			return this;
		},
		// TODO
		createByArray: function(arr) {},
		createByObject: function(obj) {
			obj = obj || {};
			let id = obj.id || "";
			let tag = obj.tag || "menuseparator";
			let attrs = obj.attrs || {};
			let events = obj.events || {};
			let childs = obj.childs || [];
			let context = this.context;
			let node = context.createElement(tag);
			each(attrs, function(key, attr) {
				node.setAttribute(key, attr);
			});
			each(events, function(key, event) {
				if (typeof event == "function") {
					let fn = "(" + event.toSource() + ").call(this, event);"
					node.setAttribute(key, fn);
				}
			});
			each(childs, function(key, child) {
				node.appendChild(this.createByObject(child));
			});
			return node;
		},
		createByHtml: function(str) {
			str = str || "";
			str = str.replace(/[\n\t]/g, "");
			let context = this.context;
			let range = context.createRange();
			let node = range.createContextualFragment(str);
			return node;
		},
		createByString: function(str) {
			let tag = str || "";
			let context = this.context;
			let node = context.createElement(tag);
			return node;
		},
		show: function(node) {
			let nodes = !!node ? [node] : this;
			each(nodes, function(i, node) {
				node.setAttribute("hidden", false);
			});
			return this;
		},
		hide: function(node) {
			let nodes = !!node ? [node] : this;
			each(nodes, function(i, node) {
				node.setAttribute("hidden", true);
			});
			return this;
		},
		// TODO
		on: function() {},
		attr: function() {},
		prop: function() {},
		appendTo: function(appendNode, node) {
			let nodes = !!node ? [node] : this;
			appendNode = appendNode || this.context.documentElement;
			each(nodes, function(i, node) {
				appendNode.appendChild(node);
			});
			return this;
		},
		append: function(node, appendNode) {
			appendNodes = appendNode || this;
			each(appendNodes, function(i, appendNode) {
				appendNodes.appendChild(node);
			});
			return this;
		},
		before: function(beforeNode, node) {
			let nodes = !!node ? [node] : this;
			beforeNode = beforeNode || this.context.documentElement;
			each(nodes, function(i, node) {
				beforeNode.parentNode.insertBefore(node, beforeNode);
			});
			return this;
		},
		after: function(afterNode, node) {
			let nodes = !!node ? [node] : this;
			afterNode = afterNode || this.context.documentElement;
			each(nodes, function(i, node) {
				afterNode.parentNode.insertBefore(node, afterNode.nextSibling);
			});
			return this;
		},
		$: function(selector, context) {
			var node;
			if (context) {
				node = $(selector, context);
			} else {
				let context = this.context;
				if (!node) {
					let fragment = context.createDocumentFragment();
					each(this, function(i, node) {
						fragment.appendChild(node);
					});
					node = $(selector, fragment);
				}
				if (!node) {
					node = $(selector, context);
				}
			}
			return this.pushStack(node);
		},
		pushStack: function(nodes) {
			let ret = this.constructor(nodes || null);
			ret.prevObject = this;
			ret.context = this.context;
			ret.selector = this.selector;
			return ret;
		},
		end: function() {
			return this.prevObject || this.constructor(null);
		},
		add: function(selector) {
			return this.concat(slice.call(this.constructor(selector)));
		},
		push: function() {
			let ret = this.pushStack(this),
				args = slice.call(arguments);
			push.apply(ret, args);
			return ret;
		},
		concat: function(obj) {
			if(isArray(obj) || isArraylike(obj)) {
				return this.push.apply(this, slice.call(obj));
			} else {
				return this;
			}
		},
		slice: function() {
			let ret = this.pushStack();
			push.apply(ret, slice.apply(this, arguments));
			return ret;
		},
		each: function(callback) {
			return each(this, callback);
		},
		// TODO
		map: function() {},
		every: function() {},
		filter: function() {},
		pop: function() {},
		some: function() {},
		sort: function() {},
		// ...
	};
	$C.extend = $C.fn.extend = function(source, target, isDeep) {
		target = target || this;
		isDeep = isDeep || false;
		for (let i in source) {
			let copy = source[i];
			if (isDeep && isObject(copy)) {
				target[i] = $C.extend(target[i], copy, isDeep);
			} else {
				target[i] = copy;
			}
		}
		return target;
	};
	$C.extend({
		$: $,
		each: each,
		isArray: isArray,
		isArraylike: isArraylike,
		isObject: isObject,
		isString: isString,
		// TODO
	});
	$C.fn.init.prototype = $C.fn;
	return (window.$C = $C);
})();