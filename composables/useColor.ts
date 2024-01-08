
export const useColor = function (id : number) {
    const hue = (id * 16807 % 2147483647) % 360;

    const saturation = 70 + (id % 10);
    const lightness = 57 + (id % 10);

    return hslToHex(hue, saturation, lightness);
}

function hslToHex(h : number, s: number, l: number) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n : number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

        return Math.round(255 * color).toString(16).padStart(2, '0');
    };

    return `#${f(0)}${f(8)}${f(4)}`;
}
