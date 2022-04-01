---
title: "AWS发布更快、更便宜、更易用的HTTP APIs"
description : ""
date: 2020-03-13
draft: false
thumbnail: posts/2020/new-http-apis-of-api-gateway/images/cover.png
categories:
- blogging
series:
- serverless-computing
isCJKLanguage: true
tags:
- 云计算
- FaaS
- AWS
- AWS API Gateway
- Serverless Computing
---
AWS在3月12日[正式发布了新一代的API网关 -- HTTP APIs][aws-http-apis-ga]。AWS发布的第一代API Gateway服务已经快5年了，通过这些年来大规模服务客户的心得以及客户反馈，由此重新构建了更快（相比第一代网关60%的延迟减少）、更便宜（至少节省71%的费用）、更易用的第二代网关服务。

<!--more-->

除了性能、费用、易用性的大幅度改进之外，在[HTTP APIs发布博客][aws-http-apis-ga]中着重介绍了以下新特性，

- HTTP APIs网关可同私有VPC内的负载均衡(ALB/NLB)，服务发现(Cloup Map)集成。意味着可将目前最流行且普遍应用的容器服务作为API后端
- 可以将自定义域名的API路径混合映射到第一代的REST APIs和最新的HTTP APIs
- 请求限流的改进。支持对不同stage以及请求路由分别设置不同的限流
- Stage变量。可以将Stage变量传递给API网关后端的服务。同时支持路由在不同的stage动态集成不同的后端Lambda函数
- Lambda集成时使用Payload version 2.0。Version 2.0格式提供了更多的灵活性及简化了数据格式
- 支持导入 Swagger / OpenAPI 配置文件

如果对HTTP APIs感兴趣，可以尝试在自己的账户内部署[这个示例][samples-with-different-apis-usage]。这个示例演示了如何按需使用AWS Batch服务进行批量任务计算，同时将任务提交和查询状态通过HTTP接口提供出来。该示例支持部署时选用不同的AWS服务（ALB、REST APIs或HTTP APIs）来提供这些API接口访问。整个示例都是基于无服务器架构实现的，不进行批量计算是不产生任何费用的哦:smile:。


[aws-http-apis-ga]: https://aws.amazon.com/blogs/compute/building-better-apis-http-apis-now-generally-available/
[samples-with-different-apis-usage]: https://github.com/zxkane/cdk-collections/blob/master/batch-demo/README.md#how-to-deploy-batch-demo-app