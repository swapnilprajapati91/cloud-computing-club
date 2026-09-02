        // Mobile Menu Toggle
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');

        if (btn && menu) {
            btn.addEventListener('click', () => {
                menu.classList.toggle('hidden');
            });
            
            // Close mobile menu on link click
            const links = menu.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    menu.classList.add('hidden');
                });
            });
        }

        // Navbar Scroll Effect
        const navbar = document.getElementById('navbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 20) {
                    navbar.classList.add('shadow-lg', 'bg-darkBg/95');
                    navbar.classList.remove('glass-nav');
                } else {
                    navbar.classList.remove('shadow-lg', 'bg-darkBg/95');
                    navbar.classList.add('glass-nav');
                }
            });
        }

        // Form Validation
        const form = document.getElementById('registrationForm');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                let isValid = true;
                
                // Name validation
                const name = document.getElementById('name');
                const nameError = document.getElementById('nameError');
                if(name && nameError) {
                    if(name.value.trim() === '') {
                        nameError.classList.remove('hidden');
                        name.classList.add('border-red-500');
                        isValid = false;
                    } else {
                        nameError.classList.add('hidden');
                        name.classList.remove('border-red-500');
                    }
                }

                // Roll validation
                const roll = document.getElementById('roll');
                const rollError = document.getElementById('rollError');
                if (roll && rollError) {
                    if(roll.value.trim() === '') {
                        rollError.classList.remove('hidden');
                        roll.classList.add('border-red-500');
                        isValid = false;
                    } else {
                        rollError.classList.add('hidden');
                        roll.classList.remove('border-red-500');
                    }
                }

                // Email validation
                const email = document.getElementById('email');
                const emailError = document.getElementById('emailError');
                if (email && emailError) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if(!emailRegex.test(email.value)) {
                        emailError.classList.remove('hidden');
                        email.classList.add('border-red-500');
                        isValid = false;
                    } else {
                        emailError.classList.add('hidden');
                        email.classList.remove('border-red-500');
                    }
                }

                // Success
                if (isValid) {
                    const btn = form.querySelector('button[type="submit"]');
                    if (btn) {
                        const originalText = btn.innerHTML;
                        
                        // Show loading state
                        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Deploying...';
                        btn.disabled = true;

                        // Simulate API call
                        setTimeout(() => {
                            btn.innerHTML = originalText;
                            btn.disabled = false;
                            const successMsg = document.getElementById('successMessage');
                            if (successMsg) successMsg.classList.remove('hidden');
                            form.reset();
                            
                            // Hide success message after 5 seconds
                            setTimeout(() => {
                                if (successMsg) successMsg.classList.add('hidden');
                            }, 5000);
                        }, 1500);
                    }
                }
            });
        }

        // Initialize AOS animations
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                once: true,
                offset: 100
            });
        }
