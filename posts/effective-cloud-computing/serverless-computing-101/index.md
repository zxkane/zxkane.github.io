---
title: "无服务器计算101"
description : "函数计算简介"
date: 2019-04-01
draft: false
thumbnail: posts/effective-cloud-computing/serverless-computing-101/images/cover.jpg
series:
- effective-cloud-computing
- serverless-computing
isCJKLanguage: true
tags:
- 云计算
- FaaS
- 阿里云
- 函数计算
- Serverless Computing
---
[Serverless Computing(无服务器计算)][serverless]是目前最被看好的云端计算执行模型。其最大的好处是提供分布式弹性可伸缩的计算执行环境，仅为实际使用资源付费，并且将应用维护者从常规的运维事务中解放出来，更利于专注到具体的业务上。

在主流的应用部署方式下，无论是使用[云主机][ec2]还是[Kubernetes][managed-k8s]作为运行环境，都会有大量运维层面的事务需要考虑和处理，并且应用程序需要按照分布式程序的设计准则来应对应用的水平伸缩。同时随着云计算服务的发展和完善，云计算厂商提供了越来越多的基础服务，例如API网关、对象存储、消息队列、日志、监控等服务，函数计算可以完美的同其他云服务集成，帮助用户快速实现出生产级别的弹性可伸缩的应用。

<!--more-->
那[函数计算][serverless]是什么呢？让我们一起来看看[阿里云对于函数计算的定义][aliyun-fc]。

> 阿里云函数计算是事件驱动的全托管计算服务。通过函数计算，您无需管理服务器等基础设施，只需编写代码并上传。函数计算会为您准备好计算资源，以弹性、可靠的方式运行您的代码，并提供日志查询、性能监控、报警等功能。借助于函数计算，您可以快速构建任何类型的应用和服务，无需管理和运维。而且，您只需要为代码实际运行所消耗的资源付费，代码未运行则不产生费用。

基于函数计算的特点，可以很好满足以下需求，

- 业务流量不确定或有明细的周期性
- 构建分布式系统经验不足
- 无需运维
- 按需计算
- 计费灵活

由于函数计算的扩展能力，对运维的要求极少，按量计费等特性用于需要快速验证的早期项目也是非常好的场景。

下面这个slide是近期针对阿里云函数计算做的分享。

{{< gdocs src="https://docs.google.com/presentation/d/e/2PACX-1vQpucN0Imyd1rram7bmQJzO5lRwRrph5KDL18swF_MuKiUFm4_H2Hg8cpUnP_83yqleJnSXYtE9gvUv/embed?start=false&loop=false&delayms=60000" >}}

[serverless]: https://en.wikipedia.org/wiki/Serverless_computing
[ec2]: https://aws.amazon.com/cn/ec2
[managed-k8s]: {{< relref "/posts/effective-cloud-computing/using-kubernetes-on-cloud/index.md" >}}
[aliyun-fc]: https://help.aliyun.com/document_detail/52895.html
