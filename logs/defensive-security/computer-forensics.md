
Hello there! Let's talk about forensics, i've been taking a short courses about computer forensics and here's some of my learnings and notes. Before we start lets remember that the goal of computer forensics was to produce evidence for legal cases.

## I. History

Computer forensics started because police needed ways to catch criminals using computers. In 1984, the FBI created a special team to handle these cases. CART stands for Computer Analysis and Response Team. It was a specialized team formed by the FBI in 1984 to handle crimes involving computers. This team was one of the first efforts to develop expertise in investigating computer-related crimes and laid the foundation for the field of computer forensics.

In 2005, ISO/IEC 17025 is an international standard that ensures testing and calibration labs are competent and produce reliable results. It's important for fields like digital forensics and cybersecurity where accurate evidence is critical.

## II. Types of Investigation

1. **Public Investigation** occurs with the criminal cases. Examples are drug crimes, sexual exploitation and theft.
2. **Private Investigation** occurs when civil cases, incident responses, policies. Examples such as Sabotage, Embezzlement and Industrial Espionage.

### Legal Implications

The Fourth Amendment is crucial in computer forensics because it protects individuals from unauthorized search and seizure. In public investigations, you must obtain a warrant supported by an affidavit to legally search and collect evidence. If this isn't done properly, the court may reject your evidence, or you could face legal consequences. Following these legal requirements ensures that your investigation is lawful and that the evidence you gather is accepted in court, which is essential for a successful forensic investigation.

## III. Anti-Forensics Techniques

Anti-forensics techniques are methods used by criminals to avoid detection and make forensic investigations harder. These include strong encryption that blocks access to data, deleting files in ways that make recovery impossible, corrupting or deleting metadata (which holds important info about files), suppressing changes to timestamps to confuse investigators, hiding data inside image files using steganography, and placing data in hidden areas like slack space on a drive. Some advanced techniques can even destroy evidence if they detect forensic analysis attempts. These tactics create ongoing challenges for computer forensics professionals.

![Anti-forensics: tampering with metadata](logs/assets/forensics/p01_0.png)

## IV. Areas of Computer Forensics

![Areas of computer forensics](logs/assets/forensics/p01_1.png)

| Main Area | Description |
|---|---|
| Network Forensics | Packet capture tools, SIEM log aggregation, and wireless (Wi-Fi/Bluetooth) sniffing. |
| OS Forensics | Specific file systems (NTFS/ext4), memory dumps, registry hives, and user artifacts (Prefetch, ShellBags). |
| Web Forensics | Browser caches/history, server-side logs (Apache/Nginx), and malicious URL/script inspection. |
| Cloud Forensics | Provider-specific logs (AWS/Azure), container/virtual machine analysis, and cross-border legal data challenges. |
| Malware Forensics | Static reverse-engineering (Ghidra/IDA), dynamic sandbox behavior, and persistence tracking. |
| Mobile Forensics | Physical (chip-level) vs. logical extraction, app data/GPS, and cloud-synced backups. |
| Email Forensics | Authentication headers (SPF/DKIM/DMARC), malicious attachment sandboxing, and mailbox archive structures (PST/OST). |

## V. Preparation for an Investigation

Speed is critical because forensic tasks like imaging can be time-consuming, so fast hardware improves efficiency. Hardware needs sufficient capacity (memory, storage, slots) and compatibility to handle various operating systems and devices. Miscellaneous tools like antistatic evidence bags, flashlights, cameras, and screwdrivers are important for handling and documenting evidence safely.

Familiarity with major digital forensics software is essential, including commercial suites like EnCase and FTK Imager, as well as open-source tools like Autopsy and SIFT.

### Hexadecimal

Computers think in 0s and 1s (binary). But a long string like `01000001` is hard for humans to read. Hexadecimal is a shortcut — it groups those 0s and 1s into shorter codes (like `41`). So instead of reading 8 digits, you only read 2.

**Why is it important?** Forensics tools often show data in hex, not binary, and it helps investigators find clues (patterns) faster, without getting lost in endless 0s and 1s.

Suggested tool to use: Neo Hex Editor.

**Simple flow: how an investigator uses it**
1. Open the file → view the raw hex grid.
2. Check the offset → go to the suspected location of the evidence.
3. Read the hex/ASCII → identify suspicious strings or file types.
4. Select the data → view the size in the Selection Panel to know how much to extract.
5. Check attributes → verify the file's creation/modified dates to see if the attacker altered them.

```
┌─────────────────────────────────┐ ┌─────────────────────────────────┐
│ BINARY SYSTEM                   │ │ HEXADECIMAL SYSTEM              │
├─────────────────────────────────┤ ├─────────────────────────────────┤
│ Base: 2                         │ │ Base: 16                        │
│ Digits: 0, 1                    │ │ Digits: 0-9, A-F                │
│ Example: A = 01000001           │ │ Example: A = 41₁₆               │
│ 8 bits = 1 byte                 │ │ 2 hex digits = 1 byte           │
│ Readability: Hard for humans    │ │ Readability: Compact & easy     │
│ Used in: Machine code, bitwise  │ │ Used in: Debugging, memory,     │
│         operations              │ │         color codes, assembly  │
└─────────────────────────────────┘ └─────────────────────────────────┘

      01000001 (Binary)  ←→  41₁₆ (Hexadecimal)
      (Both represent the letter 'A')
```

### Physical Drives vs. Logical Drives

![Physical drive vs logical drive](logs/assets/forensics/p03_0.png)

In computer forensics, **physical drives** are the actual hardware devices like hard drives, USB drives, or solid-state drives connected to your computer. Think of them as the physical boxes where data is stored.

**Logical drives**, on the other hand, are partitions or sections created by your operating system within a physical drive to organize and manage data more effectively. So, one physical drive can be divided into multiple logical drives, each acting like a separate storage area.

This distinction matters because when you use tools like hex editors, you might examine either the entire physical drive or just a specific logical drive (partition). Understanding this helps you locate and analyze data accurately during forensic investigations.

### Offset

"Offset" is a way to specify the exact location of a piece of data by measuring how far it is, in bytes, from a specific starting point like the beginning of a file, sector, or drive. It is crucial because it allows investigators to pinpoint the exact location of data within a file, sector, or entire drive. By measuring the distance in bytes from a known reference point, offsets help you find and analyze specific pieces of information accurately. This precision is essential for uncovering hidden or altered data and ensuring that evidence is correctly identified and preserved during an investigation.

![Offset diagram](logs/assets/forensics/p04_0.png)

## VI. File System Fundamentals

File systems determine how an OS stores data on a storage device. File systems like FAT (File Allocation Table) and NTFS (Master File Table) determine how an OS stores files, with NTFS being more efficient due to smaller cluster sizes that reduce wasted space (slack).

**Common Windows File Systems**

| File System | Description | Typical Use |
|---|---|---|
| NTFS (New Technology File System) | Default Windows file system; supports permissions, encryption, compression, quotas, and large files. | Internal drives, Windows installations |
| FAT32 (File Allocation Table 32) | Older file system with broad compatibility but a 4 GB maximum file size. | USB drives, memory cards |
| exFAT (Extended FAT) | Designed for flash storage; supports large files and cross-platform compatibility. | External drives, USB sticks |
| ReFS (Resilient File System) | Microsoft's newer file system focused on data integrity and scalability. | Servers and enterprise storage |

Metadata refers to the data about the files like file attributes, file names and file timestamps, while the file data is the actual data content.

### How Data is Stored and Disks are Organized

Disks are organized into 3 main levels:

**1. Partitions (Volumes)** — logical divisions or "slices" of the physical disk created by the user or operating system (e.g., `C:\`, `D:\`, or `/dev/sda1`, `/dev/sda2`). They act as separate containers that tell the OS where one file system ends and another begins. Investigators often image a single partition or the entire physical disk depending on what evidence they need.

**2. Sectors (Physical Storage Unit)** — the smallest **physical** storage units on a hard drive or solid-state drive. Each sector traditionally holds 512 bytes of data, though newer drives often use 4,096-byte sectors (Advanced Format). The hardware reads and writes data at this level. Damaged sectors (bad sectors) can hide or destroy evidence.

**3. Clusters (Logical Storage Unit)** — the smallest **logical** storage units used by the operating system's file system (like NTFS or FAT32). A cluster is made up of one or more contiguous sectors (e.g., 8 sectors of 512 bytes = 1 cluster of 4KB). It represents the smallest amount of space the OS can allocate to store a file. Even a 1-byte text file consumes an entire cluster. Deleted files leave remnants in unallocated clusters, which investigators can carve for evidence.

![Internal hard drive anatomy](logs/assets/forensics/p04_1.png)

Hard disk drives (HDDs) use magnetic storage to store binary data (0s and 1s). The drive contains spinning metal or glass disks called platters, which are coated with a magnetic material. A read/write head reads and writes data by creating and detecting positive and negative magnetic charges on these platters.

![Tracks, sectors, and clusters on a platter](logs/assets/forensics/p05_0.png)

Tracks are circular paths on the surface of a hard drive's platter, like rings on a tree trunk, where data is written. Each track is divided into smaller sections called sectors, which are like slices of a pie — each sector typically holds 512 or 4,096 bytes of data. Clusters are groups of one or more sectors combined by the operating system to form the smallest unit of storage it can allocate for files. Think of clusters as small boxes or cubby holes that organize data efficiently.

![Platters, cylinders, and R/W heads](logs/assets/forensics/p06_0.png)

### BIOS

**Basic Input/Output System** is a program stored on a computer's motherboard that helps start the computer by loading hardware drivers and then the operating system. It's a key part of the boot sequence, making sure the computer's hardware is ready before the OS runs. It controls how the system boots and accesses drives, which can affect evidence integrity.

**UEFI (Unified Extensible Firmware Interface)** is a modern replacement for the traditional BIOS. It is a type of firmware that initializes hardware and starts the operating system during the boot process. It controls how the system boots and accesses drives, which can impact the integrity of digital evidence during investigations.

**CMOS (Complementary Metal-Oxide-Semiconductor)** is a technology used to store BIOS settings on a computer's motherboard. It holds configuration data such as system time, date, and hardware settings that the BIOS uses during the boot process. It can provide clues about the system's configuration and state at the time of an investigation.

![BIOS/boot sequence diagram](logs/assets/forensics/p07_0.png)

### MBR

Master Boot Record will be accessed when BIOS selects a disk drive to boot from. The MBR is located in the first sector of the storage device and contains information about partitions, including their locations, sizes, and which one is bootable.

### Partitions

It divides the physical storage device into multiple logical sections to organize data and separate the operating system from other files. It allows for efficient management and can enable multiple operating systems, like Windows and Linux, to be installed on the same physical drive.

![Primary vs logical partitions in Disk Management](logs/assets/forensics/p08_0.png)

> Tool to use: **Gparted**
>
> - To create multiple partitions on a USB drive, first identify the correct drive by its size.
> - Resize existing partitions to free up space for new ones.
> - Create an extended partition first, as logical partitions must reside within it.
> - Use tools like Gparted to manage partitions effectively.

## VII. Persisting Data

Preserving digital evidence is important to avoid accidentally changing (adding, deleting, or modifying) data, which can make evidence inadmissible in court. Keeping the original data exactly is the goal. There are 4 techniques of preservation: Write-Blockers, Hashing, Mounting/Unmounting, and Integrity & Validity.

![Write-blocker hardware setup](logs/assets/forensics/p09_0.png)

A **write-blocker** prevents changes (it has hardware & software write-blocker types), **hashing** verifies copies, and **proper mounting** stops OS interference. They prove your evidence is intact and court-ready.

![Hardware, software, and embedded write-blockers](logs/assets/forensics/p09_1.png)

| Technique | What it does | Why it is needed |
|---|---|---|
| Write-Blocker | Blocks or prevents any writing to the evidence drive. | To avoid accidentally modifying the original data. |
| Hashing | Generates a unique digital "fingerprint" (hash) of a file or entire drive. | To verify that the copied data matches the original exactly. |
| Mounting / Unmounting | Controls how the OS connects to the drive — the mechanism that makes a drive or partition visible to the system. | To prevent the OS from writing temporary files (e.g., thumbnails, logs) to the evidence drive. |
| Integrity & Validity | Ensures that no data on the evidence has been changed, altered, or corrupted. | So that the evidence is trustworthy and admissible in court. |

### Hashing

A hash algorithm generates a unique fixed-length "digital fingerprint" (hash value) from any file or data. Even a tiny change in the file produces a completely different hash. This is used in forensics to verify data integrity, proving that a copied file is identical to the original.

![Hashing algorithm concept](logs/assets/forensics/p10_0.png)

Let's try it on my CLI:

![Hashing before/after edit in the terminal](logs/assets/forensics/p10_1.png)

```
$ touch hashing.txt
$ sha256sum hashing.txt
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  hashing.txt

$ vim hashing.txt
$ sha256sum hashing.txt
4c48e1acb6d27dd00516d3aa91318c87d5c1b879183558265d600d930e5abd36  hashing.txt
```

![Editing the file in Vim](logs/assets/forensics/p11_0.png)

This is the information I entered while editing the file in Vim, and as expected, we confirmed the hash had changed afterward.

### MD5 vs. SHA

**MD5 (Message Digest Algorithm 5)** is a 128-bit hash algorithm. Its primary weakness is the collision vulnerability, where two different files can generate the same hash value. Because of this, MD5 is no longer considered secure for forensic integrity verification, although it is still occasionally used for fast, non-critical checks.

**SHA (Secure Hash Algorithm)** is actually a family of hash algorithms, not a single algorithm. It is generally more secure than MD5, but not all SHA versions are equally reliable. SHA-1 produces a 160-bit hash and has known collision issues discovered in 2017. In contrast, SHA-256 and SHA-512 produce longer hashes and have no known practical collisions, making them the recommended choices for forensic work.

**Longer hash = more secure.** A longer hash means more possible combinations. For example, a 256-bit hash has vastly more potential values than a 128-bit hash, which makes the chance of two different files accidentally producing the same hash practically zero. This is why forensic investigators prefer SHA-256 or SHA-512 over MD5 or SHA-1.

### Tool: FTK Imager

- FTK Imager includes built-in hash algorithms like MD5 and SHA-1 to verify and validate forensic data.

![FTK Imager: Select Source](logs/assets/forensics/p12_0.png)

- The tool computes hash values both before and after creating a disk image to ensure the data remains unchanged.

![FTK Imager: Select Image Type / Evidence Item Information](logs/assets/forensics/p12_1.png)

- Creating a disk image involves selecting the physical drive, choosing the raw (DD) image format, and specifying case and evidence details.

![FTK Imager: Select Image Destination](logs/assets/forensics/p13_0.png)

- Enabling image verification at the end of the imaging process provides hash values that confirm the integrity of the copied data.

![FTK Imager: Drive/Image Verify Results](logs/assets/forensics/p13_1.png)

### Mounting

Mounting is the process of making a partition or storage device accessible and visible to an operating system, like plugging in a USB. Unmounting is the opposite — it hides the partition from the OS, preventing it from being accessed or modified. It protects evidence from accidental changes.

| Command | Purpose |
|---|---|
| `sudo fdisk -l` | List all drives. Find your USB (e.g., `/dev/sdb1`). |
| `sudo umount /dev/sdb1` | Unmount the partition. |
| `sudo mount -o ro /dev/sdb1 /mnt/...` | Mount as read-only for safe analysis. |

For example, if we run `fdisk -l`, it shows `/dev/sdb1`, which means the USB drive we plugged in exists and its FAT32 partition is visible. However, this only confirms the partition exists — it isn't usable yet. The next step is to run `sudo umount /dev/sdb1` (note: it's `umount`, not `unmount`) to detach it from wherever it's currently auto-mounted, so we can then mount it manually to our own folder instead.

![fdisk / umount in the terminal](logs/assets/forensics/p14_0.png)
![Mounting flow diagram](logs/assets/forensics/p14_1.png)

## VIII. Acquiring Data

There are three main ways to acquire data:

1. **Static Acquisition** — basic, common, and it retrieves data from non-volatile sources like hard drives or USB drives, where data remains after power is off.
2. **Live Acquisition** — deals with encryption, and it captures data from volatile sources such as RAM, which disappears when the device is powered off; increasingly important due to encryption.
3. **Remote Acquisition** — involves collecting data over a network using a client-server setup.

Naming convention:
- `/dev/sda1` = the first drive letter, referring to a hard drive.
- `/dev/sdb` = entire physical drive.
- `/dev/sdb1` = first partition (you unmount this).

### 1.1 Static Acquisition with open-source tools

On this example I show how to create a forensic image of a USB drive using a tool called `dd` on Linux — making an exact, bit-by-bit copy of the entire physical drive to preserve all data exactly as it is. The parts of the command specify the input device (the USB drive) and the output file (the image file) where the copy is saved.

![USB drive and FTK Imager shortcut](logs/assets/forensics/p16_0.png)

```
$ sudo dd if=/dev/sdb of=./usb_image.dd
^C1735445+0 records in
1735444+0 records out
888547328 bytes (889 MB, 847 MiB) copied, 121.08 s, 7.3 MB/s

$ ls -l usb_image.dd
-rw-r--r-- 1 root root 888547328 Jul 29 usb_image.dd
```

### 1.2–1.3 Static Acquisition with dcfldd

```
$ sudo dd if=/dev/sdb | split -b 650m - usbimage.
[sudo] password for kali:
^C2468353+0 records in
2468352+0 records out
1263796224 bytes (1.3 GB, 1.2 GiB) copied, 164.528 s, 7.7 MB/s

$ ls -l usbimage.*
-rw-rw-r-- 1 kali kali 681574400 Jul 29 usbimage.aa
-rw-rw-r-- 1 kali kali 582212608 Jul 29 usbimage.ab

$ sudo dcfldd if=/dev/sdb of=usbimage.dd hash=md5 hashlog=usbimage.log
6656 blocks (208Mb) written.^C
6906+0 records in
6906+0 records out
```

`dcfldd` is highlighted as a more feature-rich and user-friendly tool for forensic imaging compared to `dd`, though it may need to be installed on your Linux system, and it hashes the image on the fly as it writes.

### 1.4 Live Acquisition case study with a commercial tool

FTK Imager can be used as a live acquisition tool to capture the volatile memory (RAM) of a system. I start with "Capture Memory" to specify the destination folder and start capturing a memory dump file.

![FTK Imager capturing memory](logs/assets/forensics/p17_0.png)

Live acquisition is important in computer forensics because it captures volatile memory (RAM) from a system while it is still running.

![memdump.mem output file](logs/assets/forensics/p17_1.png)

### 1.5 Live Acquisition with a memory dump file

![Analyzing the memory dump in a hex editor](logs/assets/forensics/p18_0.png)

Searching the memory dump for strings like "password" surfaces plaintext credential fragments still resident in RAM — this is exactly why RAM capture matters for cases involving live, running malware or logged-in sessions that would otherwise leave nothing behind on disk.

![Hex/ASCII view showing a password string in memory](logs/assets/forensics/p18_1.png)

### Analyzing the Acquired Image with Autopsy

![Autopsy: New Case Information](logs/assets/forensics/p18_2.png)

Setting up a new case in Autopsy starts with basic case metadata (case number, examiner info), then moves into selecting the data source type.

![Autopsy: Select Data Source Type](logs/assets/forensics/p19_0.png)

The acquired disk image (or VM file) becomes the data source. From there, Autopsy runs a configurable set of ingest modules against it.

![Autopsy: Optional case information / Add Data Source](logs/assets/forensics/p19_1.png)

### Configuring Ingest Modules

![Autopsy: Configure Ingest modules](logs/assets/forensics/p20_0.png)

Ingest modules determine what Autopsy actually looks for while it processes the image — hash lookups, file type identification, embedded file extraction, picture analysis, email parsing, encryption detection, and more. Once configured, Autopsy adds the data source to its local database and begins analyzing files in the background.

![Autopsy: Data source added, files being analyzed](logs/assets/forensics/p20_1.png)

### Reviewing Extracted Files

![Autopsy: File listing after analysis](logs/assets/forensics/p21_0.png)

Once ingest finishes, the file listing shows everything Autopsy found — allocated and unallocated files, deleted files, carved files, and more — each with full MACB timestamps (Modified, Accessed, Created, Born/Changed).

![Autopsy: right-click file actions (Extract, Add Tag, etc.)](logs/assets/forensics/p21_1.png)

Files of interest can be extracted, tagged, bookmarked, or flagged as notable directly from this view — for example, an image file recovered from the evidence.

![Autopsy: viewing an extracted image file](logs/assets/forensics/p21_2.png)

### Tagging and Reporting

![Autopsy: Add File Tag menu](logs/assets/forensics/p22_0.png)

Tagging lets an investigator mark specific files as evidence of interest (Bookmark, Follow Up, Notable Item, etc.), optionally with comments explaining why the file matters to the case.

![Autopsy: Select Tag dialog with comment](logs/assets/forensics/p22_1.png)

Autopsy's Tools menu also exposes higher-level analysis views — Timeline, Discovery, File Search by Attributes, Common Properties — useful for spotting patterns across the whole case rather than file-by-file.

![Autopsy: Tools menu](logs/assets/forensics/p23_0.png)

### Generating the Final Report

![Autopsy: Generate Report - select data sources](logs/assets/forensics/p23_1.png)

The last step in a case is generating a report that documents everything found, tagged, and analyzed — this is the artifact that actually gets handed over for legal or incident-response purposes.

![Autopsy: Report Generation Progress](logs/assets/forensics/p24_0.png)

![Autopsy: completed HTML report listing](logs/assets/forensics/p24_1.png)

The generated HTML report includes case metadata, image information, the software/module versions used during analysis, and every tagged or flagged item — giving a full audit trail of the investigation.

![Autopsy Forensic Report: case summary](logs/assets/forensics/p25_0.png)

![Autopsy Forensic Report: full report detail](logs/assets/forensics/p25_1.png)

## Conclusion

Computer forensics is fundamentally about preserving evidence integrity while extracting meaningful artifacts — from understanding how data physically sits on a platter, to hashing and write-blocking to keep evidence court-admissible, to using tools like FTK Imager and Autopsy to acquire, tag, and report on what's found. Every step in the chain — imaging, hashing, mounting read-only, documenting — exists to answer one question in court: can you prove this evidence hasn't changed since the moment you collected it?
