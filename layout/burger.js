// burger.js - управление бургер-меню

document.addEventListener('DOMContentLoaded', function() {
    const burgerBtn = document.getElementById('burgerBtn');
    const burgerMenu = document.getElementById('burgerMenu');
    const closeBurger = document.getElementById('closeBurger');
    
    // Открыть меню
    if (burgerBtn) {
        burgerBtn.addEventListener('click', function() {
            burgerMenu.classList.add('active');
            document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
        });
    }
    
    // Закрыть меню через крестик
    if (closeBurger) {
        closeBurger.addEventListener('click', function() {
            burgerMenu.classList.remove('active');
            document.body.style.overflow = ''; // Возвращаем скролл
        });
    }
    
    // Закрыть меню при клике на фон 
    if (burgerMenu) {
        burgerMenu.addEventListener('click', function(e) {
            // Закрываем только если кликнули именно на фон, а не на контент
            if (e.target === burgerMenu) {
                burgerMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Закрыть меню при нажатии клавиши Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && burgerMenu.classList.contains('active')) {
            burgerMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Закрыть меню при клике на ссылку внутри меню
    const burgerLinks = document.querySelectorAll('.burger-nav a');
    burgerLinks.forEach(link => {
        link.addEventListener('click', function() {
            burgerMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
});