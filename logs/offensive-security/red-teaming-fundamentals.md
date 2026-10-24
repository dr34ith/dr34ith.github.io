Hi there, glad to have you here! In this note, you'll learn the **basics of Red Teaming** — these resources are compiled from my own journey studying for the **CRTA (Certified Red Team Analyst)** certification. 



## 1.1 Red Teaming

**Red Team** → a group of hackers that test an organization's infrastructure. The attacks performed are **similar to real Threat Actor techniques** with malicious intent.

|Type|What it means|
|---|---|
|**Red Team Emulation**|Copy the exact attack techniques of a specific Threat Actor|
|**Red Team Simulation**|Mimic the _behavior_ of Threat Actors (no specific group targeted)|

**Red Team is divided into 3 groups:**

1. **Cyber** — Digital Attacks
2. **Social** — Social Engineering Attacks
3. **Physical** — Physical intrusion attacks


### Penetration Testing vs. Red Teaming

|                | Penetration Testing                                                                      | Red Teaming                                                             |
| -------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Definition** | Attack against host, network, or application to measure & identify risks of exploitation | Using real-world TTPs of threat actors to measure defense effectiveness |
| **Focus**      | Reducing exposed vulnerabilities                                                         | Training people & measuring defense capabilities                        |
| **Scope**      | Specific target                                                                          | Whole organization                                                      |
|                |                                                                                          |                                                                         |
 **Memory tip:** PenTest = _"Find the holes."_ Red Team = _"Can they stop a real attacker?"_



1. ==2 Red Team ATTACK LIFECYCLE==
```
[ 01 ] Extensive OSINT
          │ Gathering info about the target
          ▼
[ 02 ] Initial Access & Execution
          │ Using entry vectors to get inside the internal network
          │ + Executing attacker-controlled code on the machine
          ▼
[ 03 ] Persistence & Privilege Escalation
          │ Hidden techniques to stay in + gain higher-level permissions
          ▼
[ 04 ] Lateral Movement & Defense Evasion
          │ Moving from one compromised device to others on the same network
          │ While avoiding detection throughout the compromise
          ▼
[ 05 ] Discovery & Data Collection
          │ Figuring out the org environment
          │ Collecting files, directories, and any victim info
          ▼
[ 06 ] Exfiltration & High-Level Persistence
          Stealing data from the network/computer
          OR compressing & encrypting all collected data
```
***Memory tip:** **O-I-P-L-D-E** → "Old Italians Prefer Linguine, Don't Expect otherwise"*


## 1.3 Red Team Infrastructure
### C 2 Server (Command & Control)

Used by attackers to **maintain communications** with compromised systems inside the target network.

```
Threat Actor ──────► C2 Server ──────► Victim Machine
```

---

### Payload Server

A dedicated server that **hosts all malicious scripts and executables**. Both the attacker AND victim can access it (bi-directional).

```
                ┌──────────────────┐
                │  Payload Server  │
                └────────┬─────────┘
                         │ (Bi-directional)
               ┌─────────┴──────────┐
               ▼                    ▼
       [ Threat Actor ]      [ Victim Network ]
```

---

### Redirector Server

**Proxies all traffic** to your C 2 server — hides the real C 2 IP from defenders.

```
[ Victim Network ]
        │ (Beacons out)
        ▼
[ Redirector Server ]
        │ (Forwards traffic)
        ▼
[ C2 Server (Attacker Controlled) ]
```

>  **Why it matters:** If defenders catch the Redirector IP, your real C 2 is still safe.


### Adversary Emulation vs. Simulation

|               | Emulation                                                    | Simulation                                                         |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| **Concept**   | Imitating a *specific* real-world threat group (e.g., FIN10) | Making it look like a real attack with NO real adversary behind it |
| **Driven by** | Threat Intelligence — follow their known TTPs strictly       | The environment — use whatever works best to bypass defenses       |


###### Key Terms

| Term                                 | Definition                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| **APT** (Advanced Persistent Threat) | Stealthy threat actor that gains unauthorized access and remains **undetected** |
| **DMZ** (De-Militarized Zone)        | Network connecting hosts that interface with untrusted external networks        |
| **MZ** (Militarized Zone)            | Zone with maximum security — most secure segment in the environment             |


### TTPs (Tactics, Techniques & Procedures)

```
TACTICS             → The "WHY" — overall threat actor behavior/goal
    │
    ▼
TECHNIQUES          → The "HOW" — more detailed description of the behavior
    │
    ▼
PROCEDURES          → The "EXACTLY HOW" — highly detailed, step-by-step description
```

>  **Example:** Tactic = _Exfiltration_. Technique = _Exfil over C 2 channel_. Procedure = _Using DNS tunneling to encode data in queries every 30 seconds._

---

### Payloads

|Type|What it does|Example|
|---|---|---|
|**Singles**|Self-contained, does ONE specific task| `payload/windows/adduser` |
|**Stagers**|Small — downloads the large payload from attacker machine, creates network connection| `payload/windows/shell/bind_tcp` |
|**Stages**|Large payload downloaded BY the stager, does complex tasks (RDP, Meterpreter, etc.)| `payload/windows/shell/bind_tcp` |

>  **Memory tip:** Stager = _the delivery truck_. Stage = _the actual cargo_.

---

### Shells

**Shell** → Non-GUI interaction with a system. Lets you interact and manage the system environment.

|Type|Direction|How it works|
|---|---|---|
|**Reverse Shell**|Target → Attacker|Victim machine _calls back_ to attacker|
|**Bind Shell**|Attacker → Target|Attacker machine _connects to_ a port opened on victim|

>  **Memory tip:** Reverse = _"Victim dials your number."_ Bind = _"You dial the victim's number."_ Reverse shells are preferred because they **bypass firewalls** — outbound traffic is rarely blocked.

---

## 1.4 Enterprise Environment

### Web Server

Software that understands URLs & HTTP. Accessed through domain names, then delivers content to the end user.

```
[ PUBLIC INTERNET ]
        │
        ▼  (HTTP/HTTPS — Ports 80/443)
[ EXTERNAL FIREWALL ]         ← Blocks malicious/unwanted traffic
        │
        ▼
====== DMZ NETWORK ======
[ EXTERNAL WEB SERVER ]       ← Serves website content to the public
============================
        │
        ▼  (Only DB queries / Auth requests allowed out)
[ INTERNAL FIREWALL ]         ← Blocks everything except specific server requests
        │
        ▼
====== INTERNAL NETWORK ======
[ Database ] [ Workstations ] [ Internal Servers / AD ]
```

---

### Mail Server

Handles & delivers email over a network (usually the internet).

```
[ Email Client ]                                    [ Email Client ]
   (Outlook)                                           (Outlook)
       │                                                   ▲
       │ (1) SMTP — Push email out                         │ (4) POP3 — Fetch/Download email
       ▼                                                   │
[ SENDER'S MAIL SERVER ] ──(2) SMTP relay──► [ RECEIVER'S MAIL SERVER ]
  (Handles outgoing mail)   Server-to-Server    (Handles incoming mail)
```

---

### Database Server

Stores and manages databases. Central point for authorized data access.

```
[ Authorized Users ]    [ Applications (Web/Mail Servers) ]
          │                            │
          └──────────────┬─────────────┘
                         │ (Central Access Over Network)
                         ▼
              [ DATABASE SERVER (SQL-Server) ]
                • Central Management of Big Data
                • Controls Authorized Data Access
                         │
                         ▼ (Executes SQL Queries)
              [ THE LOGICAL DATABASE ]
               [Add Data] [Modify Data] [Delete Data]
```

---

### Bastion Host / Jump Server

A **highly secure stepping-stone computer** used to access a private network. Serves as a **"MIDDLEMAN"** before accessing sensitive info or databases.

```
[ ANYONE ON THE INTERNET ]
        │
        ▼
[ FIREWALL 1 ]               ← Blocks everyone from directly touching the private DB
        │
   ┌────┴────┐
   ▼         ▼
[BAD GUYS]  [YOU (Authorized)]
(Blocked)        │
                 │ (1) Log In & Verify Identity
                 ▼
        [ JUMP SERVER ]      ← Your secure stepping-stone
                 │
                 │ (2) Request access to the back
                 ▼
        [ FIREWALL 2 ]       ← Only trusts requests from the Jump Server
                 │
                 ▼
        [ PRIVATE DATABASE ] ← Safely hidden at the very back
```

---

### Automation Server

Automates software development processes (CI/CD pipelines, build automation, etc.).

---

## Active Directory (AD)

A **directory / database** that manages ALL resources in an organization. Think of it as the **central hub** for everything.

**Three focal points:**

1. **Manageability** — One place to manage all users, computers, policies
2. **Security** — Controls who can access what
3. **Interoperability** — Works across different systems/platforms

---

### I. AD Structure (The Russian Nesting Doll)

```
╔══════════════════════════════════════════════════════╗
║                FOREST (The Company)                  ║
║  ╔════════════════════════════════════════════════╗  ║
║  ║              DOMAIN (The Country)              ║  ║
║  ║  ╔══════════════════════════════════════════╗  ║  ║
║  ║  ║         OU / Org Unit (The City)         ║  ║  ║
║  ║  ║  ╔════════════════════════════════════╗  ║  ║  ║
║  ║  ║  ║         GROUP (The House)          ║  ║  ║  ║
║  ║  ║  ║  [ Users / Computers / Resources ] ║  ║  ║  ║
║  ║  ║  ╚════════════════════════════════════╝  ║  ║  ║
║  ║  ╚══════════════════════════════════════════╝  ║  ║
║  ╚════════════════════════════════════════════════╝  ║
╚══════════════════════════════════════════════════════╝
```

|Component|Definition|
|---|---|
|**Forest**|Single instance of AD — the entire company|
|**Domain**|Container within the Forest — like a country|
|**OU (Organizational Unit)**|Logical grouping of users, computers & resources — like a city|
|**Groups**|Collection of users or other groups — like a house|

---

### II. AD Objects (Entities)

1. Domain Users
2. Domain Groups
3. Domain Computers
4. **Domain Controllers** → Centrally located servers that respond to security authentication requests
5. Group Policy Objects (GPOs)
6. **TGT** (Ticket Granting Ticket) → Authentication
7. **TGS** (Ticket Granting Service) → Authorization

---

### III. AD Privileged Groups (Hierarchy)

```
 [ ENTERPRISE ADMINS ]
       │  Kings of the ENTIRE Forest
       │  • Only exists in the forest root domain
       │  • Automatically a Domain Admin in every child domain
       ▼
 [ DOMAIN ADMINS ]
       │  Rulers of a SINGLE Domain
       │  • Full admin access to all resources in their domain
       ▼
️ [ BUILTIN\ADMINISTRATORS ]
       │  Local Machine Bosses
       │  • Local administrator specifically on a Domain Controller
       ▼
️ [ OPERATOR GROUPS ]
       ├─► Server Operators   → Can administer/manage domain servers
       └─► Account Operators  → Can manage regular users (not privileged ones)
```

>  **Memory tip (top to bottom):** _"Every Domain's Best Operators"_

---

### IV. Kerberos Authentication

The **authentication protocol** used by Active Directory. Your password is never sent over the network.

**The Amusement Park Analogy **

```
[ Your Computer ]
       │ (1) Login with password
       ▼
[ Key Distribution Center (KDC) ]
       │ (2) Returns TGT — "Your Security Wristband"
       ▼
[ Your Computer ]
       │ (3) Trade TGT for a TGS — "Your Ride Ticket"
       ▼
[ Key Distribution Center (KDC) ]
       │ (4) Returns TGS ticket
       ▼
[ Your Computer ]
       │ (5) Present TGS to access the file server
       ▼
[ Corporate File Server ] ← Grants Access 
```

|Ticket|Analogy|Purpose|
|---|---|---|
|**TGT** (Ticket Granting Ticket)|Security Wristband at the gate|Proves you logged in successfully. Password discarded after this.|
|**TGS** (Ticket Granting Service)|Specific ride ticket|Grants access to ONE specific service/resource|

>  **Key point:** Your password is **thrown away from memory** after the TGT is issued — it can never be stolen off the wire.

---

### Kerberos Delegation

Allows authenticated domain user credentials to be **re-used** to access resources on a different server.

**Delegation = Impersonation** A middleman computer (e.g., a web server) temporarily **pretends to be you** to access a backend resource on your behalf.

```
 [ YOU ] ──(1. "Here is my ID")──► [ WEBSITE SERVER ]
                                             │
                                     (2. Pretends to be you)
                                             ▼
 [ YOU ] ◄──(3. Returns your files)◄── [ BACKEND DATABASE ]
```

---

### V. Domain Trusts

Types of Trust:

1. **Parent-Child** Trust Relationship
2. **Forest to Forest** Trust Relationship
3. **Tree-root** Trust Relationship

---

### VI. Authorization in Active Directory

**Authorization** = Is this user _permitted_ or _denied_ to access a specific resource?

**The Bouncer Analogy:**

```
 [ YOU ] (Domain User)
       │
       ▼
 [ YOUR ID WALLET ] contains:
    1. Your Name          → Individual SID
    2. Your Department    → Group SID (e.g., "Sound Crew")
    3. Special Key        → User Rights (e.g., "Can drive a golf cart")
       │
       ▼ (Walks up to a locked door)
 [ SECURITY GATE ] checks the door rules (ACL) using 2 systems:

     DACL (The Guard)    → Checks the guest list: "Sound Crew = ALLOWED. Actors = BLOCKED."
     SACL (The Camera)   → Records/audits: "Log everyone who enters."
```

|Component|Full Name|Role|
|---|---|---|
|**ACL**|Access Control List|The full set of rules on a resource|
|**DACL**|Discretionary ACL|Who is allowed or denied|
|**SACL**|System ACL|Who gets audited/logged|

---

## DMZ vs. Militarized Network

```
 [ PUBLIC INTERNET ]
        │
        ▼ (Outer Firewall)
 [ DMZ NETWORK ]              ← Public Web/Mail Servers live here
        │                          Accessible to everyone
        ▼ (Inner Firewall)         If hacker gets in here, they're STILL trapped
 [ MILITARIZED (INTERNAL) NETWORK ] ← Private data, AD, payroll
                                   Hidden & strictly guarded
```

>  **The house analogy:** DMZ = _the front porch where visitors wait._ Militarized Network = _the locked vault deep inside the house._
