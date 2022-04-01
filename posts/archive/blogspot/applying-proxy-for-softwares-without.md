---
title: 'applying proxy for the softwares without proxy support in linux'
date: 2010-09-13T13:14:00.001+08:00
draft: false
---

If you have http proxy, set it to system environment,  

export http_proxy=http://[127.0.0.1](http://127.0.0.1):8000 Then start the application in that same terminal.  
  
If the proxy is socks proxy, use '[tsocks](http://tsocks.sourceforge.net/about.php)' to wrap the application in terminal.