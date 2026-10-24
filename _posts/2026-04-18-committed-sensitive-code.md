---
layout: post
title: "Committed Sensitive Code Writeup"
date: 2026-04-18 10:00:00 +0800
categories: [Walkthroughs, Forensics]
tags: [TryHackMe, Forensics, Git]
platform: TryHackMe
difficulty: Easy
author: dreaith
---

*"Wait, did I just push the flag to GitHub?"* In this TryHackMe CTF challenge, a developer accidentally committed sensitive code, but forgot where. I'll show you how I switched branches, compared commits, and uncovered a hardcoded password. By the end, you'll know why `git diff` is your best friend for forensic work. Let's dive in.

Room link: [tryhackme.com/room/committed](https://tryhackme.com/room/committed)

**Challenge Name:** Committed
**Category:** Forensics / Git
**Difficulty:** Easy
**Goal:** Find the sensitive code accidentally committed to the repository

## 1. Scenario

> One of our developers accidentally committed some sensitive code to our GitHub repository. We don't remember what or where. Can you track down what we accidentally committed?

We're given access to a VM with the repository files located at `/home/ubuntu/commited`. The archive `commited.zip` has been extracted, revealing a `.git` folder and project files (`Readme.md`, `main.py`).

## 2. Initial Reconnaissance
I first unzip the zip file. Basically, the `.git` folder gets disregarded if you unzip it in the CLI on some setups, so try renaming it to a different string before unzipping if it doesn't show up. I renamed mine as "others."


The files:

```
Readme.md   main.py   .git
```

After unzipping the archive:

```bash
unzip commited.zip
cd commited
ls
```


The output:

```
Readme.md   main.py   others/
```


![Readme.md open in Pluma, describing the "Commited" database management project](/assets/img/posts/committed/01-readme.png)
{: .shadow width="900" }


Git log (`master` branch):

```
commit 28c36211be8187d4be04530e339f51bbcc7ae22 (HEAD -> master)
Author: fumenoid <fumenoid@gmail.com>
Date:   Sun Feb 13 00:49:32 2022 -0800
    Finished

commit 9ecdc566de145f5c13da74673fa3432773692502
    Database management features added.
commit 26bcf1aa99094bf2fb4c9685b528a55838698fbe
    Create database logic added
commit b0eda7db60a1cb0aea86f053816a1bfb7e2d6c67
    Connecting to db logic added
commit 441daaaa600aef8021f273c8c66404d5283ed83e
    Initial Project.
```

Nothing suspicious yet. The sensitive data might be in another branch.

## 3. Branch Enumeration

To list all the branches:

```bash
git branch -a
```

Switching to the `dbint` branch (visible from the extracted `refs/heads/dbint` file):

```bash
git checkout dbint
git log
```

Output:

```
commit 4e16af9349ed8eaa4a29decd82a7f1f9886a32db (HEAD -> dbint)
    Reminder Added.
commit c56c470a2a9dfb5cfbd54cd614a9fdb1644412b5
    Oops
commit 3a8cc16f919b8ac43651d68dceacbb28ebb9b625
    DB check
commit 6e1ea88319ae84175bfe953b7791ec695e1ca004
    Note added
commit 9ecdc566de145f5c13da74673fa3432773692502
    Database management features added.
...
```

This branch has extra commits. The messages "Oops" and "DB check" suggest credentials may have been committed and later removed.

## 4. Hunting for the Leaked Secret

We use `git diff` to compare commits. The most interesting change appears when comparing commit `3a8cc16` (DB check) with its parent.

```bash
git diff 3a8cc16^..3a8cc16
```

Relevant part of the diff:

```diff
diff --git a/main.py b/main.py
index 54d0271..0e1d395 100644
--- a/main.py
+++ b/main.py
@@ -4,7 +4,7 @@ def create_db():
     mydb = mysql.connector.connect(
         host="localhost",
         user="root", # Username Goes Here
-        password="flag{a489a9dbf8eb9d37c6e0cc1a92cda17b}" # Password Goes Here
+        password="" # Password Goes Here
     )
```

Flag found! The password was hardcoded in the code and then removed in a later commit. But Git remembers everything.

![Full diff on the dbint branch showing the reminder comment about not hardcoding passwords, and the flag being removed](/assets/img/posts/committed/02-dbint-diff.png)
{: .shadow width="900" }

## 5. Retrieving the Flag

We can also check out the exact commit before removal:

```bash
git checkout 6e1ea88319ae84175bfe953b7791ec695e1ca004
cat main.py | grep password
```

## Conclusion

I found the leaked credential by switching to the `dbint` branch, examining the commit history, and using `git diff` on the "DB check" commit. The diff revealed a hardcoded MySQL password that had been removed in a later commit — but the flag was already exposed.

**Lesson:** Git is not a vault. Every commit lives forever unless you rewrite history (which is dangerous). Always scan your diffs before pushing, and use tools like `git-secrets` to prevent accidental leaks.
