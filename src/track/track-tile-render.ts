import { Bodies, Body, Bounds, Composite, Vector } from "matter-js";
import { BARRIER_THICKNESS, TILE_SIZE } from '../constants';
import { TrackTile } from './track-tile';
import { Direction, directionAddTurn, directionIsCardinal, directionOpposite, DIRECTIONS, Turn, turnFromDirections, turnToString } from 'tiled-geometry';
import { directionToRadians } from '../geom/angle';
import { makeSvg, makeSvgPath, makeSvgRect } from "../util/svg";

function _nextExitDirection(from: Direction, tile: TrackTile): Direction | undefined {
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

const TILE_BACKGROUND_DIRT = 'rgb(97, 62, 34)';
// Note that the svg is always twice as big as the tile
export function getTileSvg(doc: Document, tile: TrackTile | undefined, options?: TileSvgOptions): SVGElement | undefined {
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
    const sqrt2 = Math.sqrt(2);
    const svg = makeSvg(doc, {
        width: size * 2,
        height: size * 2,
    });
    const center = Vector.create(size, size);
    const path: string[] = [];

    let fromDir = firstDirection;
    while (true) {
        const fromExit = tile.getExit(fromDir)!;
        const fromWidth = fromExit.trackWidth;
        const fromHalfWidth = fromWidth / 2;
        const fromBackup = !directionIsCardinal(fromDir) ? sqrt2 * halfSize - halfSize : 0;
        const toDir = _nextExitDirection(fromDir, tile)!;
        const toExit = tile.getExit(toDir)!;
        const toWidth = toExit.trackWidth;
        const toHalfWidth = toWidth / 2;
        const toBackup = !directionIsCardinal(toDir) ? sqrt2 * halfSize - halfSize : 0;
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
            const v1 = vec(fromHalfWidth, -halfSize - fromBackup);
            const v2 = vec(fromHalfWidth, fromHalfWidth - sqrt2 * toHalfWidth);
            const v3 = vec((halfSize + toHalfWidth + toBackup) / sqrt2, (halfSize - toHalfWidth + toBackup) / sqrt2);
            path.push(`${v1.x} ${v1.y} L${v2.x} ${v2.y} L${v3.x} ${v3.y}`);
        } else if (turn === Turn.R_45) {
            // slight right turn
            const v1 = vec(fromHalfWidth, -halfSize - fromBackup);
            const v2 = vec(fromHalfWidth, -fromHalfWidth + sqrt2 * toHalfWidth);
            const v3 = vec((-halfSize + toHalfWidth - toBackup) / sqrt2, (halfSize + toHalfWidth + toBackup) / sqrt2);
            path.push(`${v1.x} ${v1.y} L${v2.x} ${v2.y} L${v3.x} ${v3.y}`);
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
        fill: TILE_BACKGROUND_DIRT
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
export function getTileComposite(tile: TrackTile | undefined): Composite | undefined {
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
    const sqrt2 = Math.sqrt(2);
    const sin30 = Math.sin(Math.PI / 6);
    const cos30 = Math.cos(Math.PI / 6);
    const center = Vector.create(halfSize, halfSize);
    const bodies: Body[] = [];

    let fromDir = firstDirection;
    while (true) {
        const fromExit = tile.getExit(fromDir)!;
        const fromWidth = fromExit.trackWidth;
        const fromHalfWidth = fromWidth / 2;
        const fromBackup = !directionIsCardinal(fromDir) ? sqrt2 * halfSize - halfSize : 0;
        const toDir = _nextExitDirection(fromDir, tile)!;
        const toExit = tile.getExit(toDir)!;
        const toWidth = toExit.trackWidth;
        const toHalfWidth = toWidth / 2;
        const toBackup = !directionIsCardinal(toDir) ? sqrt2 * halfSize - halfSize : 0;
        const turn = turnFromDirections(directionOpposite(fromDir), toDir);
        const vec = (x: number, y: number) => {
            return Vector.add(center, Vector.rotate(Vector.create(x, y), directionToRadians(fromDir)));
        };
        const polyBody = (vertices: Vector[]) => {
            const bounds = Bounds.create(vertices);
            const ret = Bodies.fromVertices(0, 0, [vertices], {
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
                vec(radius * sqrt2, 0),
                vec(radius * sqrt2 + thickness / sqrt2, 0 + thickness / sqrt2),
                vec(0 + thickness / sqrt2, radius * sqrt2 + thickness / sqrt2),
                vec(0, radius * sqrt2),
            ]));
            bodies.push(polyBody([
                vec(-radius, radius),
                vec(radius, radius),
                vec(radius, radius + thickness),
                vec(-radius, radius + thickness),
            ]));
            bodies.push(polyBody([
                vec(-radius * sqrt2 - thickness / sqrt2, 0 + thickness / sqrt2),
                vec(-radius * sqrt2, 0),
                vec(0, radius * sqrt2),
                vec(0 - thickness / sqrt2, radius * sqrt2 + thickness / sqrt2),
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
                vec(c[0] - radius * sin30, c[1] + radius * cos30),
                vec(c[0] - radius * cos30, c[1] + radius * sin30),
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
                vec(c[0] + rt * cos30 + thickness, c[1] + rt * sin30 + thickness),
                vec(c[0] + rt * cos30, c[1] + rt * sin30),
            ]));
            bodies.push(polyBody([
                vec(c[0] + rt * cos30, c[1] + rt * sin30),
                vec(c[0] + rt * cos30 + thickness, c[1] + rt * sin30 + thickness),
                vec(c[0] + rt * sin30 + thickness, c[1] + rt * cos30 + thickness),
                vec(c[0] + rt * sin30, c[1] + rt * cos30),
            ]));
            bodies.push(polyBody([
                vec(c[0] + rt * sin30, c[1] + rt * cos30),
                vec(c[0] + rt * sin30 + thickness, c[1] + rt * cos30 + thickness),
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
            bodies.push(polyBody([
                vec(fromHalfWidth, -halfSize - fromBackup),
                vec(fromHalfWidth + thickness, -halfSize - fromBackup),
                vec(fromHalfWidth + thickness, fromHalfWidth - sqrt2 * toHalfWidth - thickness),
                vec(fromHalfWidth, fromHalfWidth - sqrt2 * toHalfWidth),
            ]));
            bodies.push(polyBody([
                vec(fromHalfWidth, fromHalfWidth - sqrt2 * toHalfWidth),
                vec(fromHalfWidth + thickness, fromHalfWidth - sqrt2 * toHalfWidth - thickness),
                vec((halfSize + toHalfWidth + toBackup + thickness) / sqrt2, (halfSize - toHalfWidth + toBackup - thickness) / sqrt2),
                vec((halfSize + toHalfWidth + toBackup) / sqrt2, (halfSize - toHalfWidth + toBackup) / sqrt2),
            ]));
        } else if (turn === Turn.R_45) {
            // slight right turn
            bodies.push(polyBody([
                vec(fromHalfWidth, -halfSize - fromBackup),
                vec(fromHalfWidth + thickness, -halfSize - fromBackup),
                vec(fromHalfWidth + thickness, -fromHalfWidth + sqrt2 * toHalfWidth + thickness),
                vec(fromHalfWidth, -fromHalfWidth + sqrt2 * toHalfWidth),
            ]));
            bodies.push(polyBody([
                vec(fromHalfWidth, -fromHalfWidth + sqrt2 * toHalfWidth),
                vec(fromHalfWidth + thickness, -fromHalfWidth + sqrt2 * toHalfWidth + thickness),
                vec((-halfSize + toHalfWidth - toBackup + thickness) / sqrt2, (halfSize + toHalfWidth + toBackup + thickness) / sqrt2),
                vec((-halfSize + toHalfWidth - toBackup) / sqrt2, (halfSize + toHalfWidth + toBackup) / sqrt2),
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