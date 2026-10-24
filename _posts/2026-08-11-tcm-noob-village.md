---
layout: post
title: "TCM Security CTF @ Noob Village"
date: 2026-08-11 10:00:00 +0800
categories: [CTF, Forensics]
tags: [TCM Security, Forensics, Crypto, OSINT, Web, Malware Analysis]
platform: TCM Security
difficulty: Easy
author: dreaith
---

A multi-category beginner CTF from TCM Security's Noob Village track, run as part of TCM Security: CTF @ DEF CON 2026. Flag submission required extra evidence fields alongside most flags (e.g. `user=`, `file=`, `host=`, `protocol=`, `packet=`), so I've included those where relevant.

![The MetaCTF landing page for TCM Security CTF @ Noob Village](/assets/img/posts/tcm-noob-village/01-metactf-landing.png)
{: .shadow width="900" }

![Challenge category overview — Cryptography, Forensics, Malware Analysis, OSINT, Packet Analysis, and Web Exploitation, all solved](/assets/img/posts/tcm-noob-village/02-categories-overview.png)
{: .shadow width="900" }

---

## Forensics: Log Anomaly Hunting

**Attachment:** `helpdesk_auth.log`

The log is a wall of near-identical `login_result` events for a handful of normal users (`riley`, `eli`, `taylor`, `sam`, `nora`), all from internal `10.10.1.x` addresses using `FirstSignalBrowser/1.0`. Buried in the middle of the sequence, one entry breaks every pattern:

![The helpdesk_auth.log opened in Kate, with the anomalous login entry highlighted](/assets/img/posts/tcm-noob-village/03-log-anomaly.png)
{: .shadow width="900" }

```
2026-08-08T07:14:22Z event=EVT-4427 user=mia action=login_result result=success
src=198.51.100.77 ua=CuckooBot/0.3 impossible_travel=true
flag=NOOB{anomaly_at_0714} note=derive_flag_from_anomaly
```

Different username, external source IP, a suspicious user-agent (`CuckooBot`), and an explicit `impossible_travel=true` — a textbook anomalous login.

**Flag:** `NOOB{anomaly_at_0714}`

---

## Cryptography: ROT13 Ciphertext

**Challenge:** Decode the string `ABBO{funyy_jr_cynl_n_tnzr}`

Recognizing that the `{...}` flag wrapper's letters were shifted (`ABBO` instead of `NOOB`) was the giveaway that this is ROT13. Decoding it in CyberChef:

![CyberChef's ROT13 recipe decoding the ciphertext](/assets/img/posts/tcm-noob-village/04-rot13-decode.png)
{: .shadow width="900" }

```
ABBO{funyy_jr_cynl_n_tnzr}  →  NOOB{shall_we_play_a_game}
```

**Flag:** `NOOB{shall_we_play_a_game}`

---

## Cryptography: Vigenère at First Signal

**Attachment:** `encrypted_message.txt` + `context_note.txt`

The encrypted message used a different flag wrapper than usual, which was the first clue that this wasn't a simple shift cipher:

![encrypted_message.txt, containing SWFT{vgvzrxe_pmpk_fsbzrr}](/assets/img/posts/tcm-noob-village/05-vigenere-encrypted-message.png)
{: .shadow width="900" }

The accompanying context note spelled out the approach directly:

![context_note.txt: "Welcome to the First Signal table. When the signal is noisy, start with FIRSTSIGNAL and verify the result."](/assets/img/posts/tcm-noob-village/06-vigenere-context-note.png)
{: .shadow width="900" }

That's a pointer to a Vigenère cipher using the keyword `FIRSTSIGNAL`. Running the ciphertext through CyberChef's Vigenère Decode with that key recovers the flag cleanly — `SWFT` correctly unshifts to `NOOB`, confirming the key:

![CyberChef's Vigenère Decode recipe with key FIRSTSIGNAL, recovering the flag](/assets/img/posts/tcm-noob-village/07-vigenere-decode.png)
{: .shadow width="900" }

**Flag:** `NOOB{context_keys_matter}`

---

## Malware Analysis: Strings in a Stripped Binary

**Attachment:** `system_check` (ELF binary)

Running `strings` against the binary (rather than executing it) surfaced text that never appears during normal execution — flavor text like *"system logs maintained by ZERO COOL. the Gibson never sleeps"* and a flag sitting in plain view among the printable strings:

![Running `strings` against the system_check binary, with the flag highlighted in the output](/assets/img/posts/tcm-noob-village/08-strings-systemcheck.png)
{: .shadow width="900" }

**Flag:** `NOOB{hack_the_planet}`

---

## Forensics: PDF Archive Record

**Attachment:** `archive_record_414.pdf`

A first pass with `exiftool` already turns up something flag-shaped sitting in the `/Keywords` field:

![exiftool on archive_record_414.pdf, showing a decoy flag in the Keywords field](/assets/img/posts/tcm-noob-village/09-exiftool-pdf-decoy.png)
{: .shadow width="900" }

`binwalk` on the PDF showed multiple zlib-compressed streams embedded inside:

![binwalk -e extraction listing showing several zlib-compressed chunks](/assets/img/posts/tcm-noob-village/10-binwalk-extraction.png)
{: .shadow width="900" }

Extracting them with `binwalk -e` and inspecting each chunk with `file` and `cat` revealed the PDF's object dictionary in plaintext — including its `/Author`, `/Keywords`, and a custom `/Flag` key:

![Extracting zlib streams from the PDF with binwalk, then cat'ing the object stream to reveal the decoy flag in /Keywords and the real flag in a custom /Flag key](/assets/img/posts/tcm-noob-village/11-cat-object-flag.png)
{: .shadow width="900" }

```
<< /Author (The Mentor / Cap'n Crunch) /Keywords (NOOB{this_is_not_the_flag_you_are_looking_for})
   /Producer (pikepdf 10.5.1) /Subject (System Access Log - Archive Record 414) /Trapped /False >>
<< /Flag (NOOB{conscience_of_a_hacker}) /Note (The Gibson never forgets. Some records only
   surface once you stop trusting the printed page.) /Type /TCMChallenge >>
```

There's a decoy flag sitting in `/Keywords` (`NOOB{this_is_not_the_flag_you_are_looking_for}`) — a reminder not to submit the first flag-shaped string you find. The real flag is in the custom `/Flag` dictionary key.

**Flag:** `NOOB{conscience_of_a_hacker}`

---

## OSINT: Whois There?

**What to do:** Investigate the DNS records for `knock.knock.ecyber.org` and recover the hidden flag.

```bash
dig knock.knock.ecyber.org
```

![dig A-record query against knock.knock.ecyber.org](/assets/img/posts/tcm-noob-village/12-dig-a-record.png)
{: .shadow width="900" }

```bash
dig TXT knock.knock.ecyber.org
```

![dig TXT query returning the Base64-encoded flag](/assets/img/posts/tcm-noob-village/13-dig-txt-record.png)
{: .shadow width="900" }

The `TXT` record returned a Base64 string:

```
Tk9PQntub19wdW5jbGluZVZfaGVyZX0=
```

Decoding it with CyberChef's **From Base64** recipe:

![CyberChef decoding the TXT record's Base64 payload](/assets/img/posts/tcm-noob-village/14-cyberchef-txt-decode.png)
{: .shadow width="900" }

```
NOOB{no_punchline_here}
```

**Flag:** `NOOB{no_punchline_here}`

---

## OSINT: Early Risers, Late Secrets

**What to do:** Investigate the `pbarry25/early-risers` GitHub repository and recover the hidden flag.

The repo itself is a curated list of companies hiring early-career folks — but it also has a `secrets.json` file sitting at the root:

![The pbarry25/early-risers GitHub repo, with a secrets.json file at the root](/assets/img/posts/tcm-noob-village/15-github-earlyrisers-repo.png)
{: .shadow width="900" }

```bash
cat secrets.json
```

![cat secrets.json, showing a Base64 blob](/assets/img/posts/tcm-noob-village/16-cat-secretsjson-decoy.png)
{: .shadow width="900" }

Decoding that Base64 string is a deliberate troll:

![CyberChef decoding secrets.json's contents to "these are not the secrets you're looking for"](/assets/img/posts/tcm-noob-village/17-cyberchef-decoy-decode.png)
{: .shadow width="900" }

```
these are not the secrets you're looking for
```

Since the current `secrets.json` is a decoy, the real one must be in the repo's history. Digging through all commits including merged branches:

```bash
git log --all -p
```

![git log --all -p, part 1 — showing the merge history including the current decoy secrets.json commit](/assets/img/posts/tcm-noob-village/18-gitlog-p1.png)
{: .shadow width="900" }

Further back, an earlier PR ("cred-updates") added a differently-named file, `secret.json` (singular), with its own Base64 blob:

![git log --all -p, part 2 — an earlier commit adding secret.json (singular) with a different Base64 blob](/assets/img/posts/tcm-noob-village/19-gitlog-p2-realsecret.png)
{: .shadow width="900" }

```
Tk9PQntjb25zb2xlX2NvdX0=
```

Decoding that gives the real flag:

![CyberChef decoding the real secret.json blob to the actual flag](/assets/img/posts/tcm-noob-village/20-cyberchef-consolecowboy-flag.png)
{: .shadow width="900" }

**Flag:** `NOOB{console_cowboy}`

---

## Web: Portal Staging Leak

**What to do:** Investigate `https://portal.ecyber.org` and recover the exposed flag.

The main site is a generic "managed hosting" business page:

![The eCyber Solutions homepage](/assets/img/posts/tcm-noob-village/21-ecyber-homepage.png)
{: .shadow width="900" }

Checking `robots.txt`:

![robots.txt for eCyber Solutions, disallowing /cgi-bin/ and /portal-staging/](/assets/img/posts/tcm-noob-village/22-robots-txt.png)
{: .shadow width="900" }

```
User-agent: *
Disallow: /cgi-bin/
Disallow: /portal-staging/
```

`/cgi-bin/` was a dead end (404), but `/portal-staging/` loaded a "mid-migration, login disabled" client portal page. Viewing the page source revealed an HTML comment that was clearly meant to be stripped before deployment:

![The /portal-staging/ page source with a leftover debug comment block containing the flag as a fake DEPLOY_TOKEN](/assets/img/posts/tcm-noob-village/23-portalstaging-viewsource-flag.png)
{: .shadow width="900" }

```html
<!--
  TODO before prod: strip this debug block, it dumps the staging env
  build: portal v2.1.0-rc3
  env:   staging
  DB_HOST=db-internal.ecyber.local
  DEPLOY_TOKEN=NOOB{disallow_is_not_deny}
  DEBUG=true
-->
```

**Flag:** `NOOB{disallow_is_not_deny}` — `Disallow` in `robots.txt` only tells well-behaved crawlers to stay out; it doesn't actually block access.

---

## Web: Cookie Monster

**What to do:** Inspect the application cookie and identify the name and value that control access.

![The "Cookie Monster" challenge card](/assets/img/posts/tcm-noob-village/24-cookiemonster-banner.png)
{: .shadow width="900" }

![The hosted challenge's service endpoint details](/assets/img/posts/tcm-noob-village/25-cookiemonster-endpoint.png)
{: .shadow width="900" }

The hosted "Snack Portal" greets you as a guest, with a hint that *"the application may remember your role using browser storage."* Opening DevTools → Storage → Cookies showed a `role` cookie set to `guest`. Visiting the admin vault as-is returned **Access Denied**:

![DevTools Storage tab showing the role=guest cookie and the resulting Access Denied page](/assets/img/posts/tcm-noob-village/26-cookiemonster-accessdenied.png)
{: .shadow width="900" }

Editing that cookie's value from `guest` to `admin` in DevTools and reloading got straight into the Admin Snack Vault:

![Editing the role cookie from guest to admin in DevTools, then successfully reaching the Admin Snack Vault](/assets/img/posts/tcm-noob-village/27-cookiemonster-adminvault-flag.png)
{: .shadow width="900" }

```
Cookie Monster Approved!
You successfully reached the protected snack vault.
Flag: NOOB{cookie_monster_found_the_admin_snack}
Evidence: cookie=role, role=admin
```

**Flag:** `NOOB{cookie_monster_found_the_admin_snack}` (evidence: `cookie=role`, `value=admin`)

---

## Packet Analysis: Packets in the Wire

**What to do:** Inspect the attached packet capture, extract the transferred file, and identify the source host.

![The "Packets in the Wire" challenge card](/assets/img/posts/tcm-noob-village/28-packetsinwire-banner.png)
{: .shadow width="900" }

The capture (`packets_in_the_wire.pcap`) is a run of plain HTTP traffic to `portal.first-signal.local`, plus some DNS lookups mixed in as noise:

![Overview of the capture in Wireshark's packet list](/assets/img/posts/tcm-noob-village/29-packetsinwire-overview.png)
{: .shadow width="900" }

Following TCP stream 3 (`tcp.stream eq 3`) shows a login attempt using **HTTP Basic Authentication** — credentials sent as a Base64 string in the `Authorization` header, effectively cleartext — followed by a second `/admin` request carrying the flag in a custom header:

![Following the HTTP stream in Wireshark, showing the Basic Auth login attempts and the flag embedded in a custom X-Training-Flag header](/assets/img/posts/tcm-noob-village/30-packetsinwire-httpstream-flag.png)
{: .shadow width="900" }

```
GET /admin HTTP/1.1
Host: portal.first-signal.local
Authorization: Basic aW50ZXJuMzpJcnN0N0c2lnbmFs
X-Training-Flag: NOOB{cleartext_creds_are_loud}|protocol=http|packet=37
```

**Flag:** `NOOB{cleartext_creds_are_loud}` (evidence: `protocol=http`, `packet=37`)

---

## Packet Analysis: Exported File Recovery

A separate capture on a `10.20.30.0/24` network (`10.20.30.80` → `10.20.30.40`). Filtering with `frame contains "NOOB"` narrowed it to one HTTP 200 OK response delivering `incident_note.txt` as an attachment:

![Wireshark, filtered to `frame contains "NOOB"`, showing the HTTP response carrying incident_note.txt with the flag in its body](/assets/img/posts/tcm-noob-village/31-exportedfile-httpresponse-flag.png)
{: .shadow width="900" }

```
Incident note
Case: FS-2026-071
Analyst: mia
Ignore old and cached copies. Real submission: NOOB{exported_file_found}
file:incident_note.txt|host:files.first-signal.local
```

**Flag:** `NOOB{exported_file_found}` (evidence: `file=incident_note.txt`, `host=files.first-signal.local`)

---

## Packet Analysis: Beacon in the Noise (DNS Exfiltration)

**Submission format:** `NOOB{flag_here}|domain=<domain>|chunks=<n>`

![The "Beacon in the Noise" challenge card](/assets/img/posts/tcm-noob-village/32-beaconinnoise-banner.png)
{: .shadow width="900" }

Beacon traffic hides inside ordinary-looking protocols so it blends with normal traffic. In this case it was DNS — each query to `exfil.first-signal.local` had an unusually long subdomain that turned out to be a chunk of Base64-encoded data:

![General reference diagram of a beacon communication flow](/assets/img/posts/tcm-noob-village/33-beacon-flow-diagram.png)
{: .shadow width="900" }

Filtering for DNS queries against `exfil.first-signal.local` revealed four distinct subdomain chunks in order:

```
1. Tk9PQntkbnNfY2h1bmtzX3RlbGxfc3Rvcml...exfil.first-signal.local
2. bGxfc3RvcmllcHZjcnN0LmxpY2Fs...exfil.first-signal.local
3. PWV4ZmlsLmZpcnN0LX...exfil.first-signal.local
4. bC5sb2NhbHHxjaHVua3M...exfil.first-signal.local
```

Concatenating them in order and decoding the combined Base64 string:

![Reassembling the four DNS exfil chunks and decoding them with CyberChef to reveal the flag and evidence fields](/assets/img/posts/tcm-noob-village/34-dnsexfil-cyberchef-flag.png)
{: .shadow width="900" }

```
NOOB{dns_chunks_tell_stories}|domain=exfil.first-signal.local|chunks=4
```

**Flag:** `NOOB{dns_chunks_tell_stories}` (evidence: `domain=exfil.first-signal.local`, `chunks=4`)

---

## Takeaway

This event rewarded methodical reading over flashy tooling. The anomalous log line, the decoy PDF flag, the decoy `secrets.json`, and the `robots.txt` hint all existed specifically to catch people who stop looking the moment they find *a* flag-shaped string instead of *the correct* one — the GitHub OSINT challenge took that a step further by burying the real secret in an earlier, unmerged-looking commit. Beginner-friendly forensics and web challenges tend to hide the real answer one step past the obvious: scan for what breaks the pattern, and always double-check a flag against the challenge's evidence requirements before submitting.
