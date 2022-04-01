---
title: 'Customize PDE build'
date: 2011-07-22T13:59:00.000+08:00
draft: false
tags : [PDE, Eclipse, build]
---

[The documentation of PDE](http://help.eclipse.org/helios/index.jsp?topic=/org.eclipse.pde.doc.user/tasks/pde_customization.htm) has a chapter for this topic. Basically it's simply. Copy the template scripts what you want from _templates/headless-build_ folder under _org.eclipse.pde.build_ plug-in to your build configuration directory that is the folder has _build.properties_ file.  
  
However I found the variables listed in template '_customAssembly.xml_' can't be used in the runtime. I filed bug [346370](https://bugs.eclipse.org/bugs/show_bug.cgi?id=346370) against it.