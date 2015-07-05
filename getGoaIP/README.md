getGoaIP.uc.js
----------------------------------- 
 - 获取网络上分享的IP。  
 - 看到的低调使用。  
 - 还未经各站长同意，若不允许，本人无条件删除。  

###说明  
####<a name="code">编写规则
```javascript
 // url(必须):
 // 描述：网站网址
 // 类型：String
 // ————————————
 // get:
 // 描述：一个CSS选择器（通过innerHTML查找IP）或一个自定义function，以数组形式返回IP。
 // 类型：String | Function
 // e.g.
    // CSS选择器
    get: "div[class='crayon-line'][id|='crayon']",
    // 自定义function doc: 该网站document site: 即自身obj
    get: function(doc, site) {
    	return doc.querySelector("div[class='crayon-line'][id|='crayon']").innerHTML.match(/((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))/g);
     },
 // ————————————
 // download:
 // 描述：一个下载地址或字符串"get"或自定义function。
 // 类型：String | Function
 // e.g.
    // 下载该地址内容
    download: "http://www.firefoxfan.com/goagentip/proxy.ini",
    // 将get的ip以txt文件下载下来
    download: "get",
    // 自定义function doc: 该网站document site: 即自身obj
    download: function(doc, site) {
    	//do something
    },
 // ————————————
```


####自定义命令
 - 用于鼠标手势、KeyChanger等
  - getGoaIP.run(action, site);
    - action String
    - site String | Number | Array
 - e.g.
  - 获取所有IP
    - getGoaIP.run(); | getGoaIP.run("get");
  - 获取规则一的IP
    - getGoaIP.run("get", 0); | getGoaIP.run("get", "firefoxfan");
  - 获取规则一、规则二的IP
    - getGoaIP.run("get", [0, 1]); | getGoaIP.run("get", ["firefoxfan", "honglingjin"]);
  - 下载规则一IP
    - getGoaIP.run("download", 1); | getGoaIP.run("download", "firefoxfan");

###图片  
![](https://github.com/GH-Kelo/userChromeJS/raw/master/getGoaIP/img/getGoaIP.png "getGoaIP")  
![](https://github.com/GH-Kelo/userChromeJS/raw/master/getGoaIP/img/getGoaIP2.png "getGoaIP2")  

###更新记录    
 - 2015.7.05 0.0.4 更新
 - 2015.7.04 0.0.3 更新
 - 2015.7.03 0.0.2 更新
  - 1）重写大部分代码
  - 2）使用Promise对象
  - 3）download部分改写还未完成
 - 2015.5.30 0.0.1 Create.  


