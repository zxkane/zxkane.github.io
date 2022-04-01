---
title: '[tip]Find -exec tip'
date: 2010-02-24T13:46:00.001+08:00
draft: false
tags : [Shell]
---

Using -exec command like below, need add escape character for semicolon that separated two commands in shell  
  
find directory/ -type d -exec chmod a+x {} \\;  
  
Feb 24, 2010 - update:  
find . -maxdepth 4 -type d  -name 'g-vxworks' 2>/dev/null -print