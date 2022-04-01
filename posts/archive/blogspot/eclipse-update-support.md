---
title: '[Eclipse]Eclipse update support'
date: 2007-01-17T13:51:00.000+08:00
draft: false
tags : [Update, Eclipse, RCP]
---

Those days my work is focus on eclipse's update. Now I understand the general mechanism and meet some issues when using it in development work.

The update mechanism includes four major types: install, enable, disable and uninstall. And all of those operations can be executed by command line, such as installing a feature can use following line:  
-application org.eclipse.update.core.standaloneUpdate -command install -featureId my.feature -version 1.0.0 -from file:/v:/local_updateSite/ -to file:/v:/eclipse/.  
The installation process would copy the feature and plugins which are included by the feature to the local site from the update site, then execute the feature's global install handler if it has one.  

Some strange issue occurs when I want to disable a feature.Then I try to disable the feature with command,  
-command disable -featureId my.feature -version 1.0.0 -to file:/v:/eclipse/  
The output of command means that the command is executed successfully.  
But I list the status of features with command line "-command listFeatures", the status of my.feature is still enable.  
Then I try to uninstall my.feature with command,  
-command uninstall -featureId my.feature -version 1.0.0 -to file:/v:/eclipse/  
It fails, and the following is the root cause found in log file.  
!MESSAGE \[Cannot find unconfigured feature my.feature with version 1.0.0\]  
unconfigured feature means the feature is disabled.

I posted my question in forum, and one guy told me that it might be a bug of eclipse and advised me to fire a bug for it.