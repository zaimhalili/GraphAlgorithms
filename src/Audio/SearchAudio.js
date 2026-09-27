export class SearchAudio {
    constructor(enabled = true) {
        this.enabled = enabled;
        this.context = null;
        this.resumePending = false;
        this.lastVisitedTone = -Infinity;
        this.lastPathTone = -Infinity;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    playVisited() {
        this.playTone("visited");
    }

    playPathStep() {
        this.playTone("path");
    }

    prepare() {
        if (!this.enabled) return;

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        if (!this.context) this.context = new AudioContextClass();

        if (this.context.state === "suspended" && !this.resumePending) {
            this.resumePending = true;
            this.context.resume().catch(() => {}).finally(() => {
                this.resumePending = false;
            });
        }

        return this.context;
    }

    playTone(phase) {
        const context = this.prepare();
        if (!context) return;

        const now = context.currentTime;
        const isPath = phase === "path";
        const lastTone = isPath ? this.lastPathTone : this.lastVisitedTone;
        const minimumGap = isPath ? 0.11 : 0.065;
        if (now - lastTone < minimumGap) return;

        if (isPath) this.lastPathTone = now;
        else this.lastVisitedTone = now;

        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const duration = isPath ? 0.06 : 0.026;
        const frequency = isPath
            ? 360 + (Math.round(now * 10) % 3) * 25
            : 780 + (Math.round(now * 12) % 3) * 45;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(isPath ? 0.04 : 0.03, now + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
}