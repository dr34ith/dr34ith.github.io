---
title: Burp Suite
category: web
tags: [Burp Suite, web security, proxy]
related: [metasploit, gobuster, nmap]
---

Burp Suite is basically how I actually see what my browser is sending, instead of guessing. Once I got comfortable proxying traffic through it, a lot of web challenges stopped feeling like a black box — I could see the request, tweak one value, and just resend it.

## Why I reach for it

Anything involving logins, hidden parameters, or "the app is doing something weird and I need to see the raw request" — that's Burp territory for me.

- watching requests go between my browser and the target app
- messing with auth flows to see what breaks
- finding endpoints or parameters that aren't obvious from the UI
- resending a modified request over and over without retyping it

## Common workflows

- point the browser's proxy at Burp so all traffic flows through it
- send an interesting request to **Repeater** and tweak it manually
- use **Intruder** when I actually need to fuzz something (careful, it's rate-limited on the free version)
- skim **Scanner**/passive findings just to see if anything obvious got flagged (Community edition doesn't have active scanning, worth remembering)

## Notes to self

- Set the scope first. Early on I didn't do this and just had noise from every tab I had open flooding the history.
- I do a pass of just *looking* — reading requests/responses passively — before I start firing things at the app. Helps me actually understand the flow instead of poking blindly.
- Repeater is where most of my actual "aha" moments happen. Change one header or parameter, hit send, compare the response.
- Pairing Burp with Gobuster works well for me — Gobuster finds the hidden path, Burp lets me actually interact with it once I've found it.
- Don't trust a finding until I've reproduced it manually outside the tool too. Scanner flags stuff that isn't always real.
