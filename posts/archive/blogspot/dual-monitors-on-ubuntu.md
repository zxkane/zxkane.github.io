---
title: 'Dual monitors on Ubuntu'
date: 2012-03-19T20:04:00.000+08:00
draft: false
tags : [Tip, Ubuntu, Dual monitor, Trick]
---

I had two monitors for my workstation. One is 22' and the another is 17'. I used the small one as a extend desktop.  
  
Today I get a another 23' monitor to replace the small one. However the resolution of the 23' monitor can't be changed after pluging it in. It always used the resolution matching the 17' one.  
  
Both 'Setting - Display' and 'AMD Catalyst control' can't adjust it as higher resolution.  
  
After some tuning, I found a workaround.  
  
I totally remove all config of small one from **/etc/X11/xorg.conf**. Then change its resolution in 'AMD Catalyst control', it works!