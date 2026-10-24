---
title: The Security Principles
date: 2026-04-20
tags: [fundamentals, theory, cryptography,CIA,AAA,ThreatActors]
category: foundations
categoryLabel: Foundations
cover: /logs/assets/security-principle.jpeg
---

## CIA Triad

Hello there! Let's begin discussing the Security Principes. The **CIA Triad** is the backbone of almost every security practice - the checklist for keeping data safe, accurate, and usable. 


### 1. Confidentiality (Keeping Secrets Safe)
Confidentiality is about **who gets to see what**. Sensitive info should only be accessed by the right people (e.g. your bank PIN).

**Threats:** hackers stealing passwords, phishing emails, careless credential sharing.

**How to protect it:**
- Strong passwords + multi-factor authentication (MFA)
- Encrypt sensitive data
- Train people not to overshare credentials or fall for scams


### 2. Integrity (Making Sure Data Stays Trustworthy)
Data should stay **accurate, consistent, and unaltered**. If an attacker changes the amount in your online banking account - that's a breach of integrity.

**Threats:** malware that alters files, hackers modifying logs to hide tracks, human error.

**How to protect it:**
- Hashing and digital signatures to verify data
- Regular backups and file monitoring
- Strict access controls

![The CIA Triad: Confidentiality, Integrity, Availability](/logs/assets/cia-triad-cover.png "The three pillars of the CIA Triad")

### 3. Availability (Keeping Systems Up and Running)
Even private, accurate data is useless if you can't access it when needed.

**Threats:** power outages, DoS/ransomware attacks, server crashes from outdated systems.

**How to protect it:**
- Backups and disaster recovery plans
- Keep systems patched
- Redundancy (backup servers)

**Why it matters:** Confidentiality keeps secrets safe, Integrity keeps data honest, Availability keeps everything working. If a system fails in even one area, security is compromised.


> The opposite of CIA is DAD which means **==Disclosure==**, **==Alteration==**, and ==**Destruction**==

### 3 States of Data
- **==Data at Rest==**: Data ==not being used==.
- **==Data in Motion==**: Data ==traversing into a network==.
- **==Data in Use==**: Data ==actively being used==.


## IAAA: Identification, Authentication, Authorization, Auditing

The four steps that control access and hold people accountable:

1. **Identification** → Who are you? (claiming an identity - username, ID card)
2. **Authentication** → Can you prove it? (something you know/have/are - MFA combines these)
3. **Authorization** → What are you allowed to do? (principle of least privilege)
4. **Auditing** → What did you actually do? (logs, monitoring, accountability)

Without IAAA, a network is like an unlocked building - anyone could walk in, move freely, and leave unnoticed.

## Access Control
1. Discretionary Access Control is about the access of certain ovject was assigned to the object owner.
2. Mandatory Access Control is when confidentiality is the most important and this have the authority. Often use in the military.
3. Role Based Access Control is when integrity is the most important and it's all about roles and privileges.
4. Attribute Based Access Control is about attributes and the access to objects is granted based on the subjects,objects and environemental conditions. It could be subject/user, object/resource.

![aaa](/logs/assets/AAA.png)

## Risk Assessment

We have here Qualitative Risk Analysis and Quantitive Risk Analysis. When we say **Qualitative** its about relying on the judgement, personal experience and team opinions. It also uses descriptive words or some rankings like High/Medium/Low or scale from 1 to 5 and this is more fast or easy to complete for quick look at many risks. The second one is **Quantitative Risk Analysis** which relies on the quantity or numbers,percentages,money amounts. This is hard data, statistics and mathematical models. This is more detailed, slow and requires specia tools.

## Access Control Categories

We have here Administrative, Technical and Physical Controls. When we say **Administrative Control** this is about organizational policies and procedures, regulations or Training. When we say **Technical or Logical Control** it means about hardware, software, firmware such as firewalls, routers, encryption. While the **Physical Control** is about locks, fences, guards, dogs, bollards.

## Access Control Types

The 5 Access controls that i will explore now is about Preventive, Detective, Correctice, Recovery and Deterrent. First is the **Preventive Control** it prevents some action from happening. Second is **Detective Control** which controls the detect during or after an attack such as IDS, CCTV, Alarms, Anti-virus. Third is **Corrective Control** which controls or correct the attack like patches, IPS.  Next one is **Recovery Control** which helps us to recover after an attack like backups, DR environment, HA environment. Lastly, **Deterrent Control** it means discourage or deter an attack, it makes an hacker/threat actor slightly less interested such as fences, security guards, dogs, lights.

## The Different Faces of Cyber Threats

- **Script Kiddies** - beginners using ready-made tools/stolen code without fully understanding the damage
- **Hacktivists** - motivated by ideology/politics; deface sites, leak info, protest
- **Nation-State Actors** - work for governments; espionage, cyber warfare
- **Organized Crime Groups** - treat attacks like a business (ransomware, data theft, access sales)
- **Insiders** - disgruntled employees, careless staff, or infiltrators

## Common Cybersecurity Attacks

- **Viruses** - spread via human interaction (running an infected file)
- **Worms** - spread automatically across networks, no click needed
- **Trojans** - pretend to be safe software, secretly open doors for attackers
- **Ransomware** - locks/encrypts files, demands payment
- **Keyloggers** - silently track everything typed
- **Cryptominers** - hijack device processing power to mine crypto

## Cryptography Basics
![crypto-system](/logs/assets/cryptosystem.jpg)
- **Encryption** - turns readable data into scrambled text; only the key holder can unlock it
- **Hashing** - one-way transform of data into a fixed string; can't be "unlocked," useful for integrity checks and password storage
- **Salted Hashing** - adds random data (salt) before hashing to defeat rainbow-table attacks
- **Digital Signatures** - confirm sender identity and that data wasn't tampered with (non-repudiation)

## Risks and Weaknesses

Four common risk-handling strategies:

1. **Risk Avoidance** - steer clear of risky activities (e.g. not clicking suspicious links)
2. **Risk Mitigation** - reduce likelihood/impact (firewalls, antivirus, strong passwords)
3. **Risk Acceptance** - acknowledge a risk but decide it's manageable
4. **Risk Transference** - shift responsibility elsewhere (e.g. cyber insurance)

Humans remain the weakest link - phishing, ignored updates, and misconfigurations open more doors than technical flaws do.

## Social Engineering Tricks

1. **Phishing** - fake emails/sites that trick you into giving up credentials
2. **Spear phishing** - targeted, researched attacks (e.g. against execs/CEOs)
3. **Vishing** - phone/voicemail impersonation
4. **Tailgating** - physical social engineering, following someone through a secure door
5. **Typosquatting** - fake sites with misspelled domains (e.g. `g00gle.com`)

## The Pyramid of Pain

![Pyramid-of-pain](/logs/assets/pyramid.jpg)

A model (David Bianco) showing how much "pain" you cause an attacker by disrupting different parts of their operation - the higher up the pyramid, the harder it is for them to adapt:

| Level | Difficulty for attacker to replace |
|---|---|
| Hash values | Trivial |
| IP addresses | Easy |
| Domain names | Simple |
| Network/host artifacts | Annoying |
| Tools | Challenging |
| TTPs (tactics, techniques, procedures) | Tough |

Blocking hashes barely slows attackers down. Detecting their **behaviors (TTPs)** forces them to change their entire playbook - the most painful option for them.

## Cyber Kill Chain

Attackers follow a chain of steps: **Recon → Weaponization → Delivery → Exploitation → Installation → Command & Control → Actions on Objectives.**

Understanding the chain helps defenders stop attacks earlier - interrupt recon, block delivery, patch vulnerabilities, or detect suspicious C2 traffic before the attacker reaches their goal.

![cyber-kill-chain](/logs/assets/cyberkillchain.jpg)

**Steganography** hides secret data inside harmless files (e.g. embedding a message in an image) to smuggle information past casual inspection.

**Takeaway:** technology can't protect us from every attack. A single click on a malicious link can bypass the best firewalls - awareness and good habits are the best defense.
