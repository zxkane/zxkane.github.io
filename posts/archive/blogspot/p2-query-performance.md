---
title: 'p2 query performance'
date: 2011-10-17T19:34:00.001+08:00
draft: false
tags : [p2, performance]
---

Our p2 based on installer suffered performance issue when querying IUs from repositories. Though the repositories have a large number of IUs to be queried, but we find the performance of using QL is unacceptable in some special scenarios.  
  
I [published several different methods](https://docs.google.com/document/d/1wfnr2d2TF4vIYDCMmWPuYd0kQA32WiWaXTiaCoJovho/edit?pli=1) to find the expected IUs. Thomas pointed out the better expression of QL and finally helped us to find out the our repository without **IIndexProvider** implementation.  
  
**IIndexProvider** implementation of a repository is quite important to improve the performance of QL, especially use the 'traverse' clause to query something.  
  
And Slicer API is an alternative method when querying the complete dependencies.