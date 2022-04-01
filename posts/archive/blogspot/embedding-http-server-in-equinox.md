---
title: 'Embedding an HTTP server in Equinox'
date: 2012-03-05T19:25:00.000+08:00
draft: false
tags : [Equinox, Jetty, OSGi]
---

I want to create a test server for my application. Using embedding Http server in equinox is my first option.  
  
I had experience using simple http service implementation of equinox, however I want to play with Jetty this time.  
  
Following [the guide](http://www.eclipse.org/equinox/server/http_in_equinox.php) of Equinox server, I can't running a Jetty server with my servlet in Eclipse Indigo. Obviously [the guide](http://www.eclipse.org/equinox/server/http_in_equinox.php) is out of date.  
  
After tuning it, I found below bundles are minimum collection to run Jetty inside OSGi runtime.  
 {{< gist zxkane 1977922 "embedded-jetty-osgi" >}} 
  
You only need create a run configuration of OSGi framework, add your bundles with servlets and above bundles.