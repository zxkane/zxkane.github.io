---
title: "QCon2019北京站回顾"
description : "SOFTWARE IS CHANGING THE WORLD"
date: 2019-05-09
draft: false
categories:
- blogging
thumbnail: "https://static001.geekbang.org/static/qconbj2019/img/logo-qcon-bj-10th.0a0e2a4.svg"
isCJKLanguage: true
tags:
- 会议
- QCon
- DevOps
- 架构
- 混沌工程
- 工程效率
---

这周参加了[QCon 2019北京站][qconbj-2019]，这里记录下部分印象深刻的主题以及个人感受。

QCon是由InfoQ主办的综合性技术盛会，主题涵盖了大前端、高可用架构、容器技术、大数据、机器学习等各种热门技术主题。其中也不乏[下一代分布式应用][next-gen-ha-system]、[混沌工程][chaos-engineering-themes]等前沿有意思的主题，后面会详细介绍相关的主题演讲。

<!--more-->

### 工程效率提升

这是在QCon第一日个人感兴趣且非常有意思的一个[系列主题][dev-productivity]。无论是创业公司、独角兽企业还是互联网巨头都希望不断提升工程效率，3个相关的分享分别来自BAT，可见互联网巨头们对团队效率提升的渴望和重视。

#### [10倍速原则对工程生产力建设的方向性影响][qiaoliang-talk]

这个talk来自腾讯的高级顾问乔梁，这位老兄已经连续10年在QCon上分享持续集成、持续交付等工程效率相关的主题了！他的演讲始于对成功企业的**一万次实验法则**方法论，
{{< figure src="/posts/2019/2019-qconbeijing-images/1万次法则.jpeg" alt="1万次实验法则" >}}
而大量高效的实验基于一个**双环模型**的快速验证环。
{{< figure src="/posts/2019/2019-qconbeijing-images/双环模型.jpeg" alt="双环模型" >}}
最终工程生产力是由**工作流程**、**支撑工具**和**工程素养**三方面一起决定的。
{{< figure src="/posts/2019/2019-qconbeijing-images/工程生产力.jpeg" alt="工程生产力" >}}

>  非常认可决定工程效率的这三要素，个人认为**工程素养**是其他两个要素的基石，[奈飞文化手册][powerful]中开篇强调的只招聘**成年人**就是很好的诠释。

#### [百度工程能力提升之道][baidu-talk]

这个分享来自百度研发效能部门的产品经理，从**人**、**技**、**法**三方面强调工程能力提升的策略模型。其实这个模型就是对应着上面[乔梁分享的工程生产力三要素][qiaoliang-talk-anchor]。
{{< figure src="/posts/2019/2019-qconbeijing-images/提升工程能力策略.jpeg" alt="提升工程能力的策略" >}}
关于对工程师的培养和技术规范，百度发布了"百度工程师手册"，据说可以从网络上下载到。大量工具的细节分享涉及的都是百度内部工具，不过工具针对的思路还是可以借鉴的。

#### [菜鸟集团研发效能变革实践][cainiao-talk]

这个分享来自阿里系的菜鸟集团，特别强调数据化驱动的研发效能提升，里面很有意思的一点是建立成本模型来评估效能的好坏。

> 作为效能部门负责人，有数据特别是成本数据，让高层管理者buy-in你的想法，这应该是个非常好的角度。

### 高可用架构

#### [声明式自愈系统——高可用分布式系统的设计之道][declarative-system-talk]

这个分享比较理论化的介绍声明式的、可自愈的分布式系统原理和实践，其实业界已经有个非常好的参考实现 -- 就是[Kubernetes][k8s] :smiley:。

#### [超大规模高可用性云端系统构建之禅][caichao-talk]

这是一个非常实用的工程实践分享，列举了大量大规模云原生应用一定会面临的挑战，以及简单又实用的解决方法。每一个云原生应用开发者都应该看看这个[slide][caichao-pdf]，学习前人实践的经验。另外为讲演者蔡超做个推广，对Go语言有兴趣的同学，可以考虑学习蔡超的极客时间课程[Go语言从入门到实战][go-intro-practise]。

### 运维架构

#### [Kubernetes 日志平台建设最佳实践][aliyun-sls-talk]

这个分享介绍了Kubernetes上日志方案的解决思路，及它的实践 -- 阿里云的日志服务。对于很多有基础服务建设的团队可以作为很好的参考方案。对于已经托管在阿里云上的应用，建议就不要重复建设低端的轮子了，阿里云日志服务应该做为团队的首选。不论在性能同其他云托管服务集成上，都远远好于自建的方案。

#### [多云管下的自动化运维架构][multi-clouds-talk]

多云是现在一些厂商力推的话题，个人认为是市场排名靠后的总要找些方法来提升自己产品的竞争力:smirk:。分享者企业做了一套ops平台来管理多云的资源，他们通过adapter方式来将不同云厂商的差异和资源进行了抽象。这其中涉及大量处理产品间差异性和被动适配的工作，个人不太认同这种方式。并且丢掉了infra as code这类重要的特性，对于有这种需求的大型企业来说不是一个完美的方案。

### [混沌工程][chaos-engineering-themes]

混沌工程这个话题非常有意思，同时也是较新的一种实践工程。从最早的提出、系统实践到现在还不到10年时间。来自阿里巴巴的[云原生架构下的混沌工程实践][cloud-native-chaos-engineering-talk]和AWS的[AWS 云上混沌工程实践之对照实验设计和实施][aws-chaos-engineering-practice]两个分享介绍了从混沌工程的起源到如何全方位的实践用于提升云原生应用的"韧性"，非常值得学习。[蔡超的超大规模高可用性云端系统构建][cainiao-talk-anchor]也提到了使用混沌工程来提升系统的高可用性，在云原生应用越来越普及的情况下，被动的设计高可用系统肯定不如主动(甚至持续的自动化)可控的注入混乱来逐渐提升系统的高可用性。目前chaos engineering的工具/平台支持还不太完善，这个方向看起来是技术创业很好的切入点:smirk:。最后切记一点，**混沌工程最终一定要在生产系统上实施**。
{{< figure src="/posts/2019/2019-qconbeijing-images/混动工程实践.jpeg" alt="混动工程实践" >}}

### [下一代分布式应用][next-gen-ha-system]

这个主题虽说命名为下一代分布式应用，主要分享的大多是服务间流量治理问题，特别是Service Mesh下实践经验。其中来自阿里李云的[分布式应用的未来——Distributionless][distributionless-talk]特别值得一提。这个分享并没有实际的案例或经验分享，他重点分享的是对于Cloud Native本质和趋势的看法，这些观点我个人特别认同(`好像找到知音似的:grinning:`)！完整的slide[这里下载][distributionless-pdf]。
{{< figure src="/posts/2019/2019-qconbeijing-images/CloudNative本质.jpeg" alt="CloudNative的本质" >}}
{{< figure src="/posts/2019/2019-qconbeijing-images/CloudNative的趋势.jpeg" alt="CloudNative的趋势" >}}
{{< figure src="/posts/2019/2019-qconbeijing-images/与CloudNative同行.jpeg" alt="与CloudNative同行" >}}

### 用户增长

来自云测的陈冠诚在[智能优化 & A/B 测试 - 实验驱动用户增长的理论与技术实践][ab-test-talk]分享了A/B测试实验对用户增长的理论及实践，顺便也推广了他家云测的A/B测试SaaS服务。听圈内的朋友分享，云测的A/B测试服务确实比较简单好用，方便产品后台创建测试并分析结果，对增长有需求的小伙伴可以考虑体验下，减少不必要的重复建设轮子。

[qconbj-2019]: https://2019.qconbeijing.com/
[next-gen-ha-system]: https://2019.qconbeijing.com/track/501
[chaos-engineering-themes]: https://2019.qconbeijing.com/track/565
[dev-productivity]: https://2019.qconbeijing.com/track/499
[qiaoliang-talk]: https://2019.qconbeijing.com/presentation/1505
[qiaoliang-talk-anchor]: {{< relref "#10倍速原则对工程生产力建设的方向性影响-qiaoliang-talk" >}}
[powerful]: https://book.douban.com/subject/30356081/
[baidu-talk]: https://2019.qconbeijing.com/presentation/1487
[cainiao-talk]: https://2019.qconbeijing.com/presentation/1439
[cainiao-talk-anchor]: {{< relref "#超大规模高可用性云端系统构建之禅-caichao-talk" >}}
[declarative-system-talk]: https://2019.qconbeijing.com/presentation/1511
[k8s]: https://kubernetes.io
[caichao-talk]: https://2019.qconbeijing.com/presentation/1437
[caichao-pdf]: https://static001.geekbang.org/con/38/pdf/2428705636/file/%E8%B6%85%E5%A4%A7%E8%A7%84%E6%A8%A1%E9%AB%98%E5%8F%AF%E7%94%A8%E6%80%A7%E4%BA%91%E7%AB%AF%E7%B3%BB%E7%BB%9F%E6%9E%84%E5%BB%BA%E4%B9%8B%E7%A6%85-%E8%94%A1%E8%B6%85.pdf
[go-intro-practise]: https://time.geekbang.org/course/intro/160
[aliyun-sls-talk]: https://2019.qconbeijing.com/presentation/1448
[multi-clouds-talk]: https://2019.qconbeijing.com/presentation/1653
[cloud-native-chaos-engineering-talk]: https://2019.qconbeijing.com/presentation/1479
[aws-chaos-engineering-practice]: https://2019.qconbeijing.com/presentation/1741
[distributionless-talk]: https://2019.qconbeijing.com/presentation/1501
[distributionless-pdf]: https://static001.geekbang.org/con/38/pdf/3913410004/file/%E5%88%86%E5%B8%83%E5%BC%8F%E5%BA%94%E7%94%A8%E7%9A%84%E6%9C%AA%E6%9D%A5&mdash;&mdash;Distributionless-%E6%9D%8E%E4%BA%91.pdf
[ab-test-talk]: https://2019.qconbeijing.com/presentation/1650
