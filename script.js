(function(){
  const STORAGE_KEY = 'todolist.tasks.v1';
  const THEME_KEY = 'todolist.theme.v1';

  const form = document.getElementById('taskForm');
  const titleInput = document.getElementById('titleInput');
  const titleError = document.getElementById('titleError');
  const categoryInput = document.getElementById('categoryInput');
  const priorityInput = document.getElementById('priorityInput');
  const dueDateInput = document.getElementById('dueDateInput');
  const notesInput = document.getElementById('notesInput');
  const submitBtn = document.getElementById('submitBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const categoryFilter = document.getElementById('categoryFilter');
  const priorityFilter = document.getElementById('priorityFilter');
  const sortBy = document.getElementById('sortBy');

  const taskList = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');

  const statTotal = document.getElementById('statTotal');
  const statPending = document.getElementById('statPending');
  const statCompleted = document.getElementById('statCompleted');
  const statOverdue = document.getElementById('statOverdue');

  const themeToggle = document.getElementById('themeToggle');

  const deleteModal = document.getElementById('deleteModal');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

  let tasks = [];
  let editingId = null;
  let pendingDeleteId = null;

  function loadTasks(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    }catch(e){
      tasks = [];
    }
  }

  function saveTasks(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function loadTheme(){
    const saved = localStorage.getItem(THEME_KEY);
    if(saved === 'dark'){
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = 'Light mode';
    }
  }

  themeToggle.addEventListener('click', function(){
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if(isDark){
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem(THEME_KEY, 'light');
      themeToggle.textContent = 'Dark mode';
    }else{
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(THEME_KEY, 'dark');
      themeToggle.textContent = 'Light mode';
    }
  });

  function genId(){
    return 't_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function todayStr(){
    const d = new Date();
    return d.toISOString().slice(0,10);
  }

  function isOverdue(task){
    if(!task.dueDate || task.completed) return false;
    return task.dueDate < todayStr();
  }

  function priorityRank(p){
    return { high: 0, medium: 1, low: 2 }[p] ?? 3;
  }

  function resetForm(){
    form.reset();
    priorityInput.value = 'medium';
    titleError.textContent = '';
    editingId = null;
    submitBtn.textContent = 'Add task';
    cancelEditBtn.style.display = 'none';
    titleInput.focus();
  }

  function validateTitle(value){
    if(!value || !value.trim()){
      return 'Task title is required.';
    }
    if(value.trim().length < 3){
      return 'Title should be at least 3 characters.';
    }
    if(value.trim().length > 120){
      return 'Title should be under 120 characters.';
    }
    return '';
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const titleVal = titleInput.value;
    const err = validateTitle(titleVal);
    titleError.textContent = err;
    if(err){
      titleInput.focus();
      return;
    }

    if(editingId){
      const task = tasks.find(t => t.id === editingId);
      if(task){
        task.title = titleVal.trim();
        task.category = categoryInput.value;
        task.priority = priorityInput.value;
        task.dueDate = dueDateInput.value || '';
        task.notes = notesInput.value.trim();
      }
    }else{
      tasks.unshift({
        id: genId(),
        title: titleVal.trim(),
        category: categoryInput.value,
        priority: priorityInput.value,
        dueDate: dueDateInput.value || '',
        notes: notesInput.value.trim(),
        completed: false,
        createdAt: Date.now()
      });
    }

    saveTasks();
    resetForm();
    render();
  });

  cancelEditBtn.addEventListener('click', resetForm);

  titleInput.addEventListener('input', function(){
    if(titleError.textContent){
      titleError.textContent = validateTitle(titleInput.value);
    }
  });

  function startEdit(id){
    const task = tasks.find(t => t.id === id);
    if(!task) return;
    editingId = id;
    titleInput.value = task.title;
    categoryInput.value = task.category;
    priorityInput.value = task.priority;
    dueDateInput.value = task.dueDate || '';
    notesInput.value = task.notes || '';
    submitBtn.textContent = 'Save changes';
    cancelEditBtn.style.display = 'inline-block';
    titleError.textContent = '';
    titleInput.focus();
    window.scrollTo({ top: 0 });
  }

  function toggleComplete(id){
    const task = tasks.find(t => t.id === id);
    if(!task) return;
    task.completed = !task.completed;
    saveTasks();
    render();
  }

  function requestDelete(id){
    pendingDeleteId = id;
    deleteModal.classList.remove('hidden');
  }

  confirmDeleteBtn.addEventListener('click', function(){
    if(pendingDeleteId){
      tasks = tasks.filter(t => t.id !== pendingDeleteId);
      saveTasks();
      if(editingId === pendingDeleteId) resetForm();
      pendingDeleteId = null;
    }
    deleteModal.classList.add('hidden');
    render();
  });

  cancelDeleteBtn.addEventListener('click', function(){
    pendingDeleteId = null;
    deleteModal.classList.add('hidden');
  });

  deleteModal.addEventListener('click', function(e){
    if(e.target === deleteModal){
      pendingDeleteId = null;
      deleteModal.classList.add('hidden');
    }
  });

  [searchInput, statusFilter, categoryFilter, priorityFilter, sortBy].forEach(el => {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  function getFilteredTasks(){
    const q = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;
    const cat = categoryFilter.value;
    const pri = priorityFilter.value;

    let result = tasks.filter(function(t){
      if(q && !(t.title.toLowerCase().includes(q) || (t.notes || '').toLowerCase().includes(q))){
        return false;
      }
      if(status === 'pending' && t.completed) return false;
      if(status === 'completed' && !t.completed) return false;
      if(cat !== 'all' && t.category !== cat) return false;
      if(pri !== 'all' && t.priority !== pri) return false;
      return true;
    });

    const sortVal = sortBy.value;
    result.sort(function(a, b){
      if(sortVal === 'due'){
        if(!a.dueDate && !b.dueDate) return 0;
        if(!a.dueDate) return 1;
        if(!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if(sortVal === 'priority'){
        return priorityRank(a.priority) - priorityRank(b.priority);
      }
      if(sortVal === 'title'){
        return a.title.localeCompare(b.title);
      }
      return b.createdAt - a.createdAt;
    });

    return result;
  }

  function formatDate(dateStr){
    if(!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderStats(){
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(isOverdue).length;
    statTotal.textContent = total;
    statPending.textContent = pending;
    statCompleted.textContent = completed;
    statOverdue.textContent = overdue;
  }

  function renderTaskList(){
    const filtered = getFilteredTasks();
    taskList.innerHTML = '';

    if(filtered.length === 0){
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';

    filtered.forEach(function(task){
      const el = document.createElement('div');
      el.className = 'task priority-' + task.priority + (task.completed ? ' completed' : '');

      const overdue = isOverdue(task);

      el.innerHTML = `
        <input type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task completed">
        <div class="task-body">
          <div class="task-title">${escapeHtml(task.title)}</div>
          ${task.notes ? `<div class="task-notes">${escapeHtml(task.notes)}</div>` : ''}
          <div class="task-meta">
            <span class="tag priority-${task.priority}">${task.priority} priority</span>
            <span class="tag">${escapeHtml(task.category)}</span>
            ${task.dueDate ? `<span class="tag ${overdue ? 'overdue' : ''}">${overdue ? 'Overdue: ' : 'Due '}${formatDate(task.dueDate)}</span>` : ''}
            ${task.completed ? '<span class="tag">Completed</span>' : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="icon-btn edit-btn" title="Edit task" aria-label="Edit task">✎</button>
          <button class="icon-btn delete-btn" title="Delete task" aria-label="Delete task">✕</button>
        </div>
      `;

      el.querySelector('input[type="checkbox"]').addEventListener('change', function(){
        toggleComplete(task.id);
      });
      el.querySelector('.edit-btn').addEventListener('click', function(){
        startEdit(task.id);
      });
      el.querySelector('.delete-btn').addEventListener('click', function(){
        requestDelete(task.id);
      });

      taskList.appendChild(el);
    });
  }

  function render(){
    renderStats();
    renderTaskList();
  }

  loadTheme();
  loadTasks();
  render();
})();