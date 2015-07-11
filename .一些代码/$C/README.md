$C
===================================  
 - 主要功能是创建元素节点及对其进行各种操作。
 - 学习jq的设计模式，可以使用链式操作。

###example
```js
// 在导航栏创建一个按钮和分割线
$C([{
	// 用于未创建元素节点时的选取
	id:"test",
	// 元素类型
	type: "toolbarbutton",
	// 设置属性
	attrs: {
		// 元素节点的id
		id:"test",
		label:"test"
	},
	events: {
		oncommand: function() {
			// do something
		}
	}
},{
	//... 空obj默认为menuseparator
}])
.append(document.getElementById("nav-bar")); // 除了append还可以使用after和before
```
```js
// 对元素进行操作
$C([{
	// 用于未创建元素节点时的选取
	id:"test",
	// 元素类型
	type: "toolbarbutton",
	// 设置属性
	attrs: {
		// 元素节点的id
		id:"test",
		label:"test"
	},
	events: {
		oncommand: function() {
			// do something
		}
	}
},{
	//... 空obj默认为menuseparator
}])
.$("test") // 获取test
.hide() // 将它隐藏
.$("test") // 获取test
.show() // 将它显示
.after(); //创建元素节点
```
```js
// 较复杂示例
$C([{
	type:"toolbarbutton",
	attrs:{
		type:"menu",
		image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAqElEQVQ4ja1ObQuCMBi8XxsShCGMRBmJtiiSrCCQiP7q9Wkyn00d1MFxbzxjwD9g7h+GGLvjcHtTPup2Szvq64tWpQ917g0AoLr0tCp9qHNvAAD6/PS+6HZLO8rjgyHG7gPypmPedIzNHlTVUlUtY/OATJ8YotynMtLCeK+6XVoYzmVsdjWtSm+z3EdYqz2tSm+z3EdIMu2VbpdkmnMZq23JEOU+lX/CF5tmGfKU1HvcAAAAAElFTkSuQmCC"
	},
	events:{
		oncommand:function() {
			alert("run")
		}
  	},
	childs:[{
		type:"menupopup",
		childs:[{
			type:"menuitem",
			attrs:{
				label:"test"
			}
		}]   
 	 }]
}])
.append()
```


