\# LOCALCHAMBERS\_TECH\_SPEC\_2026.md

\# LocalChambers.ai Master Technical Specification

\*\*Version:\*\* 2026.1.0 

\*\*Status:\*\* Master Reference Document 

\*\*Region:\*\* us-west1 (Mandatory)

\---

\#\# 1\. Architecture: The Three-Pillar Model

LocalChambers.ai is governed by the \*\*Three-Pillar Model\*\*, ensuring separation of concerns, scalability, and security.

\#\#\# Core Pillars:

1\.  \*\*The Vault (Identity & Security)\*\*

   \*   Centralized authentication and authorization.

   \*   Secure storage of user credentials and sensitive metadata.

   \*   Implementation of RBAC (Role-Based Access Control).

2\.  \*\*The Factory (Logic & Automation)\*\*

   \*   Processing engine for chamber operations.

   \*   Houses the \`ama-chamber-manager-agent\` logic.

   \*   Manages membership lifecycle, invoicing, and reporting.

3\.  \*\*The Storefront (Experience & Interface)\*\*

   \*   User-facing Next.js application.

   \*   Optimized for both Members and Chamber Administrators.

   \*   Responsive and accessible design via Tailwind CSS.

\---

\#\# 2\. Infrastructure & Security

\#\#\# Database Connectivity

\*   \*\*Mandatory Private IP:\*\* All database connections must utilize the \*\*10.83.0.3\*\* Private IP. Public IP access is strictly prohibited for production environments.

\*   \*\*VPC Peering:\*\* Ensure necessary VPC peering and connector configurations are active in the \`us-west1\` region.

\#\#\# Secret Management

\*   \*\*Google Secret Manager:\*\* All API keys, connection strings, and sensitive environment variables MUST be retrieved from Google Secret Manager. Hardcoded keys or standard \`.env\` files in production are non-compliant.

\---

\#\# 3\. Frontend Specification

\#\#\# Framework & Styling

\*   \*\*Framework:\*\* Next.js 15 (App Router).

\*   \*\*Styling:\*\* Tailwind CSS for consistent, premium UI development.

\#\#\# Dashboard Views

The application must provide two distinct dashboard experiences:

1\.  \*\*Member Dashboard:\*\* Focused on value delivery—membership perks, event registrations, and community interaction.

2\.  \*\*Chamber Admin Dashboard:\*\* Focused on operational efficiency—membership approvals, financial oversight, and chamber-wide communications.

\---

\#\# 4\. Backend & Core Logic

\#\#\# Foundation: \`ama-chamber-manager-agent\`

The core logic for staff and operational tasks is derived from the \`ama-chamber-manager-agent\`. This agent governs:

\*   Automated membership renewals.

\*   Staff workflow orchestration.

\*   Intelligent notification routing.

\---

\#\# 5\. Data Model: The "Who, What, Why"

The database schema must strictly link entities to answer the fundamental questions of chamber management:

\*   \*\*Who? (Users)\*\*

   \*   Individual identity records (AuthID, Email, Profile).

\*   \*\*What? (Memberships)\*\*

   \*   The contractual link between a User and a Chamber.

   \*   Defines tier level, status (Active/Lapsed), and expiration date.

\*   \*\*Why? (Chambers)\*\*

   \*   The organizational entity.

   \*   Attributes include Chamber Name, EIN, and administrative settings.

\*\*Relational Requirement:\*\* Every \`Membership\` record must map one \`User\` to one \`Chamber\`, establishing a clear audit trail for billing and access.

\---

\#\# 6\. Success Criteria

\*   Zero Public IP database traffic.

\*   100% Secret Manager utilization.

\*   Full Next.js 15 compatibility.

\*   Dual-dashboard logic separation.

