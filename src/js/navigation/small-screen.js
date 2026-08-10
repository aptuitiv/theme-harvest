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
        const html = document.documentElement;
        const button = document.querySelector('.js-ssNavBtn');
        const nav = document.querySelector('.js-navBar');
        const dropdowns = document.querySelectorAll('.js-dropdown');

        /**
         * Close the small screen navigation and undo everything opening it changed
         */
        function closeNav() {
            nav.dataset.open = 'no';
            button.classList.remove('is-active');
            button.setAttribute('aria-expanded', 'false');
            html.classList.remove('menu-open');
        }

        /**
         * Function to toggle showing and hiding the small screen navigation
         */
        function toggleNav() {
            if (nav.dataset.open === 'yes') {
                // Hide the menu
                closeNav();
            } else {
                // Show the menu
                nav.dataset.open = 'yes';
                button.classList.add('is-active');
                button.setAttribute('aria-expanded', 'true');
                // Set the offset position for the menu
                const buttonPosition =
                    button.getBoundingClientRect().top +
                    button.offsetHeight +
                    10;
                nav.style.setProperty('--navbar-offset', `${buttonPosition}px`);
                html.classList.add('menu-open');
            }
        }

        if (button !== null) {
            // Small screen nav menu (hamburger) button click
            button.addEventListener('click', (e) => {
                e.preventDefault();
                toggleNav();
            });

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
                    // Reset the open state as well. Only dropping the scroll lock left
                    // the button, its ARIA state and data-open stuck open, so the menu
                    // came back open (unlocked) when resizing back down.
                    closeNav();
                }
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
