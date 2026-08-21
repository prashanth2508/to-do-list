# To-Do List
A clean and responsive **To-Do List web application** designed to help users organize and manage their daily tasks efficiently. Built using plain HTML, CSS, and JavaScript with no frameworks or external dependencies. All tasks and theme preferences are stored locally in the browser using `localStorage`.
## Features

* **Add, edit, and delete tasks** with input validation
* **Mark tasks as completed or pending** with a single click
* **Local persistence** — tasks and theme preferences are saved using `localStorage`
* **Live statistics dashboard** — total, pending, completed, and overdue task counts
* **Search** across task titles and notes
* **Filter tasks** by status, category, and priority
* **Sort tasks** by date added, due date, priority, or title
* **Task categories** — General, Academics, Project, Personal, and Other
* **Priority levels** — High, Medium, and Low
* **Due dates** with automatic overdue detection
* **Dark mode** with saved theme preference
* **Fully responsive** design for mobile, tablet, and desktop

## Tech Stack

* HTML5
* CSS3
* JavaScript (ES6+)
* LocalStorage
* CSS Grid & Flexbox

## Project Structure

```text
to-do-list/
├── index.html    # Page structure and markup
├── style.css     # Styling, layout, and dark mode
└── script.js     # App logic, CRUD, filtering, sorting, and storage
```
## How to Use

1. Enter a task in the **Add a Task** form.
2. Add optional notes, category, priority, and due date.
3. Click **Add Task** to create the task.
4. Use the checkbox to mark a task as completed or pending.
5. Use the edit button to update a task.
6. Use the delete button to remove a task.
7. Use the search and filter options to quickly find specific tasks.
8. Toggle **Dark Mode** from the top-right corner.

## Data & Privacy

All task data is stored locally in your browser using `localStorage`. No data is sent to or stored on an external server.

