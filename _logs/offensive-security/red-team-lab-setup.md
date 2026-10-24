---
title: Red Team Lab Setup
date: 2026-06-08
tags: [redteam, lab, activedirectory]
category: offensive-security
categoryLabel: Offensive Security
cover: /logs/assets/red-team-lab-setup/01.png
---

Start the Set-up : 2026-06-08

Finished the Set-up : 2026-06-10

----

Hello there! I set up this lab while preparing for the CRTA examination, and I'm happy to say I passed the exam! I enjoyed the experience so much that I intentionally didn't send all flags.On That way, I can revisit the lab exam for a second run and still have challenges left to solve. It makes the experience just as enjoyable the next time around.

These notes may not be very detailed, but they include plenty of screenshots documenting the steps I took throughout the setup process. My goal was to create a visual reference that makes it easier to follow and revisit the environment whenever needed.

#### I. External Set-up Lab
The setup : 
![Lab setup screenshot 1](/logs/assets/red-team-lab-setup/01.png)



```
[ PHASE 1: UNTRUSTED ]           [ PHASE 2: FOOTHOLD ]            [ PHASE 3: COMPROMISED ]
   Outside / Public IP             DMZ / Middle Bridge             Inside / Private IP
     (192.168.50.0/24)              (Dual-Homed Host)               (10.10.10.0/24)
            │                               │                               │
┌───────────┴───────────┐         ┌─────────┴─────────┐           ┌─────────┴─────────┐
│      KALI LINUX       │         │    WEB SERVER     │           │ DOMAIN CONTROLLER │
│     (192.168.50.2)    │         │  (192.168.50.3)   │           │   (10.10.10.2)    │
└───────────┬───────────┘         └─────────▲─────────┘           └─────────▲─────────┘
            │                               │                               │
            │  (1. Exploits Web App Flaw)   │                               │
            └───────────────────────────────┘                               │
                                            │                              │
                                            │  (2. Uses Web Server NIC)    │
                                            └─────[ 10.10.10.5 ]───────────┤
                                                                          │
                                                                          ▼
                                                                  ┌───────────────────┐
                                                                  │    APP SERVER     │
                                                                  │   (10.10.10.3)    │
                                                                  ├───────────────────┤
                                                                  │  EMPLOYEE SYSTEM  │
                                                                  │   (10.10.10.4)    │
                                                                  └───────────────────┘
```

Edit the Virtual Editor : 
![Lab setup screenshot 2](/logs/assets/red-team-lab-setup/02.png)

![Lab setup screenshot 3](/logs/assets/red-team-lab-setup/03.png)




Webserver/Metasploitable : 
![Lab setup screenshot 4](/logs/assets/red-team-lab-setup/04.png)

![Lab setup screenshot 5](/logs/assets/red-team-lab-setup/05.png)

Then restart : 
![Lab setup screenshot 6](/logs/assets/red-team-lab-setup/06.png)

ifconfig to check : ![Lab setup screenshot 7](/logs/assets/red-team-lab-setup/07.png)


IP Allotment : 

![Lab setup screenshot 8](/logs/assets/red-team-lab-setup/08.png)


Kali Network Adapter : 
![Lab setup screenshot 9](/logs/assets/red-team-lab-setup/09.png)

![Lab setup screenshot 10](/logs/assets/red-team-lab-setup/10.png)

![Lab setup screenshot 11](/logs/assets/red-team-lab-setup/11.png)

To check if kali is connected to the Web Server / Metasploitable:
![Lab setup screenshot 12](/logs/assets/red-team-lab-setup/12.png)


### II. Internal Set-up Lab
![Lab setup screenshot 13](/logs/assets/red-team-lab-setup/13.png)


Installation of 3 windows: 
![Lab setup screenshot 14](/logs/assets/red-team-lab-setup/14.png)
*Using Windows Server 2016 for the Domain Controller Setup, Windows 10 as our Employee-Machine and Windows Server 2012 as Application Server*

• Domain Controller [10.10.10.2] 
• Employee-Machine [10.10.10.4] 
• Application Server [10.10.10.3]



##  THE 3 VM setup (Windows)

The course uses **2 separate VMnets** in VMware:

|VMnet|Network|Who's on it|
|---|---|---|
|**VMnet 2** (vLan 1)|192.168.50.0/24|Kali Linux (192.168.50.2) + Web Server (192.168.50.3)|
|**VMnet 3** (vLan 2)|10.10.10.0/24|Domain Controller, App Server, Employee, Web Server|


### Step 1 — Create the VMnets in VMware

On your **host PC**:

1. Open VMware → **Edit → Virtual Network Editor**
2. Click **"Add Network"** → select **VMnet 2** → type: **Host-only** → Subnet: `192.168.50.0` mask `255.255.255.0`
3. Click **"Add Network"** → select **VMnet 3** → type: **Host-only** → Subnet: `10.10.10.0` mask `255.255.255.0`
4. **Uncheck DHCP** on both — you want static IPs only
5. Click **Apply → OK**




### Step 2 — Assign VMnets to Each VM

Power off each VM first, then go to **VM Settings → Network Adapter:**

|VM|Set Network Adapter to|
|---|---|
|Domain Controller (Win Server 2016)|**VMnet 3**|
|Application Server (Win Server 2012)|**VMnet 3**|
|Employee Machine (Windows 10)|**VMnet 3**|



### Step 3 — Set Static IPs Inside Each VM

######  Domain Controller — `10.10.10.2`

Once Windows Server 2016 is installed and at the desktop:

1. Right-click Network icon → **Open Network & Sharing Center**
2. Click **Change adapter settings** → right-click NIC → **Properties**
3. Double-click **IPv 4** → set:

```
IP:       10.10.10.2
Subnet:   255.255.255.0
Gateway:  (leave blank)
DNS:      127.0.0.1
```


![Lab setup screenshot 15](/logs/assets/red-team-lab-setup/15.png)


Checking if it reflects now/correct IP.
![Lab setup screenshot 16](/logs/assets/red-team-lab-setup/16.png)


Go to server manager.
![Lab setup screenshot 17](/logs/assets/red-team-lab-setup/17.png)

![Lab setup screenshot 18](/logs/assets/red-team-lab-setup/18.png)

Select server role.
![Lab setup screenshot 19](/logs/assets/red-team-lab-setup/19.png) ![Lab setup screenshot 20](/logs/assets/red-team-lab-setup/20.png) 
Restart & click Install.
![Lab setup screenshot 21](/logs/assets/red-team-lab-setup/21.png)

![Lab setup screenshot 22](/logs/assets/red-team-lab-setup/22.png)

![Lab setup screenshot 23](/logs/assets/red-team-lab-setup/23.png)

![Lab setup screenshot 24](/logs/assets/red-team-lab-setup/24.png)

![Lab setup screenshot 25](/logs/assets/red-team-lab-setup/25.png)

######  Employee Machine — `10.10.10.4`

Same steps, set:

```
IP:       10.10.10.4
Subnet:   255.255.255.0
Gateway:  10.10.10.2
DNS:      10.10.10.2  ← Must point to DC!
```


==Employee Machine: ==
I run the on my own device the Media Creation tool exe to execute a new "ISO FILE".
![Lab setup screenshot 26](/logs/assets/red-team-lab-setup/26.png)

That media exe file generate now into Windows ISO.
![Lab setup screenshot 27](/logs/assets/red-team-lab-setup/27.png)

![Lab setup screenshot 28](/logs/assets/red-team-lab-setup/28.png)


Network Adapter into "int"
![Lab setup screenshot 29](/logs/assets/red-team-lab-setup/29.png)

![Lab setup screenshot 30](/logs/assets/red-team-lab-setup/30.png)

![Lab setup screenshot 31](/logs/assets/red-team-lab-setup/31.png)

I try to connect to domain controller (already setup na and i just want to check if theyre connected) , but it was "request timeout" cause theirs a firewall blocking (but that's fine). I'll set up next is the Application Server
![Lab setup screenshot 32](/logs/assets/red-team-lab-setup/32.png)

![Lab setup screenshot 33](/logs/assets/red-team-lab-setup/33.png)
![Lab setup screenshot 34](/logs/assets/red-team-lab-setup/34.png)

![Lab setup screenshot 35](/logs/assets/red-team-lab-setup/35.png)







######  Application Server — `10.10.10.3`

Same steps, set:

```
IP:       10.10.10.3
Subnet:   255.255.255.0
Gateway:  10.10.10.2
DNS:      10.10.10.2
```


==Application Server==
![Lab setup screenshot 36](/logs/assets/red-team-lab-setup/36.png)


![Lab setup screenshot 37](/logs/assets/red-team-lab-setup/37.png)

![Lab setup screenshot 38](/logs/assets/red-team-lab-setup/38.png)

![Lab setup screenshot 39](/logs/assets/red-team-lab-setup/39.png)

![Lab setup screenshot 40](/logs/assets/red-team-lab-setup/40.png)


---

### Step 4 — Test Connectivity

After setting IPs, open CMD on each VM and ping the others:

```
ping 10.10.10.2   ← from Employee/AppServer
ping 10.10.10.3
ping 10.10.10.4
```

All should reply if VMnet 3 is set correctly.


-----

==DOMAIN CONTROLLER==
### Step 5 - Create employee acc
![Lab setup screenshot 41](/logs/assets/red-team-lab-setup/41.png)


View > Advanced Features
![Lab setup screenshot 42](/logs/assets/red-team-lab-setup/42.png)


right click > manage
![Lab setup screenshot 43](/logs/assets/red-team-lab-setup/43.png)

Then to create a new user. Click user > new object > user
![Lab setup screenshot 44](/logs/assets/red-team-lab-setup/44.png)

![Lab setup screenshot 45](/logs/assets/red-team-lab-setup/45.png)

Successfully, we just now created a new employee user.
![Lab setup screenshot 46](/logs/assets/red-team-lab-setup/46.png)

### STEP 6 - Employee Machine  (Log in as a new user)

We will be using the account that we just created on the step 5.
![Lab setup screenshot 47](/logs/assets/red-team-lab-setup/47.png)

![Lab setup screenshot 48](/logs/assets/red-team-lab-setup/48.png)

### STEP 7 - Change the domain & computer name of Application Server

files -> This pc (Right click) -> System (Change Settings) -> change the Computer name & domain.
![Lab setup screenshot 49](/logs/assets/red-team-lab-setup/49.png)


![Lab setup screenshot 50](/logs/assets/red-team-lab-setup/50.png)


==TAKE NOTE! THESE 3 WINDOWS VMWARE MUST BE CONNECTED TO "VLAN 2 (INT)".==


### STEP 8 - Creation of new user at Domain Windows
![Lab setup screenshot 51](/logs/assets/red-team-lab-setup/51.png)

![Lab setup screenshot 52](/logs/assets/red-team-lab-setup/52.png)


### STEP 9 - Login as a new user (Application Server)
![Lab setup screenshot 53](/logs/assets/red-team-lab-setup/53.png)

![Lab setup screenshot 54](/logs/assets/red-team-lab-setup/54.png)

---

### SUMMARY

###### Purpose of the 3 Windows VMs in CRTA Lab

**Domain Controller (Windows Server 2016)**

This is the **heart of the internal network** that manages all authentication and authorization for the `cyberwarfare.corp` domain. It runs **Active Directory Domain Services (AD DS)** which controls user accounts, passwords, and group policies for all domain-joined machines. In red teaming, this is the **ultimate target** — if you compromise the Domain Controller, you own the entire network.

**Employee Machine (Windows 10)**

This simulates a **regular employee's workstation** inside the company network, joined to the `cyberwarfare.corp` domain. It represents the typical **initial foothold target** after gaining access to the internal network through the web server. In red teaming exercises, this machine is used to practice **lateral movement, credential harvesting, and privilege escalation** techniques.

 **Application Server (Windows Server 2012 R 2)**

This simulates an **internal company server** that hosts business applications and services within the internal network. It is domain-joined to `cyberwarfare.corp` and represents a **high-value target** for attackers looking to move laterally after gaining initial access. In red teaming, compromising this server demonstrates the ability to **pivot deeper into the network** and access sensitive internal resources.