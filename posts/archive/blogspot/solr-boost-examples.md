---
title: 'Solr boost examples'
date: 2013-05-11T13:16:00.002+08:00
draft: false
tags : [lucene, solr]
---

The index has a field named 'create_time' that is the timestamp of document created time. The query string can boost the latest created document like below,  
  
{!boost b=recip(ms(NOW,create_time),3.16e-11,0.08,0.05)}name:keyword  
  
There is another field named 'important' that indicates whether the document is important or not. The query string can boost the document is important like below,  
  
q={!boost b=$importfunc}name:keyword&importfunc=query({!v='important:true'})  
  
Above query string uses a sub query in boost function.  
  
Finally I want to boost both above two fields, and 'important' field has higher priority. The query string looks like below,  
  
defType=edismax&q=name:keyword&bf=query({!v='import:true'})^20.0 recip(ms(NOW,create_time),3.16e-11,0.08,0.05)^10.0")