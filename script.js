document.addEventListener('DOMContentLoaded', function() {
    
    // --- Generic Modal Logic ---
    // Make functions globally available for onclick attributes
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.classList.add('overflow-hidden');
        }
    }

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('overflow-hidden');
        }
    }

    // --- Animate on Scroll (AOS-like) ---
    const aosElements = document.querySelectorAll('.aos-fade-up');
    if (aosElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                }
            });
        }, {
            threshold: 0.1
        });
        aosElements.forEach(element => {
            observer.observe(element);
        });
    }

    // --- Mobile Menu Logic ---
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });

        // Close mobile menu when a link is clicked
        mainNav.querySelectorAll('ul li a').forEach(link => {
            link.addEventListener('click', function() {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                }
            });
        });
    }

    // --- Back to Top Button ---
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        const toggleBackToTopButton = () => {
            if (window.scrollY > 200) {
                backToTopButton.classList.remove('opacity-0', 'invisible');
                backToTopButton.classList.add('opacity-100');
            } else {
                backToTopButton.classList.remove('opacity-100');
                backToTopButton.classList.add('opacity-0', 'invisible');
            }
        };

        window.addEventListener('scroll', toggleBackToTopButton);

        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        toggleBackToTopButton();
    }

    // --- Active Navigation Link Styling ---
    const navLinks = document.querySelectorAll('.main-nav a');
    // Get the page name from the URL, e.g., "about.html" or "" for the root
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        // Get the page name from the link's href
        const linkPage = link.getAttribute('href').split('/').pop();

        // Special case for the "Order Now!" button which might link to contact.html
        if (link.classList.contains('btn-primary') && currentPage === 'contact.html') {
             link.classList.add('active-nav-link');
        } else if (linkPage === currentPage) {
            link.classList.add('active-nav-link');
        }
    });

});