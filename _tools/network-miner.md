---
title: Network Miner
category: forensics
tags: [Network Miner, packet analysis, forensics]
related: [wireshark, ftk-imager]
---

Network Miner is the tool I reach for when Wireshark feels like too much manual digging and I just want a pcap automatically broken down into hosts, files, and credentials. It's passive analysis — feed it a capture, and it organizes what it finds instead of me building the picture packet by packet.

## Why I reach for it

Sometimes the fastest path through a forensics challenge is letting a tool pull out the transferred files or spotted credentials automatically, rather than manually following every stream in Wireshark myself.

## Common workflows

- load a capture and check the host/session summary tabs for a quick overview
- pull out files that were transferred in the capture without manually exporting each stream
- check the credentials tab for anything sent in the clear (plaintext HTTP logins still show up more than you'd expect)

## Notes to self

- I treat it as a fast first pass, then go confirm anything interesting manually in Wireshark — good for triage, not necessarily the final word.
- The automatic file extraction has saved me time on challenges where the flag was literally sitting inside a transferred file.
- Worth checking the credentials tab even when the scenario doesn't explicitly mention creds — plaintext protocols leak more than people expect.
