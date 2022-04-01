---
title: 'Eclipse/OSGi preference'
date: 2009-10-22T15:29:00.000+08:00
draft: false
tags : [Equinox, OSGi, Eclipse]
---

The IPreferenceStore API of Eclipse is based on OSGi's preferences service. Equinox implements several scope context for different preferences, such DefaultScope, InstanceScope and ConfigurationScope. The IPreferenceStore is the wrapper of instance scope for back-compatibility. It stored the data in workspace(osgi.data.area).

The workspace folder would be created when launching RCP application if it doesn't exist. But we can use argument '-data @none' to suppress the creation of workspace. If that, the instance scope/IPreferenceStore can't store any value any more.

There is a workaround to resolve such issue. Use ConfigurationScope instead of InstanceScope. Both of them are implemented the same interface, so it's easy to migrate to use ConfigurationScope. The data of configuration scope would be stored in @config.dir/.setting folder.