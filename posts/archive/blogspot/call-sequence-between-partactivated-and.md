---
title: '[Eclipse]The call sequence between partActivated and menu update'
date: 2006-10-19T12:42:00.000+08:00
draft: false
tags : [Eclipse, RCP]
---

I met a defect that dynamically created menu items disappear after creating a new viewPart. It caused me overtime last Friday. Today I find the root cause.

The scenario is:

1.  open first document, the items are shown well
    
2.  open another document, the items disappear
    

The requirement is that showing the menu items while current part is document, otherwise hide them.

So our implementation is:

1.  when current document part is deactivated, set menu items invisible
    
2.  when document part is activated, set menu items visible
    

  

After debugging, I found that menu items was updated before the part activated listener was notified. Hence the menu is invisible while the parent menu is updated. The resolved solution is that setting menu items visible while part opened listener is notified.