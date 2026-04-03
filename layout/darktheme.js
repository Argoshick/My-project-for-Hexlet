// тема
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const themeBtn = document.getElementById('themeToggle');
    if (document.body.classList.contains('dark-theme')) {
        themeBtn.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeBtn.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

// Загрузка сохраненной темы при загрузке страницы
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    document.getElementById('themeToggle').textContent = '☀️';
}


document.getElementById('themeToggle').addEventListener('click', toggleTheme);