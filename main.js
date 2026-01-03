
        // Mobile Menu Toggle
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');

        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.textContent = '☰';
            });
        });

        // Navbar scroll effect
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Animate stats on scroll
        const observerOptions = {
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            observer.observe(statsSection);
        }

        function animateStats() {
            const statNumbers = document.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.textContent);
                let current = 0;
                const increment = target / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        stat.textContent = target + '%';
                        clearInterval(timer);
                    } else {
                        stat.textContent = Math.floor(current) + '%';
                    }
                }, 30);
            });
        }

        // Add animation to elements on scroll
        const animateOnScroll = () => {
            const elements = document.querySelectorAll('.feature-card, .program-card');
            elements.forEach((element, index) => {
                const elementTop = element.getBoundingClientRect().top;
                const elementBottom = element.getBoundingClientRect().bottom;
                
                if (elementTop < window.innerHeight && elementBottom > 0) {
                    setTimeout(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        };

        // Set initial state
        document.querySelectorAll('.feature-card, .program-card').forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'all 0.6s ease';
        });

        window.addEventListener('scroll', animateOnScroll);
        window.addEventListener('load', animateOnScroll);

        /* Booking modal and form handling */
        (function () {
            const bookBtn = document.getElementById('bookNowBtn');
            const modal = document.getElementById('bookingModal');
            const closeBtn = modal ? modal.querySelector('.modal-close') : null;
            const cancelBtn = modal ? modal.querySelector('.modal-cancel') : null;
            const form = document.getElementById('bookingForm');
            const status = form ? form.querySelector('.form-status') : null;
            let opener = null;

            function openModal() {
                if (!modal) return;
                opener = document.activeElement;
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                // focus first input
                const first = form.querySelector('input, select, textarea');
                if (first) first.focus();
            }

            function closeModal() {
                if (!modal) return;
                modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                if (opener) opener.focus();
            }

            if (bookBtn) bookBtn.addEventListener('click', openModal);
            if (closeBtn) closeBtn.addEventListener('click', closeModal);
            if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
            if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

            if (form) {
                form.addEventListener('submit', function (e) {
                    e.preventDefault();
                    if (!form.checkValidity()) {
                        form.reportValidity();
                        return;
                    }
                    const submitBtn = form.querySelector('button[type="submit"]');
                    const originalText = submitBtn.textContent;
                    submitBtn.disabled = true;
                    submitBtn.classList.add('is-loading');
                    submitBtn.setAttribute('aria-busy', 'true');
                    if (cancelBtn) cancelBtn.disabled = true;
                    status.textContent = 'جاري الإرسال...';
                    status.classList.remove('success','error');
                    const fd = new FormData(form);
                    // include a marker for backend to identify source
                    fd.append('form_source', 'website_booking_form');
                    // For WordPress, admin-post.php expects form-data; we POST to the form action.
                    fetch(form.action, { method: 'POST', body: fd, credentials: 'same-origin' })
                        .then(r => {
                            if (!r.ok) throw new Error('خطأ في الاتصال');
                            return r.text();
                        })
                        .then(() => {
                            status.textContent = 'تم إرسال طلب الحجز بنجاح. سنتواصل معك قريبا.';
                            status.classList.add('success');
                            form.reset();
                            setTimeout(() => { 
                                closeModal(); 
                                status.textContent = ''; 
                                status.classList.remove('success'); 
                                submitBtn.disabled = false;
                                submitBtn.classList.remove('is-loading');
                                submitBtn.removeAttribute('aria-busy');
                                submitBtn.textContent = originalText;
                                if (cancelBtn) cancelBtn.disabled = false;
                            }, 2200);
                        })
                        .catch((err) => {
                            console.error(err);
                            status.textContent = 'حدث خطأ أثناء إرسال الطلب. يمكنك المحاولة لاحقًا أو الاتصال بنا.';
                            status.classList.add('error');
                            submitBtn.disabled = false;
                            submitBtn.classList.remove('is-loading');
                            submitBtn.removeAttribute('aria-busy');
                            submitBtn.textContent = originalText;
                            if (cancelBtn) cancelBtn.disabled = false;
                        });
                });
            }
        })();