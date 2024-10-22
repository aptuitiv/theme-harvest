/**
 * Accordion
 *
 * Sort of based on https://codepen.io/brundolf/pen/dvoGyw?editors=1111
 * https://css-tricks.com/using-css-transitions-auto-dimensions/
 */
const accordion = {
    /**
     * Initialize the accordion
     */
    init() {
        document.querySelectorAll('.js-accordionHeading').forEach((el) => {
            el.addEventListener('click', (e) => {
                const container = accordion.getContainer(e.target);
                const state = container.getAttribute('data-collapsed');
                const isCollapsed = state === 'yes' || state === 'initial';
                if (isCollapsed) {
                    accordion.expand(container);
                } else {
                    accordion.collapse(container);
                }
            });
        });
    },

    /**
     * Get the accordion container
     *
     * @param {HTMLElement} el The container element
     * @returns {HTMLElement}
     */
    getContainer(el) {
        const p = el.parentNode;
        if (p.classList.contains('js-accordion')) {
            return p;
        }
        return this.getContainer(p);
    },

    /**
     * Expand the accordion
     *
     * @param {HTMLElement} container The container element
     */
    expand(container) {
        const content = container.querySelector('.js-accordionContent');
        // get the height of the content's inner content, regardless of its actual size
        const sectionHeight = content.scrollHeight;

        // have the content transition to the height of its inner content
        content.style.height = `${sectionHeight}px`;

        // when the next css transition finishes (which should be the one we just triggered)
        const transitionEnd = () => {
            // remove this event listener so it only gets triggered once
            content.removeEventListener('transitionend', transitionEnd);

            // remove "height" from the content's inline styles, so it can return to its initial value
            content.style.height = null;
        };
        content.addEventListener('transitionend', transitionEnd);

        // mark the section as "currently not collapsed"
        container.setAttribute('data-collapsed', 'no');
    },
    /**
     * Collapse the accordion
     *
     * @param {HTMLElement} container The container element
     */
    collapse(container) {
        const content = container.querySelector('.js-accordionContent');
        // get the height of the content's inner content, regardless of its actual size
        const sectionHeight = content.scrollHeight;

        // temporarily disable all css transitions
        const contentTransition = content.style.transition;
        content.style.transition = '';

        // on the next frame (as soon as the previous style change has taken effect),
        // explicitly set the content's height to its current pixel height, so we
        // aren't transitioning out of 'auto'
        requestAnimationFrame(() => {
            content.style.height = `${sectionHeight}px`;
            content.style.transition = contentTransition;

            // on the next frame (as soon as the previous style change has taken effect),
            // have the content transition to height: 0
            requestAnimationFrame(() => {
                content.style.height = `${0}px`;
            });
        });

        // mark the section as "currently collapsed"
        container.setAttribute('data-collapsed', 'yes');
    },
};
