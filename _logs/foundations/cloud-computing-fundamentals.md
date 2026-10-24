---
title: Cloud Computing Fundamentals
date: 2026-05-06
tags: [cloud, aws, fundamentals]
category: foundations
categoryLabel: Foundations
cover: /logs/assets/cloud-computing-cover.png
---

## I. Benefits of Cloud Computing

- **Scalability** - easily scale resources up or down as demand changes
- **On-demand self-service** - instantly create or remove servers/storage without waiting for hardware
- **Pay-as-you-go** - costs based on actual usage, not upfront investment
- **Security** - providers implement strong infrastructure protections
- **High availability** - systems stay operational even if components fail
- **Global access** - applications are accessible worldwide

## II. Cloud Deployment Models

![image](/logs/assets/modelscloud.png)

- **Public Cloud** - shared infrastructure, affordable, highly scalable. Common for startups, websites, global apps.
- **Private Cloud** - dedicated to one organization; more control, customization, and compliance. Used by banks, healthcare, government.
- **Hybrid Cloud** - combines public and private; sensitive data stays private while public cloud handles scaling. Common in e-commerce and enterprises.

## III. Cloud Service Models

Using the "renting an apartment" analogy:

- **IaaS (Infrastructure as a Service)** - renting an empty apartment. You choose the furniture, install appliances, and handle maintenance. Rent virtual servers, storage, networking - you manage the OS/apps, provider manages hardware.
- **PaaS (Platform as a Service)** - renting a semi-furnished apartment. The basics are set up; you focus on living, not installing infrastructure. Provider manages infrastructure and OS - you build/deploy applications.
- **SaaS (Software as a Service)** - staying in a hotel. Everything is ready to use, cleaning/maintenance/services handled for you. Fully managed applications delivered via browser or app (e.g. Gmail, Zoom).

![image](/logs/assets/service.jpg)


## IV. Major Cloud Vendors

- **Amazon Web Services (AWS)** - industry leader with broad global reach
- **Microsoft Azure** - strong in enterprise and hybrid solutions
- **Google Cloud Platform (GCP)** - excels in analytics, AI, and machine learning
- **Alibaba Cloud** - major provider in Asia with global expansion
- **IBM Cloud** - focuses on hybrid cloud and AI-driven solutions
- **Oracle Cloud** - specializes in enterprise applications and databases

![image](/logs/assets/providers.webp)


## V. Basic AWS Terminology

- **EC2 (Elastic Compute Cloud)** - virtual servers in the cloud; each instance has CPU, RAM, and can run applications
- **Instance Types (e.g. t2, t3, m5)** - define the power and cost of an EC2 instance. Larger instances = more CPU/RAM = higher cost; smaller = less CPU/RAM = lower cost

## VI. Summary

| Term | Meaning |
|---|---|
| Public Cloud | Shared services accessible online |
| Private Cloud | Exclusive to one organization |
| Hybrid Cloud | Mix of public and private |
| IaaS | Rent basic computing resources |
| PaaS | Build/run apps without managing servers |
| SaaS | Use complete software online |
| EC2 | Amazon's virtual computers, scalable on demand |
