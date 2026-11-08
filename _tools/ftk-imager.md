---
title: FTK Imager
category: forensics
tags: [FTK Imager, disk imaging, digital forensics]
related: [autopsy, network-miner]
---

FTK Imager is what I use before I touch anything else in a disk forensics challenge. Its whole job is acquiring and previewing evidence without altering it, which matters a lot once you understand why forensics as a field cares so much about not touching the original data.

## Why I reach for it

Before I load anything into Autopsy or start browsing a filesystem, I want a verified, hash-checked image I know hasn't been modified. FTK Imager handles that acquisition/verification step cleanly.

## Common workflows

- create a forensic image of the provided evidence (disk, memory dump, single files)
- verify the image's hash matches so I know the acquisition was clean
- preview files and partitions directly without needing to mount anything or risk altering the source

## Notes to self

- Hash verification isn't just busywork — it's the whole point. If the hash doesn't match after imaging, something's wrong and I need to redo it, not shrug it off.
- The preview pane is genuinely handy for a quick look before committing to a full analysis workflow in Autopsy — sometimes the answer is right there in an obvious file.
- I keep the original evidence file untouched and always work off a copy/image, even in a low-stakes CTF — it's the habit that matters more than the specific challenge.
