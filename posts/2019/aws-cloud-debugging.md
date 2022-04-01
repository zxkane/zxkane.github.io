---
title: "AWS Cloud Debugging初探"
description : "Start to debug your code in cloud environment"
date: 2019-12-26
draft: false
categories:
- blogging
series:
- effective-cloud-computing
thumbnail: "https://d3nmt5vlzunoa1.cloudfront.net/dotnet/files/2019/12/banner-1.png"
isCJKLanguage: true
tags:
- AWS
- AWS Toolkit
- AWS ECS
- AWS Fargate
- IntelliJ IDEs
---
在[re:Invent][reInvent] 2019之前，[AWS Toolkit][aws-tools]发布了[Cloud Debugging beta][cloud-debugging-beta-announcement]功能。该功能支持在IntelliJ IDEs(IntelliJ, PyCharm, Webstorm, 以及 Rider)中远程调试 ECS [Fargate][fargate] 容器中执行的应用程序。

<!--more-->

对[ECS Fargate demo][cloud-debug-demo]启用了远程调试并调试成功后，这里记录一下该功能的使用体验并且分享体验过程中掉进去过的一些坑。

#### 试用体验

- 首先，该功能不适用于生产环境。因为对ECS Fargate类型的Service启用**Cloud Debugging**功能会将原始的`ECS Services`收缩为**0**个task副本，同时创建一个新的Service并启用新的Task Definition，新的Task Definition中会加入`Cloud Debug Sidecar`容器来辅助实现远程调试。整个过程会对生产环境造成变更。
- 如果ECS集群是通过CI/CD持续部署，并且是多人协同使用的环境，该功能也不适用。因为，对某些容器服务启用`Cloud Debugging`将导致他人的持续部署失败或不生效。
- 启用`Cloud Debugging`操作比较麻烦，且启用状态下无法更新ECS中部署的版本。需要先停用`Cloud Debugging`，部署新版本代码，然后再次启用`Cloud Debugging`才能调试新代码。尽可能的不要依赖`Cloud Debugging`来调试程序，花功能做好单元测试，集成测试以及E2E测试来避免调试云端环境。

#### 试用经验

- 按照[官方文档启用`Cloud Debugging`][enable-cloud-debugging-doc]后，创建[Cloud Debugging Launch Configuration][launch-configuration-doc]并执行调试，遇到**`Retrieve execution role finished exceptionally`**错误。错误的原因是，文档中没有提到`Cloud Debug Sidecar`需要`logs:CreateLogStream`权限创建CloudWatch Logs Stream。解决方案是，为ECS Task Execution Role添加`logs:CreateLogStream`权限。
- 在[AWS Toolkit Jetbrains][aws-toolkit-jetbrains]当前的版本*1.9-193*不支持启用了[AppMesh][appmesh-issue]或[X-Ray][x-ray-issue]的Task。解决方案是，对需要启用`Cloud Debugging`的Task暂时禁用App Mesh和X-Ray。

> `Cloud Debugging`是一个不错的开发工具尝试思路，帮助开发者更好的做出Cloud Native应用。但是该项目仍然是一个早期项目，有许多问题需要修复和改进。

[reInvent]: https://reinvent.awsevents.com/?nc2=h_ql_re
[aws-tools]: https://aws.amazon.com/getting-started/tools-sdks/?nc2=h_ql_prod_dt_tsdk
[cloud-debugging-beta-announcement]: https://aws.amazon.com/about-aws/whats-new/2019/11/announcing-cloud-debugging-beta/?nc1=h_ls
[fargate]: https://aws.amazon.com/fargate/
[cloud-debug-demo]: https://github.com/zxkane/alibabacloud-microservice-demo/tree/cloud-debug
[enable-cloud-debugging-doc]: https://docs.aws.amazon.com/zh_cn/toolkit-for-jetbrains/latest/userguide/ecs-debug.html#ecs-prereqs
[launch-configuration-doc]: https://docs.aws.amazon.com/zh_cn/toolkit-for-jetbrains/latest/userguide/edit-configuration-dialog.html#edit-configuration-dialog-ecs
[aws-toolkit-jetbrains]: https://github.com/aws/aws-toolkit-jetbrains
[appmesh-issue]: https://github.com/aws/aws-toolkit-jetbrains/issues/1463
[x-ray-issue]: https://github.com/aws/aws-toolkit-jetbrains/issues/1464