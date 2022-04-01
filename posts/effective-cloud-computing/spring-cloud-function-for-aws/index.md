---
title: "Spring Cloud Function -- 跨Serverless平台的函数计算框架"
description : "实战使用Spring Cloud Function开发AWS Lambda函数"
date: 2019-06-28
draft: false
thumbnail: https://i.ytimg.com/vi/2drTR7pEUyg/maxresdefault.jpg
series:
- effective-cloud-computing
- serverless-computing
isCJKLanguage: true
tags:
- 云计算
- FaaS
- 函数计算
- AWS
- AWS Lambda
- 钉钉
- dingtalk
- Serverless Computing
- Spring
- Spring Cloud Function
---
[基于serverless框架的钉钉回调函数][serverless-dingtalk]中介绍了serverless framework，一款支持跨云厂商/Serverless平台的部署工具。但是函数代码还是需要针对不同的serverless平台作对应的适配。而[Spring Clound Function][spring-cloud-function]就是针对这种情况专门开发的跨serverless平台的框架，实现一套代码通过不同的打包实现跨serverless平台。Spring Clound Function目前支持AWS Lambda, Microsoft Azure Function以及Apache OpenWhisk。

<!--more-->

这里我们继续使用[无函数版本的钉钉回掉函数][dingtalk-callback-on-aws]来演示[Spring Clound Function][spring-cloud-function] for AWS的使用。

首先将`spring cloud function for aws adapter`添加到项目依赖，

{{< highlight kotlin >}}
implementation("org.springframework.cloud:spring-cloud-function-adapter-aws:${springCloudFunctionVersion}")
{{< /highlight >}}

其次创建函数`Handler`，实现Spring Cloud Function跨函数计算实现抽象的`SpringBootRequestHandler`类，或者是继承自它的trigger类，例如`SpringBootApiGatewayRequestHandler`

{{< highlight kotlin >}}
import org.springframework.cloud.function.adapter.aws.SpringBootApiGatewayRequestHandler

class Handler : SpringBootApiGatewayRequestHandler()
{{< /highlight >}}

接下来创建Spring Boot应用程序，并将serverless实现函数注册为`Spring Bean`，函数的实现部分就是serverless函数具体做的业务逻辑。

{{< highlight kotlin >}}
@SpringBootApplication
open class DingtalkCallbackApplication {

    @Bean
    open fun dingtalkCallback(): Function<Message<EncryptedEvent>, Map<String, String>> {
        val callback = Callback()
        return Function {
            callback.handleRequest(it)
        }
    }
}
fun main(args: Array<String>) {
    SpringApplication.run(DingtalkCallbackApplication::class.java, *args)
}
{{< /highlight >}}

最后将函数打包为fat jar（如果将依赖打包为lambda layer，可不用打包为fat jar）作为lambda的代码。

函数的部署同其他的lambda函数没有任何区别，这个示例中沿用了之前的SAM/CloudFormation配置或者[serverless framework][serverless-framework]部署配置。

完整的可运行、部署代码请访问[这个分支][spring-cloud-function-branch]。

> 总体来说，[Spring Clound Function][spring-cloud-function]的实现原理并不复杂，定义统一的函数实现入口，通过不同serverless平台的adapter对接不同平台的API接口，做到编写一次函数实现，通过打包不同的adapter做到跨serverless平台运行。

> 但个人认为现实中这样的场景并不多。并且serverless函数触发方式很多，例如AWS上的APIGateway、Kinesis、CloudWatch、IoT等服务，与这些服务对接或API调用其实也产生了耦合，并不能简单的迁移到三方的serverless平台去执行。同时，开发者需要引入spring/spring boot/spring cloud相关的依赖，增加了程序的复杂度，又延长了lambda函数clod start需要的时间。另外，开发者需要学习spring cloud function相关的知识，无形中增加了复杂度。总之使用spring cloud function作为函数计算框架收益并不高，整个项目给人感觉比较鸡肋。

[serverless-framework]: https://serverless.com/
[spring-cloud-function]: https://spring.io/projects/spring-cloud-function
[serverless-dingtalk]: {{< relref "/posts/2019/serverless-framework.md" >}}
[dingtalk-callback-on-aws]: {{< relref "/posts/effective-cloud-computing/serverless-dingtalk-callback/index.md" >}}
[spring-cloud-function-branch]: https://github.com/zxkane/dingtalk-callback-on-aws/tree/spring-cloud-function
