// Simple and reliable To-Do List Application
let tasks = [];
let taskIdCounter = 1;
let currentFilter = 'all';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Get DOM elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Bind events
    if (addTaskBtn) {
        addTaskBtn.onclick = function() {
            addTask();
        };
    }
    
    if (taskInput) {
        taskInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        };
        
        // Clear error on input
        taskInput.oninput = function() {
            clearError();
        };
    }
    
    // Filter button events
    filterButtons.forEach(function(btn) {
        btn.onclick = function() {
            setFilter(btn.dataset.filter);
        };
    });
    
    // Bulk action events
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const markAllCompleteBtn = document.getElementById('markAllComplete');
    
    if (clearCompletedBtn) {
        clearCompletedBtn.onclick = function() {
            clearCompleted();
        };
    }
    
    if (markAllCompleteBtn) {
        markAllCompleteBtn.onclick = function() {
            markAllComplete();
        };
    }
    
    // Initial render
    updateUI();
    
    // Focus on input
    if (taskInput) {
        taskInput.focus();
    }
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    if (!taskInput) return;
    
    const taskText = taskInput.value.trim();
    
    if (!validateInput(taskText)) {
        return;
    }
    
    const task = {
        id: taskIdCounter++,
        text: taskText,
        completed: false,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toLocaleString()
    };
    
    tasks.unshift(task);
    taskInput.value = '';
    clearError();
    updateUI();
    taskInput.focus();
    
    showFeedback('Task added successfully!', 'success');
}

function validateInput(text) {
    if (!text) {
        showError('Please enter a task description');
        return false;
    }
    
    if (text.length > 250) {
        showError('Task description must be 250 characters or less');
        return false;
    }
    
    // Check for duplicate tasks
    if (tasks.some(function(task) { return task.text.toLowerCase() === text.toLowerCase(); })) {
        showError('This task already exists');
        return false;
    }
    
    return true;
}

function showError(message) {
    const inputError = document.getElementById('inputError');
    if (inputError) {
        inputError.textContent = message;
        inputError.style.color = 'var(--color-error)';
    }
}

function clearError() {
    const inputError = document.getElementById('inputError');
    if (inputError) {
        inputError.textContent = '';
    }
}

function showFeedback(message, type) {
    const inputError = document.getElementById('inputError');
    if (inputError) {
        inputError.textContent = message;
        inputError.style.color = type === 'success' ? 'var(--color-success)' : 'var(--color-error)';
        
        setTimeout(function() {
            clearError();
        }, 2000);
    }
}

function toggleTask(taskId) {
    const task = tasks.find(function(t) { return t.id === taskId; });
    if (task) {
        task.completed = !task.completed;
        updateUI();
        
        const status = task.completed ? 'completed' : 'pending';
        showFeedback('Task marked as ' + status + '!', 'success');
    }
}

function deleteTask(taskId) {
    const taskIndex = tasks.findIndex(function(t) { return t.id === taskId; });
    if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1);
        updateUI();
        showFeedback('Task deleted!', 'success');
    }
}

function setFilter(filter) {
    currentFilter = filter;
    
    // Update active filter button
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(function(btn) {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    updateUI();
}

function getFilteredTasks() {
    switch (currentFilter) {
        case 'completed':
            return tasks.filter(function(task) { return task.completed; });
        case 'pending':
            return tasks.filter(function(task) { return !task.completed; });
        default:
            return tasks;
    }
}

function clearCompleted() {
    const completedCount = tasks.filter(function(task) { return task.completed; }).length;
    
    if (completedCount === 0) {
        showFeedback('No completed tasks to clear', 'error');
        return;
    }
    
    tasks = tasks.filter(function(task) { return !task.completed; });
    updateUI();
    showFeedback(completedCount + ' completed task' + (completedCount > 1 ? 's' : '') + ' cleared!', 'success');
}

function markAllComplete() {
    const pendingTasks = tasks.filter(function(task) { return !task.completed; });
    
    if (pendingTasks.length === 0) {
        showFeedback('All tasks are already completed', 'error');
        return;
    }
    
    tasks.forEach(function(task) {
        if (!task.completed) {
            task.completed = true;
        }
    });
    
    updateUI();
    showFeedback(pendingTasks.length + ' task' + (pendingTasks.length > 1 ? 's' : '') + ' marked as complete!', 'success');
}

function updateUI() {
    updateStats();
    renderTasks();
    updateBulkActions();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(function(task) { return task.completed; }).length;
    const pending = total - completed;
    
    const totalTasksEl = document.getElementById('totalTasks');
    const completedTasksEl = document.getElementById('completedTasks');
    const pendingTasksEl = document.getElementById('pendingTasks');
    
    if (totalTasksEl) totalTasksEl.textContent = total;
    if (completedTasksEl) completedTasksEl.textContent = completed;
    if (pendingTasksEl) pendingTasksEl.textContent = pending;
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    
    if (!taskList || !emptyState) return;
    
    const filteredTasks = getFilteredTasks();
    
    // Show/hide empty state
    const hasVisibleTasks = filteredTasks.length > 0;
    
    if (hasVisibleTasks) {
        emptyState.classList.add('hidden');
        taskList.classList.remove('hidden');
    } else {
        emptyState.classList.remove('hidden');
        taskList.classList.add('hidden');
        updateEmptyStateMessage();
        return;
    }
    
    // Render task items
    taskList.innerHTML = filteredTasks.map(function(task) {
        return createTaskHTML(task);
    }).join('');
    
    // Add event listeners to new task elements
    bindTaskEvents();
}

function updateEmptyStateMessage() {
    const emptyIcon = document.querySelector('.empty-icon');
    const emptyTitle = document.querySelector('.empty-state h3');
    const emptyText = document.querySelector('.empty-state p');
    
    if (!emptyIcon || !emptyTitle || !emptyText) return;
    
    switch (currentFilter) {
        case 'completed':
            emptyIcon.textContent = '✅';
            emptyTitle.textContent = 'No completed tasks';
            emptyText.textContent = 'Complete some tasks to see them here!';
            break;
        case 'pending':
            emptyIcon.textContent = '🎉';
            emptyTitle.textContent = 'No pending tasks';
            emptyText.textContent = 'Great job! All your tasks are completed!';
            break;
        default:
            emptyIcon.textContent = '📋';
            emptyTitle.textContent = 'No tasks yet';
            emptyText.textContent = 'Add your first task above to get started!';
    }
}

function createTaskHTML(task) {
    const timeAgo = getTimeAgo(task.timestamp);
    
    return [
        '<li class="task-item ' + (task.completed ? 'completed' : '') + ' slide-in" data-task-id="' + task.id + '" role="listitem">',
            '<input type="checkbox" class="task-checkbox" ' + (task.completed ? 'checked' : '') + ' data-action="toggle" aria-label="Mark task as ' + (task.completed ? 'incomplete' : 'complete') + '">',
            '<div class="task-content">',
                '<div class="task-text">' + escapeHtml(task.text) + '</div>',
                '<div class="task-meta">',
                    '<span class="task-time">Created ' + timeAgo + '</span>',
                    '<span class="task-status">' + (task.completed ? 'Completed' : 'Pending') + '</span>',
                '</div>',
            '</div>',
            '<div class="task-actions">',
                '<button class="task-action-btn delete" data-action="delete" aria-label="Delete task" title="Delete task">',
                    'Delete',
                '</button>',
            '</div>',
        '</li>'
    ].join('');
}

function bindTaskEvents() {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;
    
    // Remove existing event listeners
    const newTaskList = taskList.cloneNode(true);
    taskList.parentNode.replaceChild(newTaskList, taskList);
    
    // Add new event listeners
    newTaskList.addEventListener('change', function(e) {
        if (e.target.dataset.action === 'toggle') {
            const taskId = parseInt(e.target.closest('.task-item').dataset.taskId);
            toggleTask(taskId);
        }
    });
    
    newTaskList.addEventListener('click', function(e) {
        if (e.target.dataset.action === 'delete') {
            e.preventDefault();
            const taskId = parseInt(e.target.closest('.task-item').dataset.taskId);
            deleteTask(taskId);
        }
    });
}

function updateBulkActions() {
    const bulkActions = document.getElementById('bulkActions');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const markAllCompleteBtn = document.getElementById('markAllComplete');
    
    if (!bulkActions || !clearCompletedBtn || !markAllCompleteBtn) return;
    
    const hasCompletedTasks = tasks.some(function(task) { return task.completed; });
    const hasPendingTasks = tasks.some(function(task) { return !task.completed; });
    const hasTasks = tasks.length > 0;
    
    if (hasTasks) {
        bulkActions.classList.remove('hidden');
    } else {
        bulkActions.classList.add('hidden');
    }
    
    // Update button states
    clearCompletedBtn.disabled = !hasCompletedTasks;
    markAllCompleteBtn.disabled = !hasPendingTasks;
    
    // Update button text based on state
    const pendingCount = tasks.filter(function(task) { return !task.completed; }).length;
    markAllCompleteBtn.textContent = pendingCount > 0 
        ? 'Mark All Complete (' + pendingCount + ')' 
        : 'Mark All Complete';
    
    const completedCount = tasks.filter(function(task) { return task.completed; }).length;
    clearCompletedBtn.textContent = completedCount > 0 
        ? 'Clear Completed (' + completedCount + ')' 
        : 'Clear Completed';
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return minutes + ' minute' + (minutes > 1 ? 's' : '') + ' ago';
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return days + ' day' + (days > 1 ? 's' : '') + ' ago';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to focus input from anywhere
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const taskInput = document.getElementById('taskInput');
        if (taskInput) {
            taskInput.focus();
        }
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
        const taskInput = document.getElementById('taskInput');
        if (taskInput && document.activeElement === taskInput) {
            taskInput.value = '';
            clearError();
        }
    }
});
