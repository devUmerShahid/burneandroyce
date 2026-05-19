document.addEventListener('DOMContentLoaded', () => {
    console.log("Burne & Royce Digital - Interactive systems initialized.");

    // Micro-interactions for Hero buttons (if uncommented)
    const chatBtn = document.getElementById('chatButton');
    if (chatBtn) {
        chatBtn.addEventListener('click', () => {
            alert("Thanks for reaching out! Let's start our conversation.");
        });
    }

    const fingerprintBtn = document.querySelector('.fingerprint-btn');
    if (fingerprintBtn) {
        fingerprintBtn.addEventListener('click', () => {
            console.log("Fingerprint icon clicked!");
        });
    }

    /* -------------------------------------------------------------
       1. Touchpad & Horizontal Drag Marquee (JS driven for infinite loop + 2-finger scroll)
       ------------------------------------------------------------- */
    const marqueeContainer = document.querySelector('.work-marquee-container');
    const marqueeTrack = document.querySelector('.work-marquee-track');

    if (marqueeContainer && marqueeTrack) {
        let isUserInteracting = false;
        let isHovered = false;
        let interactionTimeout = null;
        const scrollSpeed = 0.8; // Pixels per frame (smooth slow crawl)
        
        // Auto scroll animation loop
        function autoScroll() {
            if (!isUserInteracting && !isHovered) {
                marqueeContainer.scrollLeft += scrollSpeed;

                // Reset scroll when reaching half-way (since the cards are duplicated)
                const halfWidth = marqueeTrack.scrollWidth / 2;
                if (marqueeContainer.scrollLeft >= halfWidth) {
                    marqueeContainer.scrollLeft -= halfWidth;
                } else if (marqueeContainer.scrollLeft <= 0) {
                    marqueeContainer.scrollLeft += halfWidth;
                }
            }
            requestAnimationFrame(autoScroll);
        }
        
        // Start scroll
        requestAnimationFrame(autoScroll);

        // Pause on mouse hover
        marqueeContainer.addEventListener('mouseenter', () => {
            isHovered = true;
        });

        marqueeContainer.addEventListener('mouseleave', () => {
            isHovered = false;
        });

        // Trackpad 2-finger scroll detection (wheel event)
        marqueeContainer.addEventListener('wheel', (e) => {
            isUserInteracting = true;
            clearTimeout(interactionTimeout);

            // Handle loop wrap during active manual scrolling
            const halfWidth = marqueeTrack.scrollWidth / 2;
            if (marqueeContainer.scrollLeft >= halfWidth) {
                marqueeContainer.scrollLeft -= halfWidth;
            } else if (marqueeContainer.scrollLeft <= 0) {
                marqueeContainer.scrollLeft += halfWidth;
            }

            // Resume auto-scroll after 2 seconds of inactivity
            interactionTimeout = setTimeout(() => {
                isUserInteracting = false;
            }, 2000);
        }, { passive: true });

        // Touch swipe (mobile) interaction
        marqueeContainer.addEventListener('touchstart', () => {
            isUserInteracting = true;
            clearTimeout(interactionTimeout);
        }, { passive: true });

        marqueeContainer.addEventListener('touchend', () => {
            interactionTimeout = setTimeout(() => {
                isUserInteracting = false;
            }, 2000);
        }, { passive: true });

        // Mouse Drag to Scroll (Bonus premium micro-interaction!)
        let isMouseDown = false;
        let startX;
        let scrollLeftVal;

        marqueeContainer.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            isUserInteracting = true;
            clearTimeout(interactionTimeout);
            marqueeContainer.classList.add('active');
            startX = e.pageX - marqueeContainer.offsetLeft;
            scrollLeftVal = marqueeContainer.scrollLeft;
        });

        marqueeContainer.addEventListener('mouseleave', () => {
            isMouseDown = false;
        });

        marqueeContainer.addEventListener('mouseup', () => {
            isMouseDown = false;
            interactionTimeout = setTimeout(() => {
                isUserInteracting = false;
            }, 2000);
        });

        marqueeContainer.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            e.preventDefault();
            const x = e.pageX - marqueeContainer.offsetLeft;
            const walk = (x - startX) * 1.5; // Scroll speed modifier
            marqueeContainer.scrollLeft = scrollLeftVal - walk;

            // Handle infinite wrap while dragging
            const halfWidth = marqueeTrack.scrollWidth / 2;
            if (marqueeContainer.scrollLeft >= halfWidth) {
                marqueeContainer.scrollLeft -= halfWidth;
            } else if (marqueeContainer.scrollLeft <= 0) {
                marqueeContainer.scrollLeft += halfWidth;
            }
        });
    }

    /* -------------------------------------------------------------
       2. Scroll-Driven Circular Reveal Transition for Work Section
       ------------------------------------------------------------- */
    const workSection = document.querySelector('.work-section');
    const revealCircle = document.querySelector('.work-reveal-circle');

    if (workSection && revealCircle) {
        function handleScrollReveal() {
            const rect = workSection.getBoundingClientRect();
            const viewHeight = window.innerHeight;

            // When the section starts coming into view from the bottom
            if (rect.top < viewHeight && rect.bottom > 0) {
                // Calculate position relative to viewport
                const startPos = viewHeight;
                const currentPos = rect.top;
                
                // Progress from 0 (touches bottom of screen) to 1 (reaches 15% of viewport height)
                let progress = (startPos - currentPos) / (viewHeight * 0.85);
                progress = Math.min(Math.max(progress, 0), 1.25); // Cap it with overshoot to fully cover

                // Scale factor: Base size of circle is 100px.
                // Scale 40 * 100px = 4000px diameter, which easily covers full 4K screens.
                const maxScale = 42; 
                const currentScale = progress * maxScale;
                
                revealCircle.style.transform = `translate(-50%, -50%) scale(${currentScale})`;
                revealCircle.style.opacity = progress > 0.02 ? 1 : 0;
            } else if (rect.top >= viewHeight) {
                // Completely out of view below
                revealCircle.style.transform = `translate(-50%, -50%) scale(0)`;
                revealCircle.style.opacity = 0;
            } else if (rect.bottom <= 0) {
                // Completely scrolled past above
                revealCircle.style.transform = `translate(-50%, -50%) scale(42)`;
                revealCircle.style.opacity = 1;
            }
        }

        // Run on load and on scroll
        window.addEventListener('scroll', handleScrollReveal);
        handleScrollReveal(); // Initialize state
    }

    /* -------------------------------------------------------------
       3. Wix-Style Scroll-Linked Interpolation for Services Headings
       ------------------------------------------------------------- */
    const headingItems = document.querySelectorAll('.service-heading-item');
    const servicesSection = document.querySelector('.services-section');

    if (headingItems.length > 0 && servicesSection) {
        function handleServicesScroll() {
            // Only execute parallax scroll links on desktop sizes
            if (window.innerWidth <= 991) {
                headingItems.forEach(item => {
                    item.style.transform = '';
                    delete item.dataset.naturalTop;
                });
                return;
            }

            const viewHeight = window.innerHeight;
            const startTrigger = viewHeight; // Parallax begins when item enters bottom viewport edge
            const endTrigger = 220; // Parallax settles to 0,0 when item rises to 220px from top

            headingItems.forEach(item => {
                // Cache the absolute document top position once to prevent transform-induced jitter loops
                if (!item.dataset.naturalTop) {
                    const prevTransform = item.style.transform;
                    item.style.transform = 'none';
                    const rect = item.getBoundingClientRect();
                    item.dataset.naturalTop = rect.top + window.scrollY;
                    item.style.transform = prevTransform;
                }

                const absoluteTop = parseFloat(item.dataset.naturalTop);
                const currentScrollY = window.scrollY;
                
                // Stable viewport top unaffected by translation transforms
                const naturalViewportTop = absoluteTop - currentScrollY;
                
                // Calculate interpolation progress
                let progress = (naturalViewportTop - endTrigger) / (startTrigger - endTrigger);
                progress = Math.min(Math.max(progress, 0), 1); // Clamp to [0, 1] range

                // Wix translation formula: Initial state (346px, 200px) -> Settled state (0px, 0px)
                const translateX = progress * 346;
                const translateY = progress * 200;

                // Apply direct style transformations synchronously with scroll for buttery smooth 60fps/120fps physics
                item.style.transform = `translate(${translateX}px, ${translateY}px)`;
            });
        }

        window.addEventListener('scroll', handleServicesScroll);
        window.addEventListener('resize', handleServicesScroll);
        // Delay initialization slightly to let fonts/layouts fully settle
        setTimeout(handleServicesScroll, 100);
    }
});
