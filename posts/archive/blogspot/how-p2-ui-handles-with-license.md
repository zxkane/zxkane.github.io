---
title: 'How p2 UI handles with license agreements'
date: 2009-12-30T16:56:00.001+08:00
draft: false
---

P2 install wizard firstly query the repository to find out the root installable unit(as well as top installable). Then p2 recalculate the dependency and try to search the requirements in all available repositories after user submits their installation request. Go to the license agreement page if all the dependencies are satisfied.  
  
P2 agreement page obtains all the units to be installed from the operands of provision plan. The number always is much greater than the number submitted by user. Because the submitted IUs only are the root IUs.  
  
P2 UI would check the unaccepted licenses comparing to before records. The policy class of p2 UI provides the license manager to record the even accepted license. It traverses all the installable units, querying its license whether it has already been accepted if it has. If the license agreement has been accepted, it would be ignored, won't be shown in the agreement page. Otherwise, new record is created to mark it as accepted by the license manager and display it in the agreement wizard page.  
  
The default implementation of license manager would persist the accepted information in the file -- <workspace>/.metadata/.plugins/org.eclipse.equinox.p2.ui.sdk/license.xml.