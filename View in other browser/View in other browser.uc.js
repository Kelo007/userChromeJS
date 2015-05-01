// ==UserScript==
// @name         View in other browser
// @include      chrome://browser/content/browser.xul
// @include      chrome://browser/content/history/history-panel.xul
// @include      chrome://browser/content/bookmarks/bookmarksPanel.xul
// @include      chrome://browser/content/places/places.xul
// @author       Cye3s
// @modified    Kelo
// @version      1.5
// @note           2015.4.4   增加多个浏览器 by Kelo http://bbs.kafan.cn/thread-1820331-1-1.html
// @note           2015.4.5   精简、重写代码 修复在侧栏菜单显示 和 增加在我的足迹的显示 by Kelo 
// @note           2015.4.5   增加图标可选，没有则用系统图标 by Kelo 
// @note           2015.4.11 增加折叠文件夹功能 by Kelo 
// ==/UserScript==
var LaunchBrowser = {
	//是否折叠文件夹；true折叠，false不折叠
	isFolder: true,
	//配置多个浏览器
	browsers: [{
		name: 'IE', //名字
		path: 'C:\\Program Files\\Internet Explorer\\iexplore.exe', //浏览器文件地址
		accesskey: 'U', //可选，快捷键
		image: '' //可选，没有则用系统图标
	}, {
		name: '360',
		path: 'D:\\360chrome\\360Chrome\\Chrome\\Application\\360chrome.exe',
		accesskey: 'X'
	}, {
		name: 'vivaldi',
		path: 'D:\\Vivaldi\\Application\\vivaldi.exe',
		accesskey: 'V'
	}],
	shellServicr: Cc['@mozilla.org/browser/shell-service;1'].getService(Ci.nsIShellService),
	init: function() {
		//if (this.isFolder) var popupPlace = document.createElement("menupopup");
		for (var i = 0; i < this.browsers.length; i++) {
			let browsers = this.browsers[i];
			let mItemPlace = $C('menuitem', {
				class: "placesContext-LaunchBrowser menuitem-iconic",
				label: '在' + browsers.name + '中打开',
				accesskey: browsers.accesskey,
				selection: 'link',
				selectiontype: 'single',
				path: browsers.path,
				image: browsers.image || this.setIcon(browsers.path),
				oncommand: "LaunchBrowser.launch(this.getAttribute('path'))" //LaunchBrowser.launch(this.attributes['path'].value)
			});
			//mItemPlace.classList.add('menuitem-iconic');
			if (this.isFolder && popupPlace) popupPlace.appendChild(mItemPlace); 
			else if(this.isFolder && !popupPlace){
				var popupPlace = document.createElement("menupopup"); 
				popupPlace.appendChild(mItemPlace);
			}
			else $('placesContext').insertBefore(mItemPlace, $('placesContext_open:newtab'));
		}

		if (this.isFolder) {
			let menuPlace = $C('menu', {
				class: "placesContext-LaunchBrowser menu-iconic",
				label: '其他浏览器',
				accesskey: "U",
				selection: 'link',
				selectiontype: 'single',
				image: this.browsers[0].image || this.setIcon(this.browsers[0].path),
				onclick: "if(event.target!=event.currentTarget)return;var firstItem=event.currentTarget.querySelector('menuitem');if(!firstItem)return;if(event.button===1){checkForMiddleClick(firstItem,event);}else{firstItem.doCommand();closeMenus(event.currentTarget);}"
			});
			menuPlace.appendChild(popupPlace);
			$('placesContext').insertBefore(menuPlace, $('placesContext_open:newtab'));
		}
	},

	launch: function(path) {
		var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
		file.initWithPath(path);
		if (!file.exists()) {
			alert("浏览器路径出错，请检查配置");
			return;
		}
		var n = document.popupNode;
		if (n.node && n.node.uri) {
			this.shellServicr.openApplicationWithURI(file, n.node.uri);
		} else if (n._placesNode && n._placesNode.uri) {
			this.shellServicr.openApplicationWithURI(file, n._placesNode.uri);
		} else if (n.parentNode.view.nodeForTreeIndex(n.parentNode.view.selection.currentIndex) && n.parentNode.view.nodeForTreeIndex(n.parentNode.view.selection.currentIndex).uri) {
			this.shellServicr.openApplicationWithURI(file, n.parentNode.view.nodeForTreeIndex(n.parentNode.view.selection.currentIndex).uri);
		}
	},

	setIcon: function(path) {
		var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
		file.initWithPath(path);
		if (!file.exists()) return;
		let fileURL = Services.io.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler).getURLSpecFromFile(file);
		return "moz-icon://" + fileURL + "?size=16";
	}

};

LaunchBrowser.init();

function log() {
	Application.console.log('[VIOB] ' + Array.slice(arguments));
}

function $(id) document.getElementById(id);

function $C(name, attr) {
	var el = document.createElement(name);
	if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
	return el;
}