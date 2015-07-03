// ==UserScript==
// @name	getGoaIP.uc.js
// @description	获取网络上分享的IP
// @author	Kelo
// @namespace	https://github.com/GH-Kelo/userChromeJS
// @include	main
// @charset	UTF-8
// @inspect	window.getGoaIP
// @startup	window.getGoaIP.init();
// @shutdown	window.getGoaIP.onDestroy();
// @optionsURL	about:config?filter=userChromeJS.getGoaIP.
// @version	2015.7.03 0.0.2 更新
// @version	2015.5.30 0.0.1 Create.
// ==/UserScript==
(function() {
	let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
	Cu.import("resource://gre/modules/Promise.jsm");
	if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");
	if (window.getGoaIP) {
		window.getGoaIP.onDestroy();
		delete window.getGoaIP;
	}

	var getGoaIP = {
		//================================ 设置 ================================
		//================== 自定义网站 ==================
		sites: {
			//==== 来自 火狐范 免费 IP ====
			//感谢 火狐范
			"firefoxfan": {
				//==== 网站 url ====
				url: "http://www.firefoxfan.com/firefox-gaogent/goagent-ip.html",
				//==== CSS选择器 ====
				//可能会变
				element: "div[class='crayon-line'][id|='crayon']",
				//==== 下载地址 可选 ====
				downloadURL: "http://www.firefoxfan.com/goagentip/proxy.ini",
			},
			"honglingjin": {
				//==== 网站 url ====
				url: "http://www.honglingjin.ga/",
				//==== CSS选择器 ====
				//可能会变
				element: ".header-banner > div:nth-child(3)",
				//==== 下载地址 可选 ====
				//下载为host
				downloadURL: "http://www.honglingjin.ga/hosts/hosts.zip",
			},
			"ruooo": {
				//==== 网站 url ====
				url: "http://www.ruooo.com/VPS/704.html",
				//==== 自定义callback ====
				//== site 即自身obj ==
				//== document 为网页 DOM ==
				//== 新手 不建议自定义 ==
				//自定义 获取IP callback
				//callback_get: function(site, document) {},
				//自定义 下载 callback
				callback_download: function(site, document) {
					var downloadURL = document.querySelector(".entry-content > p:nth-child(7) > span:nth-child(1) > a:nth-child(1)").innerHTML;
					//== 获取提取码 ==
					//== 正则来自 panlink 感谢 jasonshaw ==
					downloadURL += "#" + document.querySelector(".entry-content > p:nth-child(7) > span:nth-child(1)").innerHTML
						.match(/\s*(提取密碼|提取密码|提取码|提取碼|提取|密碼|密码|百度|百度云|云盘|360云盘|360云|360yun|yun)[:：]?\s*(<[^>]+>)?\s*([0-9a-zA-Z]{4,})\s*/)[3];
					gBrowser.addTab(downloadURL);
				},
			},
		},
		//=============== ip 正则 ===============
		regex: /((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))/g,
		//=============== 状态信息 ===============
		status: {
			err: "出错了：",
			suc: "成功获取IP：",
		},
		//================================ 设置结束 ================================
		get prefs() {
			delete this.prefs;
			return this.prefs = Services.prefs.getBranch("userChromeJS.getGoaIP.");
		},

		init: function() {
			this.loadSetting();
			this.prefs.addObserver('', this, false);
			window.addEventListener("unload", function() {
				getGoaIP.onDestroy();
			}, false);
		},

		onDestroy: function() {
			this.addIcon(false);
			this.prefs.removeObserver('', this, false);
			Services.obs.notifyObservers(null, "startupcache-invalidate", "");
		},

		observe: function (subject, topic, data) {
			//overlay
			if (topic == "xul-overlay-merged") {
				getGoaIP.changeStatus();
				getGoaIP.makeMenu();
				log("界面加载完毕");
			}
			//Prefobs
			if (topic == 'nsPref:changed') {
				switch (data) {
					case 'Icon_Pos':
						getGoaIP.loadSetting(data);
						break;
				}
			}
			//Notification
			if (topic == "alertclickcallback") {
				Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper).copyString(data);
				XULBrowserWindow.statusTextField.label = "Copy: " + data;
			}
		},

		loadSetting: function(type) {
			if (!type || type === "Icon_Pos") {
				this.Icon_Pos = this.getPrefs(1, "Icon_Pos", 0);
				this.addIcon(true);
				this.changeStatus();
			}
		},

		getPrefs: function(type, name, val) {
			switch (type) {
				case 0:
					if (!this.prefs.prefHasUserValue(name) || this.prefs.getPrefType(name) != Ci.nsIPrefBranch.PREF_BOOL)
						this.prefs.setBoolPref(name, val ? val : false);
					return this.prefs.getBoolPref(name);
					break;
				case 1:
					if (!this.prefs.prefHasUserValue(name) || this.prefs.getPrefType(name) != Ci.nsIPrefBranch.PREF_INT)
						this.prefs.setIntPref(name, val ? val : 0);
					return this.prefs.getIntPref(name);
					break;
				case 2:
					if (!this.prefs.prefHasUserValue(name) || this.prefs.getPrefType(name) != Ci.nsIPrefBranch.PREF_STRING)
						this.prefs.setCharPref(name, val ? val : "");
					return this.prefs.getCharPref(name);
					break;
			}
		},

		setPrefs: function(type, name, val) {
			switch (type) {
				case 0:
					this.prefs.setBoolPref(name, val ? val : false);
					break;
				case 1:
					this.prefs.setIntPref(name, val ? val : 0);
					break;
				case 2:
					this.prefs.setCharPref(name, val ? val : "");
					break;
			}
		},

		//================================ 界面相关 ================================
		addIcon: function(isAlert) {
			if (this.icon) {
				this.icon.parentNode.removeChild(this.icon);
				$("getGoaIP-popup").parentNode.removeChild($("getGoaIP-popup"));
				delete this.icon;
			}
			if(this.style) {
				this.style.parentNode.removeChild(this.style);
				delete this.style;
			}
			if (!isAlert) return;
			//================== 图标 ==================
			this.icon = $C("toolbarbutton", {
				id: "getGoaIP-icon",
				class: "toolbarbutton-1 chromeclass-toolbar-additional",
				tooltiptext: "获取分享的IP\n左键：获取设置中网址全部IP\n右键：打开功能&设置菜单",
				context: "getGoaIP-popup",
				onclick: "if (event.button != 2) getGoaIP.iconClick(event);",
				image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAt0lEQVQ4jcXTsWoCQRSF4Q8SsNEitUnhM6RQUtjb+xixTRHIG+SFks7GVxBksbBPGVjWQpsjSNhdXUjIhb+4c5l/mMMMv1g93IfeWf8Qhhi0CcYowmMosAtbfGCO2zrBFGV4CiUOP/iK5GrBHu94wTqSz7rrNAnKzOAtgm0yuUpQ4RkzLCNY4a5LBlU4ZG3RJYOT4BsbvKLfRVDlxAlGuKnb3CY4D7G1/l/Q9JSLzC5W02c69X9TR6H4UVapsaP+AAAAAElFTkSuQmCC",
			});
			if (this.Icon_Pos === 0)
				$('identity-box').appendChild(this.icon);
			else if (this.Icon_Pos === 1)
				$('urlbar-icons').appendChild(this.icon);
			else if (this.Icon_Pos === 2)
				ToolbarManager.addWidget(window, this.icon, true);
			//================== 右键菜单 ==================
			var overlay = '\
			<overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
				xmlns:html="http://www.w3.org/1999/xhtml">\
				<toolbarpalette id="mainPopupSet">\
					<menupopup id="getGoaIP-popup" position="after_start">\
				 		<menu label="图标位置">\
							<menupopup id="getGoaIP_Icon_Pos">\
								<menuitem type="radio" value="0" label="地址栏前端" name="Icon_Pos" oncommand="getGoaIP.setPrefs(1, \'Icon_Pos\', this.value);"/>\
								<menuitem type="radio" value="1" label="地址栏后端" name="Icon_Pos" oncommand="getGoaIP.setPrefs(1, \'Icon_Pos\', this.value);"/>\
								<menuitem type="radio" value="2" label="可移动按钮" name="Icon_Pos" oncommand="getGoaIP.setPrefs(1, \'Icon_Pos\', this.value);"/>\
							</menupopup>\
						</menu>\
						<menuseparator/>\
					</menupopup>\
				</toolbarpalette>\
			</overlay>';
			overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
			window.userChrome_js.loadOverlay(overlay, this);
			//================== CSS ==================
			if (this.Icon_Pos === 0 || this.Icon_Pos === 1) {
				var css = '\
				#getGoaIP-icon {\
					-moz-appearance: none !important;\
					border-style: none !important;\
					border-radius: 0 !important;\
					padding: 0 3px !important;\
					margin: 0 !important;\
					background: transparent !important;\
					box-shadow: none !important;\
					-moz-box-align: center !important;\
					-moz-box-pack: center !important;\
					min-width: 18px !important;\
					min-height: 18px !important;\
				}\
				#getGoaIP-icon > .toolbarbutton-icon {\
					max-width: 18px !important;\
					padding: 0 !important;\
					margin: 0 !important;\
				}\
				';
				this.style = addStyle(css);
			}
		},

		makeMenu: function() {
			var menu, menupopup, menuitem, menuseparator;
			for (let i in this.sites) {
				let site = this.sites[i];
				menupopup = $C("menupopup", {});

				menuitem = $C("menuitem", {
					label: "获取IP",
					class: "getGoaIP_get",
					onclick: "getGoaIP.run('get','" + i + "')",
					disabled: site.element || site.callback_get ? false : true,
				});
				menupopup.appendChild(menuitem);

				menuitem = $C("menuitem", {
					label: "下载",
					class: "getGoaIP_download",
					onclick: "getGoaIP.run('download','" + i + "')",
					disabled: site.downloadURL || site.callback_download ? false : true,
				});
				menupopup.appendChild(menuitem);

				menu = $C("menu", {label: i});
				menu.appendChild(menupopup);

				$("getGoaIP-popup").appendChild(menu);
			}
		},

		changeStatus: function() {
			if ($("getGoaIP_Icon_Pos")) 
				$("getGoaIP_Icon_Pos").childNodes[this.Icon_Pos].setAttribute('checked', 'true');
		},

		iconClick: function(event) {
			if (event.target != event.currentTarget) return;
			event.stopPropagation();
			event.preventDefault();
			this.run();
		},

		run: function(action, site) {
			var action = action || "get",
				site = site,
				promise;
			//if (typeof site == "string") site = this.sites[site];
			switch (action) {
				case "get":
					if (!site)
						promise = this.get_all();
					else
						promise = this.get(site);
					promise.then(
						function onFulfill(res) {
							// ￣.￣ 太费脑子了
							alert((!!res.msg && !!res.err ? cutString(res.msg, 50) + "\n" + res.err : cutString(res.msg, 50) + res.err) + (!!res.msg ? "\n点击复制全部IP"  : ""), 
								"getGoaIP", !!res.msg ? res.msg : null, !!res.msg ? getGoaIP : null);
					}, Cu.reportError);
					break;
				case "download": 
					alert("download 开发中...");
					break;
			}
		},

		// 返回promise
		get: function(site) {
			// _site为object类型
			if (typeof site == "object") var _site = site;
			else if (typeof site == "string") var _site = this.sites[site];
			else if (typeof site == "number") var _site = this.sites[Object.keys(this.sites)[site]];
			// 强行转换site为键值
			site = getKey(this.sites, site);
			return this.getDOM(_site.url).then(
				function onFulfill(doc) {
					if (_site.element) {
						try {
							var ip = doc.querySelector(_site.element).innerHTML.match(getGoaIP.regex);
							// 使用apply处理多维数组。 e.g. [1, 2, [3, 4], 5] to [1, 2, 3, 4, 5]
							ip = Array.concat.apply(ip, ip);
						} catch (err) {
							return {
								err: site + "：" + err,
								msg: "",
								site: site,
								_site: _site,
							};
						}
						return {
							err: "",
							msg: ip.join("|"),
							site: site,
							_site: _site,
						};
					}
				}, 
				function onReject(aReason) {
					console.error(aReason);
					return new Error(aReason);
			});
		},

		// 返回promise
		get_all: function(sites) {
			var sites = sites || this.sites;
			var promises = [];
			for (let i in sites) promises.push(this.get(i));
			return Promise.all(promises).then(
				function onFulfill(res) {
					var sucText = [], errText = [], alertText = "";
					// 组合一下再返回
					for (let i in res) {
						if (!res[i]) continue;
						else if (res[i].err) errText.push(res[i].err);
						else sucText.push(res[i].msg);
					}
					return {
						err: errText.join("\n"),
						msg: sucText.join("|"),
						site: res.site,
						_site: res._site,
					};
			}, Cu.reportError);
		},

		// 返回promise
		getDOM: function(url) {
			return new Promise(function(resolve, reject) {
				var xhr = new XMLHttpRequest();
				xhr.open('GET', url, true);
				xhr.send(null);
				xhr.onreadystatechange = function () {
					if (xhr.readyState == 4 && xhr.status == 200) {
						var parser = new DOMParser();
						var doc = parser.parseFromString(xhr.responseText, 'text/html');
						resolve(doc);
					}
				};
				xhr.onerror = function(err) {
					console.error(err);
					reject(err);
				};
			});
		},

		//================================ callback 集合 ================================
		/*getIP: function(site, document) {
			var that = getGoaIP, ip, err;
			if (site.element) {
				try {
					ip = document.querySelector(site.element).innerHTML.match(that.regex);
				} catch (e) {
					err = that.status.err + "\n" + e;
				}
				that.altText += site.name + "  " + (err || that.status.suc);
				if (ip) {
					that.altText += "\t" + cutString(ip.join("|"), 50) + "\n";
					that.ip = that.ip.concat(ip)
				}
			} 
			that.finishedSiteNum ++;

			if (that.finishedSiteNum == countObj(that.sites)) {
				var cookie = that.ip.join("|");
				alert(that.altText + "点击复制全部IP", "getGoaIP", cookie, that);
				that.reset();
			}
		},

		getGoaIP_get: function(site, document) {
			var that = getGoaIP, ip, err, cookie;
			if (!site.element) return;
			try {
				ip = document.querySelector(site.element).innerHTML.match(that.regex);
			} catch (e) {
				err = that.status.err + "\n" + e;
			}
			var text = site.name + "  " + (err || that.status.suc);
			if (ip) {
				cookie = ip.join("|");
				text += "\t" + cutString(cookie, 50) + "\n";
			}
			alert(text + (!!cookie ? "点击复制全部IP"  : ""), "getGoaIP", !!cookie ? cookie : null, !!cookie ? that : null);
		},

		getGoaIP_download: function(site, document) {
			var mainwin = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("navigator:browser");
			saveURL(site.downloadURL, null, null, null, null, null, mainwin.document);
		},

		reset: function() {
			this.finishedSiteNum = 0;
			this.ip = [];
			this.altText = "";
		},*/
	};

	// 来自 User Agent Overrider 扩展
	const ToolbarManager = (function() {
		/**
		 * Remember the button position.
		 * This function Modity from addon-sdk file lib/sdk/widget.js, and
		 * function BrowserWindow.prototype._insertNodeInToolbar
		 */
		let layoutWidget = function(document, button, isFirstRun) {

			// Add to the customization palette
			let toolbox = document.getElementById('navigator-toolbox');
			toolbox.palette.appendChild(button);

			// Search for widget toolbar by reading toolbar's currentset attribute
			let container = null;
			let toolbars = document.getElementsByTagName('toolbar');
			let id = button.getAttribute('id');
			for (let i = 0; i < toolbars.length; i += 1) {
				let toolbar = toolbars[i];
				if (toolbar.getAttribute('currentset').indexOf(id) !== -1) {
					container = toolbar;
				}
			}

			// if widget isn't in any toolbar, default add it next to searchbar
			if (!container) {
				if (isFirstRun) {
					container = document.getElementById('nav-bar');
				} else {
					return;
				}
			}

			// Now retrieve a reference to the next toolbar item
			// by reading currentset attribute on the toolbar
			let nextNode = null;
			let currentSet = container.getAttribute('currentset');
			let ids = (currentSet === '__empty') ? [] : currentSet.split(',');
			let idx = ids.indexOf(id);
			if (idx !== -1) {
				for (let i = idx; i < ids.length; i += 1) {
					nextNode = document.getElementById(ids[i]);
					if (nextNode) {
						break;
					}
				}
			}

			// Finally insert our widget in the right toolbar and in the right position
			container.insertItem(id, nextNode, null, false);

			// Update DOM in order to save position
			// in this toolbar. But only do this the first time we add it to the toolbar
			if (ids.indexOf(id) === -1) {
				container.setAttribute('currentset', container.currentSet);
				document.persist(container.id, 'currentset');
			}
		};

		let addWidget = function(window, widget, isFirstRun) {
			try {
				layoutWidget(window.document, widget, isFirstRun);
			} catch (error) {
				console.log(error);
			}
		};

		let removeWidget = function(window, widgetId) {
			try {
				let widget = window.document.getElementById(widgetId);
				widget.parentNode.removeChild(widget);
			} catch (error) {
				console.log(error);
			}
		};

		let exports = {
			addWidget: addWidget,
			removeWidget: removeWidget,
		};
		return exports;
	})();

	function log() {
		Application.console.log("[getGoaIP] " + Array.slice(arguments));
	}

	function $(id, doc) {
		doc = doc || document;
		return doc.getElementById(id);
	}

	function $C(name, attr) {
		var el = document.createElement(name);
		if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
		return el;
	}

	function addStyle(css) {
		var pi = document.createProcessingInstruction(
			'xml-stylesheet',
			'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"');
		return document.insertBefore(pi, document.documentElement);
	}

	function alert(aString, aTitle, aCookie, aListner) {
		Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService)
			.showAlertNotification("", aTitle || "getGoaIP", aString, !!aListner, aCookie ? aCookie : null, aListner ? aListner : null);
	}

	function cutString(str, len) {
		if (str.length > len) return str.substr(0, len) + "...";
		else return str;
	}

	function countObj(obj) {
		return Object.keys(obj).length;
	}

	function getKey(obj, prop) {
		if (typeof prop == "string") return prop;
		for (var i in obj) {
			if (obj[i] === prop) {
				prop = i;
				break; 
			}
		}
		return prop;
	}

	getGoaIP.init();
	window.getGoaIP = getGoaIP;
})();