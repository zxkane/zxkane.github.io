---
title: Docker Swarm mode(v1.12.x)的一些使用限制
date: 2016-09-20
categories: 
- blogging 
isCJKLanguage: true
tags:
- docker 
- docker-swarm
---

[Swarm mode][docker swarm mode]在[Docker][docker] v1.12中正式发布，[Swarm mode][docker swarm mode]带来了诸如Docker集群，容器编排，多主机网络等激动人心的特性。[V秘][vme]团队也尝试着将各种后台服务部署到[Docker Swarm Cluster][docker swarm mode]获取更好的弹性计算能力。

[Docker v1.12][docker]中正式发布的[Docker Swarm][docker swarm mode]在我们实用中发现仍有不少不足之处，让我们一一分享给大家。

<!-- more -->

1. 无法将服务的published端口只绑定到特点的网卡上。比如我们的云主机（同时也是Swarm manager/node）有**eth0**和**eth1**两块网卡，分别连接内网和外网。我们计划在[Docker Swarm][docker swarm mode]中运行一个**nginx**服务，通过80/443端口提供HTTP/HTTPS服务。当我们希望将**nginx**中的Web服务暴露在云主机上时，我们通过以下命令创建**nginx**服务。然而我们无法选择将published的**80**端口绑定在哪个interface上。[Docker Swarm][docker swarm mode]会自动将服务监听到Swarm node的所有80端口上。如果我们只想将这个服务暴露在内网interface暂时无法实现。
{{< highlight bash >}}
docker service create --name vme-nginx --network vme-network --replicas 1 \
       --publish 80:80 --publish 443:443 \
       nginx:1.11
{{< / highlight >}}
1. 无法为[Docker Swarm][docker swarm mode]内运行的服务设置主机名。通过[docker run命令][docker run]执行的容器可以设置hostname。比如，
{{< highlight bash >}}
docker run --hostname vme-nginx nginx:1.11
{{< / highlight >}}
但是[docker service create命令][docker service create]缺少等价的参数为容器指定hostname。一些依赖于**hostname**的服务将无法部署在[Docker Swarm][docker swarm mode]中，比如clustered rabbitmq。
1. [Docker compose][docker compose]还不能与[Docker Swarm][docker swarm mode]完美集成。目前有一个experimental的[Docker Stacks and Distributed Application Bundles][docker bundle]在尝试做更好的整合。
1. **docker service update**有时不能更新正在运行中的container。更多讨论见[这个issue][docker service update issue]。

[vme]: https://vme360.com
[docker]: https://www.docker.com
[docker swarm mode]: https://docs.docker.com/engine/swarm/
[docker run]: https://docs.docker.com/engine/reference/run/
[docker service create]: https://docs.docker.com/engine/reference/commandline/service_create/
[docker compose]: https://docs.docker.com/compose/
[docker bundle]: https://docs.docker.com/compose/bundles/
[docker service update issue]: https://github.com/docker/swarmkit/issues/1619
