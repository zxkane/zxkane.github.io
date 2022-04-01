---
title: "无服务器架构的域名重定向服务"
description : "基于AWS的无服务器域名重定向实践"
date: 2019-08-27
draft: false
thumbnail: posts/effective-cloud-computing/serverless-domain-redirect/images/cover.png
series:
- effective-cloud-computing
- serverless-computing
isCJKLanguage: true
tags:
- 云计算
- AWS
- AWS S3
- AWS Lambda
- AWS CDK
---
业务时常有需求将某个域名(A)的访问重定向到其他域名(B)，即使实现这样一个很简单的需求通常也需要部署Web服务器（例如Nginx），为域名A的请求返回302响应，并提供新的Location地址重定向到域名B。现在基于云计算服务，我们可以使用一些托管服务来实现同样的事情，无需管理服务器和维护应用，同时做到最低成本实现该需求。

接下来将介绍如何利用AWS上的服务实现该需求。

<!--more-->
### 使用AWS S3和AWS CloudFront实现域名重定向

1. 创建一个新的S3 bucket，例如 `redirect.domain.com`
2. 配置新bucket属性，开启静态网站托管，同时配置为重定向请求到期望的域名 `redirected-host.domain.com`
3. 创建新的CloudFront分发，设置第一步创建的S3 bucket作为[自定义源站(不可以配置源站为S3 bucket)][cf-custom-origin]。并且配置使用自定义域名 `redirect.domain.com`。注意，配置自定义CNames需要提供域名对应的SSL证书，可以使用AWS Certificate Manager创建免费的SSL/TLS证书
4. 在域名`domain.com`解析服务商为域名`redirect.domain.com`创建新的解析记录

### 使用AWS Lambda和API Gateway实现域名重定向

1. 创建一个Lambda函数来返回302请求或者HTML页面，在页面中通过Javascript实现重定向页面
2. 为该Lambda函数创建API Gateway触发器
3. 为该API Gateway接口创建自定义域名
4. 在域名`domain.com`解析服务商为域名`redirect.domain.com`创建新的解析记录 

我创建了一个基于[AWS CDK][aws-cdk]的[Github项目][serverless-domain-redirect-s3]，利用AWS Infrastructure as Code的强大能力一键部署以上两种无服务器环境，有需要的可以作为实现参考。

[cf-custom-origin]: https://docs.aws.amazon.com/zh_cn/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
[serverless-domain-redirect-s3]: https://github.com/zxkane/serverless-domain-redirect#use-aws-s3-and-cloudfront-for-domain-redirect
[aws-cdk]: https://aws.amazon.com/cdk/?nc1=h_ls
