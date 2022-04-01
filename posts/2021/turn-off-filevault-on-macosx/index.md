---
title: "Turn off Filevault on macOS"
description : "Disable Filevault from cli for installing macOS Monterey"
date: 2021-10-31
draft: false
thumbnail: posts/2021/turn-off-filevault-on-macosx/images/cover.png
categories:
- blogging
isCJKLanguage: false
tags:
- MacOSX
- macOS Monterey
- filevault
- Tip
---

I'm trying to upgrade my Macbook Pro to macOS Monterey, however the installation can not be started due to the disk is encrypted by Filevault :confused: I have to turn off Filevault to disable disk encrpytion before installing macOS Monterey.

I found this [support article on how turning off Filevault][turn-off-filevault], but it does not work at all. There is nothing hint or error message after clicking the option `Turn off Filevault`.

<!--more-->

After researching it for a while, I found [this post][disabling-filevault] via CLI command,

{{< highlight bash >}}
sudo fdesetup disable
{{< /highlight >}}

But above command also does not work, it exits with error code `-69594`.

{{< highlight bash >}}
sudo fdesetup disable
Enter the user name:kane
Enter the password for user 'kane':
FileVault was not disabled (-69594).
{{< /highlight >}}

I found some articles said that the Filevault only can be disabled by the user whom enables it. I found below command to show the user whom enabled the Filevault, it's enabled by an unknown user! I don't have idea how enabling it.

{{< highlight bash >}}
sudo fdesetup list -extended
ESCROW  UUID                                                                     TYPE USER
        2D3F7CA5-4ED4-4537-8DA2-98B1E3637954                             Unknown User
{{< /highlight >}}

Finally I found below command line to disable Filevault though I don't know which user enabled it.

{{< highlight bash >}}
diskutil apfs disableFileVault disk1s1 -user disk
{{< /highlight >}}

Input the **disk password** when booting the macOS. The disabling Filevault will be processed in backgroud, you can retrieve the progress by below command,

{{< highlight bash >}}
diskutil apfs list
{{< /highlight >}}

Happy Monterey!

[turn-off-filevault]: https://support.apple.com/guide/mac-help/turn-off-filevault-encryption-on-mac-mchlp2560/11.0/mac/11.0
[disabling-filevault]: https://docs.centrify.com/Content/mac-admin/FV2-Disable.htm