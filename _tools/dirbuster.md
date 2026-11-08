---
title: DirBuster
category: web
tags: [DirBuster, enumeration, web security]
related: [gobuster, owasp-zap]
---

DirBuster was actually one of the first enumeration tools I ever used, before I got comfortable enough with the command line to switch mostly to Gobuster and ffuf. It's got a GUI, which honestly made it a friendlier starting point when I was still figuring out what "directory brute forcing" even meant.

## Why I reach for it

I don't use it as often anymore, but it's still handy when I want a visual list of results I can sort and scroll through instead of scanning terminal output, or when I'm walking someone newer through the concept of content discovery for the first time.

## Common workflows

- point it at a target with a wordlist and let it crawl for hidden directories/files
- compare response codes and sizes across results to spot what's actually real
- look specifically for exposed backups, `.git` folders, or leftover admin paths

## Notes to self

- The GUI makes it easy to sort by response code/size, which helped me *see* patterns (like a custom 404 masquerading as 200) before I really understood what to look for in raw terminal output.
- It's slower than Gobuster/ffuf for the same wordlist, so these days I mostly reach for it only when I specifically want the visual list view.
- Good tool to learn the *concept* of directory brute-forcing on before moving to faster CLI-based versions — that's basically the role it played for me.
