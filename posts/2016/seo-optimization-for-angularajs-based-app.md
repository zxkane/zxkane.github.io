---
title: 基于Angularjs单页面应用的SEO优化
date: 2016-05-19
tags: 
- angularjs 
- single-page-app 
- seo 
- nginx 
- 搜索引擎优化
categories: 
- blogging 
isCJKLanguage: true
---

在之前的[文章][previous-post]我曾提到基于[Angularjs][angularjs]的单页面应用在用户体验上的种种好处。然而任何事情都不是完美的，[Angular][angularjs]和类似的框架通过应用内做页面路由的实现给SEO（也俗称搜索引擎优化）带来了不少麻烦。

首先，我们来看看页面内路由是如何实现的。默认[Angularjs][angularjs]生成的页面uri类型如下，

`http://mydomain.com/#/app/page1`

浏览器请求上面这个uri的时候，实际发送给服务器的请求地址是**http://mydomain.com/**, web服务器会将默认的页面响应给浏览器，比如*index.html*或*index.php*等。

浏览器返回的页面里面引入了[Angularjs][angularjs]和其他应用需要的JS库。[Angularjs][angularjs]应用开始执行后，尝试处理路由**/app/page1**。如果应用定义了该路由，将加载必要的JS库和其他html片段来完成页面的渲染。

理解了[Angularjs][angularjs]页面内路由的原理后，我们知道了对浏览器或搜索引擎爬虫而言，单页面应用所有的页面对浏览器和搜索引擎都是一个网址，比如`http://mydomain.com/`。这样对爬虫抓取站内链接造成了困难，因为所有应用内的链接都被认做了同一个链接。

<!-- more -->

我们理解了uri `http://mydomain.com/#/app/page1`给SEO造成的麻烦，接下来就是讨论如何针对SEO来作的优化。

最理想的情况当然是搜索引擎爬虫变的更加智能，它能理解网站的框架，并且针对此种情况做出优化。但截止到目前，包括Google在内的所有爬虫都无法做到这点。那我们SEO的优化只能在应用这边来做了。

[Angularjs][angularjs]提供了一种[HTML5 mode][html5mode]模式可以利用HTML5 History API来实现页面内路由。打开的方法如下，

{{< highlight javascript >}}
$locationProvider.html5Mode(true);
{{< /highlight >}}

同时在`index.html`页面加上如下标签，

{{< highlight html >}}
<base href="/">
{{< /highlight >}}

在打开[HTML5 mode][html5mode]后的[Angularjs][angularjs]应用的链接看起来就是这样了，

`http://mydomain.com/app/page1`

新的链接模式和站内跳转通过访问网站主页请求将没有任何问题。然而直接在浏览器请求如上链接的话，Web服务器将尝试请求`/app/page1`，通常会得到**404**的页面响应。因为服务器上并没有部署页面`/app/page1`。

这时就需要在Web应用服务器或应用里面实现**URL Rewrite**。将`/app/page1`的请求转到单页面应用html文件上。

下面是一些Web服务器或应用的参考配置，

- **Apache Rewrites**

	{{< highlight conf >}}
	<VirtualHost *:80>
	    ServerName my-app
	
	    DocumentRoot /path/to/app
	
	    <Directory /path/to/app>
	        RewriteEngine on
	
	        # Don't rewrite files or directories
	        RewriteCond %{REQUEST_FILENAME} -f [OR]
	        RewriteCond %{REQUEST_FILENAME} -d
	        RewriteRule ^ - [L]
	
	        # Rewrite everything else to index.html to allow html5 state links
	        RewriteRule ^ index.html [L]
	    </Directory>
	</VirtualHost>
	{{< /highlight >}}

- **Nginx Rewrites**

	{{< highlight nginx >}}
	server {
	    server_name my-app;
	
	    root /path/to/app;
	
	    location / {
	        try_files $uri $uri/ /index.html;
	    }
	}
	{{< /highlight >}}

- **Azure IIS Rewrites**

	{{< highlight conf >}}
	<system.webServer>
	  <rewrite>
	    <rules> 
	      <rule name="Main Rule" stopProcessing="true">
	        <match url=".*" />
	        <conditions logicalGrouping="MatchAll">
	          <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />                                 
	          <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
	        </conditions>
	        <action type="Rewrite" url="/" />
	      </rule>
	    </rules>
	  </rewrite>
	</system.webServer>
	{{< /highlight >}}

- **Express Rewrites**

	{{< highlight javascript >}}
	var express = require('express');
	var app = express();
	
	app.use('/js', express.static(__dirname + '/js'));
	app.use('/dist', express.static(__dirname + '/../dist'));
	app.use('/css', express.static(__dirname + '/css'));
	app.use('/partials', express.static(__dirname + '/partials'));
	
	app.all('/*', function(req, res, next) {
	    // Just send the index.html for other files to support HTML5Mode
	    res.sendFile('index.html', { root: __dirname });
	});
	
	app.listen(3006); //the port you want to use
	{{< /highlight >}}

- **ASP.Net C# Rewrites**

	{{< highlight csharp >}}
	private const string ROOT_DOCUMENT = "/default.aspx";
	
	protected void Application_BeginRequest( Object sender, EventArgs e )
	{
	    string url = Request.Url.LocalPath;
	    if ( !System.IO.File.Exists( Context.Server.MapPath( url ) ) )
	        Context.RewritePath( ROOT_DOCUMENT );
	}
	{{< /highlight >}}

[previous-post]: {{< relref "single-page-app-meets-weixin-pay.md" >}}
[angularjs]: https://angularjs.org/
[html5mode]: https://docs.angularjs.org/guide/$location