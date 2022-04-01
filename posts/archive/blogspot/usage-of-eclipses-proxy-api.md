---
title: 'The usage of Eclipse''s Proxy API'
date: 2009-10-21T16:53:00.001+08:00
draft: false
tags : [Eclipse]
---

Eclipse platform register an OSGi service 'IProxyService' to manage network connection, which has capability to set proxy setting. There are three types of proxy working mode,

*   Direct(no proxy),
*   Manual(specified by user),
*   Native(using OS's proxy setting, such as gnome-proxy, IE).

There are three types of proxy supported by IProxyService. They're http, https and socks.

It also allows to add/remove ip address from white list, which are accessed without connecting proxy.

End users can manage the proxy setting of Eclipse via Preference - General - Network Connections. Eclipse would do persistence of user's setting. Other components of Eclipse also use those proxy settings to access network, such as ECF.

Below code snippet shows how to use proxy API to manually specify proxy server,

 proxyService.setProxiesEnabled(true);  
    proxyService.setSystemProxiesEnabled(false);    
    IProxyData\[\] datas = proxyService.getProxyData();    
    IProxyData proxyData = null;    
    for(IProxyData data : datas) {     
        // clean old data     
        ((ProxyData)data).setSource("Manual"); //$NON-NLS-1$     
        data.setUserid(null); //$NON-NLS-1$     
        data.setPassword(null); //$NON-NLS-1$     
        if(proxyType == SOCKSPROXY && IProxyData.SOCKS\_PROXY\_TYPE.equals(data.getType())) {  
           proxyData = data;      
           continue;     
        }else if(proxyType == WEBPROXY && IProxyData.HTTP\_PROXY\_TYPE.equals(data.getType())){  
           proxyData = data;      
           continue;     
        }     
        data.setHost(null); //$NON-NLS-1$     
        data.setPort(0);        
      }    
      if(proxyData != null){     
          proxyData.setHost(proxyServer);     
          proxyData.setPort(proxyPort);    
      }    
      try {     
         proxyService.setProxyData(datas);    
      } catch (CoreException e) {     
         proxyService.setProxiesEnabled(false);     
         proxyService.setSystemProxiesEnabled(false);     
         return false;    
 } 

[Official API Reference](http://help.eclipse.org/galileo/index.jsp?topic=/org.eclipse.platform.doc.isv/reference/api/org/eclipse/core/net/proxy/IProxyService.html)