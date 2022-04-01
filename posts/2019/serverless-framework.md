---
title: "Serverless framework 101"
description : "使用serverless framework跨云厂商部署无服务器函数"
date: 2019-05-16
draft: false
thumbnail: "https://camo.githubusercontent.com/16068dbb37e2d7fdae1127de35a336c5f254a5e7/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6173736574732e6769746875622e7365727665726c6573732f726561646d652d7365727665726c6573732d6672616d65776f726b2e6a7067"
categories:
- blogging
series:
- serverless-computing
isCJKLanguage: true
tags:
- 云计算
- FaaS
- AWS
- AWS Lambda
- Serverless Computing
---
[Serverless Framework][serverless-framework]是一个开源命令行工具。他提供函数脚手架、流程自动化、最佳实践等帮助开发、部署跨云厂商的托管无服务器计算服务(官方已支持aws, Azure, GCP, IBM Cloud等各种厂商的无服务器计算)。同时支持使用插件来扩展各种功能，比如支持更多云厂商无服务器计算服务，例如[阿里云的函数计算][serverless-aliyun]。

这里使用[基于函数计算的钉钉回调函数接口][dingtalk-callback-on-aws]示例来演示如何使用[Serverless Framework][serverless-framework]将一个无服务器函数部署到[AWS Lambda][aws-lambda]。

<!--more-->

[安装servereless][install-serverless]后，可以通过`serverless create`命令创建函数脚手架工程，或者在已有工程的下创建serverless配置文件`serverless.yml`。

接下来可以参考[serverless aws reference][serverless-aws-template]配置你的aws lambda函数及需要的各种资源。如果已经有过使用[AWS CloudFormation][aws-cloudformation-doc]或者[AWS SAM][aws-sam-doc]经验的，可以很快适应编写Serverless配置。Serverless的配置本质上是将CloudFormation/SAM相关的概念进行抽象，为各个云厂商的无服务器计算服务提供统一的工具、命令以及概念抽象。在部署aws lambda时，`serverless`配置会被转换为`CloudFormation`配置，通过AWS API进行创建或变更。

对于Dingtalk Callback on AWS Lambda, `serverless`配置声明如下。其中指定了service的基本信息，全局的配置(如stage、region等)、云厂商provider(这里是aws)。函数的基本信息、权限、layer、触发器，自定义layer以及其他云厂商资源，比如Dingtalk callback这里用到的DynamoDB。完整的serverless配置查看[这里][servereless-yml-source]。

{{< highlight yaml >}}
service:
  name: dingtalk-callback

frameworkVersion: ">=1.0.0 <2.0.0"

provider:
  name: aws
  runtime: java8
  stage: ${opt:stage, 'dev'} # Set the default stage used. Default is dev
  region: ${opt:region, 'ap-southeast-1'} # Overwrite the default region used. Default is ap-southeast-1
  profile: ${opt:profile, 'default'} # The default profile to use with this service
  versionFunctions: true # Optional function versioning
  endpointType: regional # Optional endpoint configuration for API Gateway REST API. Default is Edge.

functions:
  dingtalk-callback:
    handler: com.github.zxkane.dingtalk.Callback::handleRequest # required, handler set in AWS Lambda
    name: ${self:provider.stage}-dingtalk-callback # optional, Deployed Lambda name
    memorySize: 384 # optional, in MB, default is 1024
    timeout: 15 # optional, in seconds, default is 6
    environment: # Function level environment variables
      PARA_DD_TOKEN: DD_TOKEN
      TABLE_NAME: {Ref: BPMTable}
    package:
      artifact: build/libs/dingtalk-callback-1.0.0-SNAPSHOT.jar
    role: dingtalkCallbackIAMRole
    layers: # An optional list Lambda Layers to use
      - {Ref: DependenciesLambdaLayer}
    events: # The Events that trigger this Function
      - http: # This creates an API Gateway HTTP endpoint which can be used to trigger this function.  Learn more in "events/apigateway"
          path: dingtalk # Path for this endpoint
          method: post # HTTP method for this endpoint

layers:
  dependencies:
    path: build/deps

resources:  # CloudFormation template syntax
  Resources:
    dingtalkCallbackIAMRole:
      Type: AWS::IAM::Role
      Properties:
        Policies:
          - PolicyName: SSMPolicy
          - PolicyName: DynamoDBPolicy
    BPMTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: bpm_raw_${self:service.name}_${self:provider.stage}
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1

{{< /highlight >}}

对于使用单一云厂商无服务器计算并且已经使用了类似[sam cli][aws-sam-doc]实现持续集成、持续部署的用户，[Serverless Framework][serverless-framework]并不能带来更多生产力的提升，在稳定性(封装云厂商的功能，增加复杂度很可能引入新的问题)或功能的及时性上可能还不如云厂商提供的工具。

对于有多云厂商部署无服务器函数需求的用户，使用了[Serverless Framework][serverless-framework]**并不能**轻松的将无服务器函数部署到不同云厂商的托管服务上，他只是帮助提供跨云厂商的统一工具链及相似的持续集成、部署等最佳实践流程。例如将一套函数从AWS迁移到Azure上，需要重新实现Azure provider下的配置，因为云厂商的托管无服务器服务和其他云资源都存在着大量差异。另外函数代码也需要面临改造，不同云厂商的触发器消息事件也都有不同的格式！这里可以考虑使用类似[Spring Cloud Function][spring-cloud-function]这样的解决方案来实现跨云厂商的函数编写。

总之，[Serverless Framework][serverless-framework]对于跨云厂商部署场景有一定生产效率的提升，但他离完美解决跨云厂商无服务器托管服务（各厂商服务天生不兼容）还有很远的距离，也许这个思路就是走不通的:confused:。

[serverless-framework]: https://serverless.com/
[serverless-aliyun]: https://github.com/aliyun/serverless-aliyun-function-compute
[dingtalk-callback-on-aws]: {{< relref "/posts/effective-cloud-computing/serverless-dingtalk-callback/index.md" >}}
[aws-lambda]: https://aws.amazon.com/lambda
[install-serverless]: https://serverless.com/framework/docs/getting-started/
[serverless-aws-template]: https://serverless.com/framework/docs/providers/aws/guide/serverless.yml/
[aws-cloudformation-doc]: https://docs.aws.amazon.com/cloudformation/?id=docs_gateway
[aws-sam-doc]: https://docs.aws.amazon.com/serverless-application-model/?id=docs_gateway
[servereless-yml-source]: https://github.com/zxkane/dingtalk-callback-on-aws/blob/master/serverless.yml
[spring-cloud-function]: https://spring.io/projects/spring-cloud-function
