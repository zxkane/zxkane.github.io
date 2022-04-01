---
title: 'Inside P2''s profile (2) - the fragment matches all osgi bundles'
date: 2010-12-28T11:33:00.000+08:00
draft: false
tags : [p2, Eclipse, profile]
---

Recently our installer met a strange bug, it didn't uninstall all legacy bundles after updating to new version. Finally I found it's due to a magic fragment is missing in the profile due to some causes.  
  
    <unit id='tooling.osgi.bundle.default' version='1.0.0' singleton='false'>  
      <hostRequirements size='1'>  
        <required namespace='org.eclipse.equinox.p2.eclipse.type' name='bundle' range='0.0.0' multiple='true' greedy='false'/>  
      </hostRequirements>  
      <properties size='1'>  
        <property name='org.eclipse.equinox.p2.type.fragment' value='true'/>  
      </properties>  
      <provides size='2'>  
        <provided namespace='org.eclipse.equinox.p2.iu' name='tooling.osgi.bundle.default' version='1.0.0'/>  
        <provided namespace='org.eclipse.equinox.p2.flavor' name='tooling' version='1.0.0'/>  
      </provides>  
      <requires size='1'>  
        <required namespace='org.eclipse.equinox.p2.eclipse.type' name='bundle' range='0.0.0' multiple='true' greedy='false'/>  
      </requires>  
      <touchpoint id='null' version='0.0.0'/>  
      <touchpointData size='1'>  
        <instructions size='4'>  
          <instruction key='install'>  
            installBundle(bundle:${artifact})  
          </instruction>  
          <instruction key='uninstall'>  
            uninstallBundle(bundle:${artifact})  
          </instruction>  
          <instruction key='unconfigure'>  
  
          </instruction>  
          <instruction key='configure'>  
            setStartLevel(startLevel:4);  
          </instruction>  
        </instructions>  
      </touchpointData>  
    </unit>  
  
It has 'hostRequirements' element that represents it's a fragment IU and match all the eclipse's plug-ins in that profile. And this fragment defines the touch point actions for its hosts that will do installBundle action during 'install' phrase and uninstallBundle action during 'uninstall' phrase. It's a very good way to remove the duplicate touch point definitions for all eclipse's plug-ins in the profile.  
  
BTW, p2's engine also doesn't attach this fragment to the eclipse's plug-in IU if the top level IU doesn't have the STRICT rule. I'm not sure the root cause of designing for it, but it's the fact.