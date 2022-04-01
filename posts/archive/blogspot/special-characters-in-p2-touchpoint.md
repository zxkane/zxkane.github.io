---
title: 'special characters in p2 touchpoint instruction'
date: 2010-02-05T16:15:00.000+08:00
draft: false
---

I suffered p2 installation failed on the configure parse. Becase I try to add vm arguments for my application.  
For example, I added '-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=8272' in the product configuration.  
P2 will fail when parsing the argument, because it contains ':' and ',' that should be escaped.  
It works again after replacing it to '-agentlib${#58}jdwp=transport=dt_socket${#44}server=y${#44}suspend=n${#44}address=8272'.  
The more detail note could be found in [p2 touchpoint wiki](http://wiki.eclipse.org/Equinox/p2/Engine/Touchpoint_Instructions#Variables_Available_in_all_phases).  
And I also opened [bug](https://bugs.eclipse.org/bugs/show_bug.cgi?id=301927) to request improving it.