---
title: "应用程序弹性设计"
description : "利用Amazon的经验和AWS上高效的工具构建弹性应用程序"
date: 2021-11-28
thumbnail: https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9-TlIqnY2-cpKRTjs_zRfBhNFW1jhlf_1jQ&usqp=CAU
draft: false
categories:
- blogging
series:
- effective-cloud-computing
- amazon-builders-library
isCJKLanguage: true
tags:
- AWS
- resilience engineering
- Amazon Builders' Library
- System Design
---

[AWS架构的完善][well-architected](AWS Well-Architected)框架涉及了五大支柱，
其中可靠性支柱要求侧重于确保工作负载在预期的时间内正确、一致地执行其预期功能。
这要求应用程序系统具备弹性设计，可从故障中快速恢复，以便满足业务和客户需求。
然而设计、开发、且验证具备弹性设计的应用程序，对经验和实践能力都有很高的要求。
利用成熟的经验和良好的工具将加快构建符合预期的弹性应用程序。

<!--more-->

[Application Resilience Workshop][application-resilience]是一套课程和动手实践学习如何进行实验来观察系统的行为，
例如，极端系统负载和网络中断情况下，使用不同的软件模式来减轻这些实验对系统稳态的影响。
整个实验也是分为假设、方法、观测和缓解等步骤，同[混沌工程][chaos-engineering-on-aws]有异曲同工之处。

应用程序弹性实验假设了一个[微服务][microservices]构建的应用程序，通过压力测试工具注入极端的系统负载，
通过应用程序各服务的可观测性来理解目标应用的延迟，吞吐、容量、RTO等指标。

当发现最初设计的应用程序在极端压力下会有灾难性的故障，教程中给出了队列，负载卸载，
通过降低服务QoS的Client Deadline Cutoff，断路器，令牌桶等程序设计模式来缓解极端压力对系统造成的灾难性的故障。

但是无论使用队列解耦还是负载卸载都不是绝对完美的解决方案，在[Amazon Builders' Library][amazon-builders-library]
中的几篇文章为我们分享了Amazon从运行大规模分布式系统中学习到的宝贵且成熟的经验，

- [避免无法克服的队列积压][avoiding-insurmountable-queue-backlogs]
- [通过卸除负载来避免过载][using-load-shedding-to-avoid-overload]
- [超时、重试和抖动回退][timeouts-retries-and-backoff-with-jitter]
 
利用这些成熟的经验我们可以权衡系统的需求和技术实现，选择当下最合理且可行的解决方案。

在今年的Pre-[re:Invent][reinvent]之际，AWS发布了[AWS Resilience Hub][resilience-hub]服务，将应用程序云上资源状态的扫描，
系统弹性的评估，符合RPO/RTO的配置建议，以及基于混沌工程的实验运行集成为一个整体的服务，通过一个控制面板实现了应用程序弹性的管理。

此外，如果你的应用刚好是一个电商或在线票务系统，系统正在面对秒杀、黑五等大规模负载压力的考验，可以参考甚至直接尝试AWS解决方案
[AWS Virtual Waiting Room][aws-virtual-waiting-room]来直接构建一个弹性系统。

[chaos-engineering-on-aws]: {{< relref "/posts/2021/chaos-engineering-on-aws/index.md" >}}
[well-architected]: https://aws.amazon.com/architecture/well-architected/?wa-lens-whitepapers.sort-by=item.additionalFields.sortDate&wa-lens-whitepapers.sort-order=desc
[fis]: https://aws.amazon.com/fis/
[application-resilience]: https://resilience.workshop.aws/application.html
[microservices]: https://microservices.io/
[amazon-builders-library]: https://aws.amazon.com/builders-library/
[avoiding-insurmountable-queue-backlogs]: https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/
[using-load-shedding-to-avoid-overload]: https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/
[timeouts-retries-and-backoff-with-jitter]: https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
[resilience-hub]: https://aws.amazon.com/resilience-hub/
[aws-virtual-waiting-room]: https://aws.amazon.com/solutions/implementations/aws-virtual-waiting-room/?did=sl_card&trk=sl_card
[reinvent]: https://reinvent.awsevents.com/