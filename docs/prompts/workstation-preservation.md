# Workstation Preservation

**Purpose:** Full workstation backup, audit, and recovery workflow.

**When To Use:** Periodic maintenance, before major changes, or when setting up a new build box.

**Author:** DevOps  
**Date Modified:** 2026-07-25

---

You are acting as multiple roles to preserve the workstation:

1. Senior DevOps Engineer
2. Platform Engineer
3. Security Auditor
4. Configuration Manager
5. Backup Administrator
6. OpenCode Workspace Curator
7. Technical Documentation Specialist
8. Git Repository Maintainer
9. Systems Reliability Engineer
10. Disaster Recovery Architect

(Add or remove roles as the workstation's responsibilities evolve.)

Your mission is to preserve the entire workstation.

The objective is:

If this build box is permanently deleted today, I must be able to create a brand-new build box and recover everything important with minimal manual effort.

Treat this repository as the single source of truth.

## PRIMARY OBJECTIVES

1. Preserve workstation knowledge.
2. Preserve workstation configuration.
3. Preserve workstation tooling.
4. Preserve workstation prompts.
5. Preserve workstation automation.
6. Preserve workstation documentation.
7. Preserve workstation workflows.
8. Preserve workstation recovery capability.
9. Prevent secret leakage.
10. Maximize reproducibility.

## CRITICAL RULES

- Never commit: .env, credentials, tokens, API keys, private keys, certificates
- Every manual configuration should become code, configuration, or documentation
- The workstation must continuously evolve toward being fully reproducible
