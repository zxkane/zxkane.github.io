---
title: "文件系统的Inode耗尽，会导致Docker编译镜像出现'No space left on device'错误"
date: 2016-01-21
categories: 
- blogging 
isCJKLanguage: true
tags:
- docker
- troubleshoot
---

最近在提交前端代码后，前端代码的自动发布老是失败。失败的原因多是编译Docker镜像时在执行`COPY`语句拷贝文件到镜像文件系统时，扔出了'No space left on device'这个错误。这个错误根据描述非常好理解，就是docker文件系统所在磁盘没有了空间。

但是通过`df -h`命令，该磁盘至少还有3，4个G的剩余空间。而前端镜像的文件大小最多也不超过300M。在该磁盘通过`touch`,`cp`仍然可以创建文件。

所以这个问题非常奇怪，为什么`docker`或者`操作系统`抱怨磁盘没有了空间？在磁盘仍然剩余数个G的情况下？

<!-- more -->

再通过相关的查找后，docker的这个[issue](https://github.com/docker/docker/issues/18144)给了我启发。Linux文件系统的`inode`在耗尽后，该文件系统将不能再创建新文件。因为前端页面是基于`nodejs`的程序，它依赖的packages产生了大量文件，在反复制作不同的docker images时，这些依赖文件又被反复复制，导致文件数量远远超过了默认inode和磁盘大小的比例，最终`inode`先于磁盘空间被全部使用。

遇到类似问题的同学，可以通过`df -i`查看`inode`的使用情况来排查问题是否由于`inode`耗尽导致这个错误。
