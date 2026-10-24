---
title: ffuf
category: web
tags: [ffuf, fuzzing, web security]
related: [burp-suite, gobuster]
---

ffuf ("fuzz faster you fool," which honestly is a great name) is what I switch to when Gobuster isn't flexible enough — mainly anytime I need to fuzz something that isn't just a directory path, like a parameter, a header, or a subdomain.

## Why I reach for it

Gobuster is great for straightforward directory brute-forcing, but ffuf's `FUZZ` keyword can go basically anywhere in a request — the URL, a header, POST body, cookie — which makes it a lot more useful once a challenge gets past the basic "find the hidden folder" stage.

## Common commands

```bash
ffuf -u http://target/FUZZ -w wordlist.txt                          # classic directory fuzz
ffuf -u http://target/api/FUZZ -w params.txt -fc 404                # filter out noisy 404s
ffuf -u http://FUZZ.target.com/ -w subdomains.txt -H "Host: FUZZ.target.com"  # vhost/subdomain fuzz
ffuf -u http://target/login -X POST -d "user=admin&pass=FUZZ" -w wordlist.txt -fs 1234  # fuzz a POST field
```

## Notes to self

- `-fc` and `-fs` (filter by status code / response size) are what actually make the output usable — without them you're drowning in false positives.
- The `FUZZ` keyword being placeable anywhere is the whole selling point. It's how I fuzz parameters and headers now, not just paths.
- It's fast enough that I sometimes throttle it (`-p`) on purpose so I don't hammer a lab environment into being unusable.
- I still sanity-check interesting hits manually in the browser or Burp — ffuf tells you *where* to look, not necessarily *what it means*.
