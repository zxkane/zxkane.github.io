---
title: "AWS Lambda Layer实践"
description : "使用Lambda Layer共享基础依赖、三方库或自定义runtime"
date: 2019-05-14
draft: false
thumbnail: "/posts/effective-cloud-computing/serverless-dingtalk-callback/images/cover.png"
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
在[基于函数计算的钉钉回调函数接口][dingtalk-callback-on-aws]中使用钉钉回调函数案例实践了[AWS Lambda][aws-lambda]无服务函数。该示例中，我们将自定义的函数代码及依赖的第三方库（比如json处理库jackson, 钉钉openapi加密库, aws dynamodb client等）整体打包为一个部署包，上传到lamdba代码仓库用于函数执行。

然而实际项目中，其实有大量的相关函数可能会共享这些基础依赖库、三方函数库(比如headless chrome(Puppeteer), pandoc, OCR library -- Tesseract等等)或者使用自定义runtime(如官方未支持的java11)的需求。AWS Lambda在去年底发布了[Lambda layers功能][aws-lambda-runtime-layer-support]来满足上述这些实际开发中的需求。

接下来，让我们看看如何将[前文][dingtalk-callback-on-aws]中的[函数依赖][dingtalk-callback-dependencies]放置到一个单独的layer中，作为不同函数的共享依赖库。

<!--more-->

在我们的构建配置`build.gradle`中，将[函数的共享依赖拷贝][copy-deps]到java runtime[特定的目录结构][lambda-layers-path]`java/lib/`下，

{{< highlight gradle "linenos=table,hl_lines=153-157,linenostart=153">}}
tasks.register<Copy>("depsLayer") {
    into("$buildDir/deps/java/lib")
    from(configurations.compileClasspath.get())
    from(configurations.runtimeClasspath.get())
}
{{< /highlight >}}

接下来将共享的依赖创建为一个lambda layer，并且让callback函数依赖这个共享layer，不再将所有的依赖打包为一个很大的部署包减小每次变更需要发布的包大小。

{{< highlight yaml "linenos=table,hl_lines=31-48,linenostart=31">}}
  DependenciesLayer:
    Type: AWS::Serverless::LayerVersion
    Properties:
      LayerName: DingTalkDependencies
      Description: DingTalk Dependencies Layer
      ContentUri: 'build/deps'
      CompatibleRuntimes:
        - java8
      LicenseInfo: 'Available under the MIT-0 license.'
      RetentionPolicy: Retain

  CallbackFunction:
    Type: AWS::Serverless::Function # More info about Function Resource: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
    Properties:
      CodeUri: build/libs/dingtalk-callback-1.0.0-SNAPSHOT.jar
      Handler: com.github.zxkane.dingtalk.Callback::handleRequest
      Layers:
        - !Ref DependenciesLayer
      Policies:
{{< /highlight >}}

在console查看部署后的函数，如下图，可以看到函数新增了一个layer。

{{< figure src="/posts/2019/aws-lambda-layers/lambda-with-layers.png" alt="lambda with layers" >}}

同其他的语言、技术一样，[Awesome Layers][awesome-lambda-layers]项目收集了目前一些常用且维护较好的layer，自创轮子之前可以先参考下:grinning:。

使用layer同样有以下限制，使用前需要注意，

- 依赖的layer数不能超过5个
- 函数以及依赖的所有layers解压后不可以超过250MB

[dingtalk-callback-on-aws]: {{< relref "/posts/effective-cloud-computing/serverless-dingtalk-callback/index.md" >}}
[aws-lambda]: https://aws.amazon.com/lambda/
[aws-lambda-runtime-layer-support]: https://aws.amazon.com/about-aws/whats-new/2018/11/aws-lambda-now-supports-custom-runtimes-and-layers/
[dingtalk-callback-dependencies]: https://github.com/zxkane/dingtalk-callback-on-aws/blob/267b5f11851148f5a23a834b8b7ecd4d3b247ce7/build.gradle.kts#L71-L91
[copy-deps]: https://github.com/zxkane/dingtalk-callback-on-aws/blob/c6a293ac58b6892278c296daa237453279f50064/build.gradle.kts#L153-L157
[lambda-layers-path]: https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html#configuration-layers-path
[awesome-lambda-layers]: https://github.com/mthenw/awesome-layers
