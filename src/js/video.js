/**
 * Play/pause toggle for videos that auto play without the native controls.
 *
 * Auto playing content that runs longer than five seconds needs a way for the
 * user to stop it. WCAG 2.2.2 (Pause, Stop, Hide).
 *
 * The toggle points at its video by id rather than by DOM position so that the
 * button can sit wherever the layout needs it. In the banner, for example, the
 * video is inside .Banner-bg but the button has to sit above the .Banner-fg
 * overlay to be clickable.
 */
const video = {
    /**
     * Initialize the videos and their play/pause toggles
     */
    init() {
        // Don't auto play for people who have asked for reduced motion. This is
        // done separately from the toggles so that it still applies to any
        // video that doesn't have a toggle.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.querySelectorAll('video.js-video').forEach((player) => {
                player.removeAttribute('autoplay');
                player.pause();
            });
        }

        document.querySelectorAll('.js-videoToggle').forEach((button) => {
            const player = document.getElementById(button.dataset.video);
            if (player === null) {
                return;
            }

            button.addEventListener('click', () => {
                if (player.paused || player.ended) {
                    // play() rejects if the browser blocks playback. The state
                    // is set from the player's own events either way.
                    const playing = player.play();
                    if (typeof playing !== 'undefined') {
                        playing.catch(() => {});
                    }
                } else {
                    player.pause();
                }
            });

            // Track the player itself so the button stays correct no matter
            // what changed the playback state
            ['play', 'pause', 'ended'].forEach((event) => {
                player.addEventListener(event, () => {
                    video.setState(button, player);
                });
            });

            video.setState(button, player);
        });
    },

    /**
     * Set the toggle button state to match the player
     *
     * @param {HTMLElement} button The toggle button
     * @param {HTMLVideoElement} player The video element
     */
    setState(button, player) {
        const isPlaying = !player.paused && !player.ended;
        button.setAttribute('data-state', isPlaying ? 'playing' : 'paused');
        button.setAttribute(
            'aria-label',
            isPlaying ? button.dataset.labelPause : button.dataset.labelPlay,
        );
    },
};

export default video;
