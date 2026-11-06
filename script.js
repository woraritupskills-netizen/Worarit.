(function () {
    // เปิดใช้งานสไตล์ animation (ถ้า JS ไม่ทำงาน เนื้อหาจะยังแสดงตามปกติ)
    document.documentElement.classList.add('js');

    var header = document.getElementById('siteHeader');
    var navToggle = document.getElementById('navToggle');
    var mainNav = document.getElementById('mainNav');
    var navLinks = mainNav.querySelectorAll('a');
    var backToTop = document.getElementById('backToTop');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- Hamburger Menu ----------
    function closeMenu() {
        navToggle.classList.remove('open');
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'เปิดเมนู');
    }

    navToggle.addEventListener('click', function () {
        var isOpen = mainNav.classList.toggle('open');
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.setAttribute('aria-label', isOpen ? 'ปิดเมนู' : 'เปิดเมนู');
    });

    navLinks.forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
        if (!header.contains(e.target)) {
            closeMenu();
        }
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });

    // ---------- Header shadow + Back to Top ----------
    function onScroll() {
        var y = window.scrollY || window.pageYOffset;
        header.classList.toggle('scrolled', y > 10);
        backToTop.classList.toggle('show', y > 500);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    // ---------- Scroll Reveal ----------
    var revealItems = document.querySelectorAll('.reveal');

    function showItem(el) {
        // หน่วงเวลาเล็กน้อยให้การ์ดในแถวเดียวกันค่อยๆ ปรากฏ
        var siblings = el.parentElement ? Array.prototype.slice.call(el.parentElement.children) : [];
        var delay = (siblings.indexOf(el) % 4) * 90;
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('visible');

        // เมื่อแสดงเสร็จ ถอด class reveal ออก เพื่อให้ hover ของการ์ดทำงานเร็วตามปกติ
        setTimeout(function () {
            el.style.transitionDelay = '';
            el.classList.remove('reveal', 'visible');
        }, 900 + delay);
    }

    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    showItem(entry.target);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealItems.forEach(function (item) {
            revealObserver.observe(item);
        });
    } else {
        revealItems.forEach(function (item) {
            item.classList.remove('reveal');
        });
    }

    // ---------- Animated Counter ----------
    var counters = document.querySelectorAll('.counter');

    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) { return; }

        if (reduceMotion) {
            el.textContent = target;
            return;
        }

        var duration = 1400;
        var start = null;
        el.textContent = '0';

        function step(ts) {
            if (start === null) { start = ts; }
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });

        counters.forEach(function (c) {
            counterObserver.observe(c);
        });
    }

    // ---------- Active Navigation ----------
    var sections = document.querySelectorAll('section[id]');

    if ('IntersectionObserver' in window) {
        var navObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    navLinks.forEach(function (link) {
                        link.classList.toggle(
                            'active',
                            link.getAttribute('href') === '#' + entry.target.id
                        );
                    });
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach(function (section) {
            navObserver.observe(section);
        });
    }

    // ---------- Lightbox (ดูภาพขนาดใหญ่) ----------
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxCaption = document.getElementById('lightboxCaption');
    var lightboxClose = document.getElementById('lightboxClose');
    var lastFocus = null;

    function openLightbox(src, alt) {
        lastFocus = document.activeElement;
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightboxCaption.textContent = alt || '';
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        lightboxClose.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
    }

    // คลิกที่ปุ่ม/องค์ประกอบที่มี data-lightbox และมี <img> อยู่ข้างใน
    document.addEventListener('click', function (e) {
        var trigger = e.target.closest('[data-lightbox]');
        if (!trigger) { return; }
        var img = trigger.querySelector('img');
        if (!img) { return; }
        openLightbox(img.currentSrc || img.src, img.alt);
    });

    lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) { closeLightbox(); }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) {
            closeLightbox();
        }
    });
})();