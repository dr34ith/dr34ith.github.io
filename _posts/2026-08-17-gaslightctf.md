---
layout: post
title: "GaslightCTF Writeup"
date: 2026-08-17 10:00:00 +0800
categories: [CTF, Crypto]
tags: [GaslightCTF, Crypto, Forensics, Web]
platform: GaslightCTF
difficulty: Easy
author: dreaith
---

Hello! So on this one i try to play solo. "GaslightCTF" was one of those events where the challenges built on each other more than I expected a shift value from an early crypto challenge turns into a parameter for a later one, metadata fields hide half a flag each, and one web challenge got solved entirely from the terminal. Here's everything I worked through, organized by category.

## Crypto

### Where the dream starts 1 (100 pts)

**Description:** *This one's a classic. Can you understand the crypto from the maths?*
**Attachments:** `encrypt.py`, `output.txt`

![Challenge card for "Where the dream starts 1"](/assets/img/posts/gaslightctf/01-dts1-card.png)
{: .shadow width="900" }

The provided script decrypts by shifting each letter backward by a key `K`:

```python
from string import ascii_lowercase

def decrypt(ct: str, K: int) -> str:
    ct = list(map(lambda x: ascii_lowercase.index(x), list(ct)))
    pt = []
    for x in ct:
        pt.append((x - K) % 26)

    pt = list(map(lambda x: ascii_lowercase[x], pt))
    pt = ''.join(pt)
    return pt

cipher_text = "fdhvduuhdoobolnhgdvkliwriwkuhh"  # Replace with actual cipher text
key = 3  # Replace with the actual key
print(decrypt(cipher_text, key))
```

That's just a Caesar cipher with a shift of 3. Running it against the real ciphertext from `output.txt` gave me:

![Terminal output of the solver script decrypting the ciphertext](/assets/img/posts/gaslightctf/02-dts1-terminal.png)
{: .shadow width="900" }

```
caesarreallylikedashiftofthree
```

**Flag:** `gaslightCTF{caesarreallylikedashiftofthree}`

### Where the dream starts 2 (100 pts)

**Description:** *Musicians transpose keys regularly. Cryptanalysts transpose columns regularly.*
**Hint:** *Keylength: key of cipher in Where the dream starts 1. Keyword: `ascii_lowercase[:keylength]`*

![Challenge card for "Where the dream starts 2"](/assets/img/posts/gaslightctf/03-dts2-card.png)
{: .shadow width="900" }

This is where the two challenges connect — the hint is telling me to reuse the shift value (`3`) from the first challenge as the number of columns here. So the keyword becomes `ascii_lowercase[:3]` → `abc`, meaning a 3-column transposition. I hadn't touched columnar transposition since a CS class, so I refreshed myself on the mechanics first:

![Wikipedia's columnar transposition page, used to refresh myself on the mechanics](/assets/img/posts/gaslightctf/04-columnar-wiki.png)
{: .shadow width="900" }

Ciphertext:

```
T aiglhTtn0-t-yf-4}hfgsaitFrss2hk--fteel  sgC{4p3-330gl!o
```

Laying it out in a 3-column grid confirmed the structure was consistent (partial view):

| Row | Col1 | Col2 | Col3 |
|-----|------|------|------|
| 1   | T    | h    | e    |
| 2   | _    | f    | l    |
| 3   | a    | g    | _    |
| 4   | i    | s    | _    |
| 5   | g    | a    | s    |

Rather than finish the grid by hand, I ran it through [boxentriq's columnar transposition tool](https://www.boxentriq.com/ciphers/columnar-transposition-cipher#manual) in **Decrypt** mode with key `abc`:

![boxentriq decrypt mode with key "abc"](/assets/img/posts/gaslightctf/05-boxentriq.png)
{: .shadow width="900" }

```
The flag is gaslightCTF{tr4nsp0s3-2-th3-k3y-0f-g-fl4t!}eo
```

**Flag:** `gaslightCTF{tr4nsp0s3-2-th3-k3y-0f-g-fl4t!}`

A third crypto challenge, "affine hill" (100 pts), was also on the board but I didn't get to solve it before the event ended.

## Forensics

### good-luck! (100 pts)

**Description:** *Good luck!*
**Attachments:** `goodluck2.mp3`

![Challenge card for "good-luck!"](/assets/img/posts/gaslightctf/06-goodluck-card.png)
{: .shadow width="900" }

Playing the file normally is just noise — nothing to hear. For audio stego, the first thing I check is always the spectrogram, so I opened it in Audacity and switched the track view over.

![Audacity spectrogram view showing the flag text hidden in the frequency data](/assets/img/posts/gaslightctf/07-spectrogram.png)
{: .shadow width="900" }

The flag characters are drawn directly into the frequency data — you can read them straight off the spectrogram:

```
c4n_u_s33_me?_u4ya
```

**Flag:** `gaslightCTF{c4n_u_s33_me?_u4ya}`

### cowabunga

I didn't keep notes on this one's description or point value, but the attachment was a PDF with several lines fully redacted behind black bars:

![Redacted PDF — most of the page blacked out](/assets/img/posts/gaslightctf/08-cowabunga-pdf1.png)
{: .shadow width="900" }

The redaction was cosmetic rather than a real flatten/burn — selecting the text underneath one of the black bars and copying it out revealed the flag sitting in plain text:

![Selecting the text under a redacted line reveals the flag](/assets/img/posts/gaslightctf/09-cowabunga-pdf2-flag.png)
{: .shadow width="900" }

The rest of the document was just filler — the same "cowabunga" phrase repeated over and over to pad the page and make the real line blend in:

![The repeated "cowabunga" filler text used to hide the real line](/assets/img/posts/gaslightctf/10-cowabunga-text.png)
{: .shadow width="900" }

**Flag:** `gaslightCTF{c0w4bung4_f1le_4ev3r}`

### icon-sketch (104 pts)

**Description:** *The pee people found the first version of the gaslightCTF icon... apparently theres a flag in here?*
**Attachments:** `icon.zip`

![Challenge card for "icon-sketch"](/assets/img/posts/gaslightctf/11-iconsketch-card.png)
{: .shadow width="900" }

The image itself is just an early sketch of the event logo (a gas can with flames spelling "gaslightingCTF") — nothing visible to the eye, so straight to metadata:

![icon.png opened in an image viewer — just the logo artwork, nothing hidden visually](/assets/img/posts/gaslightctf/12-icon-viewer.png)
{: .shadow width="900" }

```bash
$ exiftool icon.png
```

Three custom fields stood out, all Base64-looking:

- `Document Name` decodes straight to plaintext instructions: *"the pee people said to decode and put the titles together"*
- `Title` and `Artwork Title` are two more encoded blobs that need decoding separately

![CyberChef: From Base64 on Document Name, revealing the instructions](/assets/img/posts/gaslightctf/13-cyberchef-docname.png)
{: .shadow width="900" }

Decoding `Title` (Base64 → Atbash cipher) with CyberChef:

```
gaslight...{i5.t..t.su.....d_...p..s?.
```

![CyberChef: From Base64 → Atbash Cipher on the Title field](/assets/img/posts/gaslightctf/15-cyberchef-title.png)
{: .shadow width="900" }

Decoding `Artwork Title` (Base64 → the result is a string of hex byte pairs, so From Hex on top):

```
........CTF....h4...pp0s3..2b_.1s..}
```

![CyberChef: From Base64 → From Hex on the Artwork Title field](/assets/img/posts/gaslightctf/14-cyberchef-artworktitle.png)
{: .shadow width="900" }

Following the instructions from `Document Name`, I overlaid the two partial strings — wherever one has a dot placeholder, the other has the real character.

**Flag:** `gaslightCTF{i5_th4t_su5p0s3d_2b_k1sh?}`

## Web

### biscuit (100 pts)

**Description:** *Hello world! italics bold*
**Attachments:** `biscuit.tar.zst`

![Challenge card for "biscuit"](/assets/img/posts/gaslightctf/16-biscuit-card.png)
{: .shadow width="900" }

Solved this one entirely with `curl` — never opened a browser for it.

**Step 1 — Signup with an injected role.** The signup endpoint takes `username` and `password` as form fields. Breaking out of the `username` value with a quote let me smuggle a `role("admin")` call into the request:

```bash
curl -c cookies.txt -d 'username=pwn"); role("admin&password=pw123' \
  https://d0648342-a17e-40f8-8b1f-ad71db5bf186.play.gaslightctf.cooking:1337/signup
```

**Step 2 — Use the session cookie against the flag endpoint:**

```bash
curl -b cookies.txt \
  https://d0648342-a17e-40f8-8b1f-ad71db5bf186.play.gaslightctf.cooking:1337/flag
```

That returned an HTML page with a `/staff room` link, and visiting that with the "admin" account I'd just created showed:

```html
<p class="flag">gaslightCTF{d3f1nit3ly_a_cak3_f0r_l3g4l_r34s0n5_deb1849770df}</p>
```

**Flag:** `gaslightCTF{d3f1nit3ly_a_cak3_f0r_l3g4l_r34s0n5_deb1849770df}`

There was a second part to this challenge (a Jaffa Cake voting page) marked as "remove this web" in my notes — I wasn't able to solve that half.

## Final flags

| Challenge | Flag |
|---|---|
| Where the dream starts 1 | `gaslightCTF{caesarreallylikedashiftofthree}` |
| Where the dream starts 2 | `gaslightCTF{tr4nsp0s3-2-th3-k3y-0f-g-fl4t!}` |
| good-luck! | `gaslightCTF{c4n_u_s33_me?_u4ya}` |
| cowabunga | `gaslightCTF{c0w4bung4_f1le_4ev3r}` |
| icon-sketch | `gaslightCTF{i5_th4t_su5p0s3d_2b_k1sh?}` |
| biscuit | `gaslightCTF{d3f1nit3ly_a_cak3_f0r_l3g4l_r34s0n5_deb1849770df}` |

## Takeaways

- Don't throw away values from earlier challenges — a Caesar shift became the key length for the very next puzzle.
- When `exiftool` shows several custom metadata fields that all look encoded, decode each one on its own rather than assuming duplicates. Here, two differently-encoded fields each held half the flag, and a third field's plaintext told me how to combine them.
- Signup/registration endpoints that build a backend call by concatenating raw input (like `role("<username>")`) are still a live injection point in 2026 — breaking out with a quote let the account register itself as admin before any validation ran.
