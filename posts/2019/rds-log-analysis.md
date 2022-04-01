---
title: "AWS RDS数据库日志分析及展示"
description : "搭建Serverless架构下的实时日志分析报表"
date: 2019-11-05
draft: false
thumbnail: "https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2018/04/09/3-3.png"
categories:
- blogging
isCJKLanguage: true
tags:
- AWS
- Serverless
- Analysis
---
托管的RDS数据库已经是云计算服务中非常成熟的服务，绝大部分的云计算用户会采用RDS服务来提升数据库服务的可用性同时减少数据库的各类运维事务。

AWS RDS服务支持开启和查询各类的数据库日志，包括常规日志、慢日志、错误日志和审计日志。但RDS服务默认提供的日志查看工具仅仅类似文本查看器，无法针对日志数据做统计和查看历史滚动的存档。

<!--more-->

本文将介绍如何使用AWS上云原生的服务搭建无服务架构的实时日志分析报表系统。该系统的实现思路来自于AWS中国的[一篇博客][rds-log-athena-quicksight-analysis]，该文介绍了使用 CloudWatch Logs，Kinesis Firehose，Athena 和 Quicksight 实现实时分析 Amazon Aurora 数据库审计日志。

这里提供了一个完整的[AWS CDK应用][cdk-rds-audit-log]实现了博客中介绍的服务搭建思路，RDS审计日志通过 CloudWatch Log -> Kinesis Firehose -> S3 这样一个数据管道被过滤，转换，压缩最终保存到S3上，可被无服务分析服务Athena使用。同时创建了一个Lambda函数模拟应用访问数据库，它周期性的连接上应用中创建的RDS Aurora数据库并执行查询或变更Sql。在整个应用在被部署成功后数分钟，及可通过Athena数据表查询统计Aurora审计日志。Enjoy it:satisfied::satisfied:

[rds-log-athena-quicksight-analysis]: https://aws.amazon.com/cn/blogs/china/cloudwatch-logs-kinesis-firehose-athena-quicksight-amazon-aurora/
[cdk-rds-audit-log]: https://github.com/zxkane/cdk-collections/tree/master/rds-audit-log