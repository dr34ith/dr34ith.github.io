---
layout: post
title: "scriptCTF Writeup"
date: 2026-09-08 09:00:00 +0800
last_modified_at: 2026-09-17 09:00:00 +0800
categories: [CTF, Crypto]
tags: [scriptCTF, Crypto, Forensics]
platform: scriptCTF
difficulty: Medium
author: dreaith
---

scriptCTF had a good mix of "it's not what it looks like" crypto and forensics challenges that punished jumping to conclusions — the ones that took me longest were the ones where I trusted the first tool result instead of double-checking it. Grouped everything below by category.

## Crypto

### 1. Misdirection (252 pts)

**Description:** *It is not what it is.*
**Attachments:** `enc.txt`

The ciphertext looked like plain binary at first:

```
100010001010000010000111101...
```

![CyberChef Bacon Cipher Decode recipe applied to the ciphertext](/assets/img/posts/scriptctf/01-misdirection-bacon.png)
{: .shadow width="900" }

It wasn't binary — running it through CyberChef's **Bacon Cipher Decode** (Standard I=J/U=V, translation `0/1`) gave the answer immediately:

```
SCRIPTCTFNOTWHATITSEEMS
```

Reformatted into the standard flag wrapper: `scriptCTF{NOTWHATITSEEMS}`

### 2. Mis direction Again

**Description:** *Simpler, yet harder.*

This one really is just a long raw binary string:

```
1111010010001111011100001011100001100001111000000100110111110
0011000101000010001110100110100010100010101100100110101011011
0011000110111011011101011100001111010001010110111000110111000
...
```

The trick: converting the binary to integers directly (instead of chunking into 8-bit ASCII groups first) shows the resulting numbers *are* ASCII codes written out in decimal — e.g. `11599114` splits into `[115, 99, 114]`, which spells `"scr"...`.

![dCode's Binary → Numbers converter](/assets/img/posts/scriptctf/02a-ascii-decode-part1.png)
{: .shadow width="900" }

Feeding those decimal groups through dCode's ASCII Code converter finishes the decode, with the flag highlighted:

![dCode's ASCII Code converter, with the flag highlighted](/assets/img/posts/scriptctf/02b-ascii-decode-flag.png)
{: .shadow width="900" }

**Flag:** `scriptCTF{m1sd1r3ct10n_f1n4l_b055}`

### 3. Oops

**Attachments:** `chall.py`, `enc.txt`

I originally noted this one as missing its `chall.zip` link, but I did in fact get the challenge source — I'd just misplaced the screenshot of it. The script itself gives away exactly why it's called "Oops":

![chall.py source, seeding the RNG with the current Unix timestamp before generating the AES key](/assets/img/posts/scriptctf/11-oops-source.png)
{: .shadow width="900" }

```python
import random
import time
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from hashlib import sha256

flag = open('flag.txt', 'rb').read()

random.seed(int(time.time()))       # seeded with the current Unix timestamp (seconds precision)
key = random.randbytes(32)          # 32-byte AES key — deterministic if the seed is known

cipher = AES.new(key, AES.MODE_ECB) # ECB mode, no IV
enc = cipher.encrypt(pad(flag, 16)).hex()
open('enc.txt', 'w').write(enc)
```

The vulnerability is right there in the seed: `random.seed(int(time.time()))` means the entire 256-bit AES key is derived from nothing more than the Unix timestamp, in whole seconds, at the moment the script ran. That's a tiny search space — since the file's creation time narrows it down to a handful of candidate seconds, I could just brute-force every plausible timestamp, regenerate the key the same way, and try decrypting with each one until the output looked like readable text:

```python
import random
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

enc = bytes.fromhex(open('enc.txt').read().strip())

for ts in range(KNOWN_START, KNOWN_END):
    random.seed(ts)
    key = random.randbytes(32)
    cipher = AES.new(key, AES.MODE_ECB)
    try:
        pt = unpad(cipher.decrypt(enc), 16)
        if b'scriptCTF' in pt:
            print(ts, pt)
    except ValueError:
        continue
```

The correct timestamp decrypted straight to the flag:

![The brute-forced decryption output, with the recovered flag highlighted among the padding bytes](/assets/img/posts/scriptctf/12-oops-decrypted-flag.png)
{: .shadow width="900" }

**Flag:** `scriptCTF{mY_buck37_1s_l34klng!}`

## Forensics

### 1. BruteForced (358 pts)

**Description:** *Help! Our website got bruteforced. Hopefully the attacker did not leak anything.*
**Attachments:** `log.pcap`

![Challenge card for "BruteForced"](/assets/img/posts/scriptctf/13-bruteforced-card.png)
{: .shadow width="900" }

Opened the pcap in Wireshark — full of sequential brute-force requests (`GET /flag_4910`, `/flag_4911`, ...) all returning 404. Filtered for `http.response.code == 200` and found exactly one hit: `/flag_4919`, but with a 0-byte response body.

![Wireshark filtered to http.response.code == 200, showing the single 200 OK hit for /flag_4919 with an empty body](/assets/img/posts/scriptctf/14-bruteforced-http200-filter.png)
{: .shadow width="900" }

Following the TCP stream showed the actual full request URI: `http://ctf.scriptsorcerers.xyz/flag_4919`.

![Following the TCP stream, showing the full request/response and the "Full request URI"](/assets/img/posts/scriptctf/15-bruteforced-tcpstream.png)
{: .shadow width="900" }

Visiting that over plain HTTP loaded nothing — the fix was switching to **HTTPS**:

![The flag rendering after loading the URL over HTTPS instead of HTTP](/assets/img/posts/scriptctf/03-bruteforced-flag.png)
{: .shadow width="900" }

**Flag:** `scriptCTF{7h3_h1dd3n_3ndp01n7_g0t_l34k3d}`

### 2. John Cena (480 pts)

**Description:** *You can't see me!*
**Attachments:** `enc.png`

![The challenge image, enc.png — a photo of John Cena](/assets/img/posts/scriptctf/17-johncena-challenge-image.png)
{: .shadow width="900" }

Started with the usual stego toolbox. `exiftool` came up empty beyond standard PNG/ICC profile metadata:

![exiftool on enc.png — nothing but standard PNG and ICC profile metadata](/assets/img/posts/scriptctf/16-johncena-exiftool.png)
{: .shadow width="900" }

`zsteg` did find what looked like an embedded OpenPGP key pair via LSB extraction:

![zsteg output finding what looks like OpenPGP key data](/assets/img/posts/scriptctf/04-john-cena-zsteg.png)
{: .shadow width="900" }

That turned out to be a dead end — `file` confirms the extracted blobs really do look like OpenPGP key structures, but they didn't lead anywhere:

![file confirming the extracted secret.key and public.key look like OpenPGP key data — but this was a dead end](/assets/img/posts/scriptctf/18-johncena-openpgp-deadend.png)
{: .shadow width="900" }

`binwalk` also found a couple of zlib streams, and `binwalk -e` extracted them, but neither chunk turned out to be useful either:

![binwalk and binwalk -e run against enc.png, finding two zlib-compressed chunks](/assets/img/posts/scriptctf/19-johncena-binwalk.png)
{: .shadow width="900" }

![Listing the two extracted zlib chunks from the binwalk output](/assets/img/posts/scriptctf/20-johncena-binwalk-extracted.png)
{: .shadow width="900" }

**The actual approach:** since the challenge is literally a photo of John Cena, I ran a reverse image search and found the same photo's likely source on Wikipedia:

![Reverse image search identifying the photo and pointing to its Wikipedia source](/assets/img/posts/scriptctf/21-johncena-google-identify.png)
{: .shadow width="900" }

I downloaded the real photo, converted it to PNG (using `convert`, not just a rename), and compared the two file headers directly with `xxd`:

![xxd head -20 comparison between the Wikipedia original (JohnWiki.png) and the challenge image (enc.png)](/assets/img/posts/scriptctf/22-johncena-xxd-compare.png)
{: .shadow width="900" }

```python
from PIL import Image
orig = Image.open("JohnWiki.png").convert("RGB")
chall = Image.open("enc.png").convert("RGB")
print("Orig. picture in wiki Size: ", orig.size)
print("Challenge/enc size: ", chall.size)
```

![Comparing image dimensions between the Wikipedia original and the challenge image](/assets/img/posts/scriptctf/05-john-cena-compare.png)
{: .shadow width="900" }

```
Orig. picture in wiki Size:  (3661, 4866)
Challenge/enc size:  (500, 665)
```

After resizing the original to match, I compared pixel-by-pixel across the **first row only** — every pixel that differs between the two images is a `1`, every matching pixel is a `0`:

```python
dec = ''
width, height = img.size
for i in range(1):
    for j in range(width):
        if pixels[i, j] != enc_pixels[i, j]:
            dec += '1'
        else:
            dec += '0'

chunks = [dec[i:i+8] for i in range(0, len(dec), 8)]
flag = ''.join(chr(int(c, 2)) for c in chunks)
print(flag)
```

![Terminal output with the decoded flag string](/assets/img/posts/scriptctf/06-john-cena-solved.png)
{: .shadow width="900" }

(I also re-ran the same header comparison later against a differently-named copy of the challenge file, just to double check I hadn't mixed up which PNG was which — same result both times.)

![A repeat xxd header comparison confirming the same file identity](/assets/img/posts/scriptctf/23-johncena-xxd-compare2.png)
{: .shadow width="900" }

**Flag:** `scriptCTF{y0u_c4nt_s33_m3_unl355_y0u_s33_m3???}`

### 3. Recover My Pet

**Attachments:** `images.zip` (36 scrambled 60x60 PNG tiles)

Each extracted tile is numbered `row_column` (e.g. `1_1.png`, `11_17.png`):

![Listing and identifying the 36 extracted tiles, all 60x60 PNGs](/assets/img/posts/scriptctf/24-recovermypet-filelisting.png)
{: .shadow width="900" }

`exiftool` on every single tile reveals a description like:

> *i once had a cat, u know. but this crazy scientist took my cat and turned it into a donut 76 times and i cant find my cat anymore! (2/2)*

![exiftool description on one of the tiles, giving its scramble iteration count and sequence position](/assets/img/posts/scriptctf/25-recovermypet-exiftool-desc.png)
{: .shadow width="900" }

(the exact wording, iteration count, and `(n/n)` sequence marker differ slightly per tile — each tile encodes its own transform parameters). The numbers baked into each filename (`a`, `b`) plus the stated iteration count per tile are the parameters for **Arnold's Cat Map**, a chaotic pixel-scrambling transform:

![Googling "Arnold Cat Map"](/assets/img/posts/scriptctf/07-arnold-cat-map.png)
{: .shadow width="900" }

![Wikipedia's Arnold's cat map article and its transformation matrix](/assets/img/posts/scriptctf/08-inverse-matrix.png)
{: .shadow width="900" }

$$x' = (x + a \cdot y) \bmod N \qquad y' = (b \cdot x + (ab+1) \cdot y) \bmod N$$

To reverse it, apply the **inverse matrix** the exact number of times each tile's metadata states:

$$\text{inverse} = \begin{bmatrix} ab+1 & -a \\ -b & 1 \end{bmatrix}$$

Wrote `ImageSolver.py` to read each tile's `a`, `b`, and iteration count straight from its `exiftool` metadata, apply the inverse transform that many times per tile, then reassemble all 36 tiles using their `row_column` filenames as grid coordinates:

![ImageSolver.py's output, listing the a/b/iter/grid values it read from each of the 36 tiles before reassembling them](/assets/img/posts/scriptctf/27-recovermypet-solver-output.png)
{: .shadow width="900" }

My first pass got the tile ordering wrong and produced a garbled mess (you can just barely make out fragments of red hand-drawn text and gray cat fur through the mis-placed tiles):

![The first, incorrectly-ordered reassembly attempt — a garbled mix of tiles](/assets/img/posts/scriptctf/28-recovermypet-garbled-firstpass.png)
{: .shadow width="900" }

After fixing the row/column mapping, the reassembled image showed a sleeping cat wrapped in a blanket, with the flag hand-drawn in red cursive curling around it:

![The correctly reassembled image — a sleeping cat under a blanket with the flag drawn in red cursive text around it](/assets/img/posts/scriptctf/29-recovermypet-final-image.png)
{: .shadow width="900" }

Because the flag text is hand-drawn in a stylized, curling script (and the last few characters run behind the illustrated coffee cup), I'm still not 100% confident in the exact spelling. My best reading of it is `scriptCTF{w@t_4_cw1e_p@to...}`, with the tail end past "p@to" obscured by the cup art in my copy of the image — flagging this honestly rather than presenting a guess as a confirmed flag.

### 4. Ron

**Description:** *The password is his name.*

The image is the Harry Potter logo — "Ron" is the only hint, pointing to **Ron Weasley** as the steghide passphrase.

![The Harry Potter logo used as the challenge image](/assets/img/posts/scriptctf/09-ron-harrypotter.png)
{: .shadow width="900" }

Rather than guess blindly, I looked up the character's full name and the actor who plays him:

![Wikipedia's Ron Weasley article, confirming his full name and portrayal by Rupert Grint](/assets/img/posts/scriptctf/30-ron-wikipedia.png)
{: .shadow width="900" }

![A search confirming "Ronald Bilius Weasley" as the character's full name](/assets/img/posts/scriptctf/31-ron-google-fullname.png)
{: .shadow width="900" }

and built a small wordlist around it:

```
ronaldronweasley
ronald
ronaldweasley
ronweasley
ronaldbilliusweasley
ronaldbweasley
```

```bash
$ steghide extract -sf harrypotter.jpg
Enter passphrase: ronaldbweasley
wrote extracted data to "flag.txt".

$ cat flag.txt
scriptCTF{h1s_m1ddl3_n4m3_is_b1llus???}
```

![cat flag.txt, showing the extracted flag](/assets/img/posts/scriptctf/32-ron-catflag.png)
{: .shadow width="900" }

`ronaldbweasley` (first name + middle initial + last name) was the correct passphrase. A faster way is **stegseek**, which brute-forces the wordlist against steghide automatically:

![stegseek finding the passphrase in a single command](/assets/img/posts/scriptctf/10-ron-stegseek.png)
{: .shadow width="900" }

**Flag:** `scriptCTF{h1s_m1ddl3_n4m3_is_b1llus???}`

## Final flags

| Challenge | Flag |
|---|---|
| Misdirection | `scriptCTF{NOTWHATITSEEMS}` |
| Mis direction Again | `scriptCTF{m1sd1r3ct10n_f1n4l_b055}` |
| Oops | `scriptCTF{mY_buck37_1s_l34klng!}` |
| BruteForced | `scriptCTF{7h3_h1dd3n_3ndp01n7_g0t_l34k3d}` |
| John Cena | `scriptCTF{y0u_c4nt_s33_m3_unl355_y0u_s33_m3}` |
| Recover My Pet | `scriptCTF{w@t_4_cw1e_p@to...}`|
| Ron | `scriptCTF{h1s_m1ddl3_n4m3_is_b1llus}` |

## Takeaways

- Two different challenges here punished the "obvious" read of the data — one looked like binary but was Bacon cipher, the other looked like standard 8-bit binary-to-ASCII but was actually decimal ASCII codes one layer removed. Always sanity-check what a string of digits is actually representing before assuming.
- If a script seeds its RNG with something guessable — like `time.time()` — the entire keyspace built on top of it collapses to however many seconds you have to brute-force. Always check where the randomness actually comes from before assuming a cipher is secure.
- A 200 OK with an empty body in a pcap doesn't mean a dead end — the plaintext HTTP request might have been captured while the real response only exists on HTTPS.
- When a challenge image is a modified version of a real, public photo, diffing against the original is usually faster than running every stego tool blind — but don't stop pulling on the `zsteg`/`binwalk` threads until you've confirmed they're dead ends, since sometimes they aren't.
- `exiftool` metadata isn't always noise — sometimes it's the challenge author handing you the exact transform and parameters needed to solve it, one parameter set per file.

