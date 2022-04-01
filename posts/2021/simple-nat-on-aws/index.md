---
title: "在AWS上快速部署专用的NAT实例"
description : "无侵入的VPC内应用特殊网络访问解决方案"
date: 2021-04-16
draft: false
thumbnail: posts/2021/simple-nat-on-aws/images/cover.png
categories:
- blogging
series:
- effective-cloud-computing
isCJKLanguage: true
tags:
- AWS
- Tip
- network
- NAT
- CDK Construct
- AWS CDK
---
本方案的起因是，一个源代码托管在Github上的项目fix一个重要的bug后，在AWS上的持续部署流水线一直失败。分析日志后，发现流水线中的数个步骤需要克隆源代码，但是访问Github的网络非常不稳定，这数个流水线任务持续因连接超时，连接拒绝等网络错误而失败。而流水线任务大量使用了CodeBuild, Lambda等AWS托管服务，无法为执行环境配置可靠的网络连接。

<!--more-->

本方案思路如下，

- 在 VPC public subnets 中创建 NAT instance 即 EC2 虚拟机，
- 配置 NAT instance，使用 tunnel 网络访问 github，
- 修改 private subnets 的路由表，添加 github 服务的 IP CIDRs，将对这些IP地址的请求通过 NAT instance 转发。

综上，实现了不用对现有持续部署流水线做任何修改，流水线中运行在 VPC private subnet 内的任务(包括但不限于CodeBuild, Fargate, Lambda, Glue等)，对外网的请求目标地址如在路由表的特殊规则(IP CIDRs)中，网络请求将会通过 NAT instance 来转发。

为此，创建了一个基于 [AWS CDK][cdk] [construct][construct] 的开源项目 [SimpleNAT][simple-nat] 来封装和复用创建配置 NAT instances，并且将指定的IP地址段更新到路由表设置路由规则。

该项目同时提供了一个[完整示例应用][simple-nat-example]，演示了如何配置 NAT instance 使用 [sshuttle][sshuttle] 建立网络隧道，并且将指定的IP地址段请求通过 NAT instance 来转发。

[simple-nat]: https://github.com/zxkane/snat
[simple-nat-example]: https://github.com/zxkane/snat/tree/main/example
[sshuttle]: https://github.com/sshuttle/sshuttle
[cdk]: {{< relref "/posts/2019/aws-cdk.md" >}}
[construct]: https://docs.aws.amazon.com/cdk/latest/guide/constructs.html