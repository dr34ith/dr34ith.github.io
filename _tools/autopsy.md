---
title: Autopsy
category: forensics
tags: [Autopsy, digital forensics, disk analysis]
related: [ftk-imager, volatility]
---

Autopsy is basically my "load the whole disk image and start digging" tool. It wraps a bunch of forensic analysis into one GUI — file browsing, deleted file recovery, timeline view, keyword search — so I'm not stitching together five separate command-line tools for a single case.

## Why I reach for it

Whenever a challenge gives me a full disk image instead of just a file or two, Autopsy is where I go to actually explore it properly instead of manually mounting and browsing through a filesystem by hand.

## Common workflows

- create a new case and ingest the disk image, letting the built-in modules run
- check deleted files and the filesystem timeline for anything relevant to the scenario
- use keyword search across the whole image instead of clicking through every folder
- dig into browser artifacts (history, downloads) when the scenario involves user activity

## Notes to self

- Let the ingest modules finish before jumping to conclusions — I've missed things by poking around too early while analysis was still running in the background.
- The timeline view is more useful than it looks at first — sorting by time made a couple of "what happened and in what order" challenges way clearer for me.
- Keyword search across the whole case (not just one folder) has found things I would've completely missed browsing manually.
- I keep notes as I go on findings/paths, since a case can get big fast and it's easy to lose track of where something interesting was.
