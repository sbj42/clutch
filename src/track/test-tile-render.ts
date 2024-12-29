import * as fs from 'node:fs';
import { Track } from './track';
import { Direction } from 'tiled-geometry';
import { getTileSvg } from './tile-render';
import { JSDOM } from 'jsdom';
import { TrackBuilder } from './track-builder';

const outDir = __dirname + '/../../test-out';
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
}

function writeTile(t: Track, x: number, y: number, path: string) {
    const svg = getTileSvg(jsdom.window.document, t.getTile(x, y), { wireframe: true })!;
    fs.writeFileSync(outDir + path, svg.outerHTML);
}

const jsdom = new JSDOM();

//#region Dead Ends

if (!fs.existsSync(outDir + '/dead-ends')) {
    fs.mkdirSync(outDir + '/dead-ends');
}

{
    //   .
    //   |
    // .-*-.
    //   |
    //   .
    const t = TrackBuilder.start(1, 0, Direction.SOUTH)
        .go(Direction.EAST, Direction.WEST)
        .go(Direction.SOUTH, Direction.NORTH)
        .go(Direction.WEST)
        .toTrack();
    writeTile(t, 1, 0, '/dead-ends/s.svg');
    writeTile(t, 0, 1, '/dead-ends/e.svg');
    writeTile(t, 2, 1, '/dead-ends/w.svg');
    writeTile(t, 1, 2, '/dead-ends/n.svg');
}
{
    // .   .
    //  \ /
    //   *
    //  / \
    // .   .
    const t = TrackBuilder.start(0, 0, Direction.SOUTHEAST)
        .go(Direction.NORTHEAST, Direction.SOUTHWEST)
        .go(Direction.SOUTHWEST, Direction.NORTHEAST)
        .go(Direction.SOUTHEAST)
        .toTrack();
    writeTile(t, 0, 0, '/dead-ends/es.svg');
    writeTile(t, 2, 0, '/dead-ends/sw.svg');
    writeTile(t, 0, 2, '/dead-ends/ne.svg');
    writeTile(t, 2, 2, '/dead-ends/nw.svg');
}

//#endregion

//#region Straight Tracks

if (!fs.existsSync(outDir + '/straight')) {
    fs.mkdirSync(outDir + '/straight');
}
{
    // .
    // |
    // .
    // |
    // .-.-.
    const t = TrackBuilder.start(0, 0, Direction.SOUTH)
        .trackWidth('narrow')
        .go(Direction.SOUTH, Direction.EAST)
        .trackWidth('standard')
        .go(Direction.EAST)
        .toTrack();
    writeTile(t, 0, 1, '/straight/ns.svg');
    writeTile(t, 1, 2, '/straight/ew.svg');
}
{
    // .       .
    //  \     /
    //   .   .
    //    \ /
    //     .
    const t = TrackBuilder.start(0, 0, Direction.SOUTHEAST)
        .trackWidth('narrow')
        .go(Direction.SOUTHEAST, Direction.NORTHEAST)
        .trackWidth('standard')
        .go(Direction.NORTHEAST)
        .toTrack();
    writeTile(t, 1, 1, '/straight/senw.svg');
    writeTile(t, 3, 1, '/straight/nesw.svg');
}

//#endregion

//#region Corners

if (!fs.existsSync(outDir + '/corners')) {
    fs.mkdirSync(outDir + '/corners');
}

{
    // .-.
    // | |
    // .-.
    const t = TrackBuilder.start(0, 0, Direction.EAST)
        .trackWidth('narrow')
        .go(Direction.SOUTH)
        .trackWidth('standard')
        .go(Direction.WEST)
        .trackWidth('narrow')
        .go(Direction.NORTH)
        .toTrack();
    writeTile(t, 0, 0, '/corners/es.svg');
    writeTile(t, 1, 0, '/corners/sw.svg');
    writeTile(t, 1, 1, '/corners/nw.svg');
    writeTile(t, 0, 1, '/corners/ne.svg');
}
{
    //   .
    //  / \
    // .   .
    //  \ /
    //   .
    const t = TrackBuilder.start(1, 0, Direction.SOUTHEAST)
        .trackWidth('narrow')
        .go(Direction.SOUTHWEST)
        .trackWidth('standard')
        .go(Direction.NORTHWEST)
        .trackWidth('narrow')
        .go(Direction.NORTHEAST)
        .toTrack();
    writeTile(t, 1, 0, '/corners/sesw.svg');
    writeTile(t, 2, 1, '/corners/swnw.svg');
    writeTile(t, 1, 2, '/corners/nenw.svg');
    writeTile(t, 0, 1, '/corners/nese.svg');
}

//#endregion

//#region Intersections

if (!fs.existsSync(outDir + '/intersections')) {
    fs.mkdirSync(outDir + '/intersections');
}

{
    // .-.-.
    // | | |
    // .-.-.
    // | | |
    // .-.-.
    const t = TrackBuilder.start(0, 0, Direction.SOUTH)
        .trackWidth('narrow')
        .go(Direction.SOUTH, Direction.NORTH, Direction.EAST)
        .trackWidth('standard')
        .go(Direction.NORTH, Direction.SOUTH, Direction.SOUTH, Direction.NORTH)
        .trackWidth('narrow')
        .go(Direction.EAST, Direction.SOUTH, Direction.NORTH)
        .trackWidth('standard')
        .go(Direction.NORTH, Direction.WEST)
        .trackWidth('narrow')
        .go(Direction.WEST)
        .moveTo(0, 2)
        .go(Direction.EAST)
        .trackWidth('standard')
        .go(Direction.EAST)
        .toTrack();
    writeTile(t, 0, 1, '/intersections/nes.svg');
    writeTile(t, 1, 0, '/intersections/esw.svg');
    writeTile(t, 2, 1, '/intersections/nsw.svg');
    writeTile(t, 1, 2, '/intersections/new.svg');
    writeTile(t, 1, 1, '/intersections/nesw.svg');
}
{
    //     .
    //    / \
    //   .   .
    //  / \ / \
    // .   .   .
    //  \ / \ /
    //   .   .
    //    \ /
    //     .
    const t = TrackBuilder.start(2, 0, Direction.SOUTHWEST)
        .trackWidth('narrow')
        .go(Direction.SOUTHWEST, Direction.NORTHEAST, Direction.SOUTHEAST)
        .trackWidth('standard')
        .go(Direction.NORTHEAST, Direction.SOUTHWEST, Direction.SOUTHWEST, Direction.NORTHEAST)
        .trackWidth('narrow')
        .go(Direction.SOUTHEAST, Direction.SOUTHWEST, Direction.NORTHEAST)
        .trackWidth('standard')
        .go(Direction.NORTHEAST, Direction.NORTHWEST)
        .trackWidth('narrow')
        .go(Direction.NORTHWEST)
        .moveTo(0, 2)
        .go(Direction.SOUTHEAST)
        .trackWidth('standard')
        .go(Direction.SOUTHEAST)
        .toTrack();
    writeTile(t, 1, 1, '/intersections/nesesw.svg');
    writeTile(t, 3, 1, '/intersections/seswnw.svg');
    writeTile(t, 1, 3, '/intersections/nesenw.svg');
    writeTile(t, 3, 3, '/intersections/neswnw.svg');
    writeTile(t, 2, 2, '/intersections/neseswnw.svg');
}

//#endregion

//#region Transitions

if (!fs.existsSync(outDir + '/transitions')) {
    fs.mkdirSync(outDir + '/transitions');
}

{
    //   .-.
    //  /   \
    // |     .
    // .     |
    //  \   /
    //   .-.
    const t = TrackBuilder.start(1, 0, Direction.EAST)
        .trackWidth('narrow')
        .go(Direction.SOUTHEAST)
        .trackWidth('standard')
        .go(Direction.SOUTH)
        .trackWidth('narrow')
        .go(Direction.SOUTHWEST)
        .trackWidth('standard')
        .go(Direction.WEST)
        .trackWidth('narrow')
        .go(Direction.NORTHWEST)
        .trackWidth('standard')
        .go(Direction.NORTH)
        .trackWidth('narrow')
        .go(Direction.NORTHEAST)
        .toTrack();
    writeTile(t, 2, 0, '/transitions/a.svg');
    writeTile(t, 3, 1, '/transitions/b.svg');
    writeTile(t, 3, 2, '/transitions/c.svg');
    writeTile(t, 2, 3, '/transitions/d.svg');
    writeTile(t, 1, 3, '/transitions/e.svg');
    writeTile(t, 0, 2, '/transitions/f.svg');
    writeTile(t, 0, 1, '/transitions/g.svg');
    writeTile(t, 1, 0, '/transitions/h.svg');
}

//#endregion
