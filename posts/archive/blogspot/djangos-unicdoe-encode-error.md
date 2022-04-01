---
title: 'Django''s unicdoe encode error'
date: 2012-08-16T09:11:00.000+08:00
draft: false
tags : [django, encoding, python]
---

It's a common and ugly problem when using non-ascii characters in Django.  
  
The general solution is below,  
  

1.  put **\# -*- coding: utf-8 -*-** at beginning of every python source files that are using utf-8 characters
2.  declare every string variable as unicode, such as **str_var = u'中文字符'**
3.  add [a \_\_unicode\_\_](https://docs.djangoproject.com/en/1.4/ref/models/instances/#django.db.models.Model.__unicode__) method in your model classes
4.  if you are running server on apache/mod_wsgi or ngnix, you need [configure web server to use utf-8 encoding](https://docs.djangoproject.com/en/1.4/howto/deployment/modpython/#if-you-get-a-unicodeencodeerror)