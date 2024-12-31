import { Offset, Size, } from "tiled-geometry";
import type { DecorationInfo } from "../track/decoration";
import { TILE_SIZE } from "../track/tile";
import { Image } from "./image";

const TREE_IMAGE = new URL(
    '../../image/tree1.png?as=webp',
    import.meta.url
);

const TREE_SIZE = new Size(86, 78);
const TREE_CENTER = new Offset(41, 38);

export function getDecorationImage(decoration: DecorationInfo) {
    let url: URL;
    let size: Size;
    let center: Offset;
    switch (decoration.type) {
        case 'tree':
            url = TREE_IMAGE;
            size = TREE_SIZE;
            center = TREE_CENTER;
            break;
        default: throw new Error('invalid decoration type ' + decoration.type);
    }
    const ret = new Image(url, size).makeElement();
    ret.style.setProperty('position', 'absolute');
    ret.style.setProperty('left', `${decoration.location.x * TILE_SIZE - center.x}px`);
    ret.style.setProperty('top', `${decoration.location.y * TILE_SIZE - center.y}px`);
    ret.style.setProperty('transform', `rotate(${decoration.angle}rad)`);
    ret.style.setProperty('transform-origin', `${center.x}px ${center.y}px`);
    return ret;
}
