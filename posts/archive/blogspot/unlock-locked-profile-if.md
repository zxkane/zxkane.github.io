---
title: 'Unlock the locked profile if firefox/thunderbird crash'
date: 2011-05-11T13:19:00.000+08:00
draft: false
---

I met that firefox/thunderbird complained another its instance running even if no a running firefox/thunderbird process. Finally let them run again after removing the '.parentlock' file in their default profile.  
  
strace utility helps me a lot to find the solution.  
  
**strace -f -e file firfox**