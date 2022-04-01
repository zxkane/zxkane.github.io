---
title: '[Eclipse]Equinox''s classloader and its URL schema'
date: 2008-07-17T17:42:00.000+08:00
draft: false
tags : [Equinox, OSGi, Eclipse]
---

Equinox uses the adaptor hooks to implement the class loader.  
See [http://wiki.eclipse.org/Adaptor_Hooks](http://wiki.eclipse.org/Adaptor_Hooks) for more detail  
  
BaseClassLoadingHook would search the native code on itself. If it find the file in that jar file, it would extract the native library into its storage folder.  
  
EclipseClassLoadingHook defines some variables to search the native library. Belows are built-in variables:  
  
result.add("ws/" + info.getWS() + "/"); //$NON-NLS-1$ //$NON-NLS-2$  
result.add("os/" + info.getOS() + "/" + info.getOSArch() + "/"); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$  
result.add("os/" + info.getOS() + "/"); //$NON-NLS-1$ //$NON-NLS-2$  
  
So the classloader can find your native library that under those path. If your bundle is jar file, equinox would extract your native library into its storage folder.  
  
I prefer to use OSGi header(Bundle-NativeCode) defining the path of native code, which still works on other OSGi implementations.  
  
Equinox defines its url schema, one of them is named as 'BundleURLConnection'. From its name, we know it's used for describing the files of bundle. You can obtain the url of file that is located on bundle by Bundle.getResource()/Bundle.getEntry()/Bundle.findEntries()/Bundle.getResources(). The return value of those functions are an object of BundleURLConnection. Once it's used as the argument of FileLocator.toFileURL(URL), the jar bundle would be unpacked into its storage folder recursively.