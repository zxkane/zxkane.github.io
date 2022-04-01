---
title: '[debug][java]Remote debug in Eclipse'
date: 2006-10-18T12:53:00.000+08:00
draft: false
tags : [Java, Eclipse, Debug]
---

I need use remote debug in our project, however just some experience in Weblogic were found from internet. After my investigation, I got some experience about using Eclipse remote debug RCP.  
There are two important parameters for jvm. And we must launch remote java app with those two parameters.  
-Xdebug //tells jvm starting with debug mode  
-Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=1044 //transport=dt_socket represents communication with socket, address=1044 represents that the port number is 1044  
Then there are 3 steps in local env:  
1.import source code into eclipse's project  
2.Debug-Remote Java Application, see attachement as a sample  
3.insert breakpoint,  
  
update:  
a simpler way:  
-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=8000