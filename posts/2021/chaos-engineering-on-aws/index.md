---
title: "AWS上的混沌工程"
description : "Chaos engineering on AWS"
date: 2021-11-21
thumbnail: posts/2021/chaos-engineering-on-aws/images/simian-army.jpg
draft: false
categories:
- blogging
series:
- effective-cloud-computing 
isCJKLanguage: true
tags:
- AWS
- chaos engineering
- AWS Fault Injection Simulator
- AWS FIS
---
[混沌工程][chaos-engineering]是一种帮助系统满足弹性需求的技术，它起源于[Netflix的工程实践][netflix-chaos-monkey]，著名的猴子军团。

AWS一直提倡[架构的完善][well-architected](AWS Well-Architected)，混沌工程正是卓越运营和可靠性支柱的实践。
因此在 [re:Invent 2020 AWS发布了Fault Injection Simulator][fis-in-reinvent-2020]服务来简化开发者在AWS上的混动工程实践。

<!--more-->

[AWS FIS][fis]作为AWS上原生的混沌工程服务，目前已同EC2，ECS，EKS，RDS，CloudWatch，甚至是IAM Role API集成，可以触发这些服务中资源的变更来假设故障，
例如，重启或终止EC2实例，重启RDS实例等。

[Chaos Engineering on AWS][chaos-engineering-workshop]是一份非常详细的混沌工程在AWS上动手实验。
该实验将指导参与者快速设置实验初始环境，通过可观测性工具了解系统状态，然后带领实验参与者通过详细的实验步骤学习如何使用FIS服务来达到对系统可靠性的验证和优化。
实验项目除了覆盖FIS支持集成的EC2，ECS，RDS等服务外，还演示了[SSM集成][fis-ssm-agent]，并且通过FIS内置的SSM文档或自定义的SSM文档来假设系统故障。
混沌工程作为一种提升系统弹性的质量手段，需要重复性的在系统中实验，动手实验也为参与者设计了CI/CD实验，通过Gitops方式将混动工程持续实验到系统环境中。
总之，对混沌工程有兴趣的开发者，Chaos Engineering on AWS非常值得一做的动手实验，可以快速的帮助您了解混沌工程，及FIS在AWS上的实践。

最后再强调下最重要的事，混沌工程不是一个孤立的系统弹性实验，它需要系统本身的弹性、可靠性设计以及可观测性的实现，是一个系统整体的设计实践。

[chaos-engineering]: https://en.wikipedia.org/wiki/Chaos_engineering
[netflix-chaos-monkey]: https://www.gremlin.com/chaos-monkey/
[well-architected]: https://aws.amazon.com/architecture/well-architected/?wa-lens-whitepapers.sort-by=item.additionalFields.sortDate&wa-lens-whitepapers.sort-order=desc
[fis-in-reinvent-2020]: https://www.youtube.com/watch?v=yoNeMLj3CHc
[fis]: https://aws.amazon.com/fis/
[chaos-engineering-workshop]: https://chaos-engineering.workshop.aws/en/
[fis-ssm-agent]: https://docs.aws.amazon.com/fis/latest/userguide/actions-ssm-agent.html