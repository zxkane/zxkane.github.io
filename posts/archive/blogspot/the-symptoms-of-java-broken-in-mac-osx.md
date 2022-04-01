---
title: 'The symptoms of Java broken in Mac OSX 10.10 and fix solution'
date: 2015-07-13T19:11:00.000+08:00
draft: false
tags : [Java, Mac OSX, troubleshoot]
---

After uninstalling some applications from my Mac OSX, I found the applications that depends on JRE totally does not work. I noticed below symptoms,  
  
  

1.  Eclipse Mars can not be launched, even though I specified the launching vm to another one(\`java -version\` still work). The SWT native library failed to resolve the dependencies to '/System/Library/Frameworks/JavaVM.framework/Versions/A/JavaVM' which does not exists.
2.  I tried to reinstall Oracle 1.8.0_u45 via both brew and dmg image downloaded from Oracle website, both ways were failed as well.
3.  The Mac pkg Installer can not be started due to dylib broken. It means I can't install any pkg via GUI. The command line(such as `sudo installer -verboseR -target / -pkg /Volumes/OS\ X\ 10.10.4\ Update\ Combo/OSXUpdCombo10.10.4.pkg`) still works.

Finally I realized the problem was caused by I uninstalled the out of date Apple Java 6. Looks like all of above failures are required the system built-in Java. It really does not make sense the Oracle 1.8 installer script to depend on the out of date Java.

  

Finally I reinstalled [Java for OS X 2014-001](https://support.apple.com/kb/DL1572?locale=en_US) to make everything working again. The GUI installer for pkg still does not work, you need use below command to use the pkg.

  

  

sudo installer -verboseR -target / -pkg /Volumes/Java\ for\ OS\ X\ 2014-001/JavaForOSX.pkg