---
title: Bandit (OverTheWire)
date: 2026-07-29
tags: [ctf, overthewire, linux, bandit, wargame, fundamentals]
category: challenges
categoryLabel: Challenges
cover: /logs/assets/bandit/cover.png
---

Hello there! Bandit is OverTheWire's entry-level wargame  the one built to teach the basic Linux command-line skills every other wargame on the platform assumes you already have. It's 33 levels, each one handing you the password for the next once you've solved it. Below are my full notes, commands, and screenshots as I worked through it end to end.

## Getting Started

![Bandit host information](/logs/assets/bandit/level00.png)

```
Host: bandit.labs.overthewire.org
Port: 2220

To connect in cli:
ssh banditX@bandit.labs.overthewire.org -p 2220

Replace X with your current level number. Passwords are given by the previous level.
```

## Level 0 : First Step

The password for the next level is stored in a file called `readme` located in the home directory. Commands I needed here: `ls`, `cd`, `cat`, `file`, `du`, `find`.

```
ssh bandit0@bandit.labs.overthewire.org -p 2220
# password: bandit0
ls
cat readme
```

Password for bandit1: `6y2kwnwK6grgvwvpvLaa2T1cpFEKOhNR`

## Level 1 : Dash & Cat

The password is in a file named `-` in the home directory. A dash is often interpreted as a command option, so it needs special handling to read it.

```
cd home/bandit1
ls
cat ./-
```

I used an explicit `./` prefix here to stop the dash from being treated as an option. `cat -- -` or `cat "$(pwd)/-"` both work too.

Password for bandit2: `PK8fYLZg2hnHSz83plBL1iEPKdD3QToB`

## Level 2 : Spaces in the File

![Bandit level 2 — ls -la showing the spaces filename](/logs/assets/bandit/level02.png)

The password is stored in a file called `spaces in this filename`. The filename contains spaces, so it has to be quoted or escaped properly.

```
cat ./--spaces\ in\ this\ filename--
```

The `./` prefix makes the argument a path, so the leading `--` is no longer the first character of the command and won't be mistaken for an option. Shell tab-completion will also insert the `./` and escape the spaces automatically. Another method is to use `--` before the filename, which tells the command "no more options follow, everything after this is a filename."

Password for bandit3: `7ZZ2LFrykP2zEyvBl4m3clcL7tGYJPME`

## Level 3 : The Hidden File

![Bandit level 3 — inhere directory listing](/logs/assets/bandit/level03.png)

The password for the next level is stored in a **hidden file** inside the `inhere` directory.

```
cd inhere
ls -la
cat ...Hiding-From-You
```

Files that begin with a dot are hidden in Linux  a normal `ls` skips them, but `ls -la` (list all, long format) reveals them. This particular filename starts with three dots, so it's not even the standard single-dot hidden file convention.

Password for bandit4: `xzTXq1rDJQVVAzdv5cHq1TQytTWufAMq`

## Level 4: The Human-Readable File Among Many

![Bandit level 4 — home directory listing](/logs/assets/bandit/level04.png)

Ten files inside `inhere`, all named with a leading dash, which makes them tricky because commands interpret the filename as an option unless handled properly. Only one of them is human-readable.

```
file ./*
cat ./-file07
```

`./*` expands to `./-file00`, `./-file01`, and so on  because the path now starts with `./`, the dash is no longer the first character, so `file` treats each one as a normal filename instead of an option. Running `file` against all of them at once shows which one comes back as ASCII text instead of "data."

Password for bandit5: `6C7h9GD8M6ai5nr7wo1RonrzFjj9yIrG`

## Level 5: Finding a Needle in a Haystack by Size

![Bandit level 5 — inhere with 20 subfolders](/logs/assets/bandit/level05a.png)

The password file somewhere under `inhere` has all of these properties: human-readable, 1033 bytes in size, not executable. `inhere` has 20 subfolders this time, each with a handful of files some with spaces, some hidden, some starting with dashes. Manually checking all of them would take forever, so I let `find` do the filtering instead.

```
find . -type f -size 1033c
```

`-type f` means "only regular files" (skips directories and other special files), and `-size 1033c` means "exactly 1033 bytes" (`c` = bytes). `find` also sees hidden files by default, so nothing slips through unnoticed.

![Bandit level 5 — find command result](/logs/assets/bandit/level05b.png)

Password for bandit6: `pXa26xhMWaC2SvDotA4r9EgZkulOeSBW`

## Level 6: The Server-Wide Search

![Bandit level 6 — find/du across the filesystem](/logs/assets/bandit/level06.png)

This time the password file could be anywhere on the whole server. The only clues: owned by user bandit7, owned by group bandit6, exactly 33 bytes.

```
find / -user bandit7 -group bandit6 -size 33c 2>/dev/null
```

The `-user`/`-group` flags narrow the search to files owned by bandit7:bandit6, and `-size 33c` demands the exact byte count. Redirecting stderr to `/dev/null` keeps the scan from being drowned out by a flood of "Permission Denied" errors, since we're scanning the entire filesystem as a regular user. This turned up a single hit in an unusual spot I'd never have stumbled on by casually browsing: `/var/lib/dpkg/info/bandit7.password`.

Password for bandit7: `Bmnnvf82KzQlfxgAI2d1zYbr1u9pr3E3`

## Level 7: The Line Next to a Keyword

The password is stored in `data.txt`, next to the word `millionth`. Commands that might help here: `man`, `grep`, `sort`, `uniq`, `strings`, `base64`, `tr`, `tar`, `gzip`, `bzip2`, `xxd`.

```
grep "millionth" data.txt
```

`data.txt` is a big file (a "millionth" of data, basically), so `grep` is the right tool it instantly fishes out the line containing that word instead of scrolling through everything manually.

Password for bandit8: `VR1ljMayciFxbnUokuQmJFw6QC9VKtub`

## Level 8: The Unique Line

Every program run on the CLI has 3 data streams connected to it  STDIN (input fed into the program), STDOUT (output printed by the program), and STDERR (error messages). Piping and redirection let you connect these streams between programs and files: a single `>` redirects output to a file (overwriting it), while `>>` appends without erasing what's already there.

![STDIN/STDOUT/STDERR data streams](/logs/assets/bandit/level08a.png)

The password is the only line in `data.txt` that occurs exactly once every other line is duplicated.

```
sort data.txt | uniq -u
```

Sorting groups identical lines together, and `uniq -u` then prints only the lines that have no duplicate neighbor. This pipeline is the standard go-to whenever a level asks for "the only line that occurs once."

![Bandit level 8 — data.txt directory listing](/logs/assets/bandit/level08b.png)

Password for bandit9: `EjmOSvuAu7sGAHqHVcBDPirRe9T03kxl`

## Level 9: Strings and the Equal Signs

![Bandit level 9 — data.txt directory listing](/logs/assets/bandit/level09.png)

`data.txt` here is mostly binary gibberish. The clue: the password is one of the few human-readable strings, and it's preceded by several `=` characters.

```
strings data.txt | grep "=="
```

Running `cat` directly would flood the terminal with unprintable junk, so `strings` pulls out only the readable sequences first. Piping that into `grep "=="` narrows it down to the handful of lines that actually have equal signs in them one of which is the password.

Password for bandit10: `B0s2khmbT9u0geKuOoVGW3JZKhndE3BG`

## Level 10: Base64 Decode

The password is stored in `data.txt`, which contains base64-encoded data.

```
base64 -d data.txt
```

Base64 is a binary-to-text encoding that represents every 6-bit chunk of data as one of 64 printable characters — which is exactly why it shows up so often in wargames for lightly obfuscating short strings. It's not encryption, just a reversible re-encoding, so the `-d` flag on `base64` reverses it instantly with no piping or extra filtering needed here.

![Base64 reference](/logs/assets/bandit/level10-ref-base64wiki.png)
![Base64 decode examples](/logs/assets/bandit/level10-ref-base64-stackoverflow.png)

Password for bandit11: `pYfOY6HwUsDj5rL9UvyhU7MCmv8vN5Ro`

## Level 11: ROT13 Rotation

![Bandit level 11 — data.txt directory listing](/logs/assets/bandit/level11b.png)

`data.txt` holds a string where every lowercase and uppercase letter has been rotated by 13 positions — a classic Caesar cipher.

```
cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```

`tr` maps every letter to the one 13 positions further along the alphabet, wrapping around as needed. ROT13 works because the Latin alphabet has 26 letters rotating by exactly half of that (13) means applying the same transform twice gets you back to the original text. It's not meant to be secure, just to obscure spoilers/text at a glance (Usenet used it for this decades ago), which is why `tr` alone is enough to break it.

![ROT13 reference](/logs/assets/bandit/level11-ref-rot13wiki.png)

Password for bandit12: `GROozWPO8QyN0mGrjUkID0WCYkZiQxrN`

## Level 12: Decompression Puzzle

![Bandit level 12 — starting the decompression chain](/logs/assets/bandit/level12a.png)

This one's a hex dump named `data.txt`, with the password buried under a whole stack of repeated compression and archiving.

```
mkdir /tmp/dreaith && cp data.txt /tmp/dreaith && cd /tmp/dreaith
xxd -r data.txt > data
file data
```

From there it's a repeating loop: check the file type with `file`, rename it to match the extension it reports, then run the matching tool `gzip -d`, `bzip2 -d`, or `tar xf`. In my case the chain went gzip → bzip2 → tar → gzip again → more tar and bzip2 layers before finally landing on a plaintext file.

![Bandit level 12 — mid-chain: bzip2 -d, file data](/logs/assets/bandit/level12b.png)

This level is really an exercise in patience and letting `file` guide each step of the chain.

Password for bandit13: `qQYQiHOBPR8zR61qxYqX45quvihF2uzk`

## Level 13: Private Key Login

The password for the next level lives in `/etc/bandit_pass/bandit14` and can only be read by user bandit14. Instead of a password, this level hands you a private SSH key — since the server blocks internal SSH connections, the key first has to be copied out to a local machine.

```
scp -P 2220 bandit13@bandit.labs.overthewire.org:sshkey.private ./sshkey.private
chmod 600 ./sshkey.private
ssh -i ./sshkey.private -p 2220 bandit14@bandit.labs.overthewire.org
cat /etc/bandit_pass/bandit14
```

SSH refuses to use a private key file with overly permissive permissions, hence the `chmod 600` before connecting. `scp` piggybacks on the SSH protocol for the transfer, so it needs the exact same host/port as the `ssh` command itself.

![scp / secure file transfer reference](/logs/assets/bandit/level13-ref-scpwiki.png)

Public-key authentication is the whole reason this level works the way it does: the server holds bandit14's *public* key, and only someone holding the matching *private* key can prove their identity no password ever has to cross the wire.

![Public/private SSH keys reference](/logs/assets/bandit/level13-ref-sshkeyswiki.png)

My first attempt tried connecting straight from inside the Bandit server, which just hung the fix was pulling the key out and connecting from my own machine instead:

![Bandit level 13 — first attempt failing from inside the server](/logs/assets/bandit/level13a.png)
![Bandit level 13 — chmod 600 + successful connection](/logs/assets/bandit/level13b.png)

Password for bandit14: `aaWecNkG4FhxJQxz07uiwzVP6bJiYS65`

## Level 14: Netcat Submission

![Bandit level 14 — bandit14 home directory](/logs/assets/bandit/level14.png)

The password for the next level can be retrieved by submitting the current password to port 30000 on localhost.

```
nc localhost 30000
# paste the bandit14 password, press enter
```

The server responds with `Correct!` followed directly by the password for bandit15 a straightforward first introduction to `nc` for talking to network services.

Password for bandit15: `pbLYuZtTg4MgaqfJx8jbA9gKKGqM68A7`

## Level 15: SSL/TLS Connection

![Bandit level 15 — SSH login banner](/logs/assets/bandit/level15a.png)

Same idea as level 14, but this time the service on port 30001 requires an encrypted connection.

```
openssl s_client -connect localhost:30001
# paste the bandit15 password after the handshake completes
```

Despite the self-signed certificate warning, the TLS handshake still succeeds, and sending the password through gets `Correct!` plus the next one back.

![Bandit level 15 — TLS handshake details (Protocol, Cipher, Session-ID)](/logs/assets/bandit/level15b.png)

Password for bandit16: `kS0Hf0u5HiXFwKMKFqXvPdOTNGGa0X8V`

## Level 16: Port Scanning and SSL Key Retrieval

The credentials for the next level can be retrieved by submitting the current password to a port on localhost somewhere in the range 31000–32000. First I had to find which of those ports had a server listening at all, then figure out which of those spoke SSL/TLS only one of them actually gives back the next credentials.

```
nmap -p 31000-32000 localhost
ncat --ssl localhost 31790
# send the bandit16 password
```

A port scan like this sends probes across a range of ports to see which ones respond, which is a completely normal step in both legitimate administration and this kind of enumeration — it's not inherently malicious, just information-gathering.

![Port scanner reference](/logs/assets/bandit/level16-ref-portscannerwiki.png)

Nmap revealed a handful of open ports in that range. Testing them manually one at a time with `ncat --ssl` (or `openssl s_client -connect localhost:<port>`), port 31790 responded to the password with a private RSA key instead of plaintext credentials.

![Bandit level 16 — nmap scan against the remote host](/logs/assets/bandit/level16a.png)
![Bandit level 16 — nmap scan against localhost](/logs/assets/bandit/level16b.png)

```
ssh -i bandit17_key -p 2220 bandit17@bandit.labs.overthewire.org
```

The key itself is the credential for the next level.

## Level 17: Diffing Two Files

![Bandit level 17 — retrieving the key locally](/logs/assets/bandit/level17a.png)

There are two files in the home directory: `passwords.old` and `passwords.new`. The password for the next level is in `passwords.new` and is the only line that's changed between the two.

```
diff passwords.old passwords.new
```

`diff` is the ideal tool for spotting exactly what changed between two otherwise-identical files it flagged a single line that differed, and the new value was the password.

![Bandit level 17 — logged out after solving](/logs/assets/bandit/level17b.png)

Password for bandit18: `OQxXZjELndr90zuhOTDYBEomI0SZITXI`

## Level 18: Bypassing a Modified Shell

![Bandit level 18 — forcing /bin/sh over SSH](/logs/assets/bandit/level18.png)

The password for the next level is in a file called `readme` in the home directory but someone modified `.bashrc` to log you out immediately upon SSH login, before you can even read it.

```
ssh -t bandit18@bandit.labs.overthewire.org -p 2220 /bin/sh
ls
cat readme
```

The `-t` flag allocates a pseudo-terminal, and forcing `/bin/sh` to run instead of the default shell means the malicious `.bashrc` never gets sourced in the first place.

Password for bandit19: `KpsOfPkcP7i1FlIExk2QEjyt6dw8dxZI`

## Level 19: Setuid Binary

The `setuid` and `setgid` flags let a user run an executable with the file's owner or group permissions instead of their own — a common way to grant temporarily elevated privileges for one specific task, without changing what the user is normally allowed to do everywhere else.

![setuid/setgid reference](/logs/assets/bandit/level19-ref-setuidwiki.png)

To get to the next level, I had to use a setuid binary in the home directory — running it without arguments shows how to use it.

```
./bandit20-do id
./bandit20-do cat /etc/bandit_pass/bandit20
```

`bandit20-do` runs whatever command you give it with bandit20's privileges. Setuid binaries are a common privilege-escalation vector for exactly this reason — they let you act as another user without ever needing their password.

![Bandit level 19 — running bandit20-do](/logs/assets/bandit/level19b.png)

Password for bandit20: `bW9kBv5WC3P4yoDyf12LSdGuNz5ka6hY`

## Level 20: Network Setuid and Listening

![Bandit level 20 — suconnect usage](/logs/assets/bandit/level20a.png)

Bandit20 provides a setuid binary called `suconnect`, which connects to a TCP port, reads a line, and compares it against bandit20's password. If it matches, it sends back the password for bandit21.

```
# terminal 1
nc -lvp 1234
# terminal 2
./suconnect 1234
# back in terminal 1: paste the bandit20 password
```

Opening two terminals one listening with `nc`, the other initiating the connection with `suconnect` lets the binary's own logic hand the next password straight back to the listener.

![Bandit level 20 — two-pane connection](/logs/assets/bandit/level20b.png)

Password for bandit21: `RYVux2rHEm9tiXHmLFzuR7Vhx6AZQMEz`

## Level 21: Cron Job File Drop

![Bandit level 21 — locating cron.d](/logs/assets/bandit/level21a.png)

A program is running automatically at regular intervals from cron. The task is to look in `/etc/cron.d/` for the configuration and figure out what command is being executed.

```
ls /etc/cron.d
cat /etc/cron.d/cronjob_bandit22
cat /usr/bin/cronjob_bandit22.sh
```

The cron job runs `/usr/bin/cronjob_bandit22.sh` as bandit22 every minute (and at reboot). Reading the script shows it copies bandit22's password to a temp file and sets its permissions to world-readable.

![Bandit level 21 — cat /etc/cron.d/*](/logs/assets/bandit/level21b.png)

```
cat /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
```

Password for bandit22: `RYVux2rHEm9tiXHmLFzuR7Vhx6AZQMEz`

## Level 22: Cron Job with a Hashed Filename

![Bandit level 22 — checking cron.d as bandit22](/logs/assets/bandit/level22a.png)

Same idea as the previous level, but the cron script for bandit23 is intentionally easy to read — it uses `whoami` to set `myname`, then computes a target filename from `echo I am user $myname | md5sum | cut -d ' ' -f 1`.

```
myname=bandit23
echo I am user $myname | md5sum | cut -d ' ' -f 1
cat /tmp/8ca319486bfbbc3663ea0fbe81326349
```

Since the script runs as bandit23, I reproduced the exact same pipeline locally with `myname=bandit23` to get the same hash, then read the file it points to.

![Bandit level 22 — reproducing the md5sum pipeline](/logs/assets/bandit/level22b.png)

Password for bandit23: `gKXDTAXnIz3OBxiPjRZ2uqutUlPZrBsw`

## Level 23: Injecting a Script into Cron

![Bandit level 23 — reading cronjob_bandit23](/logs/assets/bandit/level23a.png)

This one requires writing my own first shell script. The cron job for bandit24 runs `/usr/bin/cronjob_bandit24.sh`, which processes every file in `/var/spool/bandit24/foo` and executes any of them that's owned by bandit23 with a 60-second timeout, forcibly killed if it hangs.

```
cat > /tmp/mysolution.sh << 'EOF'
#!/bin/bash
cat /etc/bandit_pass/bandit24 > /tmp/bandit24pass.txt
chmod 777 /tmp/bandit24pass.txt
EOF
chmod +x /tmp/mysolution.sh
cp /tmp/mysolution.sh /var/spool/bandit24/foo/mysolution.sh
cat /tmp/bandit24pass.txt
```

![Bandit level 23 — writing the drop-in script](/logs/assets/bandit/level23b.png)

Note: your script gets deleted right after cron executes it, so it's worth keeping a local copy around.

Password for bandit24: `hVQMk3lJNsmQ7VF3ubyrNNBom7BOgVXv`

## Level 24: Brute-Forcing a Pin

A **daemon** is a background process that runs without direct user control, usually handling one specific task — names ending in "d" are a common giveaway (`sshd` for SSH, `httpd` for web serving). The daemon behind this level was almost certainly built the standard way: fork off a child process, detach it from the controlling terminal, then sit there listening on its port.

![Daemon creation process reference](/logs/assets/bandit/level24-ref-daemonprocess.png)

A daemon on port 30002 wants the bandit24 password plus a secret 4-digit pin. There's no way to retrieve the pin except by brute-forcing all 10,000 combinations — and it doesn't require reconnecting each time.

![Bandit level 24 — setting up the pin-checker connection](/logs/assets/bandit/level24a.png)

```
for pin in {0000..9999}; do echo "hVQMk3lJNsmQ7VF3ubyrNNBom7BOgVXv $pin"; done | nc localhost 30002 | grep -v Wrong
```

Bash brace expansion (`{0000..9999}`) generates every 4-digit combination as a string, and piping the whole loop into a single persistent `nc` connection sends every guess one after another without reconnecting.

![Bandit level 24 — wall of "Wrong!" responses mid brute-force](/logs/assets/bandit/level24b.png)

Filtering with `grep -v Wrong` keeps the flood of rejected attempts out of view so the correct response stands out.

![Bandit level 24 — filtered result showing the correct password](/logs/assets/bandit/level24c.png)

Password for bandit25: `jHdv2ELQhT22BkprMNDjybZDAkw1zeBJ`

## Level 25: Escaping a Restricted Shell

Logging into bandit26 should be easy except the shell for that user isn't `/bin/bash`, it's something else entirely, and I had to find out what it was and how to break out of it.

```
cat /etc/passwd
```

![Bandit level 25 — /etc/passwd showing bandit26's restricted shell](/logs/assets/bandit/level25a.png)

Checking `/etc/passwd` showed bandit26's login shell is `/usr/bin/showtext`, a script that runs `more` on a text file and then exits. Shrinking the terminal window forces `more` to pause mid-output instead of printing everything and exiting immediately.

![Bandit level 25 — more paused on .bashrc](/logs/assets/bandit/level25b.png)

From that paused state, pressing `v` opens `vi` on the file, and inside `vi`:

```
:set shell=/bin/bash
:shell
```

That drops into a normal, unrestricted shell.

```
id
cat /etc/bandit_pass/bandit26
```

![Bandit level 25 — shell escape successful, id as bandit26](/logs/assets/bandit/level25c.png)

Password for bandit26: `STJLJBRRphMxKB392CT4iOr5CbzPU9ER`

## Level 26: Escaping More and Using a Setuid Binary

Once logged into bandit26 with the password from the previous level, the shell is the exact same restricted `showtext` script. Same escape as before — shrink the terminal, `v` into `vi`, set the shell, then `:shell`.

```
ls -la
./bandit27-do cat /etc/bandit_pass/bandit27
```

![Bandit level 26 — home directory listing, finding bandit27-do](/logs/assets/bandit/level26.png)

In the home directory there's a setuid binary, `bandit27-do`, which reads the next password directly with bandit27's privileges.

Password for bandit27: `STJLJBRRphMxKB392CT4iOr5CbzPU9ER`

## Level 27: Cloning a Git Repository from the Outside

Quick refresher on the Git mental model before diving in: a **working directory** is what you're actively editing, the **staging area (index)** is where changes wait before being committed, and the **repository** (`.git`) stores the full history of commits. **Remotes** are just repositories hosted elsewhere that you push to and pull from for collaboration.

![Git core mental model reference](/logs/assets/bandit/level27-ref-gitmentalmodel.png)

There's a git repository at `ssh://bandit27-git@bandit.labs.overthewire.org/home/bandit27-git/repo` on port 2220, using the same password as bandit27. Trying to clone it from inside the Bandit server always resolves to localhost, which is blocked:

![Bandit level 27 — clone attempt fails from inside the server](/logs/assets/bandit/level27b.png)

The clone has to happen from a local machine instead.

```
GIT_SSH_COMMAND="ssh -p 2220 -o PreferredAuthentications=password" git clone ssh://bandit27-git@bandit.labs.overthewire.org/home/bandit27-git/repo
cat repo/README.md
```

`GIT_SSH_COMMAND` forces password authentication over the non-standard port.

![Bandit level 27 — successful clone from a local machine](/logs/assets/bandit/level27c.png)

The cloned repo's `README.md` contains the password directly.

Password for bandit28: `y8Yd2ssKcpHpud7UvOSOxwamRMzIGIeQ`

## Level 28: Git History Forensics

Another repository, this time for bandit28-git. The password was committed once and then removed in a later commit — but Git history doesn't forget.

![Repository / working tree checkout reference](/logs/assets/bandit/level28a.png)

```
git log -p
git show HEAD~1:README.md
```

![Bandit level 28 — cloned repo listing](/logs/assets/bandit/level28b.png)

Diffing the current README against its previous version reveals the password that was deleted.

![Bandit level 28 — checking out the previous commit](/logs/assets/bandit/level28c.png)

This is a good reminder that Git history retains sensitive data even after it's been scrubbed from the current working tree — `git log` and `git show` are essential for recovering it.

Password for bandit29: `Em7eGtqaMySwNFjCpwzzHhLhospOcdt0`

## Level 29: Password in a Different Branch

This repository doesn't store the password on the `master` branch at all.

```
git branch -a
git checkout dev
cat README.md
```

![Bandit level 29 — cloning the repository](/logs/assets/bandit/level29a.png)
![Bandit level 29 — branch listing showing origin/dev](/logs/assets/bandit/level29b.png)

Listing all branches reveals a remote branch, `origin/dev`, that `master` doesn't have. Switching to it (`git checkout dev` or `git checkout -b dev origin/dev`) surfaces the README with the actual password — a reminder to look beyond the default branch when hunting for credentials.

Password for bandit30: `jq9Dfg2rXsfYsWMgFuKlXhphjdH7USgX`

## Level 30: Password in a Git Tag

![Bandit level 30 — git tag / git show secret](/logs/assets/bandit/level30.png)

Not in a file or a branch this time the password is stored inside an annotated Git tag.

```
git tag
git show secret
```

Tags are easy to overlook, but they can hold data just like commits, and `git show` reveals them directly.

Password for bandit31: `82NkymblpGBYmIXG6ZQ8YldBYstHpfUf`

## Level 31: Triggering a Server Hook via Push

This repository doesn't contain the password at all. Instead, its README instructs pushing a specific file to `master`: a file named `key.txt` containing exactly the text `May I come in?`.

```
git add -f key.txt
git commit -m "Add key.txt"
GIT_SSH_COMMAND="ssh -p 2220 -o PreferredAuthentications=password" git push origin master
```

A `.gitignore` rule blocks `*.txt` files by default, so a plain `git add` silently does nothing it has to be force-added with `-f`.

![Bandit level 31 — force-adding and committing key.txt](/logs/assets/bandit/level31a.png)

The push itself then gets rejected by a pre-receive hook on the server side, but the rejection message printed back to the terminal includes the next password anyway.

![Bandit level 31 — push rejected, password revealed in the hook output](/logs/assets/bandit/level31b.png)

This level shows that server-side hooks can validate incoming data and hand back secrets without the repository ever storing them.

Password for bandit32: `pWuj5jBQ6IgV0NXwiH6g1pXRF8S1YvbT`

## Level 32: Uppercase Shell Escape

After all the git levels, one more escape. Logging into bandit32 drops you into a shell that converts all input to uppercase — commands like `ls`, `cat`, and `sh` become `LS`, `CAT`, `SH` and simply fail.

```
$0
id
cat /etc/bandit_pass/bandit33
```

![Bandit level 32 — $0 escapes the uppercase filter](/logs/assets/bandit/level32.png)

Typing `$0` at the prompt launches a normal, unrestricted shell. `$0` expands to the name of the current shell (e.g. `/bin/sh`) through shell parameter expansion, and that expansion happens *before* the uppercase filter ever gets a chance to touch the input which is exactly what lets it bypass the filter entirely.

Password for bandit33: `u4P2CyPOwPGLe94RdD9Uo2FxFwvnFswM`

## Level 33: The Final Congratulations

Logging into bandit33 turns up only a `README.txt`.

```
cat README.txt
```

![Bandit level 33 — the final congratulations message](/logs/assets/bandit/level33.png)

No more passwords to find that's the end of Bandit. 33 levels covering file permissions, text processing, networking, cron jobs, Git repository forensics, restricted-shell escapes, and setuid binaries. A solid warm-up before the more specialized OverTheWire wargames.
