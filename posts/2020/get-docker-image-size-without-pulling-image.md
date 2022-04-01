---
title: "Get the size of Docker image without pulling image"
description : "Utility the Docker registry API to calculate the size of Docker image"
date: 2020-05-02
draft: false
thumbnail: https://static.packt-cdn.com/products/9781788992329/graphics/0ee3d4cf-2133-4143-a7c4-690274483841.png
categories:
- blogging
isCJKLanguage: false
tags:
- docker
- Tip
---
Recently I had a requirement to stats the size of some Docker images. It would be waste if pulling them all firstly then calculating the size of each image. Also you know the docker image consists of some Docker layers that probably are shared by other images. It's hard to get the disk usage if only sum the size of each image.

Is there any way to get the size of Docker image without pulling it?

<!--more-->

It's definitely **Yes**. The docker images are hosted by [Docker Registry][docker-registry-api-v2], which is defined by [a public specification][docker-registry-api-v2]. The latest V2 of Registry has [API][v2-pulling-image] to fetch the manifest of an image that contains the size of every layer. Looks like it's very cool. Utilitying the manifest API of image will satisfie my requirement!

One more thing you should note, the v2 of Docker registry still is compatible with [schema specification V1][image-manifest-v1]. You have to properly handle with the mixed responses of manifest when you query the manifest of an image.

I created a [simple shell script][simple-script] gracefully handling either v1 or v2 response of the image manifest, which can calculate the total layers size of a Docker image with specific tag, or the size of all tags of a Docker image.

> Above script was inspired by [this post][inspect-docker-image-without-pulling]. Hope you enjoy it.

[docker-registry-api-v2]: https://docs.docker.com/registry/spec/api/
[v2-pulling-image]: https://docs.docker.com/registry/spec/api/#pulling-an-image
[image-manifest-v1]: https://docs.docker.com/registry/spec/manifest-v2-1/
[simple-script]: https://gist.github.com/zxkane/23de226fee8806ee0ed8c05136972ce0
[inspect-docker-image-without-pulling]: https://ops.tips/blog/inspecting-docker-image-without-pull/