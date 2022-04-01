---
title: 'The workaround of making Zend CE/Zend debugger work on mountain lion'
date: 2012-07-28T20:49:00.001+08:00
draft: false
tags : [zend ce, zend debugger, workaround, Eclipse, php, mountain lion]
---

I installed both Zend CE and zend debugger of Eclipse on my Mac. Both of them work well in Mac lion.  However they don't work any more after I upgraded my Mac to mountain lion. 

  

After some investigation I found some extensions of Zend PHP can't be loaded due to shared library dependency can't be found in mountain lion. The **xslt** module of PHP depends on some system libraries(suc as /usr/local/libxslt-1.1.23/lib/libxslt.1.dylib) that have been removed by mountain lion.

  

The temporary solution is disabling **xlst module** of zend PHP if your application doesn't need them. 

  

The workaround fix of Zend CE on Mac, 

> rename _**/usr/local/zend/lib/php_extensions/xsl.so**_ to any other name

  

The workaround fix of zend debugger for Eclipse, 

  

> Delete the line _extension=xsl.so_ from file **<your eclipse>/plugins/org.zend.php.debug.debugger.macosx_5.3.18.v20110322/resources/php53/php.ini**