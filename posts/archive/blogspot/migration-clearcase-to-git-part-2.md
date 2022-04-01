---
title: 'Migration Clearcase to Git -- part 2'
date: 2011-10-25T19:45:00.000+08:00
draft: false
tags : [Git, Clearcase]
---

Several days ago I had a post to record the unsuccessful experience to migrate source code from Clearcase to Git.  
  
We have a new way after doing some brain storms. This way still is not a perfect solution, but it's much better than previous trial.  

1.  Use **clearexport_ccase** to export the source folder to intermittent data. See [documentation](http://publib.boulder.ibm.com/infocenter/cchelp/v7r0m1/index.jsp?topic=/com.ibm.rational.clearcase.cc_ref.doc/topics/clearexport_ccase.htm) of Clearcase admin.
2.  Create a temporary vob for importing the data later. See [example](http://publib.boulder.ibm.com/infocenter/cchelp/v7r0m1/index.jsp?topic=/com.ibm.rational.clearcase.tutorial.doc/a_cr_storagecomp_fcc_ux.htm).
3.  Import the data into temporary vob. See [example](http://www.philforhumanity.com/ClearCase_Support_38.html).
4.  Repeat step 1 to 3 for importing all necessary data into temporary vob.
5.  Use the SVN Importer to import the temporary vob as Subversion repository.
6.  Last steps refer to a documentation of [succeeded migration case](http://www.winklerweb.net/index.php/blog/4-eclipse/16-migrating-the-cdo-svn-repository-to-git) of one of Eclipse project from Subversion to Git.

Git definitely is greatest SCM tool now. The size of Subversion repository is around 10GB, finally the Git repository is less than 700MB, which saves more than 10 times disk space. It's awesome!  
  
The flaw of this way is that the removed elements in Clearcase(said using Main/LATEST as cspec of Clearcase vob when exporting) would lose after importing into a temporary vob. So switching to a maintenance branch or tag like 1.0/2.0 in Git, the source code is incomplete. The files existed in that branch or tag, then removed in latest code base are lost. The workaround could be manually checking in GA version to have complete code.  
  
If anybody have graceful and perfect solution to migrate Clearcase to Git, I think he could start a new business. :)