---
title: Nikto
category: web
tags: [Nikto, web scanning, reconnaissance]
related: [nmap, sqlmap]
---

Nikto is one of those tools I run early and mostly treat as a checklist generator rather than a final answer. Point it at a web server, let it run, and it spits out a list of "hey, this might be worth looking at" — outdated software versions, risky files, missing headers, that kind of thing.

## Why I reach for it

It's a fast way to get a baseline read on a web server without manually checking a hundred known misconfigurations myself. I don't take its output as gospel, but it points me in directions I might not have thought to check.

## Common workflows

- run it against an authorized target right after the initial Nmap scan
- go through the flagged files, headers, and outdated version warnings one by one
- manually verify anything interesting instead of assuming it's exploitable just because Nikto flagged it

## Notes to self

- It's noisy — both in terms of requests sent and false positives reported. Don't run it against something you don't have explicit permission to test.
- I treat every finding as a lead, not a confirmed vulnerability. Version banners especially can be wrong or outdated.
- It pairs well right after Nmap's `-sV` output — if Nmap tells me what's running, Nikto tells me what might be wrong with it.
- Good for CTF web boxes as a quick "did I miss anything obvious" pass before I go manual.
