---
title: "亚马逊的部署最佳实践"
description : "亚马逊如何做持续部署"
date: 2020-11-28
draft: false
thumbnail: https://d1.awsstatic.com/builderslibrary/icons/WEB_Redwood_Card-thumbnail_Software-deployments.89a23234e262e526ee155d5194c52e3aa605ffff.png
categories:
- blogging
series:
- amazon-builders-library
isCJKLanguage: true
tags:
- DevOps
- Continuous Deployment
- Amazon Builders' Library
- System Design
---
近期[Amazon Builders Library][amazon-builders-library]发布了数篇文章介绍亚马逊如何实践持续部署，同时分享了亚马逊在部署方面的最佳实践。

这里将这三篇文章核心内容做个概述，方便大家按需细读。

<!--more-->

### [Going faster with continuous delivery][going-faster-with-cd]

这篇文章先是分享了亚马逊持续改进和软件自动化的文化(Amazonian随时都惦记着的[领导力准则][amazon-leadership-principles])，然后介绍了亚马逊内部的持续部署工具Pipelines。从一个试点工具进化为亚马逊标准、一致且简洁的发布工具。并且将构建和发布软件的最佳实践检查也融入到Pipelines中。

接下来是分享如何减小故障影响到客户的风险。有过软件开发经验的都知道，软件变更引入故障是不可避免的，如何将故障对客户的影响控制到最小是非常重要的。该文从下面几个方面给出了建议，
- **部署卫生**，如对新部署程序的健康检查
- **上生产系统之前的测试**，自动化单元、集成、预生产测试
- **生产系统上的验证**，分批的部署，控制故障影响半径
- **控制何时发布软件**

最后作者介绍了亚马逊如何快速执行业务创新 -- 通过**自动化一切事情**。

### [Automating safe, hands-off deployments][automating-safe-hands-off-deployment]

这篇文章很好的呼应了[Going faster with continuous delivery][going-faster-with-cd]一文中如何避免新的部署导致故障影响，非常详细的介绍了亚马逊关于自动化安全部署的实践。

对于持续部署，`源码` -> `构建` -> `测试` -> `生产` 这个流程大家都很熟悉。

{{< figure src="https://d1.awsstatic.com/builderslibrary/architecture-images/1-Four-Pipeline-Phases.b168244d38855d468e594d26f0a5fcc40892a5da.PNG" alt="4 pipeline phases" >}}

从下图看，亚马逊对于`源码`和`构建`的理解是非常深入和全面的。

{{< figure src="https://d1.awsstatic.com/builderslibrary/architecture-images/2-Source-and-Build-Phases.e873d57fa8365a34e6fdb6699b3541caef9a019c.PNG" alt="source and build" >}}

`源码`并不仅仅是应用程序源代码，还可以包括运维工具代码、测试代码、基础架构代码、静态资源、依赖库、配置和操作系统补丁。

`代码审核`是必须的。对于全自动的流水线，代码审核是最后一道人工核验。代码审核不仅仅是审核代码的正确性，还应该检查代码是否包括足够的测试，是否有完善的工具来监测部署以及能否安全的回退。

同时`构建`也不光是编译源代码，打包并存储构件。也包含单元测试，静态代码分析，代码覆盖率检查，代码审核检查。

`测试`在亚马逊是一个多阶段的预生产环境，详见下图。

{{< figure src="https://d1.awsstatic.com/builderslibrary/architecture-images/3-Test-Phase.32a876ed20c3d585a9a761c6b07f0c3af1fff21d.PNG" alt="test deployments in pre-production environments" >}}

集成测试是自动化的模拟客户一样使用服务，实现端到端的测试。部署到生产之前，还需要执行向后兼容性测试以及借助负载均衡实现one-box测试。

AWS服务是部署在全球多个区域内的多个可用区，为了减少部署故障对客户的影响，`生产`通过**波次**部署来分批分阶段的安全部署。

{{< figure src="https://d1.awsstatic.com/builderslibrary/architecture-images/5-Prod-Phase.31bac8cfc2ae3c68c5ee1e7332c0e6d7b2385bcf.PNG" alt="production deployments" >}}

首先部署是在单区域的单可用区做one-box部署，如果引起负面问题，会自动回退并停止生产后续的部署。系统指标的监控是实现自动化安全部署的核心，需要通过监控的指标来自动触发部署回退。

Bake time也是实践经验总结出来的精髓。有时故障不是在部署后马上显现的，需要时间才会逐渐显现。设置合理的Bake time，能够让故障有足够时间被暴露出来，不至于照成大范围影响。

### [Ensuring rollback safety during deployments][ensuring-rollback-safety-during-deployments]

因为故障是不可避免的，部署能够被安全回退是非常必要的。这篇文章就详细介绍了如何实现可安全回退的部署 -- 通过**两阶段部署的技术**，以及序列化的最佳实践。

{{< figure src="https://d1.awsstatic.com/legal/builders-library/Screenshots/two-phase-deployment.4322b209195704c61f7a3f311413a76f264afb8b.png" alt="two-phase deployment technique" >}}

> 这三篇文章分别从术和器的角度分享了亚马逊在软件部署的实践经验，开发者们可以结合自身业务情况集成适合的最佳实践。

[amazon-builders-library]: https://aws.amazon.com/builders-library/
[going-faster-with-cd]: https://aws.amazon.com/builders-library/going-faster-with-continuous-delivery/?did=ba_card&trk=ba_card
[automating-safe-hands-off-deployment]: https://aws.amazon.com/builders-library/automating-safe-hands-off-deployments/?did=ba_card&trk=ba_card
[ensuring-rollback-safety-during-deployments]: https://aws.amazon.com/builders-library/ensuring-rollback-safety-during-deployments/?did=ba_card&trk=ba_card
[amazon-leadership-principles]: https://aws.amazon.com/careers/culture/