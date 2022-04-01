---
title: 如何修复Jenkins CI无法读取存在的任务配置
date: 2016-10-12
categories: 
- blogging 
isCJKLanguage: true
tags:
- Jenkins 
- trouble-shooting
---

[V秘][vme]开发团队一直使用着[Jenkins CI][jenkins]来持续集成[V秘][vme]服务的新功能和各种改进。近日，[Jenkins CI][jenkins]在重启之后，很多已有任务的配置无法被[Jenkins CI][jenkins]完整的加载，导致很多功能无法使用。导致我们整个网站的各种服务无法被升级更新了:-(

[Jenkins CI][jenkins]在管理控制台列出如下的错误信息，示意现有任务的部分配置由于错误无法加载。

	CannotResolveClassException: hudson.plugins.git.GitSCM, 
	CannotResolveClassException: com.cloudbees.jenkins.plugins.BitBucketTrigger, 
	CannotResolveClassException: hudson.plugins.emailext.ExtendedEmailPublisher, 
	CannotResolveClassException: hudson.plugins.parameterizedtrigger.BuildTrigger

通过上面的错误信息，我们初步认为错误是由于插件无法被[Jenkins CI][jenkins]加载。但是通过[Jenkins CI][jenkins]的插件管理列表，我们发现**Git**插件已经被认为是安装的了。同时我们也可以在[Jenkins CI][jenkins]安装目录中找到插件对应的文件`git.jar`，并且成功验证了类`hudson.plugins.git.GitSCM`也是存在在jar文件里面的。重新安装`Git client`插件也不能解决这个错误！

<!-- more -->

经过进一步的分析，通过[Jenkins CI][jenkins]的系统日志，我们发现`Git插件`虽然是成功安装了，但是它所依赖的某些插件没有被安装！这导致[Jenkins CI][jenkins]无法正确加载`Git插件`。通过日志的提示，将缺失的插件一一安装上，重启[Jenkins CI][jenkins]后，插件加载正常，任务执行也恢复正常。

这个错误出现的还是相当奇怪。因为[Jenkins CI][jenkins]会在安装插件的时候将依赖的插件一并安装上。此外该[Jenkins CI][jenkins]已经运行很久了，这些插件也是一直安装着的。不过现在回想起之前升级[Jenkins CI][jenkins]插件的时候，部分插件由于网络原因升级失败了，但是没有重新更新。这导致这些插件处在了一个不正确的状态。在重启[Jenkins CI][jenkins]后，这些插件被标记为未安装，导致依赖它们的插件无法加载。

[vme]: https://vme360.com
[jenkins]: https://jenkins.io/
