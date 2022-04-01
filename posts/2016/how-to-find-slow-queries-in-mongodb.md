---
title: MongoDB中如何找出慢查询
date: 2016-09-29
categories: 
- blogging 
isCJKLanguage: true
tags:
- MongoDB 
- performance-tuning
---

[MongoDB][mongodb]是目前最为流行的[NoSQL][NoSQL]数据库之一。[V秘][vme]的后台数据就是保存在[MongoDB][mongodb]中的哦;)

尽管[MongoDB][mongodb]的性能为业界称道，但任何数据库系统使用中都存在着慢查询的问题。慢查询的性能问题，可能是由于使用非最优的查询语句，不正确的索引或其他配置原因导致的。但开发人员或数据库维护人员首先要找出这些低效的查询，才能做出对应的查询优化。

<!-- more -->

在[MongoDB][mongodb]中实现慢查询的profile是非常容易，因为[MongoDB][mongodb]内置了[profile开关][profile doc]来记录执行时间触发了profile条件的查询。

参照[db.setProfileLevel()][profile doc]的文档，通过以下命令就可以记录执行时长超过**300ms**的查询。

{{< highlight javascript >}}
db.setProfilingLevel(1, 300)
{{< / highlight >}}

当慢查询被重现后，可以通过查找`system.profile` collection来查看执行时长超过**300ms**的查询。

被profiler记录下来慢查询record看起来如下，

{{< highlight json >}}
{       
        "op" : "query",
        "ns" : "myCollection",
        "query" : {     
                "builds" : {    
                        "$elemMatch" : {
                                "builtTime" : null,
                                "$and" : [      
                                        {               
                                                "createdTime" : {
                                                        "$lt" : ISODate("2016-09-20T20:07:00.796Z")
                                                }
                                        }
                                ]
                        }
                }
        },
        "ntoreturn" : 0,
        "ntoskip" : 0,
        "nscanned" : 0,
        "nscannedObjects" : 18231,
        "keyUpdates" : 0,
        "writeConflicts" : 0,
        "numYield" : 577,
        "locks" : {     
                "Global" : {    
                        "acquireCount" : {
                                "r" : NumberLong(1156)
                        }
                },      
                "Database" : {  
                        "acquireCount" : {
                                "r" : NumberLong(578)
                        }
                },      
                "Collection" : {
                        "acquireCount" : {
                                "r" : NumberLong(578)
                        }
                }
        },
        "nreturned" : 2,
        "responseLength" : 98076,
        "millis" : 11161,
        "execStats" : {
                "stage" : "COLLSCAN",
                "filter" : {
                        "builds" : {
                                "$elemMatch" : {
                                        "$and" : [
                                                {
                                                        "$and" : [
                                                                {
                                                                        "createdTime" : {
                                                                                "$lt" : ISODate("2016-09-20T20:07:00.796Z")
                                                                        }
                                                                }
                                                        ]
                                                },
                                                {
                                                        "builtTime" : {
                                                                "$eq" : null
                                                        }
                                                }
                                        ]
                                }
                        }
                },
                "nReturned" : 2,
                "executionTimeMillisEstimate" : 11080,
                "works" : 18233,
                "advanced" : 2,
                "needTime" : 18230,
                "needFetch" : 0,
                "saveState" : 577,
                "restoreState" : 577,
                "isEOF" : 1,
                "invalidates" : 0,
                "direction" : "forward",
                "docsExamined" : 18231
        },      
        "ts" : ISODate("2016-09-20T23:07:14.313Z"),
        "client" : "10.171.127.66",
        "allUsers" : [
                {
                        "user" : "dbuser",
                        "db" : "mydb"
                }
        ],
        "user" : "dbuser@mydb"
}   
{{< / highlight >}}

上面的数据具体解读如下，

1. `op: 'query'`表示执行的是查询，
2. `ns`是指查询的collection，
3. `query`是具体的查询语句，
4. 核心部分是`execStats`，给出了的查询语句具体执行统计，跟**.explain('execStats')**的内容是一致的。上面的统计是说，这个query执行了整个collection的扫描(总计扫描了18231个文档)，最终返回了2条文档，花费了11080ms，也就是11s还多的时间！这表明被记录下的慢查询跟collection的索引设置有问题，该查询没有用上索引。解决方案很简单，改善查询语句使用存在的索引或者设置合理的索引。
5. `ts`是查询开始请求的时间，
6. `allUsers`和`user`都是MongoDB client连接所使用的用户。

[vme]: https://vme360.com
[mongodb]: https://www.mongodb.com/
[NoSQL]: https://en.wikipedia.org/wiki/NoSQL
[profile doc]: https://docs.mongodb.com/manual/reference/method/db.setProfilingLevel/
