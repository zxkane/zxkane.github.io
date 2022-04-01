---
title: '[tip]Makefile'
date: 2008-05-22T20:37:00.001+08:00
draft: false
tags : [Tip, Linux, Makefile]
---

Build c/c++ project always need third party library on linux, such as gtk+, glib. Writing their absolute path in Makefile is not flexible way. You can use pkg-config instead of the absolute path. Below is code snippet:  
  
GTK_LIB=$(shell pkg-config --libs gtk+-2.0)  
GTK_INC=$(shell pkg-config --cflags gtk+-2.0)  
  
gcc -o yourlibrary.so $(GTK\_INC) $(GTK\_LIB)