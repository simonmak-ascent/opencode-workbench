# Infrastructure Domain Primer

Loaded during Phase 2 (Strategy) when the vision involves deployment, hosting, CI/CD, observability, or platform engineering.

## Research Patterns

### Infrastructure Model Assessment
- **Deployment model**: single-region, multi-region, edge, hybrid cloud/on-prem
- **Compute model**: serverless (Lambda, Cloud Run), containers (ECS, GKE, AKS), VMs, bare metal
- **Scaling strategy**: vertical, horizontal, auto-scaling based on CPU/memory/requests/latency
- **Networking**: VPC design, subnet strategy, CDN, DNS, load balancers, API gateways

### Platform & Tooling Evaluation
- **CI/CD**:
  - GitHub Actions — tight integration with GitHub, large marketplace
  - GitLab CI — integrated Docker registry, environments
  - CircleCI — fast builds, parallelism
  - Buildkite — self-hosted agents, hybrid cloud
- **Container Orchestration**:
  - Kubernetes — industry standard, high complexity, maximum control
  - Nomad — simpler than K8s, supports non-container workloads
  - ECS/Fargate — AWS-native, serverless containers
  - Docker Compose — development, small production deployments
- **Infrastructure as Code**:
  - Terraform/OpenTofu — multi-cloud, declarative, large ecosystem
  - Pulumi — real programming languages, type-safe
  - CDK (AWS CDK, CDKTF) — higher-level abstractions
  - Ansible — configuration management, procedural
- **Service Mesh & API Gateway**:
  - Istio/Linkerd — zero-trust, mTLS, traffic splitting
  - Kong/APISIX — API gateway, rate limiting, auth plugins
  - Traefik — automatic service discovery, Let's Encrypt
- **Observability**:
  - Metrics: Prometheus + Grafana, Datadog, New Relic
  - Logging: Loki, Elasticsearch, CloudWatch, structured JSON logging
  - Tracing: Jaeger, Tempo, OpenTelemetry, Honeycomb
  - Alerting: Alertmanager, PagerDuty, Opsgenie
- **Secret Management**:
  - HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager, SOPS

### Reliability & Resilience
- **SLO/SLI definition**: availability (99.x%), latency (p95 < Xms), error rate (< Y%)
- **Disaster recovery**: RPO (recovery point objective), RTO (recovery time objective)
- **Backup strategy**: database, configuration, secrets, infrastructure state
- **Chaos engineering**: fault injection, dependency failure simulation
- **Capacity planning**: current load, growth rate, headroom, burst capacity

### Security Architecture
- **Network security**: VPC, security groups, WAF, DDoS protection
- **Identity & Access**: IAM roles (least privilege), service accounts, SSO
- **Encryption**: in transit (TLS 1.3), at rest (AES-256), key rotation
- **Compliance**: SOC 2, ISO 27001, HIPAA, PCI-DSS — which apply?
- **Supply chain**: dependency scanning, SBOM, signed artifacts, provenance

## Impact Verification

### Infrastructure Health Metrics
- Uptime/availability (% — measured against SLO)
- Deployment frequency (deploys/day)
- Change failure rate (% of deploys causing incidents)
- Mean time to recovery (MTTR — minutes from alert to resolution)
- Lead time for changes (minutes from commit to production)
- Infrastructure cost per request/user

### Developer Experience Metrics
- Time to first deploy (new developer → first PR merged)
- Build pipeline duration (commit to deployable artifact)
- Local development setup time (clone to running)
- Flaky test rate (% of test failures not caused by actual bugs)

### Impact-to-Vision Verification
For each vision goal that involves infrastructure:
- "Scales to millions of users" → measured by: load test results at 10x current traffic, auto-scaling response time
- "99.99% availability" → measured by: trailing 30-day uptime, incident count, MTTR
- "Ship features faster" → measured by: deploy frequency, lead time, pipeline duration

## Domain-Specific Constraints

- **Cost management**: Budget alerts, resource tagging for cost attribution, idle resource detection
- **Environment parity**: dev/staging/prod must use same IaC with parameterized scale
- **Immutable infrastructure**: never patch running instances — replace with new image
- **Zero-downtime deployments**: blue-green, canary, rolling updates
- **Secrets rotation**: automated rotation schedule for all credentials
- **Egress costs**: understand cloud provider data transfer pricing when designing multi-region
- **Compliance evidence**: automated evidence collection for audit (who deployed what when)

## Anti-Patterns Specific to Infrastructure

- Manual infrastructure changes (click-ops) — everything must be IaC
- Single point of failure — no load balancer, single AZ, single database
- Hardcoded IPs, endpoints, or credentials in configuration
- No staging environment — testing only in production
- Alert fatigue — too many alerts, no prioritization, no runbooks
- No disaster recovery plan or untested backups
- SSH-ing into production servers for debugging — use observability tools
- Root account usage for day-to-day operations — use IAM roles with least privilege
- Skipping dependency updates — unpatched CVEs in container images or libraries
- Configuration drift between environments — use same IaC, parameterized variables
