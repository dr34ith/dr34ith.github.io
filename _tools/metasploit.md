---
title: Metasploit
category: exploitation
tags: [Metasploit, exploitation, payloads]
related: [nmap, burp-suite, john-the-ripper]
---

Metasploit is the framework I go to once I already know roughly what's vulnerable and just need a reliable, repeatable way to actually exploit it. It's less "magic hacking button" than it looks from the outside — you still need to understand what a module is actually doing before it's useful.

## Why I reach for it

Once Nmap and version enumeration point me at something with a known exploit, Metasploit turns that into a workflow instead of me hand-writing an exploit from scratch every time. It's also great for post-exploitation once I've actually got a foothold.

## Common workflows

- fire up `msfconsole` and search for a module by service name or CVE
- `use` the module, set `RHOSTS`/`RPORT`/payload options carefully
- import Nmap results directly with `db_nmap` instead of retyping target info
- validate everything in an isolated lab before assuming it'd work anywhere else

## Notes to self

- I make myself understand *why* an exploit module works before I run it, not just what flags to set — otherwise I'm not actually learning anything, just clicking a button.
- `db_nmap` is genuinely useful for keeping recon and exploitation in the same workspace instead of juggling separate terminal windows.
- Keep the lab isolated. This one doesn't need explaining twice.
- It's a workflow accelerator, not a substitute for reading the actual vulnerability writeup behind a module — I still go read the CVE details when I can.
