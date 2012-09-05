Alchemy.ns('Alchemy.app');

/**
 * @class Alchemy.Application
 * @extends Alchemy.MateriaPrima
 * @singleton
 */
Alchemy.Application = (function () {
    var paused = false;
    var stopped = true;

    return {
        /**
         * @property fps
         * @type Alchemy.util.MeanValue
         */
        fps: undefined,

        prepare: Alchemy.emptyFn,

        update: Alchemy.emptyFn,

        draw: Alchemy.emptyFn,

        finish: Alchemy.emptyFn,

        /**
         * starts the application loop;
         * this will call the {@link #prepare} method
         */
        start: function () {
            if (stopped) {
                stopped = false;
                this.frame = 0;
                this.boundLoopFn = this.boundLoopFn || this.loop.bind(this);
                this.fps = Alchemy.util.MeanValue.create(20);
                this.prepare();

                this.lastTick = Date.now();
                Alchemy.reqAnimFrame(this.boundLoopFn);
            }
        },

        /**
         * stops the application loop;
         * this will call the {@link #finish} method
         */
        end: function () {
            if (!stopped) {
                this.finish();
                stopped = true;
            }
        },

        /**
         * the loop method; called every iteration;
         * will call the {@link #update} and the {@link #draw} method
         * @private
         */
        loop: function () {
            if (!stopped) {
                var currentTick = Date.now();
                var diff = (currentTick - this.lastTick) || 1;
                this.lastTick = currentTick;
                this.fps.add(1000 / diff);

                Alchemy.reqAnimFrame(this.boundLoopFn);
                if (!paused) {
                    this.update(this.frame);
                    this.draw(this.frame);
                    this.frame++;
                }
            }
        },

        /**
         * returns <code>true</code> if and only if the current application
         * is running (it may or may not be paused though)
         *
         * @return Boolean
         */
        isRunning: function () {
            return !stopped;
        },

        /**
         * pauses the application
         */
        pause: function () {
            paused = true;
        },

        /**
         * unpauses the application
         */
        unpause: function () {
            paused = false;
        },

        /**
         * returns <code>true</code> if the application is paused
         *
         * @return {Boolean}
         */
        isPaused: function () {
            return paused;
        }
    };
})();

Alchemy.Application = Alchemy.brew({
    extend: Alchemy.MateriaPrima
}, Alchemy.Application);
