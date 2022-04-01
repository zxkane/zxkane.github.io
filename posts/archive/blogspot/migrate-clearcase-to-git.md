---
title: 'Migrate Clearcase to Git'
date: 2011-10-17T19:50:00.002+08:00
draft: false
tags : [Git, Clearcase]
---

I tried to migrate the source code of project from Clearcase to Git repository. As far as I know there is no elegant solution for such migration. For purpose of this migration, I want to keep the history and label of files in Clearcase after migrating to Git repository.  
  
There are mature tools to migrate CVS/SVN repository to Git, so I tried to use Subversion as a bridge for my migration.  
  
I used a free software '[SVN Importer](http://www.polarion.com/products/svn/svn_importer.php)' to import the Clearcase vobs to Subversion. The tool is great, and it keeps the history of files, labels and branches. The entire size of new Subversion repository has near 50GB which is unacceptable size of Git repository. The subversion repository contains a lot of legacy code and unwanted binaries, so removing those revisions could significantly reduce the size of subversion repository. And subversion provides some admin tools to manipulate the metadata of subversion, it's possible to remove the unnecessary revisions and re-create a subversion repository with refined content. But I don't have any experience to use the admin tool of subversion before, I failed to filter the unwanted data. It's not worthy of costing too much effects on it. Finally I failed to filter the subversion repository.  
  
Actually the detail history of files is rarely used. If need, we still can find it in Clearcase. At last I manually checked in the released version of our project into Git repository, and tagged them.  
  
Wrote this unsuccessful idea here for elapsed efforts.