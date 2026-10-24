---
layout: post
title: "JerseyCTF VI: Fix Your Ship, Repairing Corrupted File Headers"
date: 2026-04-26 10:00:00 +0800
categories: [CTF, Forensics]
tags: [JerseyCTF, Forensics, File Signatures, Magic Bytes]
platform: JerseyCTF
difficulty: Easy
author: dreaith
---
---

## Challenge Info
- **Challenge:** Fix Your Ship (405 pts, Easy)
- **Category:** Forensics
- **Platform:** JerseyCTF VI
- **Description:**  
  > Your ship has crash-landed and you need to fix the engine, but the files to access the schematics have been corrupted and their hexadecimal bits have been changed. Luckily, you remember the first file is a PNG, which should give clues on how to fix the other files.

---

## Scenario
We are given three files (`file1`, `file2`, `file3`) that initially appear as raw data. The challenge hints that one is a PNG, and we must repair all three to recover pieces of a flag. The files are corrupted at the byte level, specifically in their file signatures (magic bytes).

---

## Tools Used
- `file` — identify file types
- `xxd` — hex dump
- `python3` — byte patching
- HeXed (hex editor) — manual byte editing
- Standard image/video viewers

---

## Step 1: Initial Analysis

First, check what the files are currently recognized as:

```bash
file file*
```

Output:
```
file1: data
file2: data
file3: data
```

None are recognized. Next, dump the first 16 bytes of each to inspect their headers:

```bash
for i in 1 2 3; do echo "=== file$i ==="; xxd -l 16 file$i; done
```

Output:
```
=== file1 ===
00000000: 8900 0000 0d0a 1a0a 0000 000d 4948 4452  ............IHDR

=== file2 ===
00000000: 0000 00e0 0010 4a46 4946 0001 0101 0064  ......JFIF.....d

=== file3 ===
00000000: 0000 0020 7066 7974 6973 6f6d 0000 0200  ... pfytisom....
```

**Analysis:**
- **file1** should be a PNG. The standard PNG signature is `89 50 4E 47 0D 0A 1A 0A`. Here, bytes 1–3 (`50 4E 47`) are nulled to `00 00 00`. The rest (`0D 0A 1A 0A`) and the `IHDR` chunk are intact.
- **file2** should be a JPEG. The standard JPEG header is `FF D8` and trailer is `FF D9`. The current header starts with `00 00 00 E0`, but we see `JFIF` at offset 6, confirming it’s a JPEG with a corrupted start.
- **file3** should be an MP4. The `ftyp` atom (FourCC) is scrambled: instead of `66 74 79 70` (`ftyp`), it reads `70 66 79 74` (`pfyt`). The rest of the atom structure is present.

---

## Step 2: Repairing the PNG (file1)

A PNG file must start with the 8-byte signature:
```
89 50 4E 47 0D 0A 1A 0A
```
In `file1`, the bytes at offsets 1–3 are `00 00 00` instead of `50 4E 47`. We can patch them with a short Python script:

```bash
python3 -c "with open('file1','r+b') as f: f.seek(1); f.write(b'\x50\x4E\x47')"
```

**Explanation:**
- `seek(1)` moves the file pointer to the second byte (offset 1).
- We write the three missing bytes: `0x50` (`P`), `0x4E` (`N`), `0x47` (`G`).

Now `file1` is a valid PNG. Opening it reveals a starship schematic with a clue:

![Repaired file1 PNG — HUK-720 "Hawk" schematic with first flag fragment and a clue about file2](/assets/img/posts/jerseyctf/03-fixyourship-file1-png.png)

> **Clue:** Second file's first hex digit is FF and the last digit is D9.

This matches the standard JPEG signature.

---

## Step 3: Repairing the JPEG (file2)

According to the clue and standard JPEG format:
- **Header (Start of Image):** `FF D8`
- **Trailer (End of Image):** `FF D9`

The current header is corrupted. Using a hex editor (HeXed), I patched:
- The first two bytes to `FF D8`.
- The last two bytes to `FF D9`.

After saving, `file2` is a valid JPEG. Opening it shows the second piece of the schematic, labeled `_voyager_`.

![Repaired file2 JPEG — engine bay schematic labeled "_voyager_"](/assets/img/posts/jerseyctf/04-fixyourship-file2-jpeg.png)

**Note:** The clue explicitly mentioned both the first and last hex digits, so both header and trailer needed correction.

---

## Step 4: Repairing the MP4 (file3)

MP4 files use an `ftyp` atom near the beginning. The FourCC `ftyp` normally sits at bytes 4–7. In `file3`, the bytes are `70 66 79 74` (`pfyt`) instead of `66 74 79 70` (`ftyp`). We can fix this with a Python script:

```python
with open('file3', 'rb') as f:
    data = bytearray(f.read())

data[4:8] = b'\x66\x74\x79\x70'  # "ftyp"

with open('file3_fixed.mp4', 'wb') as f:
    f.write(data)
```

**Explanation:**
- `data[4:8]` targets the four bytes of the `ftyp` FourCC.
- We replace them with the correct ASCII values: `f` = `0x66`, `t` = `0x74`, `y` = `0x79`, `p` = `0x70`.

Verify the fix:
```bash
file file3_fixed
# file3_fixed: ISO Media, MP4 Base Media v1 [ISO 14496-12:2003]
```

Playing the repaired MP4 reveals the final flag fragment on screen: `apollo}`.

---

## Step 5: Combining the Flag

We collected three fragments:
- **file1:** `jctf{starship`
- **file2:** `_hawk_`
- **file3:** `apollo}`

Concatenating them gives the complete flag:

```
jctf{starship_hawk_apollo}
```

---

## Lessons Learned
- **File signatures (magic bytes)** are the first line of defense when identifying corrupted files. Always compare against known signatures.
- **Hex editors** are invaluable for precise byte-level repairs.
- **Clues in challenges** often point to exact byte values (e.g., “first hex digit is FF and last is D9”).
- **Python** is perfect for quick, scripted byte patching when you know the offset.
- Always verify repairs with `file` or by opening the file in an appropriate viewer.

---

## References
- [Gary Kessler's File Signatures Table](https://www.garykessler.net/library/file_sigs_GCK_latest.html)
- [PNG Specification](https://www.w3.org/TR/PNG/)
- [JPEG File Interchange Format](https://en.wikipedia.org/wiki/JPEG_File_Interchange_Format)
- [ISO Base Media File Format (MP4)](https://en.wikipedia.org/wiki/ISO_base_media_file_format)


