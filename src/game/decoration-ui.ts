import { Offset, Size, } from "tiled-geometry";
import type { DecorationInfo } from "../track/decoration";
import { TILE_SIZE } from "../track/tile";
import { Image } from "./image";

export type DecorationType = 'bush1' | 'bush2' | 'palmtree1' | 'palmtree2' | 'palmtree3' | 'barrier1' | 'barrier2' | 'chevrons1' | 'arrow1';

const TREE1_IMAGE = new URL(
    '../../image/tree1.png?as=webp',
    import.meta.url
);
const BUSH1_IMAGE = new URL(
    '../../image/bush1.png?as=webp',
    import.meta.url
);
const BUSH2_IMAGE = new URL(
    '../../image/bush2.png?as=webp',
    import.meta.url
);
const PALMTREE1_IMAGE = new URL(
    '../../image/palmtree1.png?as=webp',
    import.meta.url
);
const PALMTREE2_IMAGE = new URL(
    '../../image/palmtree2.png?as=webp',
    import.meta.url
);
const PALMTREE3_IMAGE = new URL(
    '../../image/palmtree3.png?as=webp',
    import.meta.url
);
const BARRIER1_IMAGE = new URL(
    '../../image/barrier1.png?as=webp',
    import.meta.url
);
const BARRIER2_IMAGE = new URL(
    '../../image/barrier2.png?as=webp',
    import.meta.url
);
const CHEVRONS_IMAGE = new URL(
    '../../image/chevrons1.svg',
    import.meta.url
);
const ARROW_IMAGE = new URL(
    '../../image/arrow1.svg',
    import.meta.url
);

const TREE1_SIZE = new Size(86, 78);
const TREE1_CENTER = new Offset(41, 38);
const BUSH_SIZE = new Size(64, 64);
const BUSH_CENTER = new Offset(32, 32);
const PALMTREE_SIZE = new Size(128, 128);
const PALMTREE_CENTER = new Offset(64, 64);
const BARRIER_SIZE = new Size(64, 26);
const BARRIER_CENTER = new Offset(32, 13);
const CHEVRONS_SIZE = new Size(210, 120);
const CHEVRONS_CENTER = new Offset(105, 60);
const ARROW_SIZE = new Size(120, 80);
const ARROW_CENTER = new Offset(60, 40);

export function getDecorationSize(type: DecorationType) {
    switch (type) {
        case 'bush1': return BUSH_SIZE;
        case 'bush2': return BUSH_SIZE;
        case 'palmtree1': return PALMTREE_SIZE;
        case 'palmtree2': return PALMTREE_SIZE;
        case 'palmtree3': return PALMTREE_SIZE;
        case 'barrier1': return BARRIER_SIZE;
        case 'barrier2': return BARRIER_SIZE;
        case 'chevrons1': return CHEVRONS_SIZE;
        case 'arrow1': return ARROW_SIZE;
        default: throw new Error('invalid decoration type ' + type);
    }
}

export function getDecorationImage(type: DecorationType) {
    let url: URL;
    switch (type) {
        case 'bush1': url = BUSH1_IMAGE; break;
        case 'bush2': url = BUSH2_IMAGE; break;
        case 'palmtree1': url = PALMTREE1_IMAGE; break;
        case 'palmtree2': url = PALMTREE2_IMAGE; break;
        case 'palmtree3': url = PALMTREE3_IMAGE; break;
        case 'barrier1': url = BARRIER1_IMAGE; break;
        case 'barrier2': url = BARRIER2_IMAGE; break;
        case 'chevrons1': url = CHEVRONS_IMAGE; break;
        case 'arrow1': url = ARROW_IMAGE; break;
        default: throw new Error('invalid decoration type ' + type);
    }
    const size = getDecorationSize(type);
    return new Image(url, size).makeElement();
}

export function getDecorationCenter(type: DecorationType) {
    switch (type) {
        case 'bush1': return BUSH_CENTER;
        case 'bush2': return BUSH_CENTER;
        case 'palmtree1': return PALMTREE_CENTER;
        case 'palmtree2': return PALMTREE_CENTER;
        case 'palmtree3': return PALMTREE_CENTER;
        case 'barrier1': return BARRIER_CENTER;
        case 'barrier2': return BARRIER_CENTER;
        case 'chevrons1': return CHEVRONS_CENTER;
        case 'arrow1': return ARROW_CENTER;
        default: throw new Error('invalid decoration type ' + type);
    }
}

export function getDecorationUi(decoration: DecorationInfo) {
    const center = getDecorationCenter(decoration.type as DecorationType);
    const ret = getDecorationImage(decoration.type as DecorationType);
    ret.style.setProperty('position', 'absolute');
    ret.style.setProperty('left', `${decoration.location.x * TILE_SIZE - center.x}px`);
    ret.style.setProperty('top', `${decoration.location.y * TILE_SIZE - center.y}px`);
    ret.style.setProperty('transform', `rotate(${decoration.angle}rad)`);
    ret.style.setProperty('transform-origin', `${center.x}px ${center.y}px`);
    return ret;
}
