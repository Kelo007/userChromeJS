_addmenu.js
----------------------------------- 
 - 个人addmenu配置。
 - Y大原脚本地址：https://github.com/ywzhaiqi/userChromeJS/tree/master/addmenuPlus

####<a name="code">配置
```javascript
// 用edge打开
// 使用方法：从开始菜单拖出edge快捷方式放在自己喜欢的地方，此样例放在chrome文件夹中
{
	label: "在 edge 中打开",
	text: "%l",
	exec: Services.dirsvc.get("UChrm", Ci.nsILocalFile).path + "\\Microsoft Edge.lnk"
}

// 询问小娜
// 配合https://github.com/GH-Kelo/userChromeJS/tree/master/askCortana
{
	label: "询问Cortana",
	onclick: "askCortana.runCortana(content.getSelection().toString());"
}
```




