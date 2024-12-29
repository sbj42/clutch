import { directionIsCardinal, directionOpposite } from "tiled-geometry";
import { TILE_SIZE } from "./tile";
import { Checkpoint } from "./checkpoint";
import { Bodies, Body, Bounds, Composite, Vector } from "matter-js";
import { directionToRadians } from "../geom/angle";
import { makeSvg, makeSvgCircle, makeSvgPath, makeSvgPattern, makeSvgRect, makeSvgText } from "../util/svg";

export type CheckpointState = 'start' | 'finish' | 'next' | 'last' | 'inactive';

export type CheckpointSvgOptions = {
    wireframe?: boolean;
}

const CHECKPOINT_START_WIDTH = 12;
const CHECKPOINT_WIDTH_DECR = 3;
const CHECKPOINT_TOTAL_WIDTH = (CHECKPOINT_START_WIDTH + CHECKPOINT_WIDTH_DECR) * (CHECKPOINT_START_WIDTH / CHECKPOINT_WIDTH_DECR - 1);
const CHECKPOINT_NEXT_COLOR = 'rgb(191, 194, 39)';
const CHECKPOINT_LAST_COLOR = 'rgba(65, 97, 64, 0.75)';
const CHECKPOINT_INACTIVE_MINI_COLOR = 'rgba(40, 40, 40, 0.5)'

const START_WIDTH = 40;
const START_CHECK_SIZE = 10;
const START_CHECK_WHITE_COLOR = 'rgb(202, 202, 202)';
const START_CHECK_BLACK_COLOR = 'rgb(53, 53, 53)';
const START_TEXT_PAD = 0;
const START_TEXT_SIZE = 40;

const START_GRID_COL_SIZE = 64;
const START_GRID_ROW_SIZE = 48;

function makeCheckerboardPattern(doc: Document) {
    const pattern = makeSvgPattern(doc, {
        id: 'checkerboard',
        width: 2 * START_CHECK_SIZE,
        height: 2 * START_CHECK_SIZE,
    });
    pattern.appendChild(makeSvgRect(doc, {
        x: 0,
        y: 0,
        width: START_CHECK_SIZE,
        height: START_CHECK_SIZE,
        fill: START_CHECK_WHITE_COLOR,
    }));
    pattern.appendChild(makeSvgRect(doc, {
        x: START_CHECK_SIZE,
        y: START_CHECK_SIZE,
        width: START_CHECK_SIZE,
        height: START_CHECK_SIZE,
        fill: START_CHECK_WHITE_COLOR,
    }));
    pattern.appendChild(makeSvgRect(doc, {
        x: START_CHECK_SIZE,
        y: 0,
        width: START_CHECK_SIZE,
        height: START_CHECK_SIZE,
        fill: START_CHECK_BLACK_COLOR,
    }));
    pattern.appendChild(makeSvgRect(doc, {
        x: 0,
        y: START_CHECK_SIZE,
        width: START_CHECK_SIZE,
        height: START_CHECK_SIZE,
        fill: START_CHECK_BLACK_COLOR,
    }));
    return pattern;
}

export function getCheckpointSvg(doc: Document, checkpoint: Checkpoint, state: CheckpointState, options: CheckpointSvgOptions): SVGElement {
    const wireframe = options?.wireframe ?? false;
    const size = TILE_SIZE;
    const halfSize = size / 2;
    const sqrt2 = Math.sqrt(2);
    const svg = makeSvg(doc, { width: size * 2, height: size * 2 });
    const center = Vector.create(size, size);

    const fromDir = checkpoint.direction;
    const fromExit = checkpoint.tile.getExit(fromDir);
    if (!fromExit) {
        throw new Error('invalid checkpoint');
    }
    const fromBackup = !directionIsCardinal(fromDir) ? sqrt2 * halfSize - halfSize : 0;
    const trackWidth = fromExit.trackWidth * size;
    const halfWidth = trackWidth / 2;
    const vec = (x: number, y: number) => {
        return Vector.add(center, Vector.rotate(Vector.create(x, y), directionToRadians(fromDir)));
    };

    if (state === 'next' || state === 'last') {
        const fill = state === 'next' ? CHECKPOINT_NEXT_COLOR : CHECKPOINT_LAST_COLOR;
        let pos = 0;
        let width = CHECKPOINT_START_WIDTH;
        while (width > 0) {
            const v1 = vec(-halfWidth, -halfSize - fromBackup + pos);
            const v2 = vec(halfWidth, -halfSize - fromBackup + pos);
            const v3 = vec(halfWidth, -halfSize - fromBackup + pos + width);
            const v4 = vec(-halfWidth, -halfSize - fromBackup + pos + width);
            svg.appendChild(makeSvgPath(doc, {
                path: `M${v1.x} ${v1.y} L${v2.x} ${v2.y} L${v3.x} ${v3.y} L${v4.x} ${v4.y} Z`,
                fill,
            }));
            pos += CHECKPOINT_START_WIDTH + CHECKPOINT_WIDTH_DECR;
            width -= CHECKPOINT_WIDTH_DECR;
        }
    } else if (state === 'start' || state === 'finish') {
        svg.appendChild(makeCheckerboardPattern(doc));
        const v1 = vec(-halfWidth, -halfSize - fromBackup);
        const v2 = vec(halfWidth, -halfSize - fromBackup);
        const v3 = vec(halfWidth, -halfSize - fromBackup + START_WIDTH);
        const v4 = vec(-halfWidth, -halfSize - fromBackup + START_WIDTH);
        svg.appendChild(makeSvgPath(doc, {
            path: `M${v1.x} ${v1.y} L${v2.x} ${v2.y} L${v3.x} ${v3.y} L${v4.x} ${v4.y} Z`,
            fill: 'url(#checkerboard)',
        }));
        const vt = vec(0, -halfSize - fromBackup + START_WIDTH + START_TEXT_PAD + START_TEXT_SIZE / 2)
        const text = makeSvgText(doc, {
            x: vt.x,
            y: vt.y,
            size: START_TEXT_SIZE,
            bold: true,
            color: START_CHECK_WHITE_COLOR,
            text: state === 'start' ? 'START' : 'FINISH',
        });
        text.setAttribute('transform', `rotate(${directionToRadians(directionOpposite(fromDir)) * 180 / Math.PI}, ${vt.x}, ${vt.y})`);
        svg.appendChild(text);
    }

    if (wireframe) {
        const sensor = getCheckpointSensor(checkpoint);
        for (const part of sensor.parts) {
            let path: string[] = [];
            for (const vertex of part.vertices) {
                path.push(`${halfSize + vertex.x} ${halfSize + vertex.y}`);
            }
            svg.appendChild(makeSvgPath(doc, {
                path,
                stroke: 'green',
            }));
        }
        if (state === 'start') {
            const grid = getStartGrid(checkpoint, 20);
            for (const vertex of grid.cells) {
                svg.appendChild(makeSvgCircle(doc, {
                    x: halfSize + vertex.x,
                    y: halfSize + vertex.y,
                    radius: 3,
                    fill: 'skyblue',
                }));
            }
        }
    }

    return svg;
}

// Body is offset from the top-left corner of the tile
export function getCheckpointSensor(checkpoint: Checkpoint): Body {
    const size = TILE_SIZE;
    const halfSize = size / 2;
    const sqrt2 = Math.sqrt(2);
    const center = Vector.create(halfSize, halfSize);

    const fromDir = checkpoint.direction;
    const fromExit = checkpoint.tile.getExit(fromDir);
    if (!fromExit) {
        throw new Error('invalid checkpoint');
    }
    const fromBackup = !directionIsCardinal(fromDir) ? sqrt2 * halfSize - halfSize : 0;
    const trackWidth = fromExit.trackWidth * size;
    const halfWidth = trackWidth / 2;
    const thickness = CHECKPOINT_TOTAL_WIDTH;
    const vec = (x: number, y: number) => {
        return Vector.add(center, Vector.rotate(Vector.create(x, y), directionToRadians(fromDir)));
    };
    const polyBody = (vertices: Vector[]) => {
        const bounds = Bounds.create(vertices);
        const ret = Bodies.fromVertices(0, 0, [vertices], {
            label: `checkpoint:${checkpoint.index}`,
            isSensor: true,
        });
        Body.setPosition(ret, Vector.sub(bounds.min, ret.bounds.min));
        return ret;
    };

    return polyBody([
        vec(-halfWidth, -halfSize - fromBackup),
        vec(halfWidth, -halfSize - fromBackup),
        vec(halfWidth, -halfSize - fromBackup + thickness),
        vec(-halfWidth, -halfSize - fromBackup + thickness),
    ]);
}

type StartGrid = {
    cells: Vector[];
    angle: number;
}

export function getStartGrid(start: Checkpoint, minimumCells: number): StartGrid {
    const fromDir = start.direction;
    const toExit = start.tile.getExit(fromDir);
    if (!toExit) {
        throw new Error('no exit');
    }
    const size = TILE_SIZE;
    const halfSize = size / 2;
    const center = Vector.create(halfSize, halfSize);
    const trackWidth = toExit.trackWidth * size;
    const carsPerRow = Math.floor(trackWidth / (START_GRID_COL_SIZE));
    const vec = (x: number, y: number) => {
        return Vector.add(center, Vector.rotate(Vector.create(x, y), directionToRadians(fromDir)));
    };
    const cells: Vector[] = [];
    for (let row = 0; row < Math.ceil(minimumCells / carsPerRow); row ++) {
        for (let col = 0; col < carsPerRow; col ++) {
            cells.push(vec((col - carsPerRow / 2 + 0.5) * START_GRID_COL_SIZE, -halfSize - START_GRID_ROW_SIZE * (row + 0.5)));
        }
    }
    return {
        cells,
        angle: directionToRadians(directionOpposite(fromDir)),
    };
}

export function getCheckpointMiniSvg(doc: Document, checkpoint: Checkpoint, state: CheckpointState, scale: number): SVGElement {
    const size = TILE_SIZE * scale;
    const halfSize = size / 2;
    const sqrt2 = Math.sqrt(2);
    const svg = makeSvg(doc, {
        width: size,
        height: size,
    });
    const center = Vector.create(halfSize, halfSize);

    const fromDir = checkpoint.direction;
    const fromExit = checkpoint.tile.getExit(fromDir);
    if (!fromExit) {
        throw new Error('invalid checkpoint');
    }
    const fromBackup = !directionIsCardinal(fromDir) ? sqrt2 * halfSize - halfSize : 0;
    const trackWidth = fromExit.trackWidth * size;
    const halfWidth = trackWidth / 2;
    const vec = (x: number, y: number) => {
        return Vector.add(center, Vector.rotate(Vector.create(x, y), directionToRadians(fromDir)));
    };

    const fill = state === 'start' || state === 'finish' ? START_CHECK_WHITE_COLOR
        : state === 'next' ? CHECKPOINT_NEXT_COLOR
        : state === 'last' ? CHECKPOINT_LAST_COLOR
        : CHECKPOINT_INACTIVE_MINI_COLOR;
    const v1 = vec(-halfWidth, -halfSize - fromBackup);
    const v2 = vec(halfWidth, -halfSize - fromBackup);
    const v3 = vec(halfWidth, -halfSize - fromBackup + 2);
    const v4 = vec(-halfWidth, -halfSize - fromBackup + 2);
    svg.appendChild(makeSvgPath(doc, {
        path: `M${v1.x} ${v1.y} L${v2.x} ${v2.y} L${v3.x} ${v3.y} L${v4.x} ${v4.y} Z`,
        fill,
    }));

    return svg;
}