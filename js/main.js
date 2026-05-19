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

    /* -------------------------------------------------------------
       4. Interactive Video Showcase Play/Pause Controller
       ------------------------------------------------------------- */
    const showcaseVideo = document.getElementById('showcaseVideo');
    const videoPlayOverlay = document.getElementById('videoPlayOverlay');

    if (showcaseVideo && videoPlayOverlay) {
        // Toggle play/pause on click
        function toggleVideoPlay() {
            if (showcaseVideo.paused) {
                showcaseVideo.play().then(() => {
                    videoPlayOverlay.classList.add('playing');
                }).catch(err => {
                    console.log("Play failed: ", err);
                });
            } else {
                showcaseVideo.pause();
                videoPlayOverlay.classList.remove('playing');
            }
        }

        videoPlayOverlay.addEventListener('click', toggleVideoPlay);
        showcaseVideo.addEventListener('click', toggleVideoPlay);

        // Autoplay when scrolled into view
        const observerOptions = {
            root: null,
            threshold: 0.2
        };

        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    showcaseVideo.play().then(() => {
                        videoPlayOverlay.classList.add('playing');
                    }).catch(err => {
                        console.log("Autoplay was blocked or interrupted: ", err);
                    });
                } else {
                    showcaseVideo.pause();
                    videoPlayOverlay.classList.remove('playing');
                }
            });
        }, observerOptions);

        videoObserver.observe(showcaseVideo);
    }

    /* -------------------------------------------------------------
       5. Draggable & Auto-Scrolling Events Gallery Slider
       ------------------------------------------------------------- */
    const galleryWrapper = document.getElementById('galleryTrackWrapper');
    const galleryTrack = document.getElementById('galleryTrack');

    if (galleryWrapper && galleryTrack) {
        let isUserInteracting = false;
        let isHovered = false;
        let interactionTimeout = null;
        const scrollSpeed = 0.7; // Pixels per frame (smooth slow crawl)
        
        // Auto scroll animation loop
        function autoScrollGallery() {
            if (!isUserInteracting && !isHovered) {
                galleryWrapper.scrollLeft += scrollSpeed;

                const totalSlidesCount = galleryTrack.children.length;
                if (totalSlidesCount > 0) {
                    const halfWidth = galleryTrack.scrollWidth / 2;
                    if (galleryWrapper.scrollLeft >= halfWidth) {
                        galleryWrapper.scrollLeft -= halfWidth;
                    } else if (galleryWrapper.scrollLeft <= 0) {
                        galleryWrapper.scrollLeft += halfWidth;
                    }
                }
            }
            requestAnimationFrame(autoScrollGallery);
        }
        
        // Start scroll loop
        requestAnimationFrame(autoScrollGallery);

        // Pause auto-scroll on hover
        galleryWrapper.addEventListener('mouseenter', () => {
            isHovered = true;
        });

        galleryWrapper.addEventListener('mouseleave', () => {
            isHovered = false;
        });

        // Loop wrap logic on manual scroll / trackpad scroll
        galleryWrapper.addEventListener('scroll', () => {
            const halfWidth = galleryTrack.scrollWidth / 2;
            if (galleryWrapper.scrollLeft >= halfWidth) {
                galleryWrapper.scrollLeft -= halfWidth;
            } else if (galleryWrapper.scrollLeft <= 0) {
                galleryWrapper.scrollLeft += halfWidth;
            }
        }, { passive: true });

        // Wheel event support for trackpads
        galleryWrapper.addEventListener('wheel', () => {
            isUserInteracting = true;
            clearTimeout(interactionTimeout);

            interactionTimeout = setTimeout(() => {
                isUserInteracting = false;
            }, 2500);
        }, { passive: true });

        // Touch event support for mobile swiping
        galleryWrapper.addEventListener('touchstart', () => {
            isUserInteracting = true;
            clearTimeout(interactionTimeout);
        }, { passive: true });

        galleryWrapper.addEventListener('touchend', () => {
            interactionTimeout = setTimeout(() => {
                isUserInteracting = false;
            }, 2500);
        }, { passive: true });

        // Mouse Draggable Slider physics!
        let isMouseDown = false;
        let startX;
        let scrollLeftVal;

        galleryWrapper.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            isUserInteracting = true;
            clearTimeout(interactionTimeout);
            startX = e.pageX - galleryWrapper.offsetLeft;
            scrollLeftVal = galleryWrapper.scrollLeft;
        });

        galleryWrapper.addEventListener('mouseleave', () => {
            if (isMouseDown) {
                isMouseDown = false;
                interactionTimeout = setTimeout(() => {
                    isUserInteracting = false;
                }, 2500);
            }
        });

        galleryWrapper.addEventListener('mouseup', () => {
            isMouseDown = false;
            interactionTimeout = setTimeout(() => {
                isUserInteracting = false;
            }, 2500);
        });

        galleryWrapper.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            e.preventDefault();
            const x = e.pageX - galleryWrapper.offsetLeft;
            const walk = (x - startX) * 1.5; // Drag sensitivity modifier
            galleryWrapper.scrollLeft = scrollLeftVal - walk;
        });
    }
});
