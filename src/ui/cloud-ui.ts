const START_RADIUS = 4;
const GROWTH_SPEED = 50; // radius pixels per second

export class CloudUi {
    readonly element: HTMLElement;
    
    private _x: number;
    private _y: number;
    private _dx: number;
    private _dy: number;
    private _radius = START_RADIUS;
    private _duration: number;
    private _time = 0;

    constructor(x: number, y: number, dx: number, dy: number, color: string, duration: number) {
        this._x = x;
        this._y = y;
        this._dx = dx;
        this._dy = dy;
        this._duration = duration;
        this.element = document.createElement('img');
        this.element.style.setProperty('position', 'absolute');
        this.element.setAttribute('src', `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' width='20' height='20'%3E%3Ccircle cx='10' cy='10' r='10' fill='${color}' /%3E%3C/svg%3E`);
    }

    get expired() {
        return this._time >= this._duration;
    }

    tick(sec: number) {
        this._time += sec;
        this._x += this._dx * sec;
        this._y += this._dy * sec;
        this._radius += sec * GROWTH_SPEED;
    }

    update() {
        if (this.expired) {
            return;
        }
        this.element.style.setProperty('left', `${this._x - this._radius}px`);
        this.element.style.setProperty('top', `${this._y - this._radius}px`);
        this.element.style.setProperty('width', `${this._radius * 2}px`);
        this.element.style.setProperty('height', `${this._radius * 2}px`);
        this.element.style.setProperty('opacity', String(Math.max(0, 1 - this._time / this._duration)));
    }
}
