/* global smallScreenNav:readonly, navAccess:readonly, accordion:readonly, setupNotifications:readonly, MicroModal:readonly */

/**
 * Initializes all Javascript bundled into main.js
 * See gulp/config.js for all script =s being bundled
 */
const init = () => {
    smallScreenNav.init();
    navAccess.init();
    accordion.init();
    setupNotifications();
    MicroModal.init({
        disableFocus: true,
    });
};

// Wait until page is ready before running any scripts
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
