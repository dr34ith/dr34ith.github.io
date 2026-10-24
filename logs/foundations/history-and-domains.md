
## Introduction

- **Cybersecurity (security):** the practice of ensuring confidentiality, integrity, and availability of information by protecting networks, devices, people, and data from unauthorized access or criminal exploitation.
- **Cloud security:** ensuring assets stored in the cloud are properly configured and access is limited to authorized users.
- **Internal threat:** a current/former employee, vendor, or trusted partner who poses a security risk.
- **Network security:** keeping an organization's network infrastructure secure from unauthorized access.
- **PII (Personally Identifiable Information):** any information used to infer an individual's identity.
- **SPII (Sensitive PII):** directly identifies an individual and could cause significant harm if leaked - SSN, driver's license/state ID, passport number, DNA profile, biometric identifiers, medical info, authentication info (passwords, password-reset info).

**Transferable skills** (apply to almost any field): analysis, problem solving, written & verbal communication.
**Technical skills** (needed for entry-level security analyst roles): data analysis, programming.

## History: Landmark Incidents

**1. Brain Virus (1986)** - first boot sector virus (MS-DOS)
- Hijacked the boot sector, hid the original by marking it bad
- Introduced stealth techniques; showed that intent doesn't matter, impact does


**2. Morris Worm (1988)** - first major internet worm
- Self-replication bug caused uncontrolled spread
- Chained multiple weaknesses (Sendmail, buffer overflow, weak creds, rsh)
- Defense in Depth fails if layers are individually weak; triggered creation of CERT and the first major cybercrime conviction

![morrisworm](logs/assets/morris.png)


**3. ILOVEYOU (2000)** - social engineering worm + credential stealer
- Human emotion + hidden file extensions as the trick
- Persist → spread via contacts → steal + destroy data
- Reinforced that humans are the easiest attack vector; technical defenses alone aren't enough

![ily](logs/assets/ily.webp)

**4. Equifax Breach (2017)** - massive data breach via a known vulnerability
- Ignored a critical patch (Apache Struts CVE)
- Exploit → web shell → lateral movement → data exfiltration
- One broken control (an expired SSL cert) blinded detection - a real-world collapse of Defense in Depth + Monitoring

![equifax](logs/assets/equifax.png)

## CISSP Security Domains (8 Domains)

1. **Security & Risk Management** - defines security goals, policies, procedures; governance, compliance, risk analysis
2. **Asset Security** - protects digital/physical assets; data classification, ownership, handling, retention
3. **Security Architecture & Engineering** - designs/implements secure systems using tools, frameworks, controls
4. **Communications & Network Security** - secures physical/wireless networks; firewalls, VPNs, IDS/IPS, secure protocols
5. **Identity & Access Management (IAM)** - controls access; identification, authentication, authorization, accountability
6. **Security Assessment & Testing** - audits, penetration testing, vulnerability assessments
7. **Security Operations** - day-to-day security activities; monitoring, incident response, investigations
8. **Software Development Security** - secure coding practices throughout the software lifecycle
![image](logs/assets/cisspdomain.jpg)
### CISSP Domains and Attack Types

- **Password Attacks** (Domain: Communication & Network Security) - brute force, rainbow table
- **Social Engineering Attacks** (Domain: Security & Risk Management) - phishing, smishing, vishing, spear phishing, whaling, social media phishing, BEC, watering hole, USB baiting, physical social engineering
- **Physical Attacks** (Domain: Asset Security) - malicious USB cable/flash drive, card cloning/skimming
- **Adversarial AI** (Domains: Communication & Network Security, IAM) - manipulating AI/ML systems
- **Supply-Chain Attacks** (Domains: Security & Risk Management, Security Architecture & Engineering, Security Operations) - exploiting vulnerabilities in third-party processes; can spread across organizations
- **Cryptographic Attacks** (Domain: Communication & Network Security) - birthday, collision, downgrade

## Security Frameworks

**Purpose:** protect PII, secure financial info, identify security weaknesses, manage organizational risks, and align security with business goals.

**Four core components of a framework:**
1. Identifying and documenting security goals
2. Setting guidelines to achieve security goals
3. Implementing strong security processes
4. Monitoring and communicating results

**Compliance:** adhering to internal standards and external regulations.
**Security lifecycle:** a constantly evolving set of policies and standards.

### Frameworks and Standards

- **NIST CSF / RMF** - U.S. voluntary frameworks for risk and cybersecurity management
- **FERC-NERC** - power grid security, Critical Infrastructure Protection standards
- **FedRAMP** - standardized cloud security for U.S. federal agencies
- **CIS Controls** - actionable safeguards for systems/networks
- **GDPR** - EU regulation protecting personal data and privacy
- **PCI DSS** - global standard for credit card data security
- **HIPAA** - U.S. law protecting patient health info (Privacy, Security, Breach rules)
- **HITRUST** - framework supporting HIPAA compliance
- **ISO Standards** - international standards for tech, manufacturing, management
- **SOC 1 / SOC 2** - reports assessing financial compliance, confidentiality, integrity, availability

## Controls, Frameworks, and Compliance

- **CIA Triad** - confidentiality, integrity, availability; foundation for security controls/policies
- **Controls** - safeguards to reduce risks/threats/vulnerabilities, implemented to meet security goals and compliance
- **Frameworks** - structured guidelines for risk management
- **Compliance** - adhering to internal standards and external regulations to meet legal/industry requirements

## Security Analyst Toolkit

- **SIEM Tools** - collect/analyze log data, alert on threats, dashboards for faster review; hosted on-premise (complex) or cloud (easier setup/maintenance)

![siem](logs/assets/siem.jpeg)

- **Network Protocol Analyzers (Packet Sniffers)** - capture/analyze network traffic, useful for detecting suspicious activity and troubleshooting


## Playbooks

Manuals guiding analysts through security tasks to ensure consistent procedures. Two key forensic playbooks:

- **Chain of Custody** - track evidence possession and movement
- **Protecting & Preserving Evidence** - handle volatile data, follow order of volatility, use copies to avoid altering originals
