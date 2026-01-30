# 🐙 GitHub Instruction & Workflow Guide

This document provides instructions for team members to collaborate on the **EduMate AI** repository effectively.

## 📥 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/YourUsername/Hackathon-Nirman.git
cd Hackathon-Nirman
```

### 2. Configure Your Identity
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## 🌿 Branching Strategy

To keep the project stable, we follow a simple branching model:

- **`main`**: The "Production" branch. Only stable, tested code should be here.
- **`dev`**: The "Integration" branch. All new features are merged here first.
- **`feature/feature-name`**: Your working branch for specific tasks.

### Create a New Feature Branch
```bash
# Always start from current dev
git checkout dev
git pull origin dev

# Create your branch
git checkout -b feature/auth-system
```

---

## 💾 Saving Your Work (Commit Policy)

Make clean, descriptive commits. Follow this format:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semi-colons, etc; no code change
- `refactor`: Refactoring production code

**Example:**
```bash
git add .
git commit -m "feat: add JWT authentication to backend"
```

---

## 📤 Pushing & Pull Requests

1. **Push your branch to GitHub**:
   ```bash
   git push origin feature/auth-system
   ```

2. **Open a Pull Request (PR)**:
   - Go to the GitHub repository.
   - Click "Compare & pull request".
   - Describe what you did and ask for a review.
   - **Target Branch**: `dev`

3. **Merge**:
   - Once approved, merge to `dev`.
   - Before a major demo, `dev` will be merged into `main`.

---

## ⚠️ Important Rules for Hackathon
1. **Never commit your `.env` file**: It contains sensitive API keys. We use `.env.example` as a template.
2. **Pull before you Push**: Always run `git pull` to get the latest changes from your teammates to avoid conflicts.
3. **Commit often**: Small, frequent commits are easier to manage than one massive update.

---

## 🛠️ Environment Sync
If someone adds a new library, you need to update your local environment:

**Backend:**
```bash
pip install -r requirements.txt
```

**Frontend:**
```bash
npm install
```

---

**Happy Coding! 🚀**
