---
title: Hydra
category: exploitation
tags: [Hydra, password auditing, authentication]
related: [metasploit, john-the-ripper]
---

Hydra is what I use when a challenge specifically wants me to brute-force a login — SSH, FTP, an HTTP form, whatever. It supports a long list of protocols, which is nice, but the actual usage is basically always the same shape: target, service, username(s), password list.

## Why I reach for it

Some CTF boxes are specifically built around weak/guessable credentials, and Hydra turns "try these 500 passwords against this login" into a couple minutes of runtime instead of manual attempts.

## Common commands

```bash
hydra -l admin -P wordlist.txt ssh://target                 # single username, wordlist of passwords
hydra -L users.txt -P wordlist.txt ftp://target              # both usernames and passwords as lists
hydra -l admin -P wordlist.txt target http-post-form "/login:user=^USER^&pass=^PASS^:F=incorrect"
```

## Notes to self

- Only run this against lab/CTF targets or things I'm explicitly authorized to test — brute forcing real accounts is a real crime, not a "gray area."
- The HTTP form syntax is the part I always have to look up again — `^USER^`/`^PASS^` placeholders plus the failure string (`F=`) to detect a wrong attempt.
- Rate-limit yourself (`-t` for threads) when the target is a shared lab environment — hammering it can lock accounts or just crash the service.
- I always double check the wordlist actually matches what the challenge is hinting at (rockyou, a custom small list, usernames from an earlier step) instead of blindly throwing the biggest list I have at it.
