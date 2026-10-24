---
title: Wireshark
category: forensics
tags: [Wireshark, packet capture, network analysis]
related: [tcpdump, nmap]
---

Wireshark is the tool that finally made "network traffic" click for me. Reading raw hex dumps never made sense until I saw them laid out with protocol names, colors, and a filter bar I could actually use. Now it's usually the first GUI I open for anything forensics or networking related.

## Why I reach for it

Anytime a challenge hands me a `.pcap` and says "something's hiding in here," this is where I start. It's also just genuinely good for understanding what a scan or exploit is doing at the packet level instead of trusting a tool's output blindly.

- digging through a pcap for something suspicious
- figuring out which hosts talked to each other and about what
- spotting weird DNS, HTTP, or TLS behavior
- following a full TCP stream to read what was actually said

## Commands I actually use

```bash
tshark -r capture.pcap                          # quick CLI look without opening the GUI
tshark -r capture.pcap -Y http.request           # filter down to just HTTP requests
tshark -r capture.pcap -q -z io,phs              # protocol hierarchy, good for a first overview
tcpdump -w capture.pcap -i eth0                  # capture something to open in Wireshark later
```

## Notes to self

- Display filters are everything. `http`, `dns`, `tcp.port == 4444` — narrowing down early saves me from scrolling through thousands of packets.
- Right-click → **Follow → TCP Stream** is the move whenever I need to read a full conversation instead of piecing it together packet by packet. This alone has solved a chunk of the forensics challenges I've done.
- `File → Export Objects` is great for pulling out files that were transferred over HTTP/SMB/FTP in the capture — no need to reconstruct anything by hand.
- If the GUI feels slow on a huge pcap, `tshark` on the command line first to narrow things down, then open the trimmed version in the GUI.
- Coloring rules are underrated — I set custom ones for things I'm actively hunting so they jump out visually instead of me re-reading every line.
