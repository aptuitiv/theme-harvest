/* ===========================================================================
    Class to inject scripts into the page after there has been a user action
=========================================================================== */

/* eslint-disable no-unused-vars */

class ScriptLoader {
    /**
     * Create an instance of ScriptLoader
     *
     * @param {Array} scripts - URLs for scripts to be injected
     */
    constructor(scripts) {
        this.scripts = scripts;

        // This is required to ensure we can remove the event listener
        // later. The scoping behaves strangely in event listener callbacks.
        this.loadScriptsHandler = this.loadScripts.bind(this);

        document.addEventListener('keydown', this.loadScriptsHandler);
        document
            .querySelector('body')
            .addEventListener('click', this.loadScriptsHandler);
    }

    /**
     * Removes the event listeneres and injects the scripts.
     */
    loadScripts() {
        // Remove event listeners
        document.removeEventListener('keydown', this.loadScriptsHandler);
        document
            .querySelector('body')
            .removeEventListener('click', this.loadScriptsHandler);

        // Inject scripts
        const head = document.querySelector('head');
        this.scripts.forEach((script) => {
            const scriptTag = document.createElement('script');
            scriptTag.type = 'text/javascript';
            scriptTag.src = script;
            head.appendChild(scriptTag);
        });
    }
}
