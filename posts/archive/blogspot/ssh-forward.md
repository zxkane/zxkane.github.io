---
title: '[tip]ssh forward'
date: 2009-10-28T15:29:00.001+08:00
draft: false
tags : [ssh, Tip]
---

ssh -qTfnN -D LocalPort remotehost  
  
All the added options are for a ssh session that's used for tunneling.  
  
-q :- be very quite, we are acting only as a tunnel.  
-T :- Do not allocate a pseudo tty, we are only acting a tunnel.  
-f :- move the ssh process to background, as we don't want to interact with this ssh session directly.  
-N :- Do not execute remote command.  
-n :- redirect standard input to /dev/null.  
  
In addition on a slow line you can gain performance by enabling compression with the -C option.