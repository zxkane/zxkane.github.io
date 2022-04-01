---
title: "跨账号跨区域部署AWS CDK编排的应用"
description : "使用AWS Step Functions编排你的DevOps流水线"
date: 2020-10-14
draft: false
thumbnail: posts/2020/deploy-aws-cdk-applications-cross-accounts/images/cover.png
categories:
- blogging
series:
- effective-cloud-computing
isCJKLanguage: true
tags:
- AWS
- AWS CDK
- DevOps
- AWS Step Functions
---
[AWS CDK][cdk-intro]是编排部署AWS云上资源最佳的工具之一。基于AWS CDK的应用应该如何实践DevOps持续集成和部署呢？

通常我们有下面几种方法，
<!--more-->
1. 使用[AWS CodePipeline][aws-codepipeline]来完成DevOps pipeline搭建。CodePipeline是AWS Code系列服务中的持续集成编排工具，它可以集成CodeBuild项目，在CodeBuild项目build中安装`cdk`，并执行`cdk deploy`命令来实现应用部署。

> 这种方法简单直接的实现了DevOps部署流水线。但缺少staging，将最新提交直接部署到生产是一种非常高风险的做法。

2. CDK近期发布了体验性的新特性[CDK Pipelines][cdk-pipelines]来封装CDK应用持续部署流水线的配置。CDK Pipelines也是基于AWS CodePipeline服务，提供快速创建可跨账号区域的持续部署流水线，同时支持部署流水线项目的自升级更新。整个流水线流程如下图所示，

{{< figure
src="https://d2908q01vomqb2.cloudfront.net/0716d9708d321ffb6a00818614779e779925365c/2020/07/02/CDKPipelines_1.png" alt="workflow of cdk pipelines" >}}

CDK Pipelines是非常高效且灵活的持续部署流水线创建的方式，但由于是体验性特性，在生产应用中还有一些局限性。例如，
- 不支持context provider查找。也就是说，无法支持CDK应用查找账户中存在的VPC，R53 HostedZone等。
- 由于CDK Pipelines实际是使用CodePipeline来编排部署流水线，CodePipeline的局限性，CDK Pipelines同样存在。
- CodePipeline在某些分区和区域还不可用。例如，AWS中国区暂时还没有CodePipeline服务，CDK Pipelines在AWS中国区也就无法使用。

3. 使用[AWS Step Functions][aws-stepfunctions]来编排CDK应用部署的流水线。在Step Functions编译的部署流水线中，可用通过CodeBuild项目来完成`cdk deploy`执行做到完整的支持CDK的所有功能。同时Step Functions具备最大的灵活性来支持持续部署过程中的各种编排需求，例如，跨账户部署应用的不同stage，引入人工审批流程，通过Slack等chatops工具来完成审批。

[Opentuna][opentuna]项目就实践了用Step Functions来编排[持续部署流水线][opentuna-pipeline]。整个部署流程如下图，

{{< figure src="images/opentuna-pipeline.png" alt="OpenTUNA部署流程" >}}

如果对基于Step Functions实现的CDK应用持续部署感兴趣，可以访问OpenTUNA项目实现的[源码][opentuna-pipeline-src]了解更多细节。

[cdk-intro]: {{< relref "/posts/2019/aws-cdk.md" >}}
[aws-codepipeline]: https://aws.amazon.com/codepipeline/
[cdk-pipelines]: https://aws.amazon.com/blogs/developer/cdk-pipelines-continuous-delivery-for-aws-cdk-applications/
[aws-stepfunctions]: https://aws.amazon.com/step-functions/
[opentuna]: https://opentuna.cn
[opentuna-pipeline]: https://github.com/tuna/opentuna/blob/master/pipeline.md
[opentuna-pipeline-src]: https://github.com/tuna/opentuna/blob/master/lib/pipeline-stack.ts