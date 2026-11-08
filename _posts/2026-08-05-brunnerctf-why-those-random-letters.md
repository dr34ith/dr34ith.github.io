---
layout: post
title: "BrunnerCTF Writeup: Crypto & Malware Challenges"
date: 2026-08-05 10:00:00 +0800
categories: [CTF, Crypto, Malware]
tags: [BrunnerCTF, Crypto, Malware, Forensics]
platform: BrunnerCTF
difficulty: Easy
author: dreaith
---
Hello, i play the brunner ctf i solved some 3 forensics challenges, some basic cryptography and 1 osint problems but i forgot to document all things along the way so i apologize.

---

## Why Those Random Letters? (35 pts, Beginner)

**Author:** Emil8250  
**Description:** We found this weird message, left behind the printer:

```
cqsWvloGoWfGsv|LXS4e`YEI4E5EmJuL`ExB2Fuuii`qSV5LoLeUpbnH"W~n
```

> Like everything else in this business, it seems so random?

![Challenge card for "Why those random letters?"](/assets/img/posts/brunnerctf/01-randomletters-card.png)
{: .shadow width="900" }

The provided `encrypt.py` shows exactly how the message was built:

![encrypt.py source, showing the ASCII shift-by-1 plus random confusion character](/assets/img/posts/brunnerctf/02-encrypt-source.png)
{: .shadow width="900" }

```python
import random
import string

plaintext_flag = "brunner{REDACTED}"

def encrypt_flag(plain_flag):
    letters = string.ascii_letters
    encrypted_flag = ""
    for char in plain_flag:
        random_letter_for_confusion = random.choice(letters)
        chars_to_add = chr(ord(char) + 1) + random_letter_for_confusion
        encrypted_flag += chars_to_add
    return encrypted_flag

print(encrypt_flag(plaintext_flag))
```

**How it works:**
- Each real character is shifted **up by 1** in ASCII.
- Immediately after, a **random letter** is inserted as noise.
- So the ciphertext is twice as long as the plaintext.

**Decryption:**
Read the ciphertext two characters at a time. Keep the first character of each pair (the shifted real character), shift it **back down by 1**, and discard the second (random) character.

```python
def decode_message(encoded_message):
    decoded_message = ""
    i = 0
    while i < len(encoded_message):
        # Get the current character and skip the next random character
        decoded_message += chr(ord(encoded_message[i]) - 1)
        i += 2  # Skip the random letter
    return decoded_message

encoded_message = "cqsWvloGoWfGsv|LXS4e`YEI4E5EmJuL`ExB2Fuuii`qSV5LoLeUpbnH\"W~n"
decoded_message = decode_message(encoded_message)
print(decoded_message)
```

Running the decryption script gives:

```bash
$ python3 decrypt.py
brunner{W3_D34lt_w1th_R4nd0m!}
```

**Flag:** `brunner{W3_D34lt_w1th_R4nd0m!}`

---

## Slis (100 pts, Easy–Medium)

**Author:** Bond  
**Description:** Brunnerne likes food 🍽️ and: some like it sHOrT 🥊, so we'll keep it short 😄

**Attachment:** `crypto_slis.zip`

![Challenge card for "Slis"](/assets/img/posts/brunnerctf/04-slis-card.png)
{: .shadow width="900" }

![The slis.py source code, showing the byte-to-integer conversion and the assert statement used to verify the correct flag](/assets/img/posts/brunnerctf/05-slis-source.png)
{: .shadow width="900" }

```python
flag = 'brunner{' + input() + '}'
n = int.from_bytes(flag.encode())
lis = [n//(i+2) - n//(i+3) for i in range(9**5)]
assert sum(lis) == 22263691028918788395010325066307464924652601045336492930678310479674861811846
```

**Understanding the code:**
- The flag is `brunner{` + our input + `}`.
- `flag.encode()` converts the string to bytes.
- `int.from_bytes()` turns those bytes into one huge integer `n`.
- `lis` is a list comprehension over `i` from `0` to `9**5 - 1` (i.e., `59048`).
- Each element is `n//(i+2) - n//(i+3)`.
- The `assert` checks that the sum of all elements equals a given constant.

**Mathematical insight:**
The sum telescopes:
\[
\sum_{i=0}^{N-1} \left( \left\lfloor \frac{n}{i+2} \right\rfloor - \left\lfloor \frac{n}{i+3} \right\rfloor \right) = \left\lfloor \frac{n}{2} \right\rfloor - \left\lfloor \frac{n}{N+2} \right\rfloor
\]
where \(N = 9^5 = 59049\). So the constant is essentially \(\lfloor n/2 \rfloor\) minus a very small term. Since \(n\) is enormous, we can approximate:
\[
n \approx 2 \times \text{constant}
\]
With the exact constant, we can solve for `n` precisely (or use the approximation and adjust). Then convert `n` back to bytes and decode to get the flag.

**Flag:** `brunner{Pease_porridge_sHOrT_:)}`

---

## Company Discount (100 pts, Easy, Malware)

**Author:** OddNorseman  
**Description:** I got this email about a new company discount! Seems like an amazing perk - check it out yourself!

**Note:** This challenge might trigger your antivirus. Although "defanged" and completely safe to run, please always treat malware/unknown challenges like this as real and use a sandbox such as a VM or Windows Sandbox.

![Challenge card for "Company Discount"](/assets/img/posts/brunnerctf/12-companydiscount-card.png)
{: .shadow width="900" }

The attachment was `Brunnerne_Employee_Discount_Newsletter_2026.hta` — an HTA (HTML Application) file. Opening it in a text editor (instead of running it) revealed a fake "Brunnerne Inc. Employee Newsletter" page:

![The malicious .hta file's source — an HTA:APPLICATION wrapper around a fake newsletter page](/assets/img/posts/brunnerctf/13-companydiscount-hta-source.png)
{: .shadow width="900" }

Inside the page’s script was a heavily obfuscated PowerShell one-liner (mixed-case cmdlets, string concatenation, `IEX`) that reaches out to a Cloudflare Worker URL for a second stage:

```bash
curl -s https://summer-darkness-50d9.oluf-sand.workers.dev/analytics/1ca729e6-5081-48da-a9b5-c1b8c21b433b
```

![Fetching the obfuscated stage-2 PowerShell payload with curl](/assets/img/posts/brunnerctf/14-companydiscount-stage2-curl.png)
{: .shadow width="900" }

That stage-2 script then fetches a third URL — which turned out to be the flag itself, in plaintext:

```bash
curl https://summer-darkness-50d9.oluf-sand.workers.dev/analytics/17d995a0-46e2-4c06-95d0-6165771cd1b7
```

![Fetching the stage-3 payload — it's the flag in plaintext](/assets/img/posts/brunnerctf/15-companydiscount-stage3-flag.png)
{: .shadow width="900" }

![Confirming the same flag by visiting the URL directly in the browser](/assets/img/posts/brunnerctf/16-companydiscount-flag-browser.png)
{: .shadow width="900" }

**Flag:** `brunner{wh00ps_l3ts_1gn0r3_th1s_4nd_h0p3_1T_d03snt_n0t1c3}`

### Takeaway
- Always inspect HTA, JS, and Office documents in a sandbox or text editor before running.
- Obfuscated PowerShell is a common malware technique. Look for `IEX`, string concatenation, and suspicious URLs.
- Following the chain of URLs (stages) often leads directly to the payload or flag.

---

## Lessons Learned
- **Crypto:** Understand the encryption scheme before writing a decryptor. Telescoping sums are a common mathematical trick in CTF crypto.
- **Malware:** Never run unknown attachments. Use `curl` or a text editor to inspect scripts safely.
- **Documentation:** Keep screenshots and exact commands for reproducibility.

---

## References
- [BrunnerCTF](https://brunnerctf.com) (archived)
- [HTA File Format](https://en.wikipedia.org/wiki/HTML_Application)
- [PowerShell Obfuscation Techniques](https://www.blackhillsinfosec.com/powershell-obfuscation/)

