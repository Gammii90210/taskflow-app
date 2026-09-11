# ⚡ TaskFlow — Scheduling System

A clean, fast, frontend-only task & scheduling app built with vanilla JavaScript. No frameworks, no build step, no backend — just open it in a browser.

![Static Badge](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![Static Badge](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![Static Badge](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![Static Badge](https://img.shields.io/badge/Storage-LocalStorage-6C63FF)
![Static Badge](https://img.shields.io/badge/License-Educational-orange)

**[🔗 Live Demo](https://gammii90210.github.io/taskflow-app/)** &nbsp;·&nbsp; **[📂 Visit Repo](https://github.com/Gammii90210/taskflow-app)**

---

## README · Educational Project

| Field | Details |
|---|---|
| **Tech** | HTML5 · CSS3 · Vanilla JavaScript (ES6+) — zero frameworks, zero dependencies |
| **State** | Plain JS state (`tasks`, `trash`, `view`, `filter`) — no React, no Vue, no build tools |
| **Data** | Persisted to `localStorage`, seeded with demo tasks on first load |
| **Icons** | [Tabler Icons](https://tabler.io/icons) webfont · **Fonts:** Inter & JetBrains Mono (Google Fonts) |

TaskFlow is a self-contained task manager and scheduling dashboard — covering tasks, priorities, categories, subtasks, recurring schedules, analytics, a calendar view, and a trash/restore flow — built to explore clean vanilla JS architecture with no UI libraries.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deploying / Live Demo](#deploying--live-demo)
- [Publishing to GitHub](#publishing-to-github)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

- ✅ **Task management** — create, edit, duplicate, complete, and soft-delete tasks
- 🗂️ **Views** — All tasks, Today, Upcoming, Overdue, plus a Trash view with restore/permanent delete
- 🏷️ **Priorities & categories** — Critical / High / Medium / Low, with color-coded categories (Work, Personal, Study, Health, Finance, Project, Other)
- 📅 **Scheduling** — due dates, due times, effort estimates, and repeat rules (daily/weekly/monthly) with reschedule reasons
- ✅ **Subtasks** — add, complete, and track subtasks per task
- 📊 **Progress tracking** — per-task progress slider plus sidebar completion stats
- 📈 **Analytics view** — visual breakdown of task status and priority distribution
- 🗓️ **Calendar view** — see tasks laid out by date
- 🔍 **Search, sort & filter** — live search, sort by due date/priority/created/progress/name, and quick filter chips
- 💾 **Persistent storage** — all data saved locally via `localStorage`, no backend required
- 📱 **Responsive UI** — collapsible sidebar and mobile-friendly layout

---

## Project Structure

```
taskflow-app/
├── index.html      # App shell, markup, task modal, confirm dialog
├── style.css        # All styling (layout, theme, components)
├── app.js           # App state, rendering, and all interactions
└── README.md
```

---

## Getting Started

TaskFlow has no dependencies and no build step.

1. Clone or download the repo
2. Open `index.html` directly in your browser

   — or serve it locally for a cleaner experience:

   ```bash
   npx serve .
   # or
   python3 -m http.server 8080
   ```

3. Visit the local URL it prints (e.g. `http://localhost:8080`)

Task data is generated automatically on first run and saved to your browser's `localStorage` — refreshing keeps your changes; clearing site data resets it back to the seed tasks.

---

## Deploying / Live Demo

Since TaskFlow is fully static, it can be hosted for free on any static host. The two easiest options:

**GitHub Pages** (recommended if you're already pushing to GitHub — see below)
1. Push the project to a GitHub repo
2. Go to **Settings → Pages**
3. Under **Source**, select the `main` branch and `/ (root)` folder
4. Save — GitHub will publish it at `https://<your-username>.github.io/<repo-name>/`

**Netlify / Vercel** (drag-and-drop)
1. Go to [netlify.com/drop](https://app.netlify.com/drop) (or Vercel's dashboard)
2. Drag the `taskflow-app` folder in
3. Get an instant live URL

Once live, update the **Live Demo** badge link at the top of this README with your URL.

---

## Publishing to GitHub

If you haven't pushed this project yet:

```bash
cd taskflow-app
git init
git add .
git commit -m "Initial commit — TaskFlow scheduling system"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

Then enable **GitHub Pages** (Settings → Pages) as described above to get a free live demo link straight from the repo.

---

## Roadmap

- [ ] Drag-and-drop task reordering
- [ ] Dark/light theme toggle
- [ ] Export/import tasks as JSON
- [ ] Optional backend sync

---

## License

This is an educational/portfolio project. Feel free to fork, learn from, and adapt it.
