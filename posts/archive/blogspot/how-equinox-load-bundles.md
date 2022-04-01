---
title: '[eclipse]How Equinox load bundles'
date: 2009-12-02T14:58:00.001+08:00
draft: false
tags : [Equinox, Eclipse]
---

How Equinox load bundles
========================

  
Equinox launcher is responsible to start OSGi framework. The system bundle would be created and marked as installed when initializing the framework. Equinox also tries to install the installed bundles if finding them in persistence data during the initializing period. Of course there is no extra bundles would be installed when launching Equinox first time.  
![](http://docs.google.com/drawings/image?id=sNT8DMKTCXXaH4PoaQOafoA&w=400&h=400&rev=109&ac=1)  
  
Then Equinox launcher would install the bundles specified by vm's system property 'osgi.bundles'. And start the initial bundles that are marked as early start. For example, let's have a look at the configuration/config.ini of Eclipse, you would find a line similar as below,  
osgi.bundles=reference\\:file\\:org.eclipse.equinox.simpleconfigurator_1.0.200.v20090831.jar@1\\:start  
It means the start level of bundle 'org.eclipse.equinox.simpleconfigurator_1.0.200.v20090831.jar' is 1, and it would be started after installing it.  
  
Here you would ask there are only two bundles are installed(one is system bundle 'org.eclipse.osgi', the other is 'org.eclipse.equinox.simpleconfigurator') when launching Equinox, how the other bundles are installed? It's done by the activate method of 'simpleconfigurator' bundle. The available bundles are recorded in plain text file configuration/org.eclipse.equinox.simpleconfigurator/bundles.info, simpleconfigurator read the file then install those bundles.  
  
It's a new bundle management introduced by p2. P2 also supports the traditional way to install extensions, such as link file, .eclipseproduct file and directly copying features/plugins.  
Below table lists the p2 bundles to implement the compatibility installation feature,  

Bundle  

Usage  

org.eclipse.equinox.p2.directorywatcher  

the definition and implementation of directory watcher API  

org.eclipse.equinox.p2.updatesite  

the implementation of updatesite repository  

org.eclipse.equinox.p2.extensionlocation  

the implementation of extension repository  

org.eclipse.equinox.p2.reconciler.dropins  

scan dropin folder and link files; watch the traditional configuration file used by update manager  

  
P2 reconciler would scan the dropin, link folder and legacy configuration file in every Equinox launching. You can disable the capability by marking it not be early start.  
org.eclipse.equinox.p2.reconciler.dropins,1.0.100.v20091010,plugins/org.eclipse.equinox.p2.reconciler.dropins_1.0.100.v20091010.jar,4,false  
  
If finding some new bundles in dorpin folder, the reconciler would add the new bundles into a local metadata repository that is stored as OSGi data of Equinox. Then synchronize the bundles into the current p2 profile, then add the new bundles into bundles.info file.