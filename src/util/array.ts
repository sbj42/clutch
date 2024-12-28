export function filterInPlace<T>(arr: T[], predicate: (value: T) => boolean) {
    let i = 0;
    let j = 0;

    while (i < arr.length) {
        const val = arr[i];
        if (predicate(val)) {
            arr[j ++] = val;
        }
        i ++;
    }

    arr.length = j;
    return arr;
}