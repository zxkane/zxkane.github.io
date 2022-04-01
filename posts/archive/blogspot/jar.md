---
title: '加载jar文件里的本地库'
date: 2007-01-24T14:19:00.000+08:00
draft: false
tags : [Java, JNI]
---

java程序开发中经常用到JNI调用本地library, 同时又希望将library同class文件编译成一个jar文件以方便deploy.

但是JDK的classloader不支持从jar文件中加载library, 一个变通的方法就是jar里的library以临时文件的方式写到临时目录或java.library目录.

附上两篇文档链接 :

[](http://www.javaworld.com.tw/jute/post/view?bid=29&id=173624&tpg=1&ppg=1&sty=1&age=0#173624)**[Load Library inside a jar file](http://www.javaworld.com.tw/jute/post/view?bid=29&id=173624&tpg=1&ppg=1&sty=1&age=0#173624)  
**

[使用JNI时，装载本地库的小技巧](http://www.javaeye.com/topic/17713 "固定链接：使用JNI时，装载本地库的小技巧")