---
title: 说一说阿里云ossfs
category: aliyun oss ossfs
date: 2016-02-26
tags: 
- aliyun 
- oss 
- ossfs
- 阿里云
categories: 
- blogging 
isCJKLanguage: true
---

阿里云提供的对象或者文件存储叫[OSS](https://www.aliyun.com/product/oss)，为应用程序提供了海量存储，按需付费等服务。应用程序则需要通过[Aliyun OSS](https://www.aliyun.com/product/oss)的各语言SDK才能操作（读，写，遍历等）OSS中的文件。

对运维人员来说，做一些数据维护工作的时候，通过SDK操作[OSS](https://www.aliyun.com/product/oss)中的文件就会比较麻烦。在linux/unix环境下，通常有一些工具把远程文件系统或云盘挂载为本地文件。在网络状况比较好的情况下，操作远程文件就像操作本地文件一样。例如，把[Amazon S3](https://github.com/s3fs-fuse/s3fs-fuse)，[Dropbox云盘](https://github.com/joe42/CloudFusion)，[可通过ssh登录的远程服务器上的磁盘](https://github.com/libfuse/sshfs)挂载为本地文件系统。

之前也有第三方公司开发的工具把[OSS bucket](https://www.aliyun.com/product/oss)挂载为本地磁盘。出于安全考虑一直为敢使用。

终于，阿里云推出了官方开源版本的[ossfs](https://github.com/aliyun/ossfs)，并且提供技术支持（通过工单）。

接下来，聊聊我的使用体会。

<!-- more -->

* 安装，配置都还简单。
* 文档看起来比较详细，但实际操作起来有些就不对。感觉写文档的人，并没有在相应环境上测试过。
* 权限设计的一塌糊涂。[ossfs](https://github.com/aliyun/ossfs)基于[FUSE](https://en.wikipedia.org/wiki/Filesystem_in_Userspace)，理当允许非root挂载或卸载OSS bucket。非root用户使用[ossfs](https://github.com/aliyun/ossfs)挂载的文件默认的owner都是**root**! 还好目前有workaround，挂载的时候指定参数，`-ouid=your_uid -ogid=your_gid`来指定文件的owner。
* 性能极其低下！！！一台ECS主机挂载了一个使用内网地址的oss bucket，bucket根下面有2k+子目录（对文件系统而言）,bucket内文件总计有28G。然而执行`ls /tmp/<bucket mount point>`超过10分钟都无法完成。而我们[V秘](https://vme360.com)之前用Java实现的[AliyunOSSFS](https://github.com/videome/AliyunOSSFS)执行同样的操作只需要数秒。
* 阿里云相关的技术支持人员及其不专业。很多文件系统，[FUSE](https://en.wikipedia.org/wiki/Filesystem_in_Userspace)等概念都不甚了解。跟他们沟通这些技术问题，首先要花时间进行教育。花费大量时间来沟通，进展确缓慢。


## 总之，[阿里云ossfs](https://github.com/aliyun/ossfs)这个工具远远没有达到**production ready**的质量。无法使用到生产环境中。