---
title: "The practise of Amazon Neptune"
description : "Lesson and learn of using Amazon Neptune"
date: 2021-09-03
draft: false
thumbnail: posts/2021/the-practise-of-amazon-neptune/images/cover.png
categories:
- blogging
series:
- effective-cloud-computing
isCJKLanguage: false
tags:
- graph database
- Amazon Neptune
- AWS
---

[Amazon Neptune][neptune] is a managed Graph database on AWS, whose compute and storage is decoupled like [Amazon Aurora][aurora]. Neptune leverages popular open-source APIs such as Gremlin and SPARQL, and easily migrate existing applications. 

<!--more-->

After exploring Neptune few months in solution, I have below few learnings,

### Bulk loading

Always meet the [ConcurrentModificationExceptions][concurrent-modification-exception] when concurrently loading vertices/edges into Neptune. Using [neptune-python-utils][neptune-python-utils] with retry backoff can improve it, however it requires the expensive large Neptune instance.

The best way of batch loading the large vertices/edges into Neptune is using the [bulk load][bulk-load] feature, it works fine though the instance of Neptune is small. The loading time depends on the instance size of Neptune.

### properties of vertice

In my use case, I store the embedding as properties of vertices like relation database. There are almost 400 properties for every vertices, the query performance is bad with large number of properties. Due to the embedding properties will not be queried, consolidating the 400 properties as a single one properties to improve the query performance.

### streams

[Neptune Streams][streams] logs every change to the graph. It's a Lab feature in 2019, and GA in 2020. However there is no Lambda integration now! It means you can not process the Neptune streams in Lambda functions!

### Tools

#### Neptune Tools

[Amazon Neptune Tools][neptune-tools] is a toolkit maintained by Neptune service team.

#### Neptune sigv4

[The script][neptunesig] can connect Neptune to call control plane APIs with aswauthsigv4 and  proxy support.


[neptune]: https://aws.amazon.com/neptune/
[aurora]: https://aws.amazon.com/blogs/database/introducing-the-aurora-storage-engine/
[concurrent-modification-exception]: https://docs.aws.amazon.com/neptune/latest/userguide/transactions-exceptions.html
[neptune-python-utils]: https://github.com/awslabs/amazon-neptune-tools/tree/master/neptune-python-utils
[bulk-load]: https://docs.aws.amazon.com/neptune/latest/userguide/bulk-load.html
[streams]: https://docs.aws.amazon.com/neptune/latest/userguide/streams.html
[neptune-tools]: https://github.com/awslabs/amazon-neptune-tools
[neptunesig]: https://gist.github.com/zxkane/75ebb9ceec06d460582b079708dcca56