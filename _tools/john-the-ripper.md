---
title: John the Ripper
category: exploitation
tags: [John the Ripper, password cracking, offline analysis]
related: [metasploit, gobuster]
---

John the Ripper is my go-to once I've already got a hash and just need to crack it offline — no more sending login attempts over the network, just raw compute against a wordlist (or rules) locally.

## Why I reach for it

A lot of CTF challenges hand you a hash, a shadow file, or a password-protected zip, and the actual "exploit" is just cracking that credential. John handles a wide range of hash formats and has helper scripts for extracting hashes from common file types, which saves a step.

## Common commands

```bash
john --wordlist=/path/to/wordlist.txt hashes.txt
john --show hashes.txt                              # see what's already been cracked
zip2john file.zip > hash.txt                         # pull a crackable hash out of a zip
john --format=sha512crypt /etc/shadow                # when the format needs to be specified explicitly
```

## Notes to self

- `rockyou.txt` is still the wordlist that cracks a surprising number of CTF passwords. Always try it before writing a custom list.
- The `*2john` helper scripts (`zip2john`, `ssh2john`, `pdf2john`, etc.) are easy to forget exist, but they're the actual first step half the time — you can't crack what you haven't extracted into John's format yet.
- `--show` is how I check progress/results instead of guessing whether it finished — it'll tell you exactly what's been cracked so far.
- If cracking is taking forever, I stop and reconsider — usually means either the wrong wordlist, the wrong hash format specified, or the challenge wants a smarter approach (rules, masks) instead of brute force.
