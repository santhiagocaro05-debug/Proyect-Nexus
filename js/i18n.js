const translations = {
    "es": {
        "nav_home": "Inicio",
        "nav_products": "Productos",
        "nav_comments": "Comentarios",
        "nav_forum": "Foro",
        "nav_features": "Características",
        "nav_team": "Equipo",
        "nav_contributors": "Contribuidores",
        "auth_btn": "Iniciar Sesión",
        "hero_title": "El futuro de la Inteligencia Artificial",
        "hero_desc": "Encuentra la mas accesible Ilum-Nexus-Jarvis para los que quieren el máximo poder. Diseñado por 157 Developers Team.",
        "btn_products": "Ver productos",
        "btn_features": "Ver características",
        "search_placeholder": "Buscar por nombre o descripción...",
        "cart_title": "Carrito",
        "cart_empty": "Tu carrito está vacío",
        "cart_checkout": "Pagar"
    },
    "en": {
        "nav_home": "Home",
        "nav_products": "Products",
        "nav_comments": "Reviews",
        "nav_forum": "Forum",
        "nav_features": "Features",
        "nav_team": "Team",
        "nav_contributors": "Contributors",
        "auth_btn": "Login",
        "hero_title": "The future of Artificial Intelligence",
        "hero_desc": "Find the most accessible Ilum-Nexus-Jarvis for those who want maximum power. Designed by 157 Developers Team.",
        "btn_products": "View products",
        "btn_features": "View features",
        "search_placeholder": "Search by name or description...",
        "cart_title": "Cart",
        "cart_empty": "Your cart is empty",
        "cart_checkout": "Checkout"
    }
};

let currentLang = 'es';

function toggleLanguage() {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    document.getElementById('langLabel').textContent = currentLang.toUpperCase();
    applyTranslations();
}

function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[currentLang][key];
            } else {
                // If it contains icons, just replace text node or handle carefully. 
                // For safety, if it has child elements, we might lose them.
                // It's better to wrap translatable text in a span.
                el.textContent = translations[currentLang][key];
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('langBtn')?.addEventListener('click', toggleLanguage);
});
