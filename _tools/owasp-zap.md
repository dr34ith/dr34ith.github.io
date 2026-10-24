---
title: OWASP ZAP
category: web
tags: [OWASP ZAP, proxy, web security]
related: [burp-suite, dirbuster]
---

ZAP is basically the free, open-source cousin of Burp Suite, and it's what I reach for when I want an active scanner and spider built in without hitting a paywall. It's a bit rougher around the edges UI-wise, but it gets the job done.

## Why I reach for it

When I want an automated crawl of an app plus some baseline vulnerability alerts without setting up a bunch of extensions, ZAP does that out of the box in a way Burp Community doesn't.

## Common workflows

- proxy browser traffic through ZAP the same way I would with Burp
- let the spider crawl an authorized application to map out its structure
- go through the alerts tab and manually verify anything flagged
- replay and tweak requests once something interesting shows up

## Notes to self

- The automated scanner is convenient but noisy — same rule as Nikto, verify before trusting.
- I like that the active scan is actually included for free here, since that's the main thing Burp Community locks behind the paid version.
- Still keep Burp around for manual work — I find its Repeater/Intruder workflow a bit smoother, but ZAP fills the gap for the automated crawl + scan step.
- Good starting point if you're a student and don't want to pay for Burp Pro yet — that was basically my reasoning for learning it.
