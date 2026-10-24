---
title: sqlmap
category: web
tags: [sqlmap, SQL injection, web security]
related: [burp-suite, nikto]
---

sqlmap is the tool that made SQL injection actually make sense to me. I'd read about UNION-based and blind injection in theory, but running sqlmap against a lab target and watching it enumerate the database step by step is what made the concept stick.

## Why I reach for it

Once I already suspect a parameter is injectable (usually from testing manually first with a `'` or `--` in a form field), sqlmap automates the tedious part — figuring out the injection type, extracting table names, dumping data — instead of me hand-crafting payloads all day.

## Common workflows

- grab the request from Burp's history and save it to a file, then feed that straight into sqlmap with `-r`
- start with a low `--level`/`--risk` and only bump it up if nothing's found
- once injection is confirmed, enumerate databases → tables → columns → data, one step at a time

## Notes to self

- I always confirm the injection manually first (a single quote breaking the query, an error message, something) before letting sqlmap loose — it saves time and it's just good practice to actually understand what's happening.
- `-r request.txt` (a captured request file) is way more reliable than typing the URL and parameters by hand, especially with cookies/auth involved.
- `--batch` is convenient for CTFs so it doesn't stop and ask you questions, but I still read what it's doing rather than just letting it run unattended.
- Only ever run this against something you're authorized to test — this is not a "try it on random websites" tool.
