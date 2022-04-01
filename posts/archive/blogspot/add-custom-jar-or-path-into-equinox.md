---
title: '[OSGi][Eclipse]Add custom jar or path into Equinox Framework'
date: 2008-09-28T13:23:00.001+08:00
draft: false
tags : [Equinox, OSGi, Eclipse]
---

Set vm arguments 'osgi.framework.extensions' and 'osgi.frameworkClassPath' when vm starts. If those value are set, those jar or path would be added into the classloader when starting EclipseStarter.  
  
See org.eclipse.equinox.launcher.Main for more details in the source code of Eclipse 3.4.  
Best Regards  
Kane