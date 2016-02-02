// ==UserScript==
// @name	OpenWithPhotoShop.uc.js
// @author	Kelo 
// @charset	UTF-8
// @include	main
// ==/UserScript==
(function() {
  function Path(path) {
    this.path = path;
    this.extension = null;
    this.name = null;
  }
  Path.prototype = {
    normalize() {
      this.path = this.path
        .replace(/\.jpg\.thumb\.jpg$/, '.jpg');
      return this;
    },
    open(cb, shouldNormalize = false, shouldSolve = false) {
      var xhr = new XMLHttpRequest();
      xhr.open('HEAD', this.path, true);
      xhr.send(null);
      xhr.onload = event => {
        this.path = event.target.responseURL;
        if (shouldNormalize) {
          this.normalize();
        }
        if (shouldNormalize) {
          this.solve();
        }
        cb.call(this, this.path);
      }
    },
    solve() {
      var SOLVE_REG = /.*\/(.+)(\.(?:jpe?g|bmp|gif|png))(\?.*)?$/i;
      var result = this.path.match(SOLVE_REG);
      this.name = result[1];
      this.extension = result[2];
      // Debug here.
      if (!this.name || !this.extension) {
        console.log("Please check it. The PATH is %s. The result is %o", this.path, result);
      }
      return this;
    }
  };

  var PSRunner = {
    init(ps) {
      var psPath = ps.path, file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
      file.initWithPath(psPath);
      // Check if the photoshop is exists.
      if (!file.exists()) {
        console.log("Your photoshop is not exists.");
        return;
      }
      this.PS = file;
      this.canRun = true;
    },
    /**
     * Run photoshop with a image.
     * @param  {Path} image The path of image.
     */
    run(image) {
      // Should init first.
      if (!this.canRun) {
        return;
      }

      var imagePath = image.path;
      var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
      process.init(this.PS);
      process.runw(false, [imagePath], 1);
    }
  };

  function ImageDownloader(imPath) {
    var {Downloads} = Cu.import("resource://gre/modules/Downloads.jsm", {});
    var file = OS.Path.join(OS.Constants.Path.tmpDir, imPath.name + imPath.extension);
    return Downloads.fetch(imPath.path, file, {isPrivate: true}).then(
      () => {
        console.log("Download done. Path: %s Date: %d", file, Date.now());
        return new Path(file);
      }, () => {
        console.log("Download wrong. Path: %s", imPath.path);
    });
  }

  var MenuItem = {
    init() {
      var menuitem = document.createElement("menuitem");
      menuitem.setAttribute("id", "OpenWithPhotoShop");
      menuitem.setAttribute("class", "menuitem-iconic");
      menuitem.setAttribute("label", "用 PhotoShop 打开");
      menuitem.addEventListener("command", this, false);
      var menu = document.getElementById("contentAreaContextMenu");
      menu.appendChild(menuitem);
      this.menuitem = menuitem;
    },
    handleEvent(event) {
      this["on" + event.type](event);
    },
    oncommand(event) {
      var imagePath = new Path(gContextMenu.mediaURL || gContextMenu.imageURL);
      if (!imagePath.path) {
        return alert("空的图片地址！");
      }
      imagePath.open(function() {
        ImageDownloader(this).then(imPath => {
          PSRunner.run(imPath);
        });
      }, true, true);
    }
  };

  var OpenWithPhotoShop = {
    ps: "D:\\Adobe\\Photoshop cc\\Adobe Photoshop CC (64 Bit)\\Photoshop.exe",
    init() {
      PSRunner.init(new Path(this.ps));
      MenuItem.init();
    }
  };
  OpenWithPhotoShop.init();
})();