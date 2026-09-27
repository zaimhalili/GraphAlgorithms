export function scheduleFrame(callback) {
    let finished = false;
    let animationFrameId;
    const timeoutId = window.setTimeout(() => finish(performance.now()), 80);

    animationFrameId = window.requestAnimationFrame(finish);

    function finish(time) {
        if (finished) return;
        finished = true;
        window.clearTimeout(timeoutId);
        if (animationFrameId !== undefined) {
            window.cancelAnimationFrame(animationFrameId);
        }
        callback(time);
    }
}