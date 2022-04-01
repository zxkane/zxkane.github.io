---
title: '[OSGi][Equinox]URL Handlers Service'
date: 2008-04-16T14:20:00.001+08:00
draft: false
tags : [Equinox, URL Handler Service, OSGi]
---

OSGi provides a mechanism to let user contribute custom schemes automatically. It avoid some restriction with Java facilities for extending the handlers. The more detail could be found from OSGi specification R4, which has description how OSGi implements URL Handler Service.  
  
Use a sample to illustrate how to contribute your scheme(protocol):  
  
1\. register your URLStreamHandlerService implementation, which must contain a property named "url.handler.protocol". below register my scheme 'smb'  
public void start(BundleContext context) throws Exception {  
Hashtable properties = new Hashtable();  
properties.put( URLConstants.URL\_HANDLER\_PROTOCOL, new String\[\] { "smb" } );  
context.registerService(URLStreamHandlerService.class.getName(), new SmbURLHandler(), properties );  
}  
2\. your URL Handler extends AbstractURLStreamHandlerService, and implements abstract function 'openConnection(URL)'  
public class SmbURLHandler extends AbstractURLStreamHandlerService {  
  
public URLConnection openConnection(URL url) throws IOException {  
return new SmbURLConnection(url);  
}  
  
}  
3\. your URL Connection extends java.net.URLConnection  
public class SmbURLConnection extends URLConnection {  
  
protected SmbURLConnection(URL url) {  
super(url);  
}  
  
public void connect() throws IOException {  
}  
}