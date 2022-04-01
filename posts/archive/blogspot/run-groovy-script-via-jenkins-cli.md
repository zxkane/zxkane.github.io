---
title: 'Run groovy script via Jenkins CLI'
date: 2013-05-13T13:44:00.000+08:00
draft: false
tags : [groovy, jenkins, jenkins-cli]
---

Jenkins supports [ssh authentication](https://wiki.jenkins-ci.org/display/JENKINS/Jenkins+SSH) in CLI.  
  
Below is a command to verify that I am authenticated:  

{{< highlight bash >}} 
java -jar jenkins-cli.jar -s http://myserver/jenkins who-am-i

    Authenticated as: myuser
    Authorities:
        authenticated
{{< /highlight >}}

However you still would meet permission error when running groovy script in CLI.

 {{< highlight bash >}}   
java -jar jenkins-cli.jar -s http://myserver/jenkins groovysh 'jenkins.model.Jenkins.instance.pluginManager.plugins.each { println("${it.longName} - ${it.version}") };'

Exception in thread "main" java.lang.reflect.UndeclaredThrowableException
at $Proxy2.main(Unknown Source)
at hudson.cli.CLI.execute(CLI.java:271)
at hudson.cli.CLI._main(CLI.java:417)
at hudson.cli.CLI.main(CLI.java:322)
{{< /highlight >}}

It's a bug of Jenkins. **The workaround is create a groovy script, then run that script via Jenkins CLI**.

 {{< highlight bash >}} 
java -jar jenkins-cli.jar -s http://myserver/jenkins/ groovy test_script.gsh
{{< /highlight >}}