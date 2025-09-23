document.addEventListener('DOMContentLoaded', function() {
    
    // --- Centralized Constants ---
    const BUSINESS_PHONE_NUMBER = "254793911383";
    const BUSINESS_EMAIL = "sunrisechickenbarn@gmail.com";

    // --- Shopping Cart State ---
    // We use localStorage to persist the cart between page loads
    let cart = JSON.parse(localStorage.getItem('sunriseFarmCart')) || [];

    // --- Sticky Header Scroll Effect ---
    const body = document.body;
    const scrollThreshold = 50; // Pixels to scroll before header changes

    const handleHeaderScroll = () => {
        if (window.scrollY > scrollThreshold) {
            body.classList.add('scrolled');
        } else {
            body.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleHeaderScroll);
    handleHeaderScroll(); // Run on load


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

    // Close modal when clicking on the background
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
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

    // --- Footer Legal Links Modal Logic ---
    // This is a more robust way than using onclick="...; return false;"
    document.querySelectorAll('.legal-link').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the link from navigating
            const modalId = this.getAttribute('data-modal-id');
            if (modalId) {
                openModal(modalId);
            }
        });
    });

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

    // --- Cart Functions (globally scoped) ---
    window.addToCart = (id, name, price, image) => {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, image, quantity: 1 });
        }
        saveCart();
        updateCartCount();
        // Optional: Show a confirmation
        alert(`${name} has been added to your cart!`);
    };

    window.updateQuantity = (id, change) => {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                // Remove item if quantity is 0 or less
                cart = cart.filter(cartItem => cartItem.id !== id);
            }
        }
        saveCart();
        renderCartPage(); // Re-render the cart page to show changes
    };

    window.removeItem = (id) => {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        renderCartPage();
    };

    window.clearCartAndNotify = () => {
        cart = [];
        saveCart();
        updateCartCount();
        // If on cart page, re-render to show it's empty
        if (window.location.pathname.endsWith('cart.html')) {
            renderCartPage();
        }
    };

    const saveCart = () => {
        localStorage.setItem('sunriseFarmCart', JSON.stringify(cart));
    };

    const updateCartCount = () => {
        const cartCountBubble = document.getElementById('cart-count-bubble');
        if (cartCountBubble) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountBubble.textContent = totalItems;
            cartCountBubble.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    };

    // --- Cart Page Rendering ---
    const renderCartPage = () => {
        const cartContainer = document.getElementById('cart-items-container');
        const cartTotalsSection = document.getElementById('cart-totals-section');
        const cartEmptyMessage = document.getElementById('cart-empty-message');
        const cartTotalPriceEl = document.getElementById('cart-total-price');

        if (!cartContainer) return; // Only run this on the cart page

        cartContainer.innerHTML = ''; // Clear current items

        if (cart.length === 0) {
            cartTotalsSection.style.display = 'none';
            cartEmptyMessage.style.display = 'block';
        } else {
            cartTotalsSection.style.display = 'block';
            cartEmptyMessage.style.display = 'none';

            let totalPrice = 0;

            cart.forEach(item => {
                totalPrice += item.price * item.quantity;

                const cartItemHTML = `
                    <div class="flex items-center justify-between bg-white p-4 rounded-xl shadow-md">
                        <div class="flex items-center gap-4">
                            <img src="${item.image}" alt="${item.name}" class="w-20 h-20 rounded-lg object-cover">
                            <div>
                                <h3 class="text-xl font-bold text-gray-800">${item.name}</h3>
                                <p class="text-gray-600">Ksh ${item.price}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex items-center border rounded-full">
                                <button onclick="updateQuantity('${item.id}', -1)" class="px-3 py-1 text-lg font-bold">-</button>
                                <span class="px-4 text-lg">${item.quantity}</span>
                                <button onclick="updateQuantity('${item.id}', 1)" class="px-3 py-1 text-lg font-bold">+</button>
                            </div>
                            <p class="text-xl font-bold w-24 text-right">Ksh ${item.price * item.quantity}</p>
                            <button onclick="removeItem('${item.id}')" class="text-red-500 hover:text-red-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
                cartContainer.innerHTML += cartItemHTML;
            });

            cartTotalPriceEl.textContent = `Ksh ${totalPrice}`;
        }
    };

    // --- Clear Cart Button ---
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your entire cart?')) {
                cart = [];
                saveCart();
                renderCartPage();
            }
        });
    }

    // --- Checkout & Invoice Modal Logic ---
    const checkoutBtn = document.getElementById('proceed-to-checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert("Your cart is empty. Please add some products before proceeding to checkout.");
                return;
            }
            generateInvoice();
            openModal('invoiceModal');
        });
    }

    const generateInvoice = () => {
        const invoiceItemsContainer = document.getElementById('invoice-items-container');
        const invoiceTotalPriceEl = document.getElementById('invoice-total-price');
        if (!invoiceItemsContainer || !invoiceTotalPriceEl) return;

        let invoiceHTML = `
            <div class="border-b-2 font-bold grid grid-cols-3 gap-4 pb-2">
                <span>Item</span>
                <span class="text-center">Quantity</span>
                <span class="text-right">Subtotal</span>
            </div>
        `;
        let totalPrice = 0;

        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            totalPrice += subtotal;
            invoiceHTML += `
                <div class="grid grid-cols-3 gap-4 py-2 border-b">
                    <span>${item.name}</span>
                    <span class="text-center">${item.quantity}</span>
                    <span class="text-right">Ksh ${subtotal}</span>
                </div>
            `;
        });

        invoiceItemsContainer.innerHTML = invoiceHTML;
        invoiceTotalPriceEl.textContent = `Ksh ${totalPrice}`;
    };

    const getOrderSummaryText = () => {
        const customerName = document.getElementById('customer_name').value || 'N/A';
        const customerPhone = document.getElementById('customer_phone').value || 'N/A';
        const customerAddress = document.getElementById('customer_address').value || 'N/A';
        let summary = `*Sunrise Chicken Farm Order*\n\n*Customer Name:* ${customerName}\n*Customer Phone:* ${customerPhone}\n*Delivery Address:* ${customerAddress}\n\n--- *Order Details* ---\n`;
        let totalPrice = 0;

        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            summary += `\n- ${item.name}\n  (Qty: ${item.quantity} x Ksh ${item.price}) = Ksh ${subtotal}`;
            totalPrice += subtotal;
        });

        summary += `\n\n---------------------\n*TOTAL: Ksh ${totalPrice}*\n---------------------\n\nThank you for your order! We will be in touch shortly to confirm delivery details.`;
        return summary;
    };

    const sendWhatsappBtn = document.getElementById('send-via-whatsapp');
    if (sendWhatsappBtn) {
        sendWhatsappBtn.addEventListener('click', () => {
            const orderText = getOrderSummaryText();
            const whatsappUrl = `https://wa.me/${BUSINESS_PHONE_NUMBER}?text=${encodeURIComponent(orderText)}`;
            window.open(whatsappUrl, '_blank');
            // Close modal and clear cart after a short delay
            setTimeout(() => {
                closeModal('invoiceModal');
                clearCartAndNotify();
            }, 1500); // 1.5-second delay
        });
    }

    const sendEmailBtn = document.getElementById('send-via-email');
    if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', () => {
            const orderText = getOrderSummaryText();
            const subject = "New Order from Sunrise Chicken Farm Website";
            const mailtoLink = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(orderText)}`;
            window.open(mailtoLink, '_blank');
            setTimeout(() => {
                closeModal('invoiceModal');
                clearCartAndNotify();
            }, 1500); // 1.5-second delay
        });
    }

    // --- Gallery Lightbox Logic ---
    const galleryImages = document.querySelectorAll('#farm-gallery img');
    if (galleryImages.length > 0) {
        const lightboxModal = document.getElementById('lightboxModal');
        const lightboxImage = document.getElementById('lightboxImage');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        let currentIndex = 0;

        const imageSources = Array.from(galleryImages).map(img => img.src);

        const showImage = (index) => {
            if (index < 0 || index >= imageSources.length) return;
            lightboxImage.src = imageSources[index];
            currentIndex = index;
        };

        galleryImages.forEach((img, index) => {
            img.parentElement.addEventListener('click', (e) => {
                e.preventDefault();
                openModal('lightboxModal');
                showImage(index);
            });
        });

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const newIndex = (currentIndex - 1 + imageSources.length) % imageSources.length;
                showImage(newIndex);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const newIndex = (currentIndex + 1) % imageSources.length;
                showImage(newIndex);
            });
        }
    }


    // --- Initializations ---
    updateCartCount(); // Update count on every page load
    
    // If we are on the cart page, render the cart items
    if (window.location.pathname.endsWith('cart.html')) {
        renderCartPage();
    }

});