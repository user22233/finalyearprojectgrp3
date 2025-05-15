
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const dateInput = document.getElementById('task-date');
  const list = document.getElementById('task-list');
  const completedCount = document.getElementById('completed-count');
  const uncompletedCount = document.getElementById('uncompleted-count');
  const filterDate = document.getElementById('filter-date');

  if ("Notification" in window) {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then(result => {
        console.log("🔔 Notification permission result:", result);
      });
    } else {
      console.log("🔔 Notification already granted.");
    }
  }

  function updateCounts() {
    const tasks = document.querySelectorAll('.task');
    let completed = 0;
    tasks.forEach(task => {
      if (task.classList.contains('completed')) completed++;
    });
    completedCount.textContent = completed;
    uncompletedCount.textContent = tasks.length - completed;
  }

  function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.task').forEach(task => {
      const text = task.querySelector('span').textContent;
      const [title, datePart] = text.split(" (Due: ");
      const dueDate = datePart ? datePart.replace(")", "") : "";
      tasks.push({
        title: title.trim(),
        dueDate: dueDate.trim(),
        completed: task.classList.contains('completed')
      });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
      createTaskElement(task.title, task.dueDate, task.completed);
    });
    updateCounts();
  }

  function createTaskElement(title, dueDate, isCompleted = false) {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task');
    if (isCompleted) taskDiv.classList.add('completed');

    const span = document.createElement('span');
    span.textContent = `${title} (Due: ${dueDate})`;

    const completeBtn = document.createElement('button');
    completeBtn.textContent = '✓';
    completeBtn.className = 'complete-btn';
    completeBtn.addEventListener('click', () => {
      taskDiv.classList.toggle('completed');
      updateCounts();
      saveTasks();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => {
      taskDiv.remove();
      updateCounts();
      saveTasks();
    });

    taskDiv.appendChild(span);
    taskDiv.appendChild(completeBtn);
    taskDiv.appendChild(deleteBtn);
    list.appendChild(taskDiv);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = input.value.trim();
    const dueDate = dateInput.value;

    if (taskText === '' || dueDate === '') return;

    createTaskElement(taskText, dueDate);
    input.value = '';
    dateInput.value = '';
    updateCounts();
    saveTasks();
  });

  filterDate.addEventListener('change', () => {
    const selectedDate = filterDate.value;
    const tasks = document.querySelectorAll('.task');

    tasks.forEach(task => {
      const text = task.querySelector('span').textContent;
      const hasDate = text.includes(`Due: ${selectedDate}`);
      task.style.display = hasDate ? 'flex' : 'none';
    });
  });

  window.clearFilter = function () {
    filterDate.value = '';
    const tasks = document.querySelectorAll('.task');
    tasks.forEach(task => task.style.display = 'flex');
  };

  function getLocalFormattedDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function notifyTodayTasks() {
    if (Notification.permission !== "granted") {
      console.warn("❌ Notification permission not granted.");
      return;
    }

    console.log("✅ Running notifyTodayTasks()");
    const tasks = document.querySelectorAll('.task');
    const today = getLocalFormattedDate();
    console.log("📅 Today is:", today);

    tasks.forEach(task => {
      const text = task.querySelector('span').textContent;
      console.log("🔍 Checking task:", text);

      if (text.includes(`Due: ${today}`) && !task.classList.contains('notified')) {
        try {
          new Notification("🔔 Task Due Today!", {
            body: text.split(" (Due:")[0],
          });
          task.classList.add('notified');
          console.log("✅ Notification triggered for:", text);
        } catch (err) {
          console.error("❌ Notification error:", err);
        }
      }
    });
  }

  loadTasks();
  notifyTodayTasks();
  setInterval(notifyTodayTasks, 1000 * 60 * 60); // Every hour
});
