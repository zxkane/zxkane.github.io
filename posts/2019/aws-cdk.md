---
title: "AWS CDK简介"
description : "AWS 上 Infrastructure as Code 最新利器"
date: 2019-09-08
draft: false
categories:
- blogging
series:
- effective-cloud-computing
thumbnail: "https://miro.medium.com/max/680/1*bnmfpzoIBkPe3PfuunfIZQ.png"
isCJKLanguage: true
tags:
- AWS
- AWS CDK
- Infrastructure as Code
---

[Infrastructure as Code][infra-as-cdoe](架构即代码)一直是衡量公有云是否支持良好运维能力的重要指标。作为云计算领先的AWS，通过服务[CloudFormation][aws-cloudformation]来编排云环境中的基础设施资源。不过由于CloudFormation是使用YAML/JSON编写的声明式语言，不善于处理逻辑，编写繁琐且不利于调试排错，对于新上手的Devops工程师来说也有不小的学习曲线。三方开源的工具[Terraform][terraform]同样没有很好解决[CloudFormation][aws-cloudformation]存在的这些问题。

<!--more-->

[AWS CDK][aws-cdk]的出现解决了目前[CloudFormation][aws-cloudformation]存在的绝大部分问题，极大的提升基础设施编排代码的开发和维护效率。

AWS CDK是一种开源软件开发框架，开发者可以用自己使用熟悉的编程语言模拟和预置云应用程序资源，目前支持Typescript/Javascript、Python、Java和.Net。AWS CDK将云中资源抽象对象化，通过极其简单语法描述资源对象或设置其各种属性(重载CDK默认属性设置)来创建或更新云中资源。

例如，下面简单几行将创建一个新的名为`Gameday`的VPC网络，并且跨了两个可用区分别创建了公有子网和私有子网。

{{< highlight typescript>}}
    this.vpc = new ec2.Vpc(this, 'Gameday', {
      cidr: '10.0.0.0/16',
      maxAzs: 2,
      subnetConfiguration: [ 
        { 
          cidrMask: 24, 
          name: 'Public', 
          subnetType: SubnetType.PUBLIC
        }, 
        { 
          cidrMask: 24, 
          name: 'Private', 
          subnetType: SubnetType.PRIVATE
        }
      ]
    });
{{< /highlight >}}

我创建了两个示例项目使用了[AWS CDK][aws-cdk]快速创建应用环境且部署应用，

- [Gameday][gameday-cdk] 为一个ECS上运行的Web应用编排了完整的环境，包括VPC、RDS Aurora、NAT Gateway、安全组、ECS集群、ECS Task定义、ALB负载均衡。
- [Serverlss Domain Redirect][serverless-domain-redirect] 基于AWS搭建了无服务器架构的域名重定向服务。基于不同的配置参数，提供了基于 S3 + CloudFront + Route 53 或是 Lambda + API Gateway + Route 53 两种解决方案。

总体的来说，[AWS CDK][aws-cdk]是一个非常值得采用的云中资源编排和管理方式，高效的管理了AWS上的资源。

由于CDK还在相对早期，成熟度还不是那么完美。我在使用中发现下面一些值得注意的问题。

1. CDK程序最终还是创建了CloudFormation配置，提交到CloudFormation完成资源变更。核心的用户体验，需要依赖CloudFormation的能力。CloudFormation的创建或回退超时过长，时常影响资源部署体验。另外，清理资源的时候，遇到部分资源无法清理且缺少明确提示。比如Aurora集群。
2. CDK类库缺少配置校验。这类错误只能通过CloudFormation部署后，才会被资源方发现并返回错误。导致整个创建的堆栈回退，调试大型的部署栈将花费比较长的时间。建议将整个部署拆分为多个小的堆栈，减小每次部署时间，方便调试。
3. 文档还比较简陋。缺少较为深入的示例。增加了开发人员的学习曲线。
4. 新版本向后兼容性不够好，时常新版本有break changes。在1.0GA之后发布的版本break changes相对减少，但仍然有出现。

[infra-as-cdoe]: https://en.wikipedia.org/wiki/Infrastructure_as_code
[aws-cloudformation]: https://aws.amazon.com/cn/cloudformation/
[aws-cdk]: https://aws.amazon.com/cn/cdk/
[terraform]: https://en.wikipedia.org/wiki/Terraform_(software)
[gameday-cdk]: https://github.com/zxkane/gameday-cdk
[serverless-domain-redirect]: https://github.com/zxkane/serverless-domain-redirect