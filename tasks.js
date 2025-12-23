let currentUser = null;
let currentTaskId = null;
let currentView = 'card';
let currentFilter = 'all';

// Display user information
function displayUserInfo() {
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const userPhoneEl = document.getElementById('userPhone');
    
    if (currentUser) {
        if (userNameEl) userNameEl.textContent = currentUser.name;
        if (userEmailEl) userEmailEl.textContent = currentUser.email;
        if (userPhoneEl) userPhoneEl.textContent = currentUser.phone;
    }
}

// Initialize dashboard
window.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('currentUser');
    
    if (!userStr) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(userStr);
        
        if (!currentUser.id || !currentUser.name || !currentUser.email) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
            return;
        }
        
        displayUserInfo();
        const savedView = localStorage.getItem('taskView') || 'card';
        changeView(savedView);
        loadTasks();
        setupTaskForm();
        
    } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
});

// Setup task form submission
function setupTaskForm() {
    const taskForm = document.getElementById('taskForm');
    
    if (!taskForm) return;
    
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const date = document.getElementById('taskDate').value;
        const time = document.getElementById('taskTime').value;
        const notificationMethod = document.getElementById('notificationMethod').value;
        const category = document.getElementById('taskCategory').value;
        
        if (!title || !date || !time) {
            showNotification('Please fill all required fields', 'error');
            return;
        }
        
        if (currentTaskId) {
            await updateTaskData(currentTaskId, { title, description, date, time, notificationMethod, category });
            currentTaskId = null;
        } else {
            await createTask(title, description, date, time, notificationMethod, category);
        }
        
        taskForm.reset();
    });
}

// Create new task
async function createTask(title, description, date, time, notificationMethod, category) {
    if (!currentUser || !currentUser.id) {
        showNotification('Session expired. Please login again.', 'error');
        return;
    }
    
    const taskData = {
        title,
        description,
        taskDate: date,
        taskTime: time,
        notificationMethod,
        category
    };
    
    try {
        const response = await apiCall(`/tasks/user/${currentUser.id}`, 'POST', taskData);
        
        if (response.success) {
            showNotification('Task created successfully! 🎉', 'success');
            await loadTasks();
        } else {
            showNotification(response.message || 'Failed to create task', 'error');
        }
    } catch (error) {
        showNotification('Failed to create task', 'error');
        console.error('Create task error:', error);
    }
}

// Load and display tasks
async function loadTasks() {
    if (!currentUser || !currentUser.id) return;
    
    try {
        const response = await apiCall(`/tasks/user/${currentUser.id}?completed=false`);
        
        if (response.success) {
            let tasks = response.data;
            
            // Filter by category if not 'all'
            if (currentFilter !== 'all') {
                tasks = tasks.filter(task => task.category === currentFilter);
            }
            
            const tasksList = document.getElementById('tasksList');
            const pendingCount = document.getElementById('pendingCount');
            
            if (pendingCount) pendingCount.textContent = tasks.length;
            
            if (tasks.length === 0) {
                const message = currentFilter === 'all' ? 'No Tasks Yet' : `No ${currentFilter.replace('_', ' ')} tasks`;
                tasksList.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                        <div style="font-size: 60px; margin-bottom: 20px;">📋</div>
                        <h3 style="margin-bottom: 10px; color: var(--text-primary);">${message}</h3>
                        <p>Create your first task above to get started!</p>
                    </div>
                `;
                return;
            }
            
            if (currentView === 'list') {
                renderListView(tasks);
            } else {
                renderCardView(tasks);
            }
        }
    } catch (error) {
        showNotification('Failed to load tasks', 'error');
        console.error('Load tasks error:', error);
    }
}
// Render Card View
function renderCardView(tasks) {
    console.log('Rendering card view with', tasks.length, 'tasks');
    const tasksList = document.getElementById('tasksList');
    
    if (!tasksList) {
        console.error('tasksList element not found');
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => {
        const emoji = getCategoryEmoji(task.category);
        return `
            <div class="task-card" onclick="showTaskDetail(${task.id})">
                <h3>${emoji} ${task.title}</h3>
                <p>${task.description || 'No description'}</p>
                <div class="task-date-time">
                    <span>📅 ${formatDate(task.taskDate)}</span>
                    <span>🕐 ${formatTime(task.taskTime)}</span>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('Card view rendered successfully');
}

// Render List View
function renderListView(tasks) {
    console.log('Rendering list view with', tasks.length, 'tasks');
    const tasksList = document.getElementById('tasksList');
    
    if (!tasksList) {
        console.error('tasksList element not found');
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => {
        const emoji = getCategoryEmoji(task.category);
        return `
            <div class="task-item">
                <div class="task-checkbox" onclick="event.stopPropagation(); quickComplete(${task.id})">✓</div>
                <div class="task-content" onclick="showTaskDetail(${task.id})">
                    <div class="task-title">${emoji} ${task.title}</div>
                    <div class="task-meta">
                        <span>📅 ${formatDate(task.taskDate)}</span>
                        <span>🕐 ${formatTime(task.taskTime)}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn complete" onclick="event.stopPropagation(); quickComplete(${task.id})">Complete</button>
                    <button class="task-action-btn delete" onclick="event.stopPropagation(); quickDelete(${task.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('List view rendered successfully');
}

// Get category emoji
function getCategoryEmoji(category) {
    const emojis = {
        'daily_work': '📋',
        'exercise': '💪',
        'study': '📚',
        'shopping': '🛒',
        'other': '📌'
    };
    return emojis[category] || '📌';
}

// Filter by category
function filterByCategory(category) {
    currentFilter = category;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === category);
    });
    loadTasks();
}

// Change view function
function changeView(view) {
    currentView = view;
    localStorage.setItem('taskView', view);
    
    const cardBtn = document.getElementById('cardViewBtn');
    const listBtn = document.getElementById('listViewBtn');
    
    if (cardBtn) cardBtn.classList.toggle('active', view === 'card');
    if (listBtn) listBtn.classList.toggle('active', view === 'list');
    
    const tasksList = document.getElementById('tasksList');
    if (tasksList) {
        tasksList.className = `tasks-list ${view}-view`;
    }
    
    loadTasks();
}

// Quick complete
async function quickComplete(taskId) {
    currentTaskId = taskId;
    await markComplete();
}

// Quick delete
async function quickDelete(taskId) {
    if (confirm('Delete this task?')) {
        try {
            const response = await apiCall(`/tasks/${taskId}`, 'DELETE');
            if (response.success) {
                showNotification('Task deleted successfully', 'success');
                await loadTasks();
            }
        } catch (error) {
            showNotification('Failed to delete task', 'error');
        }
    }
}

// Format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Format time
function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Show task detail modal
async function showTaskDetail(taskId) {
    try {
        const response = await apiCall(`/tasks/${taskId}`);
        
        if (!response.success) {
            showNotification('Task not found', 'error');
            return;
        }
        
        const task = response.data;
        currentTaskId = taskId;
        
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        const emoji = getCategoryEmoji(task.category);
        
        modalTitle.textContent = task.title;
        modalBody.innerHTML = `
            <p><strong>${emoji} Category:</strong> ${task.category.replace('_', ' ').toUpperCase()}</p>
            <p><strong>📝 Description:</strong><br>${task.description || 'No description'}</p>
            <p><strong>📅 Date:</strong> ${formatDate(task.taskDate)}</p>
            <p><strong>🕐 Time:</strong> ${formatTime(task.taskTime)}</p>
            <p><strong>🔔 Notification:</strong> ${task.notificationMethod.toUpperCase()}</p>
        `;
        
        modal.style.display = 'block';
    } catch (error) {
        showNotification('Failed to load task details', 'error');
    }
}

// Close modal
function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
    currentTaskId = null;
}

// Mark complete
async function markComplete() {
    if (!currentTaskId) return;
    
    if (confirm('Mark this task as complete?')) {
        try {
            const response = await apiCall(`/tasks/${currentTaskId}/complete`, 'PUT');
            
            if (response.success) {
                closeModal();
                showNotification('Task completed! 🎉', 'success');
                await loadTasks();
            }
        } catch (error) {
            showNotification('Failed to complete task', 'error');
        }
    }
}

// Edit task
async function editTask() {
    if (!currentTaskId) return;
    
    try {
        const response = await apiCall(`/tasks/${currentTaskId}`);
        
        if (!response.success) {
            showNotification('Task not found', 'error');
            return;
        }
        
        const task = response.data;
        
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskDate').value = task.taskDate;
        document.getElementById('taskTime').value = task.taskTime;
        document.getElementById('notificationMethod').value = task.notificationMethod;
        document.getElementById('taskCategory').value = task.category;
        
        closeModal();
        document.querySelector('.task-form-section').scrollIntoView({ behavior: 'smooth' });
        showNotification('Edit your task and click "Add Task" to save', 'info');
    } catch (error) {
        showNotification('Failed to load task for editing', 'error');
    }
}

// Update task data
async function updateTaskData(taskId, updates) {
    const taskData = {
        title: updates.title,
        description: updates.description,
        taskDate: updates.date,
        taskTime: updates.time,
        notificationMethod: updates.notificationMethod,
        category: updates.category
    };
    
    try {
        const response = await apiCall(`/tasks/${taskId}`, 'PUT', taskData);
        
        if (response.success) {
            showNotification('Task updated successfully! ✅', 'success');
            await loadTasks();
        }
    } catch (error) {
        showNotification('Failed to update task', 'error');
    }
}

// Delete task
async function deleteTask() {
    if (!currentTaskId) return;
    
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            const response = await apiCall(`/tasks/${currentTaskId}`, 'DELETE');
            
            if (response.success) {
                closeModal();
                showNotification('Task deleted successfully', 'success');
                await loadTasks();
            }
        } catch (error) {
            showNotification('Failed to delete task', 'error');
        }
    }
}

// Delete Account
async function deleteAccount() {
    if (!currentUser || !currentUser.id) {
        showNotification('Please login first', 'error');
        return;
    }
    
    const confirmation = prompt('⚠️ WARNING: Type "DELETE" to confirm account deletion:');
    
    if (confirmation !== 'DELETE') {
        showNotification('Account deletion cancelled', 'info');
        return;
    }
    
    try {
        const response = await apiCall(`/auth/delete/${currentUser.id}`, 'DELETE');
        
        if (response.success) {
            localStorage.removeItem('currentUser');
            showNotification('Account deleted successfully', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showNotification(response.message || 'Failed to delete account', 'error');
        }
    } catch (error) {
        showNotification('Failed to delete account', 'error');
        console.error('Delete account error:', error);
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// Close modal on click outside
window.onclick = function(event) {
    const modal = document.getElementById('taskModal');
    if (event.target === modal) closeModal();
}

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('taskModal').style.display === 'block') {
        closeModal();
    }
});