// ==UserScript==
// @name	askCortana.uc.js
// @author	Kelo 
// @charset	UTF-8
// @include	main
// ==/UserScript==
(function() {
	window.askCortana = ac = {
		// 延时
		delay: 100,
		// 循环次数，解决运行vbs可能未打开开始菜单问题
		count: 5,
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
				onclick: "askCortana.runCortana(content.getSelection().toString());"
			});
			menu.appendChild(menuitem);
		},
		runCortana: function(str) {
			this.timer && clearTimeout(this.timer);
			str = str.replace(/[\n\t]/g, "");
			var vbsText = '\
				set ws=createobject("wscript.shell")\n\
				for i=1 to ' + this.count + '\n\
				ws.sendKeys "^{esc}"\n\
				next\
			';
			var vbsFile = this.createTempFile(vbsText, 'popupMenu.vbs');
			this.exec(vbsFile, []);
			this.timer = setTimeout(() => {
				if (document.hasFocus()) {
					this.runCortana(str);
					return;
				}
				var vbsText = '\
					set ws=createobject("wscript.shell")\n\
					code="' + str + '"\n\
					ws.Run "cmd.exe /c echo " & code & "| clip.exe", vbHide\n\
					ws.sendKeys "^v"\
				';
				var vbsFile = this.createTempFile(vbsText, 'runCortana.vbs');
				this.exec(vbsFile, []);
			}, this.delay);
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