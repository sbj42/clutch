export type Options = {
    engineVolume: number;
    skidMarks: boolean;
    exhaust: boolean;
}

export function loadOptions(): Options {
    const json = localStorage.getItem('options');
    return {
        engineVolume: 0.5,
        skidMarks: true,
        exhaust: true,
        ...(json ? JSON.parse(json) : {}),
    };
}

export function saveOptions(Options: Options) {
    localStorage.setItem('options', JSON.stringify(Options));
}

export function resetOptions() {
    localStorage.removeItem('options');
}
