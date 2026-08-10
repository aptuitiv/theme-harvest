/* ===========================================================================
    Sticky header behavior

    Single scroll listener drives both the .is-sticky toggle and the
    hide-on-scroll behavior at small screens. Using scroll position
    (instead of an IntersectionObserver against a sentinel) gives us a
    single source of truth and explicit buffer zones around the
    thresholds, so we never oscillate.

    Companion CSS: `html.has-sticky-collapse-lg` / `.has-sticky-collapse-sm`
    set `overflow-anchor: none` — without that, when CSS-driven
    hide-when-sticky rules collapse content inside the header
    (display: none), the browser's scroll-anchoring silently nudges
    scrollY to keep visual position stable. That nudge can flip scrollY
    back across the sticky threshold and produce a rapid
    is-sticky / hide / show loop.

    Below the small-screen breakpoint, when the user scrolls down the
    sticky element animates from `top: 0` to `top: -<measured-height>px`
    (Animating `top` rather than `transform: translateY` keeps the
    visible content seamless; with translateY the sticky element still
    occupies its top-of-viewport slot in layout terms while it slides
    visually, leaving an empty strip during slow scrolls.)
=========================================================================== */

const stickyHeader = {
    header: null,
    naturalOffsetTop: 0,
    lastScrollY: 0,
    isSticky: false,
    isHidden: false,
    // Matches the --m-large-screen-nav custom media (min-width: 1051px)
    // defined in css/config/config.css.
    smallScreenBreakpoint: 1051,
    config: {
        // Once sticky, don't disengage until scrollY drops this many px
        // BELOW the natural threshold. The buffer prevents micro-toggling
        // at the boundary (touch input, layout shifts, etc.).
        stickyBuffer: 30,
        // Minimum px of scroll movement required to toggle hide/show.
        // Filters tiny touchscreen scroll noise.
        hideDelta: 5,
    },

    init() {
        this.header = document.querySelector('.has-sticky-header .Header');
        if (!this.header) return;
        if (!this.featuresSupported()) return;
        this.captureNaturalOffset();
        this.updateAnchorOffset();
        this.setupScrollListener();
        window.addEventListener('resize', () => {
            this.captureNaturalOffset();
            this.updateAnchorOffset();
        });
        // Sync state to actual scroll position on load (e.g. browser
        // restoring a deep scroll position after refresh).
        this.handleScroll();
    },

    /**
     * The header's natural document position. offsetTop returns the
     * natural value even when the element is `position: sticky`, so
     * this is reliable regardless of current sticky state.
     */
    captureNaturalOffset() {
        this.naturalOffsetTop = this.header.offsetTop;
    },

    featuresSupported() {
        return (
            typeof CSS !== 'undefined' &&
            typeof CSS.supports === 'function' &&
            CSS.supports('position', 'sticky')
        );
    },

    setupScrollListener() {
        let ticking = false;
        window.addEventListener(
            'scroll',
            () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        this.handleScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            },
            { passive: true },
        );
    },

    handleScroll() {
        const { scrollY } = window;
        const isLargeScreen = window.innerWidth >= this.smallScreenBreakpoint;
        const hideEnabled = this.header.classList.contains(
            'Header--hideOnScroll',
        );
        let stickyChangedThisFrame = false;

        // Sticky engagement with a buffer zone. The disengage threshold
        // is clamped to 0 so that headers whose natural offsetTop is at
        // or near 0 (the typical case) can still un-stick when the user
        // scrolls all the way back to the top — otherwise the disengage
        // bound goes negative and the class is never removed.
        const disengageAt = Math.max(
            0,
            this.naturalOffsetTop - this.config.stickyBuffer,
        );
        if (!this.isSticky && scrollY > this.naturalOffsetTop) {
            this.isSticky = true;
            this.header.classList.add('is-sticky');
            stickyChangedThisFrame = true;
            // Defer remeasure to next frame so CSS-driven layout collapse
            // from the .is-sticky class has settled before we sample.
            requestAnimationFrame(() => this.updateAnchorOffset());
        } else if (this.isSticky && scrollY <= disengageAt) {
            this.isSticky = false;
            this.header.classList.remove('is-sticky');
            stickyChangedThisFrame = true;
            requestAnimationFrame(() => this.updateAnchorOffset());
        }

        // Hide-on-scroll only applies on small screens, only when the
        // toggle is enabled, and only while sticky is engaged. Skip the
        // first frame after a sticky transition so we don't combine the
        // initial "scrolled past threshold" event with a hide trigger.
        if (
            hideEnabled &&
            !isLargeScreen &&
            this.isSticky &&
            !stickyChangedThisFrame
        ) {
            const delta = scrollY - this.lastScrollY;
            if (delta > this.config.hideDelta) {
                this.hide();
            } else if (delta < -this.config.hideDelta) {
                this.show();
            }
        } else {
            this.show();
        }

        this.lastScrollY = scrollY;
    },

    hide() {
        if (this.isHidden) return;
        this.header.style.top = `-${this.header.offsetHeight}px`;
        this.isHidden = true;
    },

    show() {
        if (!this.isHidden) return;
        this.header.style.top = '0px';
        this.isHidden = false;
    },

    /**
     * Set --Header-sticky-anchor-offset to the live header height so
     * scroll-padding-top on .has-sticky-header always matches the
     * current header — across breakpoints, sticky-state shrink, and
     * per-element hide-when-sticky collapses.
     */
    updateAnchorOffset() {
        document.documentElement.style.setProperty(
            '--Header-sticky-anchor-offset',
            `${this.header.offsetHeight}px`,
        );
    },
};

export default stickyHeader;
