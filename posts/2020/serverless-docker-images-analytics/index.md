---
title: "无服务器架构的Docker镜像数据分析应用"
description : "用数据湖玩转数据分析"
date: 2020-05-04
draft: false
thumbnail: posts/2020/serverless-docker-images-analytics/images/cover.jpeg
categories:
- blogging
series:
- effective-cloud-computing
- serverless-computing
isCJKLanguage: true
tags:
- 云计算
- AWS
- Big Data
- Data Lakes
- Analytics
- AWS Athena
- Cloud Native
- docker
---
近期对Docker镜像做了些数据分析，这里分享一下利用云原生技术快速且低成本的实现任意数量的数据分析。

之前通过文章介绍了[不用拉取Docker镜像就可获取镜像的大小][get-docker-image-size-without-pulling]的一种方法，通过其中的示例脚本，我们可以获取到待分析的原始数据。

比如`nginx`镜像的部分原始数据(csv格式)如下，

{{< highlight txt "linenos=table">}}
1.18.0-alpine,sha256:676b8117782d9e8c20af8e1b19356f64acc76c981f3a65c66e33a9874877892a,amd64,linux,null,null,"sha256:cbdbe7a5bc2a134ca8ec91be58565ec07d037386d1f1d8385412d224deafca08",2813316
1.18.0-alpine,sha256:676b8117782d9e8c20af8e1b19356f64acc76c981f3a65c66e33a9874877892a,amd64,linux,null,null,"sha256:6ade829cd166df9b2331da48e3e60342aef9f95e1e45cde8d20e6b01be7e6d9a",6477096
1.18.0-alpine,sha256:70feed62d5204358ed500463c0953dce6c269a0ebeef147a107422a2c78799a9,arm,linux,v6,null,"sha256:b9e3228833e92f0688e0f87234e75965e62e47cfbb9ca8cc5fa19c2e7cd13f80",2619936
1.18.0-alpine,sha256:70feed62d5204358ed500463c0953dce6c269a0ebeef147a107422a2c78799a9,arm,linux,v6,null,"sha256:a03f81873d278ad248976b107883f0452d33c6f907ebcdd832a6041f1d33118a",6080562
1.18.0-alpine,sha256:2ba714ccbdc4c2a7b5a5673ebbc8f28e159cf2687a664d540dcb91d325934f32,arm64,linux,v8,null,"sha256:29e5d40040c18c692ed73df24511071725b74956ca1a61fe6056a651d86a13bd",2724424
1.18.0-alpine,sha256:2ba714ccbdc4c2a7b5a5673ebbc8f28e159cf2687a664d540dcb91d325934f32,arm64,linux,v8,null,"sha256:806787fcd4f9e2f814506fb53e81b6fb33f9eea04e5b537b31fa5fb601a497ee",6423816
1.18.0-alpine,sha256:6d6f19360150548bbb568ecd3e1affabbdce0fcc39156e70fbae8a0aa656541a,386,linux,null,null,"sha256:2826c1e79865da7e0da0a993a2a38db61c3911e05b5df617439a86d4deac90fb",2808418
1.18.0-alpine,sha256:6d6f19360150548bbb568ecd3e1affabbdce0fcc39156e70fbae8a0aa656541a,386,linux,null,null,"sha256:f2ab0e3b0ff04d1695df322540631708c42b0a68925788de2290c9497e44fef3",6845295
1.18.0-alpine,sha256:c0684c6ee14c7383e4ef1d458edf3535cd62b432eeba6b03ddf0d880633207da,ppc64le,linux,null,null,"sha256:9a8fdc5b698322331ee7eba7dd6f66f3a4e956554db22dd1e834d519415b4f8e",2821843
1.18.0-alpine,sha256:c0684c6ee14c7383e4ef1d458edf3535cd62b432eeba6b03ddf0d880633207da,ppc64le,linux,null,null,"sha256:30a37aac8b54a38e14e378f5122186373cf233951783587517243e342728a828",6746511
1.18.0-alpine,sha256:714439fec7e1f55c29b57552213e45c96bbfeefddea2b3b30d7568591966c914,s390x,linux,null,null,"sha256:7184c046fdf17da4c16ca482e5ede36e1f2d41ac8cea9c036e488fd149d6e8e7",2582859
1.18.0-alpine,sha256:714439fec7e1f55c29b57552213e45c96bbfeefddea2b3b30d7568591966c914,s390x,linux,null,null,"sha256:214dff8a034aad01facf6cf63613ed78e9d23d9a6345f1dee2ad871d6f94b689",6569410
{{< /highlight >}}

各列的含义分别是，`镜像tag`, `镜像`[Digest][docker-content-degist], `镜像对应平台的Architecture`, `镜像对应平台的OS`, `镜像对应平台的变种`（例如，ARM的v7, v8等）, `镜像对应平台的OS版本`, `镜像组成层的`[Digest][docker-content-degist], `镜像组成层的大小`。

上面`nginx`镜像的示例数据，告诉我们镜像名`nginx`且tag为`1.18.0-alpine`的镜像包含了`amd64-linux`, `arm-linux-v6`, `arm64-linux-v8`, `386-linux`, `ppc64le-linux`以及`s390x-linux`共5种Arch合计6个版本的镜像。且每个平台的对应镜像包含了两个层以及这两个层的大小。

当我们有了成百数千甚至海量镜像的原始数据后，如何能快速且低成本的分析这些数据呢？

<!--more-->

在AWS上，我们可以利用[数据湖][aws-datalakes]相关的系列产品来实现低成本的交互式分析。

1. 在Docker镜像分析这个场景下，我已经获取到了待分析镜像的平台、层等数据。我将这些数据上传到[Amazon S3][amazon-s3]作为数据湖的数据源。
2. 接下来使用[AWS Glue][aws-glue]以S3中的数据创建Table并且从中提前数据的metadata。同时做数据分区，为接下来的查询做性能和成本优化。
3. 打开[Amazon Athena][amazon-athena]，根据业务需求通过SQL语句查询分析Docker镜像数据。

就是通过以上3个简单步骤，我就得到了一个无服务器架构的Docker镜像数据分析应用！整个应用完全是按量计费的，主要成本包括S3对象存储费用，和Athena费用（根据每次查询扫描数据的大小来计算）。

使用该分析应用，我统计了[Docker Hub官方镜像][docker-hub-official-images]中包含层最多的10个镜像(分平台统计)，
{{< figure src="/posts/2020/serverless-docker-images-analytics/images/top-10-layers-of-official-images.png" alt="Top 10 layers" >}}

最后，得力于AWS Infra as Code的强大能力，[整个应用][opensource-serverless-docker-images-analytics]也是通过代码管理的且开源的，有兴趣的读者也可以部署自己的分析应用。

[get-docker-image-size-without-pulling]: {{< relref "/posts/2020/get-docker-image-size-without-pulling-image.md" >}}
[docker-content-degist]: https://docs.docker.com/registry/spec/api/#content-digests
[aws-datalakes]: https://aws.amazon.com/big-data/datalakes-and-analytics/
[amazon-s3]: https://aws.amazon.com/s3/
[aws-glue]: https://aws.amazon.com/glue/
[amazon-athena]: https://aws.amazon.com/athena/
[docker-hub-official-images]: https://hub.docker.com/search?image_filter=official&type=image 
[opensource-serverless-docker-images-analytics]: https://github.com/zxkane/serverless-docker-images-analytics