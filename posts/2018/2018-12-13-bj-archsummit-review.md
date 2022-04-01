---
title: "2018北京ArchSummit回顾"
date: 2018-12-13
draft: false
categories:
- blogging
thumbnail: "https://img.bagevent.com/resource/20180730/2317201724451.jpg?imageView2/2/w/1920/interlace/1/q/100&lazy=0"
isCJKLanguage: true
tags:
- 会议
- 架构
- ArchSummit
---

上周参加了[ArchSummit(全球架构师峰会)](https://bj2018.archsummit.com)，在这里记录下部分参加的主题以及个人感受。

<!--more-->
### 会议回顾

今年参加了几次技术会议，`微服务`、`容器技术`、`区块链`、`大数据`、`机器学习`以及`人工智能`都是当下最热门的主题。同样这次ArchSummit绝大部分topics都跟这些主题相关。

这次会议主要参加了两个专场主题，[Kubernetes的应用](https://bj2018.archsummit.com/track/440)和[快手科技技术专题](https://bj2018.archsummit.com/track/446)。

[基于 Kubernetes 的 DevOps](https://bj2018.archsummit.com/presentation/928)是来自微软Azure的容器工程师分享如何基于 Kubernetes 的 CI/CD 落地实践。该分享中提到了CI/CD各个步骤中都有众多的工具支持，如何选择合适Kubernetes的工具将持续集成和部署串联在一起是Devops中的主要挑战。分享者也安利了AKS提供Devops完整的工具链，以及将开源工具同AKS中的服务集成实现CI/CD的最佳实践。

我们噼里啪团队在CI/CD、Devops这块做得还不错。CI/CD pipelines持续将应用部署在运行的Kubernetes集群，过程中使用的工具链基本也是社区或CNCF推荐的主流工具。下一步可以考虑同云厂商的Devops工具链集成，进一步减少维护成本。

[基于Istio on Kubernetes云原生应用的最佳实践](https://bj2018.archsummit.com/presentation/1258)来自阿里云容器工程师的分享。他概要的分享了Istio技术和实现原理。当然也大力介绍了阿里云容器服务对Istio的原生支持，以及阿里云对客户使用Istio的支持，即使客户问题非常的初级他们的技术支持也很到位。

Istio可以说是CNCF在Kubernetes上事实的服务治理实现。噼里啪技术团队也一直在关注这一块，正在尝试引入Istio提升服务的SLA。

快手技术团队的4个分享都是围绕解决明确的业务问题而做得技术工作，非常具有实战性。其中[快手万亿级实时 OLAP 平台的建设与实践](https://bj2018.archsummit.com/presentation/1337)介绍了快手实时OLAP平台从0到1的搭建过程。该平台从今年4月开始搭建，截止到11月，每日可以实时计算处理超过万亿的数据。而整个平台的搭建由两名大数据工程师外加一名前端工程师负责portal等UI，人效产出让人非常佩服。结合朋友间传言快手给技术人员的offer，快手应该是一家在实践类似Netflix管理文化的公司。

最后给大家推荐一个国产的分布式New SQL数据库TiDB相关的主题。TiDB是国内技术团队开源的一个分布式数据库，已被CNCF作为Database实现推荐方案之一。他们的CTO分享了[TiDB on Kubernetes 最佳实践](https://bj2018.archsummit.com/presentation/1331)，以及他们客户北京银行在[两地多活的核心系统](https://bj2018.archsummit.com/presentation/962)中采用的数据库就是TiDB。

### 个人感受
会议的分享者大多来自国内一线的互联网公司，他们普遍具备流量大、数据多、技术团队能力更强等特质。并且很少使用公有云服务，使用开源产品多数也会维护私有版本。他们的业务解决方案对中小型技术团队来说可复制性不强，照搬实施的难度高，更多的是在扩展思路了解业界技术动态。中小型技术团队最紧迫的事情是满足业务快速发展和需求多变，更合理的解法是选用云厂商的服务或第三方服务快速高效的满足业务需求。极客邦旗下的会议大多缺少这类的分享，相比之下AWS的reInvent大会在这方面做得更好。