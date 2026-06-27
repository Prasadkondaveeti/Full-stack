# Full-Stack CI/CD Boilerplate
### React (Vite + TypeScript) + Node.js (Express + TypeScript) + GitHub Actions + AWS EC2

---

## 📁 Project Structure

```
fullstack-cicd/
├── frontend/                     # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/Navbar.tsx
│   │   ├── pages/Home.tsx
│   │   ├── pages/About.tsx
│   │   └── services/api.ts
│   ├── .env.development          # Dev env vars (VITE_API_URL etc.)
│   ├── .env.production           # Prod env vars
│   └── vite.config.ts
│
├── backend/                      # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/health.ts
│   │   ├── routes/users.ts
│   │   ├── controllers/usersController.ts
│   │   ├── app.ts
│   │   └── index.ts
│   ├── .env.development
│   └── .env.production
│
├── .github/
│   └── workflows/
│       ├── deploy-dev.yml        # Triggers on push to `develop`
│       └── deploy-prod.yml       # Triggers on push to `main`
│
├── nginx.conf                    # Nginx config for EC2
└── ec2-setup.sh                  # One-time EC2 setup script
```

---

## 🚀 STEP-BY-STEP SETUP GUIDE

---

### STEP 1 — Create Two EC2 Instances on AWS

1. Go to **AWS Console → EC2 → Launch Instance**
2. Launch **TWO** instances:
   - **DEV EC2** (e.g., `t2.micro`, Ubuntu 22.04)
   - **PROD EC2** (e.g., `t2.small`, Ubuntu 22.04)
3. For each instance:
   - Create or assign a **Key Pair** (`.pem` file) — save these safely
   - Security Group — open these ports:
     - `22` (SSH) — your IP only (for security)
     - `80` (HTTP) — anywhere (0.0.0.0/0)
     - `443` (HTTPS) — anywhere (optional, if using SSL)
4. Note the **Public IP** of each instance

---

### STEP 2 — Run EC2 Setup Script on Both Instances

SSH into each EC2 and run the setup script:

```bash
# Copy the script to EC2
scp -i your-key.pem ec2-setup.sh ubuntu@<EC2_IP>:~/

# SSH into EC2
ssh -i your-key.pem ubuntu@<EC2_IP>

# Run the script
chmod +x ec2-setup.sh
sudo ./ec2-setup.sh
```

Then set up Nginx:
```bash
# Copy nginx config (do this from your local machine)
scp -i your-key.pem nginx.conf ubuntu@<EC2_IP>:~/

# On the EC2:
sudo cp ~/nginx.conf /etc/nginx/sites-available/myapp

# Edit the file and replace 'your-ec2-ip-or-domain' with the actual IP
sudo nano /etc/nginx/sites-available/myapp

# Enable the site
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

> ✅ Do this for **both** DEV and PROD EC2 instances.

---

### STEP 3 — Generate SSH Keys for GitHub Actions

GitHub Actions needs SSH access to your EC2. Generate a **dedicated keypair** (don't reuse your AWS .pem):

```bash
# Run this on your LOCAL machine
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""

# This creates:
#   ~/.ssh/github_deploy_key       ← PRIVATE KEY (goes into GitHub Secrets)
#   ~/.ssh/github_deploy_key.pub   ← PUBLIC KEY (goes onto EC2)
```

Add the **public key** to each EC2:
```bash
# Copy public key content
cat ~/.ssh/github_deploy_key.pub

# On each EC2, paste it into authorized_keys:
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

> 🔒 Use the **same keypair** for both EC2s (simplest), or create separate ones for extra security.

---

### STEP 4 — Add Secrets to GitHub Repository

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

Add these 8 secrets:

| Secret Name          | Value                                              |
|----------------------|----------------------------------------------------|
| `DEV_EC2_HOST`       | Public IP of DEV EC2 (e.g. `13.235.x.x`)         |
| `DEV_EC2_USER`       | `ubuntu` (default for Ubuntu AMI)                  |
| `DEV_EC2_SSH_KEY`    | Contents of `~/.ssh/github_deploy_key` (private)   |
| `DEV_BACKEND_URL`    | `http://<DEV_EC2_IP>` (nginx proxies /api)          |
| `PROD_EC2_HOST`      | Public IP of PROD EC2                              |
| `PROD_EC2_USER`      | `ubuntu`                                           |
| `PROD_EC2_SSH_KEY`   | Contents of `~/.ssh/github_deploy_key` (private)   |
| `PROD_BACKEND_URL`   | `http://<PROD_EC2_IP>`                             |

> ⚠️ For `DEV_EC2_SSH_KEY` and `PROD_EC2_SSH_KEY`, paste the entire private key including
> the `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----` lines.

---

### STEP 5 — Push the Project to GitHub

```bash
cd fullstack-cicd

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Create branches
git branch -M main
git push -u origin main

# Create and push develop branch
git checkout -b develop
git push -u origin develop
```

---

### STEP 6 — How the CI/CD Pipeline Works

#### Branch → Environment mapping:

| Git Branch | Pipeline File       | Deploys To  | Environment |
|------------|---------------------|-------------|-------------|
| `develop`  | `deploy-dev.yml`    | DEV EC2     | development |
| `main`     | `deploy-prod.yml`   | PROD EC2    | production  |

#### What happens on each push:

```
Push to `develop` branch
        │
        ├── JOB 1: Frontend DEV
        │     ├── npm ci
        │     ├── npm run build:dev  (uses .env.development)
        │     ├── rsync dist/ → DEV EC2:/var/www/frontend/
        │     └── nginx reload on DEV EC2
        │
        └── JOB 2: Backend DEV
              ├── npm ci
              ├── tsc (compile TypeScript → dist/)
              ├── rsync dist/ → DEV EC2:/var/www/backend/
              ├── npm ci --omit=dev on EC2
              └── pm2 restart backend-dev
```

Same flow for `main` → PROD EC2.

---

### STEP 7 — Local Development

```bash
# Frontend
cd frontend
npm install
npm run dev          # → http://localhost:3000 (uses .env.development)

# Backend (separate terminal)
cd backend
npm install
npm run dev          # → http://localhost:5000 (uses .env.development)
```

---

### STEP 8 — Verify Deployment

After pushing to `develop` or `main`:

1. Go to **GitHub → Actions tab** — watch the pipeline run
2. Check each step for errors
3. Visit `http://<EC2_IP>` in your browser — you should see the React app
4. Click **"Re-check"** on the Home page — it calls `/api/health` on the backend

On the EC2 itself:
```bash
# Check PM2 processes
pm2 list
pm2 logs backend-dev   # or backend-prod

# Check Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

### STEP 9 — Day-to-Day Development Workflow

```bash
# 1. Work on feature
git checkout develop
git pull origin develop
# ... make changes ...
git add .
git commit -m "feat: your feature"
git push origin develop
# ↑ This auto-deploys to DEV EC2

# 2. After testing on DEV, merge to main
git checkout main
git pull origin main
git merge develop
git push origin main
# ↑ This auto-deploys to PROD EC2
```

---

## 🌐 API Endpoints

| Method | URL              | Description     |
|--------|------------------|-----------------|
| GET    | `/api/health`    | Health check    |
| GET    | `/api/users`     | Get all users   |
| GET    | `/api/users/:id` | Get user by ID  |

---

## ⚙️ Environment Variables Reference

### Frontend (`frontend/.env.*`)
| Variable          | Description                    |
|-------------------|--------------------------------|
| `VITE_API_URL`    | Backend base URL               |
| `VITE_APP_ENV`    | `development` or `production`  |
| `VITE_APP_TITLE`  | App title shown in browser     |

### Backend (`backend/.env.*`)
| Variable          | Description                          |
|-------------------|--------------------------------------|
| `NODE_ENV`        | `development` or `production`        |
| `PORT`            | Server port (default 5000)           |
| `FRONTEND_URL`    | CORS allowed origin                  |
| `APP_NAME`        | App name shown in health check       |
