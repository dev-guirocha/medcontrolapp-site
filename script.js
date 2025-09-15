document.addEventListener('DOMContentLoaded', () => {
    // --- Landing simple mode via URL (?mode=splash or ?splash=1) ---
    try {
        const params = new URLSearchParams(window.location.search);
        const isSplash = params.get('mode') === 'splash' || params.has('splash');
        if (isSplash) {
            document.body.classList.add('landing-simple');
        }
    } catch (_) {}

    // --- Header mínimo: expande navbar após rolar 100px (apenas quando não for splash) ---
    if (!document.body.classList.contains('landing-simple')) {
        // Já deixamos 'header-min' no body via HTML; garantir que está presente
        document.body.classList.add('header-min');
        const setExpanded = () => {
            if (window.scrollY > 100) {
                document.body.classList.add('nav-expanded');
            } else {
                document.body.classList.remove('nav-expanded');
            }
        };
        setExpanded();
        window.addEventListener('scroll', setExpanded, { passive: true });
    }

    // --- Mobile Menu Toggle ---
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-menu-link');

    function openMobileMenu() {
        mobileMenu.classList.add('show');
        mobileMenu.hidden = false;
        menuBtn.classList.add('active');
        menuBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('show');
        mobileMenu.hidden = true;
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
    }

    menuBtn.addEventListener('click', () => {
        const willOpen = !mobileMenu.classList.contains('show');
        if (willOpen) {
            openMobileMenu();
        } else {
            closeMobileMenu();
        }
    });

    // --- Close mobile menu when a link is clicked ---
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
            menuBtn.focus();
        });
    });

    // --- Close with Escape key ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('show')) {
            closeMobileMenu();
            menuBtn.focus();
        }
    });
    
    // --- Form Handling ---
    const form = document.getElementById('contact-form');
    if (form) {
        const messageTextarea = document.getElementById('message');
        const charCount = document.getElementById('char-count');
        const successMessage = document.getElementById('success-message');
        const fields = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            subject: document.getElementById('subject'),
            message: document.getElementById('message')
        };
        const errors = {
            name: document.getElementById('error-name'),
            email: document.getElementById('error-email'),
            subject: document.getElementById('error-subject'),
            message: document.getElementById('error-message')
        };

        function showError(fieldName, message) {
            const input = fields[fieldName];
            const errEl = errors[fieldName];
            if (!input || !errEl) return;
            input.setAttribute('aria-invalid', 'true');
            errEl.textContent = message;
            errEl.classList.add('show');
        }

        function clearError(fieldName) {
            const input = fields[fieldName];
            const errEl = errors[fieldName];
            if (!input || !errEl) return;
            input.removeAttribute('aria-invalid');
            errEl.textContent = '';
            errEl.classList.remove('show');
        }

        function validateField(fieldName) {
            const input = fields[fieldName];
            if (!input) return true;
            clearError(fieldName);
            const value = (input.value || '').trim();
            switch (fieldName) {
                case 'name':
                    if (!value) { showError('name', 'Informe seu nome completo.'); return false; }
                    if (value.length < 2) { showError('name', 'Nome muito curto.'); return false; }
                    return true;
                case 'email':
                    if (!value) { showError('email', 'Informe seu e-mail.'); return false; }
                    if (!input.checkValidity()) { showError('email', 'Digite um e-mail válido.'); return false; }
                    return true;
                case 'subject':
                    if (!value) { showError('subject', 'Selecione um assunto.'); return false; }
                    return true;
                case 'message':
                    if (!value) { showError('message', 'Digite sua mensagem.'); return false; }
                    if (value.length > 500) { showError('message', 'Mensagem deve ter no máximo 500 caracteres.'); return false; }
                    return true;
                default:
                    return true;
            }
        }

        ['name','email','subject','message'].forEach((fname) => {
            const el = fields[fname];
            if (!el) return;
            const handler = () => validateField(fname);
            el.addEventListener('input', handler);
            el.addEventListener('blur', handler);
            if (fname === 'subject') el.addEventListener('change', handler);
        });

        // Character counter
        if (messageTextarea && charCount) {
            messageTextarea.addEventListener('input', () => {
                const length = messageTextarea.value.length;
                charCount.textContent = length;
                charCount.style.color = length > 450 ? '#EF4444' : length > 400 ? '#F59E0B' : '#6B7280';
            });
        }

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let allValid = true;
            ['name','email','subject','message'].forEach((fname) => {
                const valid = validateField(fname);
                if (!valid) allValid = false;
            });
            if (!allValid) {
                const firstInvalid = Object.keys(fields).map(k => fields[k]).find(el => el.hasAttribute('aria-invalid'));
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            // Demo: sucesso artificial
            const submitButton = form.querySelector('.submit-button');
            submitButton.querySelector('.button-text').textContent = 'Enviando...';
            submitButton.disabled = true;
            submitButton.setAttribute('aria-disabled', 'true');
            form.setAttribute('aria-busy', 'true');

            setTimeout(() => {
                successMessage.classList.add('show');
                form.reset();
                charCount.textContent = '0';
                charCount.style.color = '#6B7280';
                submitButton.querySelector('.button-text').textContent = 'Enviar Mensagem';
                submitButton.disabled = false;
                submitButton.removeAttribute('aria-disabled');
                form.removeAttribute('aria-busy');
                // Limpa erros após envio
                ['name','email','subject','message'].forEach(clearError);
            }, 1500);
        });
    }

    // --- Active Nav Link on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.desktop-menu .nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 // 50% of the section must be visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                    if (link.getAttribute('data-section') === sectionId) {
                        link.classList.add('active');
                        link.setAttribute('aria-current', 'page');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Foca primeiro item do menu ao abrir
    menuBtn.addEventListener('click', () => {
        if (mobileMenu.classList.contains('show')) {
            const firstItem = mobileMenu.querySelector('.mobile-menu-link');
            if (firstItem) firstItem.focus();
        }
    });

});

// --- Functions available globally ---
function closeSuccessMessage() {
    const successMessage = document.getElementById('success-message');
    if (successMessage) {
        successMessage.classList.remove('show');
    }
}
