
OWASP, the Open Web Application Security Project, is the most widely adopted framework for identifying critical web application security risks. Rather than treating vulnerabilities as a random grab bag, OWASP organizes them into a "Top 10" list that gets periodically updated based on real-world breach data. Before getting into the individual categories, I wanted to anchor everything in the IAAA framework, since almost every OWASP category eventually traces back to one of these four pillars failing.

## IAAA Framework: The Foundation

IAAA stands for:
- **Identity**: having a unique account
- **Authentication**: proving that identity is really you
- **Authorisation**: being allowed to perform specific actions
- **Accountability**: logging who did what

The reason this matters so much: break just one link in this chain, and the entire trust chain collapses. Most breaches, when traced back far enough, come down to a failure at one of these four stages. Someone wasn't really who they claimed to be, or they were allowed to do something they shouldn't have been, or nobody was logging any of it so nobody noticed until it was too late.

With that lens in place, here's how the individual OWASP categories break down.

## Access Control and Authentication Failures

### A01: Broken Access Control

The server fails to verify a user's permissions on each individual request. If I change `?invoice_id=4567` to `?invoice_id=4568` and the server just hands over that invoice without checking whether it belongs to me, that's broken access control.

This leads to horizontal privilege escalation (accessing another user's data at the same permission level) or vertical privilege escalation (accessing admin-level functionality as a regular user).

**Defense:** ownership checks server-side, on every single request, deny by default, and use GUIDs instead of predictable sequential IDs.

**Memory hook:** a hotel keycard that opens any room. The design trusts the room number far too much.

### A07: Identification and Authentication Failures

This covers weak login flows: no rate limiting, session flaws, predictable credentials.

Example: if there's no rate limit on a login endpoint, a tool like Hydra can spray a wordlist like `rockyou.txt` against it and eventually land on something like `admin:password123`.

**Defense:** mandatory MFA, rate limiting, secure session handling, and avoiding verbose error messages that tell an attacker whether the username or the password was the wrong part.

**Memory hook:** a bouncer who actually checks ID, versus one who just trusts "I'm on the list."

### A09: Security Logging and Monitoring Failures

This one is sneaky because it's not really a vulnerability you exploit directly, it's a failure that lets everything else go unnoticed. No logs, unmonitored logs, or logs that can be tampered with all fall under this.

Example: an attacker exfiltrates 10GB of data and nothing fires because failed logins were never logged in the first place. Often the breach gets discovered by a customer or a regulator, not the internal security team.

**Defense:** log authentication events and privilege changes, centralize everything in a SIEM, and alert on anomalies rather than just storing logs no one reads.

**Memory hook:** a security camera with no tape in it, and no one watching the monitor anyway.

## Configuration, Supply Chain, and Design Failures

### AS02: Security Misconfiguration

Unsafe defaults, unnecessary features left enabled, or cloud storage left public.

Example: Tomcat installed with default credentials `tomcat:tomcat`, letting an attacker deploy a malicious WAR file straight through the admin panel.

**Defense:** harden configurations, remove unused features, and automate compliance scanning so this doesn't just quietly creep back in after every update.

**Memory hook:** front door locked, but the window is wide open.

### AS03: Software Supply Chain Failures

Vulnerabilities live in third-party libraries or the build pipeline itself, not in code I wrote.

Example: the Log4j vulnerability (`CVE-2021-44228`) sat inside a widely used Java logging library and led to remote code execution in thousands of applications that had no idea they were even exposed.

**Defense:** SBOM (software bill of materials) tracking, verifying signed artifacts, and continuously monitoring dependencies rather than checking once at install time.

**Memory hook:** a restaurant kitchen, food safety ultimately depends on suppliers you never see.

### AS04: Cryptographic Failures

Weak encryption, hardcoded keys, or missing TLS entirely.

Example: a password database storing MD5 hashes, which are trivially cracked today.

**Defense:** strong algorithms (AES-256, TLS 1.3), secure key storage using an HSM or KMS, and regular key rotation.

**Memory hook:** transparent wrapping paper, everyone can see the gift inside.

### AS06: Insecure Design

This is the hardest category to fix because the flaw is baked into the architecture from the start. You can't patch bad logic the way you patch a library.

Example: an API that assumes the mobile app is the only possible caller, with no check preventing an attacker from calling that API directly and skipping whatever validation the app was supposed to enforce.

**Defense:** threat modeling during the design phase, and abuse case testing (actively trying to think like an attacker before the product ships).

**Memory hook:** a building with cracks in the foundation, painting the walls won't fix that.

## Injection, Integrity, and Data Handling

### A05: Injection

Untrusted input gets treated as code or commands instead of plain data.

Examples: `' OR 1=1--` in a login field (SQL injection), or `<script>` tags submitted through a comment box (cross-site scripting).

**Defense:** parameterized queries, input validation, and output encoding.

**Memory hook:** letting a stranger speak at a podium as if they were you.

### A08: Software and Data Integrity Failures

Trusting code or data without verifying where it actually came from.

Example: a PHP application unserializes user input like `O:8:"Example":0:{}`, and that insecure deserialization leads to remote code execution.

**Defense:** code signing, verifying artifacts before trusting them, and runtime monitoring.

**Memory hook:** accepting a package from a stranger just because it has your name written on it.

### A03: Insecure Data Handling (2025 Focus)

Excessive data collection, no data minimization, weak storage practices.

Example: an API endpoint returns the full user object, including password hashes, when the frontend only ever needed the email address.

**Defense:** data minimization (only collect and return what's actually needed), encryption at rest, and strict access controls.

**Memory hook:** keeping the crown jewels in a cardboard box.



## Summary Reference Table

| Flaw | Root Cause | Key Test |
|---|---|---|
| A01 Access Control | Missing server-side checks | Parameter tampering |
| A07 Authentication | Weak identity proof | Credential brute-force |
| A09 Logging | No visibility | Trigger event, check logs |
| AS02 Misconfig | Unsafe defaults | Default creds, exposed services |
| AS03 Supply Chain | Third-party risk | Dependency scanning |
| AS04 Crypto | Weak encryption | Traffic inspection |
| AS06 Design | Architecture flaws | Business logic abuse |
| A05 Injection | Untrusted input | Payload fuzzing |
| A08 Integrity | Trust without verification | Deserialization |
| A03 Data Handling | Excess collection | Extract beyond need |

## Takeaways

Grouping these by theme instead of just memorizing a numbered list actually helped it stick:
- **Access and identity failures** (A01, A07, A09): the trust chain itself breaks down.
- **Configuration and design failures** (AS02, AS03, AS04, AS06): the system was built or set up wrong from the start.
- **Injection and data failures** (A05, A08, A03): untrusted input or excess data gets treated with more trust than it deserves.

Tying this back to the web fundamentals I covered earlier: almost every one of these categories is really just a different flavor of the same underlying problem, trusting something (a request, a config, a dependency, a piece of input) that shouldn't have been trusted without verification.