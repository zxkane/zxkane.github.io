---
title: '[OSGi][Equinox]the Bundle-NativeCode implementation in Equinox'
date: 2008-03-31T17:36:00.001+08:00
draft: false
tags : [Equinox, NativeCode, Bundle, OSGi, Eclipse]
---

OSGi Spec defines Bundle-NativeCode header to contain a specification of native code libraries contained in that bundle. All magic things are initialized by org.eclipse.osgi.internal.baseadaptor.DefaultClassLoader.findLibrary(String) and org.eclipse.osgi.framework.internal.core.BundleLoader.findLibrary(String). Then BundleLoader uses the org.eclipse.osgi.baseadaptor.BaseData(an implementation of BundleData) to find the library path, if the bundle is NOT a jar file, it would directly get the absolute path of library. Otherwise, the BaseData would extract the library file if it could NOT find it in OSGi bundle storage(located in ${data}/org.eclipse.osgi/bundles/\[bundle_id\]/.cp/). Refer to org.eclipse.osgi.baseadaptor.BaseData.findLibrary(String) for more detail.