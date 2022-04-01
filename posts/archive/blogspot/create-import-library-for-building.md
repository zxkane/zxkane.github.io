---
title: 'Create an import library for building application in MinGW'
date: 2011-08-12T10:51:00.000+08:00
draft: false
tags : [compile, MinGW]
---

Yesterday I modified an existing c++ application for Windows. And its default build environment is Makefile and MinGW.  
  
However I used a newly Windows API that is not included by header files of MinGW.  
  
First of all, I copied the constant definition from header file of Windows SDK, and defined the Windows API method as a extern C method. So it's no problem to compile the code in MinGW.  
  
Secondly I have to fix the link issue. Because the symbol of the Windows API also can't be found by gcc link.  
  
Here great thanks to Google. It's quite easy to get the knowledge from others.  
  
I found a way to create an library by using dlltool. Dlltool is a utility to create an library with specified methods from existing dll library, which can be used by gcc link later.  
  
Below are links I referred to create an import library,  
  
\[1\] http://www.emmestech.com/moron_guides/moron1.html  
\[2\] http://www.mingw.org/wiki/CreateImportLibraries  
\[3\] http://lists-archives.org/mingw-users/19461-import-library-for-c.html