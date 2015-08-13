askCortana.uc.js
----------------------------------- 
###说明  
 - 询问Cortana  
 - win10 only  
 - 如何使用快捷方式？
  1. 你可以从开始菜单中拖出Cortana.lnk（[查看动图](https://github.com/GH-Kelo/userChromeJS/raw/master/askCortana/img/img3.gif)）或下载提供的 [快捷方式.zip](https://github.com/GH-Kelo/userChromeJS/raw/master/askCortana/%E5%BF%AB%E6%8D%B7%E6%96%B9%E5%BC%8F.zip) （不保证每台电脑都可以使用）
  2. 将Cortana.lnk放在配置中，如放在profile\chrome中，然后打开askCortana.uc.js修改第14行`_path: "chrome\\Cortana.lnk",`
 - askCortana.uc.js和askCortana(纯vbs).uc.js区别
  - askCortana(纯vbs).uc.js大多数功能由VBS实现；askCortana.uc.js是JS与VBS混合，很难控制时间、耦合，但扩展性很强
  - 最佳方案是askCortana.uc.js + 快捷方式

###图片  
![](https://github.com/GH-Kelo/userChromeJS/raw/master/askCortana/img/img1.png "图片展示")   
![](https://github.com/GH-Kelo/userChromeJS/raw/master/askCortana/img/img2.png "图片展示")   
###更新记录  
 - 2015.08.01 创建  


