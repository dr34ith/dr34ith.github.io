---
title: Bash
category: scripting
tags: [Bash, scripting, Linux]
related: [nmap]
---

I didn't take Bash seriously until I got tired of retyping the same five commands during a CTF. Now half my "tooling" is just small shell one-liners I've built up over time — nothing fancy, just stuff that saves me from doing repetitive work by hand.

## Why I reach for it

Most of my machine is Linux-based, so Bash is the glue between everything else on this list. Nmap output gets piped somewhere, wordlists get filtered, logs get grepped — it's rarely the star of a writeup, but it's doing work in almost every one of them.

- chaining recon commands together instead of running them one at a time
- cleaning up or filtering messy command output
- automating the boring, repeatable parts of a lab
- gluing other tools together (Nmap → grep → feed into another tool)

## Commands I actually use

```bash
grep -oP '(?<=flag{)[^}]+' output.txt      # yank a flag out of a wall of text
for ip in $(cat hosts.txt); do ping -c1 $ip; done   # quick liveness check across a list
cat wordlist.txt | sort -u > clean.txt     # dedupe a wordlist before using it
watch -n2 'ls -la /tmp'                    # keep an eye on a directory during a challenge
```

## Notes to self

- I keep a personal `notes.sh` scratch file during every CTF with commands I reused more than once — small thing, saves a surprising amount of time.
- `grep -oP` with a lookbehind/lookahead is basically how I pull flags out of noisy output now instead of eyeballing it.
- Piping and redirection (`|`, `>`, `2>&1`) get you further than most standalone "hacking tools" ever will. A lot of recon is just moving text around.
- I still write scripts more defensively than I need to for a CTF (checking if files exist, quoting variables) because it's saved me from silly mistakes on actual assignments too.
