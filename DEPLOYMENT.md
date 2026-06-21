# Wanderlust — End-to-End DevSecOps + GitOps Deployment Guide

This guide walks you from zero to a running MERN travel blog on **AWS EKS**, with **Terraform** infrastructure, **Jenkins** CI/CD, **ArgoCD** GitOps, and optional **Prometheus/Grafana** monitoring.

It follows the architecture described in [README.md](./README.md).

## Architecture overview

```text
Developer → GitHub → Jenkins CI (scan, build, push) → Docker Hub
                              ↓
                    Jenkins CD (update k8s manifests in Git)
                              ↓
                         ArgoCD (sync Git → EKS)
                              ↓
              EKS: Frontend (31000) + Backend (31100) + MongoDB + Redis
```

| Layer | Tool | Purpose |
|-------|------|---------|
| Code | GitHub | Source of truth for app + manifests |
| IaC | Terraform | EC2 (Jenkins), EKS cluster, networking |
| CI | Jenkins + [Shared Library](https://github.com/Santosh-Pathak/jenkins-shared-libraries) | Trivy, OWASP, SonarQube, Docker build/push |
| CD | Jenkins + ArgoCD | GitOps — manifest tag bumps trigger EKS rollout |
| Runtime | Kubernetes on EKS | MERN stack + Redis cache |
| Observability | Helm (optional) | Prometheus + Grafana |

## Repository layout

```text
terraform/              # AWS infrastructure (EC2 + EKS)
kubernetes/             # App manifests (ArgoCD watches this path)
gitops/                 # ArgoCD Application + CD Jenkinsfile
Automations/            # Env IP injection scripts for CI
Jenkinsfile             # Wanderlust-CI pipeline
DEPLOYMENT.md           # This file
```

---

## Phase 0 — Prerequisites

1. **AWS account** with IAM user access keys configured locally (`aws configure`).
2. **Tools on your laptop**: Terraform ≥ 1.5, AWS CLI v2, Git.
3. **GitHub** repository: `https://github.com/Santosh-Pathak/WanderLust.git`
4. **Docker Hub** account for publishing images.
5. Basic Linux, kubectl, and Jenkins familiarity (helpful).

Recommended AWS region: **us-east-2** (matches Terraform defaults and README EKS examples).

---

## Phase 1 — Provision infrastructure with Terraform

All commands run from the `terraform/` directory.

### 1.1 Configure variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Verify the Ubuntu AMI for your region:

```bash
aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
  --query 'sort_by(Images,&CreationDate)[-1].ImageId' \
  --output text
```

### 1.2 Deploy

```bash
terraform init
terraform plan
terraform apply
```

Terraform creates:

- **Jenkins master EC2** — Jenkins, SonarQube, kubectl, ArgoCD CLI
- **Jenkins worker EC2** — CI agent with Docker + Trivy (IAM admin role attached)
- **EKS cluster** `wanderlust` — 2× `t2.large` nodes, Kubernetes 1.30
- **SSH key pair** — saved to `terraform/.generated/wanderlust-deployer.pem`

Save these outputs:

```bash
terraform output jenkins_master_public_ip
terraform output jenkins_worker_public_ip
terraform output configure_kubectl
terraform output ssh_private_key_path
```

### 1.3 Configure kubectl (on Jenkins master)

SSH to the master node, install AWS CLI and kubectl, then run:

```bash
aws eks update-kubeconfig --region us-east-2 --name wanderlust
kubectl get nodes
```

---

## Phase 2 — Prepare Jenkins master

SSH to **Jenkins master** (`terraform output jenkins_master_public_ip`).

### 2.1 Install Docker

```bash
sudo apt-get update
sudo apt-get install docker.io -y
sudo usermod -aG docker ubuntu && newgrp docker
```

### 2.2 Install Jenkins

```bash
sudo apt update -y
sudo apt install fontconfig openjdk-17-jre -y
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list
sudo apt-get update -y
sudo apt-get install jenkins -y
```

Open **http://\<master-public-ip\>:8080**, complete setup, install plugins:

- OWASP Dependency-Check
- SonarQube Scanner
- Docker Pipeline
- Pipeline: Stage View
- Email Extension

### 2.3 Run SonarQube

```bash
docker run -itd --name sonarqube -p 9000:9000 sonarqube:lts-community
```

Open **http://\<master-public-ip\>:9000**, login `admin/admin`, change password, create project key `wanderlust`, generate a token for Jenkins.

---

## Phase 3 — Prepare Jenkins worker

SSH to **Jenkins worker** (`terraform output jenkins_worker_public_ip`).

### 3.1 Install Java, Docker, Trivy, AWS CLI

```bash
sudo apt update -y
sudo apt install fontconfig openjdk-17-jre docker.io -y
sudo usermod -aG docker ubuntu && newgrp docker

sudo apt-get install wget apt-transport-https gnupg lsb-release -y
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update -y && sudo apt-get install trivy -y
aws configure
```

Allow Docker socket access for Jenkins builds:

```bash
sudo chmod 666 /var/run/docker.sock
```

### 3.2 Connect worker as Jenkins agent

On **master**, copy the Terraform-generated public key to the worker `authorized_keys`.

In Jenkins: **Manage Jenkins → Nodes → New Node**

| Field | Value |
|-------|-------|
| Name | `Node` |
| Labels | `Node` |
| Launch method | SSH |
| Host | Worker public IP |
| Credentials | SSH key from `terraform/.generated/wanderlust-deployer.pem` |

---

## Phase 4 — Jenkins credentials and tools

In **Manage Jenkins → Credentials**, add:

| ID | Type | Used for |
|----|------|----------|
| `dockerhub-cred` | Username/password | Docker Hub push |
| `Github-cred` | Username + PAT | CD pipeline git push |
| Sonar token | Secret text | SonarQube analysis |

Configure SonarQube server (name `Sonar`), email notifications, and tools (`Sonar` scanner, `DP-Check`).

### Shared library

Configure the external library in **Manage Jenkins → System → Global Pipeline Libraries → Add**:

| Field | Value |
|-------|-------|
| Name | `Shared` |
| Default version | `main` |
| Retrieval | Modern SCM → Git |
| Repository | `https://github.com/Santosh-Pathak/jenkins-shared-libraries.git` |

Functions used by Wanderlust pipelines: `clean_ws`, `clone`, `trivy_scan`, `docker_build`, `docker_push`.
OWASP and SonarQube steps remain inline in `Jenkinsfile` (not in the shared library).

---

## Phase 5 — Install ArgoCD on EKS

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl patch svc argocd-server -n argocd -p '{"spec":{"type":"NodePort"}}'
kubectl get svc argocd-server -n argocd
```

Register cluster and apply GitOps app:

```bash
argocd login <worker-ip>:<nodeport> --username admin --insecure
argocd cluster add wanderlust --name wanderlust-eks-cluster
kubectl apply -f gitops/argocd-application.yaml
```

---

## Phase 6 — Configure application for your environment

Replace `YOUR_DOCKERHUB_USER` in:

- `Jenkinsfile`
- `gitops/Jenkinsfile`
- `kubernetes/backend.yaml`
- `kubernetes/frontend.yaml`

Set EKS worker instance ID in `Automations/updatebackendnew.sh` and `Automations/updatefrontendnew.sh`:

```bash
aws ec2 describe-instances \
  --filters "Name=tag:eks:nodegroup-name,Values=wanderlust" \
  --query 'Reservations[].Instances[].InstanceId' \
  --output text
```

Commit and push to GitHub.

---

## Phase 7 — Create Jenkins pipelines

| Job | Script path |
|-----|-------------|
| Wanderlust-CI | `Jenkinsfile` |
| Wanderlust-CD | `gitops/Jenkinsfile` |

---

## Phase 8 — First deployment

1. Run **Wanderlust-CI** with tags e.g. `v1.0.0`.
2. CI scans, builds env files, pushes images to Docker Hub.
3. **Wanderlust-CD** bumps manifest tags and pushes to Git.
4. ArgoCD syncs: `kubectl get pods -n wanderlust -w`

Access:

```text
Frontend: http://<eks-worker-public-ip>:31000
Backend:  http://<eks-worker-public-ip>:31100/health
```

---

## Phase 9 — Monitoring (optional)

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl create namespace prometheus
helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
  -n prometheus -f helm/monitoring/values.yaml --wait --timeout 10m
```

Grafana: `http://<eks-worker-public-ip>:32000` (admin password from `monitoring-grafana` secret).  
Prometheus: `http://<eks-worker-public-ip>:32090`

See [helm/monitoring/README.md](./helm/monitoring/README.md) for full details.

---

## Cleanup

```bash
cd terraform && terraform destroy
```

---

## Security notes

- Change `JWT_SECRET` in `backend/.env.docker` before production.
- Restrict security group CIDRs from `0.0.0.0/0` in production.
- Scope down Jenkins worker IAM from administrator access for real workloads.
