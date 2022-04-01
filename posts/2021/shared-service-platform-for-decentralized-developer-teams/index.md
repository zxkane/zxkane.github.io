---
title: "AWS上构建共享自服务平台服务去中心化研发团队"
description : "用抽象和自助服务安全合规的提升研发交付速度"
date: 2021-12-26
draft: false
thumbnail: posts/2021/shared-service-platform-for-decentralized-developer-teams/images/cover.png
categories:
- blogging
series:
- effective-cloud-computing
isCJKLanguage: true
tags:
- SSP
- DevOps
- GitOps
- Infrastructure as Code
- AWS
- Proton
- Service Catalog
---

近期在一个 Webinar 分享了如何在 AWS 上服务去中心化研发团队构建共享服务平台，核心观点总结如下，

<!--more-->

这里的去中心化团队是同理想的完全化的 DevOps 团队(负责设计、开发、测试、运维以及运营等所有环节)相对立的。
在较大型的组织中，账户管理、网络规划、服务审计等模块会由平台，基础设施或安全团队所负责，
多个研发团队会负责各个业务系统的开发、测试、运维等。

如今组织的健康运营对安全性合规性要求越来越高，通常基础设施团队外加安全团队负责承担安全、合规需求的整体策略规划及实施。
但是满足安全、合规需求通常是同业务交付速度期望是相悖的。一方面，平台、安全团队要为应用上线或变更进行安全性与合规性审查，
而研发团队需要投入更多的资源去满足安全、合规的需求，这必然会推迟交付。另一方面，研发团队的交付变更还需要内部流程以及
人工操作的话，跨团队的沟通、协作必然也会延缓交付速度。所以基于安全、合规需求的抽象，外加自助服务的共享服务平台，
针对这种场景而生，可以大幅改善交付速度同时满足安全、合规要求。

## AWS 上抽象的助力

在亚马逊软件开发中的抽象分为以下几类，

### 框架

框架为应用程序编写代码的时候，为了编写更小更高效的代码，代码被扩展成或被建成更实质性的软件部分。
开发人员对框架应该非常熟悉了，无论是Web开发的Spring、Django、VueJS、React还是ML模型训练的TesnorFlow和PyTorch都是
框架，帮助开发者降低开发门槛，专注在核心业务上。从组织的安全、合规角度出发，基础设施或安全团队可以通过模板或者模式来
强制实施企业规范来达到安全性和合规性需求。

AWS 目前提供的框架类工具或服务有 [AWS SAM][sam], [AWS CDK][cdk]以及[AWS CloudFormation][cloudformation]。
基于这些框架类工具和服务，用户可以快速构建云上应用，或者是创建云上应用的组件且同时满足企业安全合规需求。

### 命令行 CLI

框架的命令行 CLI 让开发团队用他们熟练的语言根据它构建自动化。CLI 能够简化框架的使用难度，开发者可以使用最熟悉的开发语言
(例如 Shell 脚本/Python)来调用 CLI，实现业务逻辑的封装。

[AWS Copilot][copilot]，[AWS SAM CLI][sam-cli]是 AWS 提供的 CLI 工具。

### 部署服务
最后部署服务拿应用软件来说，由开发团队编写并定义了如何使用那个软件，并让它在真实的基础设施环境运行。开发团队需要加快
应用交付速度来满足业务需求，而基础设施和安全团队需要作为企业安全合规方面的 GateKeeper。一套合理的协作模式将会加速
开发团队的交付且满足安全需求，例如共享自服务平台。

AWS 提供了很多开箱即用的产品开启建立一个共享服务平台，例如，[AWS Proton][proton]，[AWS CodeDeploy][codedeploy]。

## 平台所有权模式的思考

作为一个共享服务平台，不同的管理需求/模式或应用负载类型，会有不同的服务扮演不同的角色。下面是一些客户实践的平台模式。

### AWS 账户作为"平台"

组织将 AWS 账户作为平台，自动化创建，其特点如下，

- AWS 账户属于应用团队且由他们运营
- 基础设施团队为应用账户提供工具，包括且不限于，
  - 支撑型的基础设施(例如，网络，安全，域名，公司标准等)
  - AWS Proton 环境和应用
  - [AWS Service Catalog][service-catalog] 产品
  
此外 [AWS Control Tower][control-towner], [AWS Organizations][organizations], CloudFormation StackSets, [AWS Config][config] 一致性功能，
都是一些服务或功能可以支持以账户为管理单位的共享平台。

### 托管容器集群作为"平台"

AWS 账户由平台/基础设施团队运营，他们将管理容器集群的生命周期，例如托管的 [EKS][eks](Kubernentes) 集群。应用团队负责将
应用部署到基础设施团队管理的多租户集群，应用团队将承担如下职责(包括且不限于)，

- 应用程序持续集成
- 入口流量控制
- 访问管理
- 运营可见性

服务于应用程序的周边基础设施(例如，数据库、队列或缓存等)的部署可以通过持续集成的 AWS CloudFormation/AWS CDK 模板，AWS Proton 环境/应用来实现。

### 可部署的应用程序模式作为"平台"

这种模式下通常会由基础设施团队拥有共享账户，负责网络、域名、审计等资源。应用团队负责应用账户。基础设施团队创建现成的
应用程序、部署机制、抽象库供应用程序团队使用或自定义，如下一些服务或功能可以实现该模式，

- AWS Proton
- AWS CloudFormation / AWS Service Catalog
- AWS [CDK constructs][construct-hub]
 
## 产品化运营共享自服务平台

共享自服务平台除了根据组织管理和技术栈选择合适的实现模式外，是否能够在一个组织内真正的优化效率，提升研发交付速度取决于
如何运营这个平台。这里我们看到的成功案例都是将该平台产品化，按经营产品的方式来运营他。通常成功的共享自服务平台
分为三个步骤来实现自身价值，形成增长飞轮。

### 1. 尝试，证明价值

所谓万事开头难，构建共享服务平台需要找到一个合适的应用团队作为种子用户。该团队的应用场景应该是一个典型用例，应用团队
需要频繁发布来交付业务价值，而该应用将涉及到基础设施团队负责的模块，且要符合组织对安全性和合规性的审查。由双方团队共同
定义交互模型，例如，如何开发基础设施即代码，平台基础架构，应用部署方式。并且应用团队方需要认可该平台的价值，在种子应用
成功落地共享服务平台后，会逐渐将更多应用落地到共享平台模式上。

同时，平台的技术选项也非常重要，要适应企业自身的组织管理结构和技术栈能力。例如，

- AWS CloudFormation / AWS CDK: 通用且最灵活的实现；同时也是双刃剑，维护大型的 CloudFormation 模板是非常困难的，采用
 AWS CDK 需要学习新的技能，且有时需要深入研究才可能 Hack 某些内部实现；是如果需要完全掌握实现细节时的选择，
- AWS Copilot: 仅适用于 ECS 上部署的容器应用；开发应用的团队不关心或不需要管理基础设施，
- AWS Proton: 适用于将应用和基础设施权限分离的场景；满足应用团队需要自服务的模式。

### 2. 复制推广

在满足了种子应用的需求后，让共享服务平台走向成功的关键是如何运营推广他。产品化的运营需要做的以下几点，

1. **文档化**你构建的平台，包括
   1. 自服务/自动化的采用步骤
   1. 用户手册、API 文档
   1. 支持的机制，如何为采用平台的内部用户提供技术支持
   1. 公开代码，至少是内部开源，让更多的用户参与共享
1. 内部**营销**平台
   1. 利用成功案例赢得领导们的支持，达到量化平台价值，规避风险，提升业务研发效率
   1. 内部"路演"招募团队并获得反馈
1. 证明你的共享服务平台方式可**扩展**
   1. 考虑支持几十上百的团队
   1. 可跨越各种场景，例如，应用程序中断，AWS 服务事件，迁移，0-day 补丁
   1. 考虑平台复制的瓶颈在哪里？例如，采用难度，学习曲线，部署，支持 / on call 等等
  
### 3. 形成飞轮

共享自服务平台最终形成产生自身增长势头的良性循环，例如，

> 投资平台团队 --> 添加平台功能 --> 应用开发者更快乐 --> 增加平台使用 --> 提升组织的效率 --> 投资平台团队 --> ...

通过以上一个飞轮闭环，达成长期成功。

[sam]: https://aws.amazon.com/serverless/sam/
[cdk]: {{< relref "/posts/2019/aws-cdk.md" >}}
[cloudformation]: https://aws.amazon.com/cloudformation/
[copilot]: https://aws.amazon.com/blogs/containers/introducing-aws-copilot/
[sam-cli]: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html
[proton]: https://aws.amazon.com/proton/
[codedeploy]: https://aws.amazon.com/codedeploy/
[service-catalog]: https://aws.amazon.com/servicecatalog/
[control-tower]: https://aws.amazon.com/controltower/
[config]: https://aws.amazon.com/config
[organizations]: https://aws.amazon.com/organizations/
[eks]: https://aws.amazon.com/eks/
[construct-hub]: https://constructs.dev/