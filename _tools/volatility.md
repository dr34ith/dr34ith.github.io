---
title: Volatility
category: forensics
tags: [Volatility, memory forensics, incident response]
related: [autopsy, wireshark]
---

Volatility is what taught me that a memory dump isn't just a giant blob of useless bytes — there's a whole running snapshot of a system in there: processes, network connections, sometimes even passwords sitting in plaintext in memory.

## Why I reach for it

Any time a challenge hands me a `.mem`/`.raw` memory dump instead of a disk image, this is the tool. It's a bit more command-line-heavy and less beginner-friendly than Autopsy, but that's just the nature of memory forensics.

## Common workflows

- identify the correct OS profile for the dump first — get this wrong and every other command gives you garbage
- list running processes to get a sense of what was active at capture time
- enumerate network connections for anything reaching out that shouldn't be
- dig into flagged processes for injected code or suspicious memory artifacts

## Notes to self

- Getting the profile/OS identification right at the start matters more than anything else — I've wasted time running the wrong plugins before realizing the profile was off.
- Process listing plugins (`pslist`, `pstree` depending on version) are where I start, since an obviously weird process name or parent/child relationship is often the giveaway.
- Network connection plugins are worth checking even when the scenario seems purely process-focused — malware calling home shows up here.
- This one has a steeper learning curve than most tools on this list. I had to actually read documentation instead of guessing flags, and that was fine — some tools are just like that.
