// ==UserScript==
// @name	askCortana.uc.js
// @author	Kelo 
// @charset	UTF-8
// @include	main
// ==/UserScript==
(function() {
	var ac = window.askCortana = {
		// 延时
		_delay: 100,
		// 循环次数，解决运行vbs可能未打开开始菜单问题 （360或其他杀软问题）
		_popupmenucount: 5,
		get sysVersion() Services.sysinfo.getProperty("version").split(".")[0],
		init: function() {
			if (this.sysVersion != 10) {
				return;
			}
			var menu = document.getElementById("contentAreaContextMenu");
			var menuitem = $C("menuitem", {
				id: "askCortana",
				class: "menu-iconic",
				label: "询问Cortana",
				condition: "select",
				onclick: "askCortana.runCortana(content.getSelection().toString())"
			});
			menu.appendChild(menuitem);
			var menuitem = $C("menuitem", {
				id: "Xiaoice",
				class: "menu-iconic",
				label: "召唤小冰",
				onclick: "askCortana.runXiaoice();"
			});
			menu.appendChild(menuitem);
		},
		runCortana: function(str) {
			str = str.replace(/[\n\t]/g, "");
			this.copy(str);
			var vbsText = '\
				set ws=createobject("wscript.shell")\n\
				for i=1 to ' + this._popupmenucount + '\n\
				ws.sendKeys "^{esc}"\n\
				next\n\
				wscript.sleep ' + this._delay + '\n\
				ws.sendKeys "^v"\
			';
			var vbsFile = this.createTempFile(vbsText, 'runCortana.vbs');
			this.exec(vbsFile, [])
		},
		runXiaoice: function() {
			this.copy("召唤小冰")
			var vbsText = '\
				set ws=createobject("wscript.shell")\n\
				for i=1 to ' + this._popupmenucount + '\n\
				ws.sendKeys "^{esc}"\n\
				next\n\
				wscript.sleep ' + this._delay + '\n\
				ws.sendKeys "^v"\n\
				wscript.sleep ' + this._delay + '\n\
				ws.sendKeys "{ENTER}"\
			';
			var vbsFile = this.createTempFile(vbsText, 'runXiaoice.vbs');
			this.exec(vbsFile, [])
		},
		copy: function(str) {
			Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper).copyString(str);
		},
		exec: function(path, args, blocking) {
			if (typeof blocking == 'undefined') blocking = false;
			var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
			file.initWithPath(path);
			if (args instanceof Array) {
				args = args;
			} else if (typeof args == "string") {
				args = [args];
			}
			if (file.exists()) {
				var proc = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
				proc.init(file);
				proc["runw" in proc ? "runw" : "run"](blocking, args, args.length);
				return true;
			} else {
				Cu.reportError('File Not Found: ' + path);
				return false;
			}
		},
		createTempFile : function(data, filename, charset) {
			var file = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("TmpD", Ci.nsIFile);
			file.append(filename);
			if (file.exists()) {
		    		file.remove(false);
			}
			file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);

			var foStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
			foStream.init(file, 0x02 | 0x08 | 0x20, 0700, 0);
			var converter = Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(Ci.nsIConverterOutputStream);
			converter.init(foStream, charset || "gbk", 0, "?".charCodeAt(0));
			converter.writeString(data);
			converter.close();

			return file.path;
		},

	};
	ac.init();

	function $C(name, attr) {
		var el = document.createElement(name);
		if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
		return el;
	}

})();