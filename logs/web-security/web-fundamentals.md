
Let's now slow down to understand whats hapenning under the hood every time a browser talks to a server. This writeup covers the core building blocks of the web  HTTP/HTTPS, DNS, the client-server model, requests/responses, cookies, and sessions  and why each one matters from a security perspective.


## HTTP: The Language Everything Speaks

HTTP (Hypertext Transfer Protocol) is a **stateless** request-response protocol. Stateless means the server doesn't remember anything about you between requests; every request has to carry whatever context it needs.

The main methods I need to know:
- **GET**: retrieve a resource
- **POST**: submit data
- **PUT**: update a resource
- **DELETE**: remove a resource

A simple example: my browser sends `GET /index.html HTTP/1.1`, and the server responds with the HTML for that page. Every single web interaction, loading a page, submitting a login form, liking a post, is HTTP happening under the hood.

**Why it matters for security:** since HTTP is just plaintext, anything sent over plain HTTP (not HTTPS) can be read or altered in transit.

## HTTPS: HTTP With a Lock on It

HTTPS is HTTP wrapped in TLS/SSL encryption. Without it, everything, including passwords and cookies, travels in plaintext, meaning anyone on the network path (public wifi, a compromised router, etc.) could read it.

Example: when I submit a login form over HTTPS, my credentials get encrypted before they ever leave my browser.

Today, over 90% of web traffic is HTTPS, so when I see a browser flag "mixed content" warnings, that's a signal something on the page is still loading over plain HTTP, which is worth investigating.

## DNS: Turning Names Into Addresses

DNS translates human-readable domain names (like `tryhackme.com`) into machine IP addresses (like `10.10.10.10`) that computers actually use to connect.

The flow: browser to local resolver to authoritative DNS servers to IP address returned to browser connects.

**Security angle:** DNS attacks (like poisoning or spoofing) can redirect me to a malicious site *without the URL in my address bar ever changing*, which is a scary thought, since URL-checking is often my first line of defense as a user.

## Client-Server Model

This is the basic architecture of the web: the **client** (browser) requests resources, and the **server** processes and responds.

- The client handles UI and user interaction
- The server handles logic and data

Example: I send my login credentials as the client; the server validates them and sends back a session cookie.

One thing worth noting: modern apps (SPAs, single-page applications) blur this line a bit, since a lot of logic now runs client-side in JavaScript. That's actually relevant for attackers too, since client-side logic can sometimes be manipulated if the server doesn't double-check everything.

## Request Structure

Every request from the client to the server has three parts:
1. **Request line**: e.g. `GET /page`
2. **Headers**: e.g. `Host: example.com`
3. **Body** (optional): e.g. POST data

Full example:
```
POST /login HTTP/1.1
Host: bank.com
Content-Length: 24

user=admin&pass=123
```

This is the exact reason tools like Burp Suite exist: every attack starts by crafting or modifying a request, and Burp lets me intercept and change these before they hit the server.

## Response Structure

The server replies with a status code, headers, and an optional body.

Status code classes:
- **2xx**: success
- **3xx**: redirect
- **4xx**: client error
- **5xx**: server error

Example: `HTTP/1.1 200 OK` with an HTML body means the page loaded fine. A `404 Not Found` means the page doesn't exist.

**Security angle:** status codes leak information. A `403 Forbidden` vs a `404 Not Found` can tell an attacker whether a resource *exists but is protected* versus *doesn't exist at all*, a small detail with big implications during recon.

## Cookies

Cookies are key-value pairs the browser stores and sends along with every request to the same domain. Their purpose is to maintain state across an otherwise stateless protocol, things like session tracking or saved preferences.

Example: the server sends `Set-Cookie: sessionId=abc123`, and my browser automatically attaches that cookie to every future request to that site.

**Security angle:** this is exactly why session hijacking works. If an attacker steals my cookie, they can impersonate me without ever knowing my password.

## Sessions

Sessions are server-side stored state, tied to a session ID (usually delivered via a cookie). Since HTTP itself is stateless, sessions are how the server "remembers" that I'm logged in, what's in my cart, etc.

Example: the server maps session ID `abc123` to something like `user: admin, logged_in: true`.

**Security angle:** session fixation is a specific attack where an attacker forces a *known* session ID onto a victim, then waits for the victim to log in. At that point the attacker can just use that same known session ID to log in as them.

## Website Architecture

Putting it all together, a website is made of three layers:
1. **Frontend**: HTML/CSS/JS (what I see and interact with)
2. **Backend**: server-side code (the logic)
3. **Database**: where data actually lives

The flow: browser requests a page, backend queries the database, backend renders HTML, server returns it to the client.

Example: I type something into a search bar; that query gets sent to the backend; the backend runs a SQL query; matching results come back and get rendered.

**Why this matters:** each layer has its own distinct attack surface. XSS lives in the frontend, SQL injection lives in the backend/database layer. Understanding the flow helps me understand *where* to look for each class of vulnerability.

## Memory Hooks (for quick recall)

| Concept | Analogy |
|---|---|
| HTTP | A postcard: anyone along the way can read or alter it |
| HTTPS | A sealed envelope: contents are protected in transit |
| Cookies | A wristband at a theme park: identifies you between rides |
| Sessions | A locker with a number: the server holds your stuff, you just hold the key |

## Summary Table

| Concept | Key Point | Attack Angle |
|---|---|---|
| HTTP | Plaintext request/response | Sniff/modify traffic |
| HTTPS | Encrypted channel | SSL stripping, cert issues |
| DNS | Name-to-IP resolver | Poisoning, spoofing |
| Client-Server | Browser talks to backend | Attack either side |
| Request | Client asks | Parameter tampering |
| Response | Server answers | Information disclosure |
| Cookies | Client-side storage | Theft, fixation |
| Sessions | Server-side memory | Hijacking, prediction |
| Architecture | Layers compose the app | Attack the weakest layer |

## Takeaways

Going through this made it click for me why so many attacks are really just "abusing trust" at some layer of this stack:
- Trusting that a client won't tamper with a request (parameter tampering, IDOR)
- Trusting that DNS resolution is accurate (poisoning)
- Trusting that a cookie/session ID actually belongs to who it says it does (hijacking, fixation)
- Trusting that data flowing between layers is "just data" and not code (XSS, SQLi)

Every vulnerability I'll study after this basically boils down to one of these trust assumptions breaking somewhere in the request/response cycle.