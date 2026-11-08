---
title: Gobuster
category: web
tags: [Gobuster, enumeration, directory brute forcing]
related: [burp-suite, nmap]
---

Gobuster is my answer to "there's a website but I have no idea what's actually on it besides the homepage." It's fast, it's simple to run, and more often than I'd like to admit, it's found the one hidden path that made a whole challenge click.

## Why I reach for it

Right after Nmap tells me port 80/443 is open, Gobuster is usually next. Web apps hide a lot behind directories that aren't linked anywhere in the UI — admin panels, backups, leftover dev files — and brute-forcing paths is honestly the fastest way to find them.

## Common commands

```bash
gobuster dir -u http://target/ -w wordlist.txt
gobuster dir -u http://target/ -w /usr/share/wordlists/dirb/common.txt -x php,txt,bak
gobuster vhost -u http://target/ -w wordlist.txt         # for finding hidden vhosts/subdomains
```

## Notes to self

- Start with a common wordlist (`common.txt` or SecLists' `raft` lists) before writing anything custom — most of the time the answer isn't obscure.
- `-x` to add extensions is what actually turns up the interesting stuff — `.php`, `.bak`, `.old`, `.config` have all paid off for me at some point.
- If I get a wall of `200 OK` results that all look identical, that's usually a custom 404 page messing with the results — worth checking response size/length to filter that noise out.
- I always double-check anything Gobuster finds in Burp before assuming it's actually reachable/useful. Some paths return 200 but are effectively empty.
- vhost mode is easy to forget exists, but it's caught subdomains for me that dir mode alone never would have.
