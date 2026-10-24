---
title: Nmap
category: network
tags: [Nmap, reconnaissance, scanning]
related: [wireshark, metasploit, gobuster]
---

Nmap is usually the first command I type on literally any box, CTF or home lab, doesn't matter. Before I even know what a machine is supposed to be, I want to know what ports are open and what's listening on them — that's the whole game of recon, and Nmap makes it fast.

## Why I reach for it

I treat Nmap as step zero. If I skip it and jump straight into guessing services, I end up wasting time on the wrong thing (learned that the hard way more than once). A proper scan tells me what's actually worth my attention before I go poking around further.

- figuring out what's alive on a network
- seeing which ports are open and what's running on them
- getting a rough guess at the OS
- pulling service/version banners so I know what to Google next
- doing a sanity check on my own home lab setup

## Commands I actually use

```bash
nmap -sS target                 # quiet-ish TCP scan, my default first pass
nmap -sV -sC target             # grab versions + run the default scripts
nmap -Pn -T4 target             # when the host is blocking pings but I know it's up
nmap -p- target                 # full port range, slower but catches stuff -sS misses
nmap -A target                  # the "give me everything" scan
```

## Notes to self

- `-sV -sC` is basically my go-to combo now — versions plus default NSE scripts covers most of what I need in one shot.
- If a scan seems to hang or return nothing, try `-Pn` first before assuming the host is down. A lot of boxes just don't respond to ping.
- `-p-` takes a while, but I've been burned before by a service sitting on some random high port that a top-1000 scan never checks.
- I like piping into Wireshark or reading the raw pcap when I need to confirm what a scan is actually sending — helped me understand why some scans got flagged and others didn't.
- Don't go straight to `-A` out of habit — it's noisy, and on an actual assessment (not a CTF) that noise matters.
