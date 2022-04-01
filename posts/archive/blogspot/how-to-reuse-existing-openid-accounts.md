---
title: 'How to reuse the existing OpenID accounts after the host name of Gerrit server is changed'
date: 2012-02-15T11:36:00.000+08:00
draft: false
tags : [OpenID, gerrit, configuration]
---

An internal Gerrit server was moved, so the hostname of server is changed. However we are using OpenID for user control, the OpenID provider(such as Google account) will generate a new token for the new server(hostname changing will impact the identity token of Google account) when we login Gerrit with same OpenID account. Gerrit will create a new internal account by default even though my OpenID account has existed in the system and has a lot of activities.  
  
The solution is updating the 'ACCOUNT\_EXTERNAL\_IDS' table of Gerrit via gsql. Setting the 'ACCOUNT\_ID' to your existing account\_id for the new record whose 'EXTERNAL_ID' is the new token gotten from Google.  
  

> update ACCOUNT\_EXTERNAL\_IDS set ACCOUNT\_ID='1000001' where EXTERNAL\_ID='https://www.google.com/accounts/o8/id?id=xxxxxxxxxx';

  
Then search the documentation of Gerrit, I find a configuration property looks like supporting such a migration for OpenID authentication.  

> auth.allowGoogleAccountUpgrade

> Allows Google Account users to automatically update their Gerrit account when/if their Google Account OpenID identity token changes. Identity tokens can change if the server changes hostnames, or for other reasons known only to Google. The upgrade path works by matching users by email address if the identity is not present, and then changing the identity.
> 
> This setting also permits old Gerrit 1.x users to seamlessly upgrade from Google Accounts on Google App Engine to OpenID authentication.
> 
> Having this enabled incurs an extra database query when Google Account users register with the Gerrit server.
> 
> By default, unset/false.