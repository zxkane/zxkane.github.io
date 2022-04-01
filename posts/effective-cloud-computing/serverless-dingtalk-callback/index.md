---
title: "基于函数计算的钉钉回调函数接口"
description : "基于阿里云和AWS生产级别的钉钉回调函数接口"
date: 2019-04-02
draft: false
thumbnail: posts/effective-cloud-computing/serverless-dingtalk-callback/images/cover.png
series:
- effective-cloud-computing
- serverless-computing
isCJKLanguage: true
tags:
- 云计算
- FaaS
- 阿里云
- 函数计算
- AWS
- AWS Lambda
- 钉钉
- dingtalk
- Serverless Computing
---
由于企业内部管理的需要，用到了[钉钉的业务事件回调][dingtalk-callback]能力，正好将这个轻量级的接口使用[无服务器技术][serverless-101-post]来实现部署，以应对流量无规律下的动态扩展伸缩、按需使用、按量计费等需求。

<!--more-->
### 阿里云函数计算版本

由于公司系统部署在阿里云，首先选择使用[阿里云函数计算][aliyun-fc]来实现及部署。该接口使用了JVM上语言Kotlin开发，虽然阿里云函数计算官方支持的[开发语言有Java但没有Kotlin][aliyun-fc-develop-language]。其实无论Java或Kotlin最终部署文件都是Java Class字节码，加上Kotlin与Java良好的互操作性，实测函数计算可以完美支持Kotlin开发(个人认为任意JVM上的开发语言都是支持的)。

同时该函数使用了[表格存储][ots]来持久化回调事件。表格存储是个按量计费的分布式存储，有兴趣的可以自行查阅文档了解更多。

该函数通过[API网关][apigateway]和[表格存储触发器][ots-trigger]来触发。访问日志和执行日志被存储在[日志服务][sls]中。

函数的本地测试和线上部署，使用了函数计算提供的命令行工具[Fun][aliyun-fc-fun]。基于[Fun定义的阿里云Serverless模型][aliyun-fc-fun-spec]实现了对函数们使用资源的声明和编排，集成[Gitlab CI][gitlab-ci]实现了[函数的CI/CD自动化发布流程][dingtalk-callback-aliyun-cicd]。

不涉及公司业务的代码已[开源在Github][dingtalk-callback-on-aliyunfc]，有兴趣的可以作为参考。

目前[函数计算][aliyun-fc-quota]和[表格存储][ots-quota]有各自的免费配额，在业务量不大的情况下，该服务完全免费。

### AWS Lambda版本

[AWS Lambda][aws-lambda]是目前全球使用最为广泛的serverless服务，同时也是函数计算发展方向的引领者。

由于一些个人原因，笔者最近接触了部分AWS服务，同时尝试将钉钉回调函数移植到了[AWS Lambda][aws-lambda]上。阿里云上使用的云服务改为由AWS上对应服务来实现，例如存储使用了[DynamoDB][dynamodb]，日志使用[CloudWatch][cloudwatch]收集和查询。

本地测试和部署工具，使用的是[SAM CLI][sam-cli]，持续集成和持续部署使用的是[AWS CodeBuild][codebuild]和[AWS CodePipeline][codepipeline]。此外AWS通过[AWS CloudFormation][cloudformation]提供一种非常强大的能力，可以将AWS上的各种资源通过配置声明的方式来管理(也就是现在非常热门的一个概念--[Infrastructure as Code][infrastructure-as-code])。[AWS CloudFormation][cloudformation]会为每次一个或多个资源的变更生成ChangeSet，提供查看对比、版本管理、遇到变更错误整体回退等能力。所以，AWS版本也将该项目的CI/CD部署用到的[AWS CodeBuild][codebuild]、[AWS CodePipeline][codepipeline]、[Amazon DynamoDB][dynamodb]等资源通过CloudFormation的配置管理起来。

配置代码段如下，
{{< highlight yaml "linenos=table,hl_lines=56-84">}}
Description: Create a CodePipeline to include Github source, CodeBuild and Lambda deployment.

Parameters:
  AppBaseName:
    Type: String
    Description: App base name
    Default: dingtalk-callback
  ArtifactStoreS3Location:
    Type: String
    Description: Name of the S3 bucket to store CodePipeline artificat.
  BranchName:
    Description: GitHub branch name
    Type: String
    Default: master
  RepositoryName:
    Description: GitHub repository name
    Type: String
    Default: dingtalk-callback-on-aws
  GitHubOAuthToken:
    Type: String
    NoEcho: true

Resources:
  BuildDingtalkProject:
    Type: AWS::CodeBuild::Project
    Properties:
      Name:
        Fn::Sub: ${AppBaseName}-build-${AWS::StackName}
      Description: Build, test, package dingtalk callback project
      ServiceRole:
        Fn::GetAtt: [ CodeBuildRole, Arn ]
      Artifacts:
        Type: S3
        Location:
          Ref: ArtifactStoreS3Location
        Name:
          Fn::Sub: ${AppBaseName}-build-${AWS::StackName}
        NamespaceType: BUILD_ID
        Path: 
          Fn::Sub: ${AppBaseName}/artifacts
        Packaging: NONE
        OverrideArtifactName: true
        EncryptionDisabled: true
      Environment:
        Type: LINUX_CONTAINER
        ComputeType: BUILD_GENERAL1_SMALL
        Image: aws/codebuild/java:openjdk-11
        PrivilegedMode: false
        ImagePullCredentialsType: CODEBUILD
        EnvironmentVariables:
          - Name: s3_bucket
            Value:
              Ref: ArtifactStoreS3Location
      Source:

  DingtalkCallbackPipeline:
    Type: 'AWS::CodePipeline::Pipeline'
    Properties:
      Name:
        Fn::Sub: ${AppBaseName}-pipeline-${AWS::StackName}
      RoleArn:
        Fn::GetAtt: [ CodePipelineRole, Arn ]
      Stages:
        - Name: Source
          Actions:
            - Name: SourceAction
              ActionTypeId:
                Category: Source
                Owner: ThirdParty
                Version: 1
                Provider: GitHub
              OutputArtifacts:
                - Name: 
                    Fn::Sub: ${AppBaseName}-source-changed
              Configuration:
                Owner: !Ref GitHubOwner
                Repo: !Ref RepositoryName
                Branch: !Ref BranchName
                OAuthToken: !Ref GitHubOAuthToken
                PollForSourceChanges: false
              RunOrder: 1
        - Name: Build
          Actions:
            - Name: Build_Test_Package
              InputArtifacts:
                - Name:
                    Fn::Sub: ${AppBaseName}-source-changed
              ActionTypeId:
                Category: Build
                Owner: AWS
                Version: 1
                Provider: CodeBuild
              OutputArtifacts:
                - Name: 
                    Fn::Sub: ${AppBaseName}-packaged-yml
              Configuration:
                ProjectName:
                  Ref: BuildDingtalkProject
              RunOrder: 1
{{< /highlight >}}

AWS版本完整的代码、CloudFormation配置以及部署文档可以通过[这里][dingtalk-callback-on-aws]查看。

[dingtalk-callback]: https://open-doc.dingtalk.com/microapp/serverapi2/lo5n6i
[serverless-101-post]: {{< relref "/posts/effective-cloud-computing/serverless-computing-101/index.md" >}}
[aliyun-fc]: https://www.aliyun.com/product/fc
[aliyun-fc-develop-language]: https://help.aliyun.com/document_detail/74712.html
[ots]: https://www.aliyun.com/product/ots
[apigateway]: https://www.aliyun.com/product/apigateway
[ots-trigger]: https://help.aliyun.com/document_detail/100092.html
[sls]: https://www.aliyun.com/product/sls
[aliyun-fc-fun]: https://help.aliyun.com/document_detail/64204.html
[aliyun-fc-fun-spec]: https://github.com/aliyun/fun/blob/master/docs/specs/2018-04-03-zh-cn.md?spm=a2c4g.11186623.2.24.717428femnY0Et&file=2018-04-03-zh-cn.md
[gitlab-ci]: https://about.gitlab.com/product/continuous-integration/
[dingtalk-callback-aliyun-cicd]: https://github.com/zxkane/dingtalk-callback-on-aliyunfc/blob/master/.gitlab-ci.yml
[aliyun-fc-quota]: https://help.aliyun.com/document_detail/54301.html
[ots-quota]: https://help.aliyun.com/document_detail/52733.html
[dingtalk-callback-on-aliyunfc]: https://github.com/zxkane/dingtalk-callback-on-aliyunfc
[dingtalk-callback-on-aws]: https://github.com/zxkane/dingtalk-callback-on-aws
[aws-lambda]: https://aws.amazon.com/lambda/
[dynamodb]: https://aws.amazon.com/dynamodb/
[cloudwatch]: https://aws.amazon.com/cloudwatch/
[sam-cli]: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html
[codebuild]: https://aws.amazon.com/codebuild/
[codepipeline]: https://aws.amazon.com/codepipeline/
[cloudformation]: https://aws.amazon.com/cloudformation/
[infrastructure-as-code]: https://en.wikipedia.org/wiki/Infrastructure_as_code
