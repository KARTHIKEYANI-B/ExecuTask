// Theme Management
function changeTheme() {
    const themeSelect = document.getElementById('themeSelect');
    const selectedTheme = themeSelect.value;
    document.documentElement.setAttribute('data-theme', selectedTheme);
    localStorage.setItem('theme', selectedTheme);
}

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = savedTheme;
    }
});

// Notification System (THIS WAS MISSING!)
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

// Registration Form Handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            name: document.getElementById('registerName').value.trim(),
            email: document.getElementById('registerEmail').value.trim(),
            phone: document.getElementById('registerPhone').value.trim(),
            password: document.getElementById('registerPassword').value
        };
        
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (!data.name || !data.email || !data.phone || !data.password) {
            showNotification('Please fill all fields', 'error');
            return;
        }
        
        if (data.password !== confirmPassword) {
            showNotification('Passwords do not match!', 'error');
            return;
        }
        
        if (data.password.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        console.log('Sending registration data:', data);
        
        try {
            const response = await apiCall('/auth/register', 'POST', data);
            
            console.log('Registration response:', response);
            
            if (response.success) {
                localStorage.setItem('currentUser', JSON.stringify(response.data));
                showNotification('Registration successful! Welcome!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showNotification(response.message || 'Registration failed', 'error');
            }
        } catch (error) {
            showNotification('Registration failed. Please try again.', 'error');
            console.error('Registration error:', error);
        }
    });
}

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            email: document.getElementById('loginEmail').value.trim(),
            password: document.getElementById('loginPassword').value
        };
        
        if (!data.email || !data.password) {
            showNotification('Please fill all fields', 'error');
            return;
        }
        
        console.log('Sending login data:', data);
        
        try {
            const response = await apiCall('/auth/login', 'POST', data);
            
            console.log('Login response:', response);
            
            if (response.success && response.data) {
                localStorage.setItem('currentUser', JSON.stringify(response.data));
                showNotification('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showNotification(response.message || 'Invalid email or password', 'error');
            }
        } catch (error) {
            showNotification('Login failed. Please try again.', 'error');
            console.error('Login error:', error);
        }
    });
}

// Check if user is logged in
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Run auth check on page load
checkAuth();