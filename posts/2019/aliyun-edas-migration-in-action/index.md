---
title: "实战Aliyun EDAS应用迁移AWS"
description : "一套能快速上手且可复制的迁移方案"
date: 2019-12-02
draft: false
thumbnail: posts/2019/aliyun-edas-migration-in-action/images/cover.jpg
categories:
- blogging
isCJKLanguage: true
tags:
- AWS
- EDAS
- Migration
- Microservice
- Infrastructure as Code
---
近期实践了将阿里云EDAS微服务应用迁移到AWS上，在这里分享一下迁移方案。

该方案涉及了以下三个方面，

1. 微服务应用集群。在AWS上采用的[ECS][aws-ecs]集群部署微服务应用，通过[Cloudmap][aws-cloudmap]实现服务注册发现，[App Mesh][aws-appmesh]实现服务间流量控制。更加详尽的微服务迁移要点和对应方案，详见下面的deck。
2. Devops pipeline。使用托管的[CodePipeline][codepipeline]，[CodeBuild][codebuild]实现CI/CD。
3. Infra as Code。利用AWS强大的[Infra as Code][infra-as-cdoe]能力，将云上的基础设施和微服务应用编排通过[CDK][aws-cdk]代码实现。

> 下面是迁移方案的deck。完整且可部署的PoC代码，点[这里][demo-source]。

{{< gdocs src="https://docs.google.com/presentation/d/e/2PACX-1vRrD1lBxjbGsI0xIX8XTzUyJzDqnaqW97d6jGASdatRPYUkciSwxbeCJFQv-gwZLcZ31DFPXQtvmob1/embed?start=false&loop=false&delayms=5000" >}}

[aws-ecs]: https://aws.amazon.com/cn/ecs/
[aws-cloudmap]: https://aws.amazon.com/cn/cloud-map/
[aws-appmesh]: https://aws.amazon.com/cn/app-mesh/
[codebuild]: https://aws.amazon.com/cn/codebuild/
[codepipeline]: https://aws.amazon.com/cn/codepipeline/
[infra-as-cdoe]: https://en.wikipedia.org/wiki/Infrastructure_as_code
[aws-cdk]: {{< relref "/posts/2019/aws-cdk.md" >}}
[demo-source]: https://github.com/zxkane/alibabacloud-microservice-demo