---
title: tcpdump
category: network
tags: [tcpdump, packet capture, troubleshooting]
related: [wireshark, nmap]
---

tcpdump is what I use when I just need a quick look at traffic without spinning up a full GUI, or when I'm on a remote box over SSH where Wireshark isn't even an option. Command-line packet capture, nothing fancy, gets the job done.

## Why I reach for it

Sometimes I don't need the whole Wireshark experience — I just need to confirm "is this host actually talking to that port" or grab a capture file to analyze properly later.

## Common commands

```bash
tcpdump -i eth0                      # watch traffic live on an interface
tcpdump -i eth0 -nn -A                # raw IPs/ports (no DNS lookups) plus readable payload
tcpdump -w capture.pcap -i eth0       # save to a file to open in Wireshark afterward
tcpdump -r capture.pcap               # read back a saved capture
```

## Notes to self

- `-nn` is the flag I forget most often and then regret — without it, tcpdump tries to resolve hostnames/service names and the output gets slower and messier.
- If I'm just doing a quick sanity check on a lab connection issue, tcpdump on the CLI is faster than launching Wireshark for something that small.
- I capture to a file (`-w`) whenever I think I'll actually need to dig into the traffic properly — easier to analyze in Wireshark afterward than to try to read it live in the terminal.
- Filtering by host/port at capture time (`tcpdump -i eth0 port 4444`) keeps the output focused instead of drowning in unrelated traffic.
