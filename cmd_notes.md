````md
# 📒 DevOps_Project Notes (Full Process) — AWS + Terraform + Docker + GitHub Actions Auto Deploy

> ✅ Goal: Push code to GitHub → GitHub Actions connects to EC2 → runs deploy.sh → website updates automatically.  
> ✅ Stack: AWS EC2 + Terraform (modules) + Docker + Docker Compose + GitHub Actions (CI/CD)

---

# 0) Project Repo
Repo URL:
https://github.com/DharmendraChakrawarti/DevOps_Project.git

---

# 1) Prerequisites

## ✅ 1.1 On Local PC (Windows)
You should have:
- Git installed
- Terraform installed
- AWS CLI installed (recommended)
- AWS credentials configured (Access Key + Secret Key)

### Check installations
```bash
git --version
terraform --version
aws --version
````

### Configure AWS CLI (if not done)

```bash
aws configure
```

It will ask:

* AWS Access Key ID
* AWS Secret Access Key
* Default region name (example: ap-south-1)
* Default output format (json)

---

## ✅ 1.2 On AWS (Important Setup)

You need:

* AWS Account
* EC2 Key Pair (example: `dckey.pem`)
* Security Group must allow:

  * SSH (22) → your IP (recommended)
  * HTTP (80) → 0.0.0.0/0
  * (Optional) HTTPS (443) → 0.0.0.0/0

---

# 2) Terraform (Create AWS Infra)

## 2.1 Go to terraform folder

```bash
cd terraform
```

## 2.2 Initialize terraform

```bash
terraform init
```

## 2.3 Validate (optional but recommended)

```bash
terraform validate
```

## 2.4 Plan (check what will create)

```bash
terraform plan -var="key_name=dckey"
```

## 2.5 Apply (create infra)

```bash
terraform apply -var="key_name=dckey"
```

Type:

```text
yes
```

## 2.6 Get outputs (EC2 Public IP etc.)

```bash
terraform output
```

(If you want specific output)

```bash
terraform output ec2_public_ip
```

## 2.7 Destroy infra (when not needed)

```bash
terraform destroy -var="key_name=dckey"
```

---

# 3) SSH into EC2

## 3.1 Go to the folder where PEM key is present in laptop

Example (Windows):

```bash
cd C:\Users\dharm\Downloads
```

## 3.2 Fix key permission (Windows Git Bash / WSL only)

If SSH says permission error, run:

```bash
chmod 400 dckey.pem
```

## 3.3 Connect using PEM key

```bash
ssh -i dckey.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Example:

```bash
ssh -i dckey.pem ubuntu@43.205.xx.xx
```

If asked:

```text
Are you sure you want to continue connecting (yes/no)?
```

Type:

```bash
yes
```

---

# 4) Install Required Tools on EC2 (What we installed + how)

## ✅ 4.1 Update system packages (must do first)

```bash
sudo apt update -y
sudo apt upgrade -y
```

---

## ✅ 4.2 Install Git

```bash
sudo apt install git -y
git --version
```

---

## ✅ 4.3 Install Docker Engine

```bash
sudo apt install docker.io -y
docker --version
```

### Start and enable Docker service

```bash
sudo systemctl start docker
sudo systemctl enable docker
sudo systemctl status docker
```

---

## ✅ 4.4 Give Docker permission to ubuntu user (IMPORTANT)

So we don’t need `sudo` every time.

```bash
sudo usermod -aG docker ubuntu
newgrp docker
```

Test:

```bash
docker ps
```

---

## ✅ 4.5 Install Docker Compose

```bash
sudo apt install docker-compose -y
docker-compose --version
```

---

## ✅ 4.6 Install SSH Server (Usually already installed)

```bash
sudo apt install openssh-server -y
sudo systemctl start ssh
sudo systemctl enable ssh
sudo systemctl status ssh
```

---

# 5) Clone Repo on EC2

## 5.1 Go to home

```bash
cd ~
```

## 5.2 Clone repo

```bash
git clone https://github.com/DharmendraChakrawarti/DevOps_Project.git
```

## 5.3 Enter project

```bash
cd DevOps_Project
```

## 5.4 Pull latest code anytime

```bash
git pull origin main
```

---

# 6) Run Website on EC2 (Docker Compose)

## 6.1 Build and run containers (detached)

Run from project root:

```bash
docker-compose -f docker/docker-compose.yml up --build -d
```

## 6.2 Check running containers

```bash
docker ps
```

## 6.3 View logs (live)

```bash
docker-compose -f docker/docker-compose.yml logs -f
```

## 6.4 Stop containers

```bash
docker-compose -f docker/docker-compose.yml down
```

---

# 7) Open Website in Browser

## 7.1 Use EC2 Public IP

```text
http://YOUR_EC2_PUBLIC_IP
```

Example:

```text
http://43.205.xx.xx
```

✅ If not opening:

* Check EC2 Security Group inbound rule (HTTP 80 open)
* Check container running:

```bash
docker ps
```

---

# 8) Create Auto Deploy Script (deploy.sh) on EC2

## 8.1 Create deploy.sh in EC2 home folder

```bash
cd ~
nano deploy.sh
```

## 8.2 Paste this deploy.sh code

```bash
#!/bin/bash
set -e

echo "===== DEPLOY STARTED ====="

cd /home/ubuntu/DevOps_Project

echo "Pulling latest code..."
git pull origin main

echo "Rebuilding & restarting containers..."
docker-compose -f docker/docker-compose.yml down
docker-compose -f docker/docker-compose.yml up --build -d

echo "===== DEPLOY DONE ====="
```

## 8.3 Save nano

```text
CTRL + X
Y
ENTER
```

## 8.4 Make script executable

```bash
chmod +x ~/deploy.sh
```

## 8.5 Test deploy manually

```bash
bash ~/deploy.sh
```

---

# 9) GitHub Actions SSH Authentication (The Key Fix We Did)

> ❌ Error we got:
> ssh: handshake failed: unable to authenticate (publickey)

✅ Fix: We created a NEW key pair inside EC2 for GitHub Actions.

---

## 9.1 Create ssh folder + permission

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

---

## 9.2 Generate new SSH key for GitHub Actions (EC2 side)

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""
```

If it says:

```text
/home/ubuntu/.ssh/github_actions already exists.
Overwrite (y/n)?
```

Type:

```text
y
```

---

## 9.3 Add PUBLIC key into authorized_keys (EC2 side)

```bash
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Verify:

```bash
tail -n 5 ~/.ssh/authorized_keys
```

---

## 9.4 Copy PRIVATE KEY (this goes into GitHub Secret EC2_KEY)

```bash
cat ~/.ssh/github_actions
```

⚠️ Copy FULL output including:

* -----BEGIN OPENSSH PRIVATE KEY-----
* -----END OPENSSH PRIVATE KEY-----

---

# 10) Add GitHub Secrets (Repo Settings)

Go to:

```text
GitHub Repo → Settings → Secrets and variables → Actions → New repository secret
```

Add these secrets:

## 10.1 EC2_HOST

Value:

```text
YOUR_EC2_PUBLIC_IP
```

Example:

```text
43.205.xx.xx
```

## 10.2 EC2_KEY

Value:

```text
PASTE FULL PRIVATE KEY OUTPUT FROM:
cat ~/.ssh/github_actions
```

⚠️ NOTE:

* If GitHub says secret already exists:

  * Either update it OR delete and re-add

---

# 11) GitHub Actions Workflow File (deploy.yml)

## 11.1 Create file path in project

```text
.github/workflows/deploy.yml
```

## 11.2 Paste this workflow code

```yaml
name: Deploy React App to EC2

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_KEY }}
          port: 22
          script: |
            bash /home/ubuntu/deploy.sh
```

---

# 12) Push Code to GitHub (From Local PC)

## 12.1 Go to project folder

Example:

```bash
cd C:\Users\dharm\OneDrive\Desktop\DevOps_project
```

## 12.2 Add changes

```bash
git add .
```

## 12.3 Commit

```bash
git commit -m "update"
```

## 12.4 Push

```bash
git push origin main
```

✅ Now GitHub Actions will auto deploy 🚀

---

# 13) Check GitHub Actions Status

Go to:

```text
GitHub Repo → Actions tab → latest workflow run
```

If success:
✅ Deployment done

---

# 14) Common Commands (Quick Reference)

## 14.1 Check containers

```bash
docker ps
```

## 14.2 Stop containers

```bash
docker-compose -f docker/docker-compose.yml down
```

## 14.3 Start containers

```bash
docker-compose -f docker/docker-compose.yml up --build -d
```

## 14.4 Logs

```bash
docker-compose -f docker/docker-compose.yml logs -f
```

## 14.5 Run deploy script manually

```bash
bash ~/deploy.sh
```

## 14.6 Check open ports

```bash
sudo ss -tulnp
```

---

# 15) Common Errors + Fix

## 15.1 If website not opening in browser

### Check container is running

```bash
docker ps
```

### Check EC2 security group inbound rules

* HTTP (80) open to 0.0.0.0/0

### Check Nginx container logs

```bash
docker-compose -f docker/docker-compose.yml logs -f
```

---

## 15.2 If GitHub Actions shows SSH handshake failed

Run on EC2:

```bash
sudo cat /var/log/auth.log | tail -n 30
```

Then fix:

* wrong username (must be ubuntu)
* wrong key pasted in EC2_KEY
* key not added to authorized_keys

---

# ✅ FINAL WEBSITE URL

```text
http://YOUR_EC2_PUBLIC_IP
```

🎉 DONE — Full Auto Deployment Working!

```
```
