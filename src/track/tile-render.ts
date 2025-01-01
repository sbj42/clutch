import { Bodies, Body, Bounds, Composite, Vector } from "matter-js";
import { TILE_SIZE } from "./tile";
import { Tile } from './tile';
import { Direction, directionAddTurn, directionIsCardinal, directionOpposite, DIRECTIONS, Turn, turnFromDirections, turnToString } from 'tiled-geometry';
import { directionToRadians } from '../geom/angle';
import { makeSvg, makeSvgPath, makeSvgRect } from "../util/svg";
import type { Track } from "./track";
import { Material } from "./track-info";

function _nextExitDirection(from: Direction, tile: Tile): Direction | undefined {
    for (let i = 0; i < DIRECTIONS.length; i++) {
        from = directionAddTurn(from, Turn.R_45);
        if (tile.getExit(from)) {
            return from;
        }
    }
    return;
}

export type TileSvgOptions = {
    wireframe?: boolean;
}

const BARRIER_THICKNESS = 15;

const TILE_BACKGROUND_DIRT = 'rgb(97, 62, 34)';
const TILE_BACKGROUND_ROAD = 'rgb(99, 99, 99)';

const SQRT2 = Math.sqrt(2);
const SIN30 = Math.sin(Math.PI / 6);
const COS30 = Math.cos(Math.PI / 6);
const SIN22_5 = Math.sin(Math.PI / 8);
const COS22_5 = Math.cos(Math.PI / 8);
const TAN22_5 = Math.tan(Math.PI / 8);

function _getFillColor(material: Material): string {
    switch (material) {
        case 'dirt':
            return TILE_BACKGROUND_DIRT;
        case 'road':
            return TILE_BACKGROUND_ROAD;
        default:
            throw new Error('invalid material ' + material);
    }
}

// Note that the svg is always twice as big as the tile
export function getTileSvg(doc: Document, track: Track, tile: Tile | undefined, options?: TileSvgOptions): SVGElement | undefined {
    const wireframe = options?.wireframe ?? false;
    if (!tile) {
        return;
    }
    const firstDirection = _nextExitDirection(Direction.NORTHWEST, tile);
    if (firstDirection === undefined) {
        return;
    }

    const size = TILE_SIZE;
    const halfSize = size / 2;
    const svg = makeSvg(doc, {
        width: size * 2,
        height: size * 2,
    });
    const center = Vector.create(size, size);
    const path: string[] = [];

    let fromDir = firstDirection;
    while (true) {
        const fromExit = tile.getExit(fromDir)!;
        const fromWidth = fromExit.trackWidth * size;
        const fromHalfWidth = fromWidth / 2;
        const fromBackup = !directionIsCardinal(fromDir) ? SQRT2 * halfSize - halfSize : 0;
        const toDir = _nextExitDirection(fromDir, tile)!;
        const toExit = tile.getExit(toDir)!;
        const toWidth = toExit.trackWidth * size;
        const toHalfWidth = toWidth / 2;
        const toBackup = !directionIsCardinal(toDir) ? SQRT2 * halfSize - halfSize : 0;
        const turn = turnFromDirections(directionOpposite(fromDir), toDir);
        const vec = (x: number, y: number) => {
            return Vector.add(center, Vector.rotate(Vector.create(x, y), directionToRadians(fromDir)));
        };
        if (turn === Turn.T_180) {
            // dead-end
            const v1 = vec(fromHalfWidth, -halfSize - fromBackup);
            const v2 = vec(fromHalfWidth, 0);
            const v3 = vec(-fromHalfWidth, 0);
            const v4 = vec(-fromHalfWidth, -halfSize - fromBackup);
            const radius = fromHalfWidth;
            path.push(`${v1.x} ${v1.y} L${v2.x} ${v2.y} A${radius} ${radius} 0 0 1 ${v3.x} ${v3.y} L${v4.x} ${v4.y}`);
            break;
        } else if (turn === Turn.NONE) {
            // straight
            const v1 = vec(fromHalfWidth, -halfSize - fromBackup);
            const v2 = vec(toHalfWidth, halfSize + toBackup);
            path.push(`${v1.x} ${v1.y} L${v2.x} ${v2.y}`);
        } else if (turn === Turn.L_90) {
            // left turn
            const radius = halfSize - Math.max(fromHalfWidth, toHalfWidth);
            const fromExtend = Math.max(0, fromHalfWidth - toHalfWidth);
            const toExtend = Math.max(0, toHalfWidth - fromHalfWidth);
            if (fromExtend > 0 || fromBackup > 0) {
                const v1 = vec(fromHalfWidth, -halfSize - fromBackup);
                path.push(`${v1.x} ${v1.y}`);
            }
            const v2 = vec(fromHalfWidth, -halfSize + fromExtend);
            const v3 = vec(halfSize - toExtend, -toHalfWidth);
            path.push(`${v2.x} ${v2.y} A${radius} ${radius} 0 0 0 ${v3.x} ${v3.y}`);
            if (toExtend > 0 || toBackup > 0) {
                const v4 = vec(halfSize + toBackup, -toHalfWidth);
                path.push(`${v4.x} ${v4.y}`);
            }
        } else if (turn === Turn.R_90) {
            // right turn
            const radius = halfSize + Math.min(fromHalfWidth, toHalfWidth);
            const fromExtend = Math.max(0, toHalfWidth - fromHalfWidth);
            const toExtend = Math.max(0, fromHalfWidth - toHalfWidth);
            if (fromExtend > 0 || fromBackup > 0) {
                const v1 = vec(fromHalfWidth, -halfSize - fromBackup);
                path.push(`${v1.x} ${v1.y}`);
            }
            const v2 = vec(fromHalfWidth, -halfSize + fromExtend);
            const v3 = vec(-halfSize + toExtend, toHalfWidth);
            path.push(`${v2.x} ${v2.y} A${radius} ${radius} 0 0 1 ${v3.x} ${v3.y}`);
            if (toExtend > 0 || toBackup > 0) {
                const v4 = vec(-halfSize - toBackup, toHalfWidth);
                path.push(`${v4.x} ${v4.y}`);
            }
        } else if (turn === Turn.L_45) {
            // slight left turn
            const radius = 2 * (halfSize - Math.max(fromHalfWidth, toHalfWidth));
            const v1 = vec(fromHalfWidth, -halfSize - fromBackup);
            const v2 = vec(fromHalfWidth, fromHalfWidth - SQRT2 * toHalfWidth - TAN22_5 * radius);
            const v3 = vec(fromHalfWidth + TAN22_5 * radius / SQRT2, fromHalfWidth - SQRT2 * toHalfWidth + TAN22_5 * radius / SQRT2);
            const v4 = vec((halfSize + toHalfWidth + toBackup) / SQRT2, (halfSize - toHalfWidth + toBackup) / SQRT2);
            path.push(`${v1.x} ${v1.y} L${v2.x} ${v2.y} A${radius} ${radius} 0 0 0 ${v3.x} ${v3.y} L${v4.x} ${v4.y}`);
        } else if (turn === Turn.R_45) {
            // slight right turn
            const radius = 2 * (halfSize - Math.max(fromHalfWidth, toHalfWidth));
            const v1 = vec(fromHalfWidth, -halfSize - fromBackup);
            const v2 = vec(fromHalfWidth, -fromHalfWidth + SQRT2 * toHalfWidth - TAN22_5 * radius);
            const v3 = vec(fromHalfWidth - TAN22_5 * radius / SQRT2, -fromHalfWidth + SQRT2 * toHalfWidth + TAN22_5 * radius / SQRT2);
            const v4 = vec((-halfSize + toHalfWidth - toBackup) / SQRT2, (halfSize + toHalfWidth + toBackup) / SQRT2);
            path.push(`${v1.x} ${v1.y} L${v2.x} ${v2.y} A${radius} ${radius} 0 0 1 ${v3.x} ${v3.y} L${v4.x} ${v4.y}`);
        } else {
            throw new Error('unimplemented turn ' + turnToString(turn));
        }
        if (fromDir > toDir) {
            break;
        }
        fromDir = toDir;
    }

    if (wireframe) {
        svg.appendChild(makeSvgRect(doc, {
            x: halfSize,
            y: halfSize,
            width: size,
            height: size,
            stroke: 'green',
        }));
    }

    svg.appendChild(makeSvgPath(doc, {
        path,
        fill: _getFillColor(track.material),
    }));

    if (wireframe) {
        const composite = getTileComposite(tile);
        for (const body of composite?.bodies ?? []) {
            for (const part of body.parts) {
                let path: string[] = [];
                for (const vertex of part.vertices) {
                    path.push(`${halfSize + vertex.x} ${halfSize + vertex.y}`);
                }
                svg.appendChild(makeSvgPath(doc, {
                    path,
                    stroke: 'red',
                }));
            }
        }
    }

    return svg;
}

// Composite is offset from the top-left corner of the tile
export function getTileComposite(tile: Tile | undefined): Composite | undefined {
    if (!tile) {
        return;
    }
    const firstDirection = _nextExitDirection(Direction.NORTHWEST, tile);
    if (firstDirection === undefined) {
        return;
    }

    const thickness = BARRIER_THICKNESS;
    const size = TILE_SIZE;
    const halfSize = size / 2;
    const center = Vector.create(halfSize, halfSize);
    const bodies: Body[] = [];

    let fromDir = firstDirection;
    while (true) {
        const fromExit = tile.getExit(fromDir)!;
        const fromWidth = fromExit.trackWidth * size;
        const fromHalfWidth = fromWidth / 2;
        const fromBackup = !directionIsCardinal(fromDir) ? SQRT2 * halfSize - halfSize : 0;
        const toDir = _nextExitDirection(fromDir, tile)!;
        const toExit = tile.getExit(toDir)!;
        const toWidth = toExit.trackWidth * size;
        const toHalfWidth = toWidth / 2;
        const toBackup = !directionIsCardinal(toDir) ? SQRT2 * halfSize - halfSize : 0;
        const turn = turnFromDirections(directionOpposite(fromDir), toDir);
        const vec = (x: number, y: number) => {
            return Vector.add(center, Vector.rotate(Vector.create(x, y), directionToRadians(fromDir)));
        };
        const polyBody = (vertices: Vector[]) => {
            const bounds = Bounds.create(vertices);
            const ret = Bodies.fromVertices(0, 0, [vertices], {
                label: `barrier:${tile.offset}`,
                isStatic: true,
            });
            Body.setPosition(ret, Vector.sub(bounds.min, ret.bounds.min));
            return ret;
        };
        if (turn === Turn.T_180) {
            // dead-end
            const radius = fromHalfWidth;
            bodies.push(polyBody([
                vec(fromHalfWidth, -halfSize - fromBackup),
                vec(fromHalfWidth + thickness, -halfSize - fromBackup),
                vec(fromHalfWidth + thickness, radius),
                vec(fromHalfWidth, radius),
            ]));
            bodies.push(polyBody([
                vec(radius * SQRT2, 0),
                vec(radius * SQRT2 + thickness / SQRT2, 0 + thickness / SQRT2),
                vec(0 + thickness / SQRT2, radius * SQRT2 + thickness / SQRT2),
                vec(0, radius * SQRT2),
            ]));
            bodies.push(polyBody([
                vec(-radius, radius),
                vec(radius, radius),
                vec(radius, radius + thickness),
                vec(-radius, radius + thickness),
            ]));
            bodies.push(polyBody([
                vec(-radius * SQRT2 - thickness / SQRT2, 0 + thickness / SQRT2),
                vec(-radius * SQRT2, 0),
                vec(0, radius * SQRT2),
                vec(0 - thickness / SQRT2, radius * SQRT2 + thickness / SQRT2),
            ]));
            bodies.push(polyBody([
                vec(-fromHalfWidth, -halfSize - fromBackup),
                vec(-fromHalfWidth, radius),
                vec(-fromHalfWidth - thickness, radius),
                vec(-fromHalfWidth - thickness, -halfSize - fromBackup),
            ]));
            break;
        } else if (turn === Turn.NONE) {
            // // straight
            bodies.push(polyBody([
                vec(fromHalfWidth, -halfSize - fromBackup),
                vec(fromHalfWidth + thickness, -halfSize - fromBackup),
                vec(toHalfWidth + thickness, halfSize + toBackup),
                vec(toHalfWidth, halfSize + toBackup),
            ]));
        } else if (turn === Turn.L_90) {
            // left turn
            const radius = halfSize - Math.max(fromHalfWidth, toHalfWidth);
            const fromExtend = Math.max(0, fromHalfWidth - toHalfWidth);
            const toExtend = Math.max(0, toHalfWidth - fromHalfWidth);

            if (fromExtend > 0 || fromBackup > 0) {
                bodies.push(polyBody([
                    vec(fromHalfWidth, -halfSize - fromBackup),
                    vec(fromHalfWidth + thickness, -halfSize - fromBackup),
                    vec(fromHalfWidth + thickness, -halfSize + fromExtend),
                    vec(fromHalfWidth, -halfSize + fromExtend),
                ]));
            }
            const c = [fromHalfWidth + radius, -halfSize + fromExtend];
            bodies.push(polyBody([
                vec(c[0] - radius, c[1]),
                vec(c[0] - radius + thickness, c[1]),
                vec(c[0], c[1] + radius - thickness),
                vec(c[0], c[1] + radius),
                vec(c[0] - radius * SIN30, c[1] + radius * COS30),
                vec(c[0] - radius * COS30, c[1] + radius * SIN30),
            ]));
            if (toExtend > 0 || toBackup > 0) {
                bodies.push(polyBody([
                    vec(halfSize - toExtend, -toHalfWidth - thickness),
                    vec(halfSize + toBackup, -toHalfWidth - thickness),
                    vec(halfSize + toBackup, -toHalfWidth),
                    vec(halfSize - toExtend, -toHalfWidth),
                ]));
            }
        } else if (turn === Turn.R_90) {
            // right turn
            const radius = halfSize + Math.min(fromHalfWidth, toHalfWidth);
            const fromExtend = Math.max(0, toHalfWidth - fromHalfWidth);
            const toExtend = Math.max(0, fromHalfWidth - toHalfWidth);
            if (fromExtend > 0 || fromBackup > 0) {
                bodies.push(polyBody([
                    vec(fromHalfWidth, -halfSize - fromBackup),
                    vec(fromHalfWidth + thickness, -halfSize - fromBackup),
                    vec(fromHalfWidth + thickness, -halfSize + fromExtend),
                    vec(fromHalfWidth, -halfSize + fromExtend),
                ]));
            }
            const c = [fromHalfWidth - radius, -halfSize + fromExtend];
            const rt = radius + thickness;
            bodies.push(polyBody([
                vec(c[0] + radius, c[1]),
                vec(c[0] + radius + thickness, c[1]),
                vec(c[0] + rt * COS30 + thickness, c[1] + rt * SIN30 + thickness),
                vec(c[0] + rt * COS30, c[1] + rt * SIN30),
            ]));
            bodies.push(polyBody([
                vec(c[0] + rt * COS30, c[1] + rt * SIN30),
                vec(c[0] + rt * COS30 + thickness, c[1] + rt * SIN30 + thickness),
                vec(c[0] + rt * SIN30 + thickness, c[1] + rt * COS30 + thickness),
                vec(c[0] + rt * SIN30, c[1] + rt * COS30),
            ]));
            bodies.push(polyBody([
                vec(c[0] + rt * SIN30, c[1] + rt * COS30),
                vec(c[0] + rt * SIN30 + thickness, c[1] + rt * COS30 + thickness),
                vec(c[0], c[1] + radius + thickness),
                vec(c[0], c[1] + radius),
            ]));
            if (toExtend > 0 || toBackup > 0) {
                bodies.push(polyBody([
                    vec(-halfSize - toBackup, toHalfWidth),
                    vec(-halfSize + toExtend, toHalfWidth),
                    vec(-halfSize + toExtend, toHalfWidth + thickness),
                    vec(-halfSize - toBackup, toHalfWidth + thickness),
                ]));
            }
        } else if (turn === Turn.L_45) {
            // slight left turn
            const radius = 2 * (halfSize - Math.max(fromHalfWidth, toHalfWidth));
            bodies.push(polyBody([
                vec(fromHalfWidth, -halfSize - fromBackup),
                vec(fromHalfWidth + thickness, -halfSize - fromBackup),
                vec(fromHalfWidth + thickness, fromHalfWidth - SQRT2 * toHalfWidth - TAN22_5 * radius),
                vec(fromHalfWidth, fromHalfWidth - SQRT2 * toHalfWidth - TAN22_5 * radius),
            ]));
            const c = [fromHalfWidth + radius, fromHalfWidth - SQRT2 * toHalfWidth - TAN22_5 * radius];
            bodies.push(polyBody([
                vec(c[0] - radius, c[1]),
                vec(c[0] - radius + thickness, c[1]),
                vec(c[0] - (radius - thickness) / SQRT2, c[1] + (radius - thickness) / SQRT2),
                vec(c[0] - radius / SQRT2, c[1] + radius / SQRT2),
                vec(c[0] - radius * COS22_5, c[1] + radius * SIN22_5),
            ]));
            bodies.push(polyBody([
                vec(fromHalfWidth + TAN22_5 * radius / SQRT2, fromHalfWidth - SQRT2 * toHalfWidth + TAN22_5 * radius / SQRT2),
                vec(fromHalfWidth + TAN22_5 * radius / SQRT2 + thickness / SQRT2, fromHalfWidth - SQRT2 * toHalfWidth + TAN22_5 * radius / SQRT2 - thickness / SQRT2),
                vec((halfSize + toHalfWidth + toBackup + thickness) / SQRT2, (halfSize - toHalfWidth + toBackup - thickness) / SQRT2),
                vec((halfSize + toHalfWidth + toBackup) / SQRT2, (halfSize - toHalfWidth + toBackup) / SQRT2),
            ]));
        } else if (turn === Turn.R_45) {
            // slight right turn
            const radius = 2 * (halfSize - Math.max(fromHalfWidth, toHalfWidth));
            bodies.push(polyBody([
                vec(fromHalfWidth, -halfSize - fromBackup),
                vec(fromHalfWidth + thickness, -halfSize - fromBackup),
                vec(fromHalfWidth + thickness, -fromHalfWidth + SQRT2 * toHalfWidth - TAN22_5 * radius),
                vec(fromHalfWidth, -fromHalfWidth + SQRT2 * toHalfWidth - TAN22_5 * radius),
            ]));
            const c = [fromHalfWidth - radius, -fromHalfWidth + SQRT2 * toHalfWidth - TAN22_5 * radius];
            bodies.push(polyBody([
                vec(c[0] + radius, c[1]),
                vec(c[0] + radius + thickness, c[1]),
                vec(c[0] + (radius + thickness) * COS22_5, c[1] + (radius + thickness) * SIN22_5),
                vec(c[0] + radius * COS22_5, c[1] + radius * SIN22_5),
            ]));
            bodies.push(polyBody([
                vec(c[0] + radius * COS22_5, c[1] + radius * SIN22_5),
                vec(c[0] + (radius + thickness) * COS22_5, c[1] + (radius + thickness) * SIN22_5),
                vec(c[0] + (radius + thickness) / SQRT2, c[1] + (radius + thickness) / SQRT2),
                vec(c[0] + radius / SQRT2, c[1] + radius / SQRT2),
            ]));
            bodies.push(polyBody([
                vec(fromHalfWidth - TAN22_5 * radius / SQRT2, -fromHalfWidth + SQRT2 * toHalfWidth + TAN22_5 * radius / SQRT2),
                vec(fromHalfWidth - TAN22_5 * radius / SQRT2 + thickness / SQRT2, -fromHalfWidth + SQRT2 * toHalfWidth + TAN22_5 * radius / SQRT2 + thickness / SQRT2),
                vec((-halfSize + toHalfWidth - toBackup + thickness) / SQRT2, (halfSize + toHalfWidth + toBackup + thickness) / SQRT2),
                vec((-halfSize + toHalfWidth - toBackup) / SQRT2, (halfSize + toHalfWidth + toBackup) / SQRT2),
            ]));
        } else {
            throw new Error('unimplemented turn ' + turnToString(turn));
        }
        if (fromDir > toDir) {
            break;
        }
        fromDir = toDir;
    }

    return Composite.create({ bodies });
}