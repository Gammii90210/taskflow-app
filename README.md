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

## 📖 What is TaskFlow?

TaskFlow is a to-do list / scheduling dashboard, similar to apps like Todoist or TickTick, but stripped down and built entirely from scratch so it's easy to read, learn from, and modify.

There's no server, no database, and no sign-up. When you open the app, it creates some example tasks for you automatically, and everything you add, edit, or delete is saved right in your browser.

---

## 🧠 What You Can Learn From This Project

If you're learning JavaScript, this project is a good example of:

- **DOM manipulation without a framework** — how to build and update a whole interface using plain `document.querySelector`, `innerHTML`, and event listeners
- **Managing app state by hand** — how an app can "remember" things (tasks, filters, current view) using simple JavaScript variables instead of a state management library
- **Working with `localStorage`** — saving and loading data so it persists even after the page is refreshed or closed
- **Rendering lists dynamically** — turning an array of task objects into HTML on the screen, and keeping it in sync as data changes
- **Building reusable UI patterns** — modals, dropdowns, toasts (pop-up notifications), and confirm dialogs, all built manually
- **Basic date logic** — figuring out if a task is "Today," "Overdue," or "In 3 days" using plain JavaScript `Date` objects

---

## 🧩 How the App is Organized

The whole project is just 3 files:

```
taskflow-app/
├── index.html      → the structure of the page (sidebar, task list, modal forms)
├── style.css        → all the visual styling and layout
├── app.js           → all the logic: state, rendering, and interactions
└── README.md
```

There's no build step — you don't need Node.js, npm, or a compiler. You can open `index.html` straight in a browser and it works.

### How the JavaScript is structured (`app.js`)

The code is organized into clear sections, so it's easy to follow even if you're new to JavaScript:

| Section | What it does |
|---|---|
| **State** | Holds the current list of tasks, trash, and which view/filter is active |
| **Utilities** | Small helper functions — formatting dates, generating unique IDs, etc. |
| **Storage** | Saves and loads tasks from `localStorage` |
| **Seed data** | Creates example tasks the first time you open the app |
| **Render functions** | Take the current state and turn it into HTML on the screen |
| **Event handlers** | Respond to clicks, typing, and form submissions (adding a task, marking it done, deleting it, etc.) |

A simplified version of how it works, from start to finish:

1. The app loads → it checks `localStorage` for saved tasks
2. If none exist, it creates some example tasks (`seed()`)
3. `render()` reads the current state and builds the task list on screen
4. When you do something — like check off a task — the state is updated, saved back to `localStorage`, and `render()` runs again to reflect the change

This "change the data → re-render the screen" pattern is the same basic idea behind bigger frameworks like React — TaskFlow just does it manually, so you can see every step.

---

## ✅ Features

- Create, edit, complete, duplicate, and delete tasks
- Organize tasks by priority (Low, Medium, High, Critical) and category (Work, Personal, Study, etc.)
- Set due dates, due times, and repeat schedules (daily/weekly/monthly)
- Break tasks into subtasks with their own checkboxes
- Track progress on each task with a slider
- Search, sort, and filter tasks
- View tasks in different ways: All, Today, Upcoming, Overdue, Analytics (charts), and Calendar
- Soft-delete tasks to a Trash view, with the option to restore or permanently delete
- All data is saved automatically — nothing is lost on refresh

---

## 🚀 Running It Yourself

No installation needed.

**Option 1 — Just open it**
Download or clone the repo, then double-click `index.html` to open it in your browser.

**Option 2 — Run a local server** (slightly more reliable for some browsers)
```bash
npx serve .
```
Then open the local address it gives you (usually `http://localhost:3000`).

---

## 🌐 Try It Live

You don't need to install anything to try TaskFlow — it's hosted for free with GitHub Pages:

👉 **[https://gammii90210.github.io/taskflow-app/](https://gammii90210.github.io/taskflow-app/)**

---

## 🛠️ Ideas to Extend This Project

If you want to practice by building on top of this, some good next steps:

- Add a dark mode toggle
- Let users export/import their tasks as a JSON file
- Add drag-and-drop reordering of tasks
- Connect it to a real backend (Firebase, Supabase, or a custom API) so tasks sync across devices

---

