/**
 * Small screen navigation
 */
const smallScreenNav = {
    /**
     * Initialization
     */
    init() {
        // The max window width where the small screen navigation is shown
        const width = 1024;

        // Select elements
        const body = document.querySelector('body');
        const button = document.querySelector('.js-ssNavBtn');
        const nav = document.querySelector('.js-mainNav');
        const dropdowns = document.querySelectorAll('.js-dropdown');

        // Make sure that the navigation gets displayed if the window resizes.
        // If you resize to make the small screen nav display, show and hide the nav,
        // and then resize so that regular nav should show, the regular nav doesn't show
        // because there are inline styles on the nav to hide it.
        // We do this by clearing out any inline CSS styles so that the styles
        // from the stylesheet are used.
        window.addEventListener('resize', () => {
            if (window.innerWidth >= width) {
                nav.style.display = '';
                nav.style.opacity = '';
            }
        });

        /**
         * Function to toggle showing and hiding the small screen navigation
         */
        function toggleNav() {
            button.classList.toggle('is-active');
            if (nav.dataset.open === 'yes') {
                // Hide the menu
                nav.dataset.open = 'no';
                button.setAttribute('aria-expanded', 'false');
                body.style.overflow = '';
            } else {
                // Show the menu
                nav.dataset.open = 'yes';
                button.setAttribute('aria-expanded', 'true');
                // Set the offset position for the menu
                const buttonPosition =
                    button.getBoundingClientRect().top +
                    button.offsetHeight +
                    10;
                nav.style.setProperty('--navbar-offset', `${buttonPosition}px`);
                // Prevent scrolling on the body tag.
                // Unfortunately, this doesn't work on iOS devices as of 2024. This is a known issue with no good workaround
                // except to add "position: fixed" to the body tag, but that causes other issues.
                body.style.overflow = 'hidden';
            }
        }

        if (button !== null) {
            // Small screen nav menu (hamburger) button click
            button.addEventListener('click', (e) => {
                e.preventDefault();
                toggleNav();
            });
        }

        Array.from(dropdowns).forEach((dropdown) => {
            dropdown.addEventListener('click', (e) => {
                if (window.innerWidth <= width) {
                    e.preventDefault();
                    e.target.classList.toggle('is-active');
                    e.target.parentElement.classList.toggle('is-active');
                }
            });
        });
    },
};

export default smallScreenNav;
