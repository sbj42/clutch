
export function timeToString(time: number) {
    const mm = Math.floor(time / 60);
    const ss = (time - mm * 60).toFixed(1);
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(4, '0')}`;
}
