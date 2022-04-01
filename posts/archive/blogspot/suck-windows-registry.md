---
title: '万恶的注册表'
date: 2007-04-03T13:16:00.000+08:00
draft: false
tags : [注册表]
---

最近几天被一个注册表相关的defect搞的焦头烂额。

背景是这样的，产品在安装的时候需要通过修改注册表注册文件关联等信息。在先前安装程序基于InstallShield时工作正确，但在最近安装程序改用MSI后，我们写入注册表的信息没有被写到所期望的位置。

通过各种试验，查找资料，终于搞明白原因。我们修改注册表的进程不是当前用户进程，而是系统进程，因此写入到HKEY\_CURRENT\_USER下的数据不能被写入到当前登陆用户下。

We should not use "**HKEY\_CURRENT\_USER"** to retrival current user's registry key value. Because Windows Services always startup before user login. It may happen some error or loading the wrong setting profile. If you still insist on using the current user registry key setting, please refer "_[RegOpenCurrentUser](http://msdn.microsoft.com/library/default.asp?url=/library/en-us/sysinfo/base/regopencurrentuser.asp)_".  

最后只好将这些数据写到了Local Machine键值下。