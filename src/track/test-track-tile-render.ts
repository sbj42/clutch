import * as fs from 'node:fs';
import { Track } from './track';
import { Direction } from 'tiled-geometry';
import { getTileSvg } from './track-tile-render';
import { JSDOM } from 'jsdom';

const outDir = __dirname + '/../../test-out';
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
}

function writeTile(t: Track, x: number, y: number, path: string) {
    const svg = getTileSvg(jsdom.window.document, t.getTile(x, y), { wireframe: true })!;
    fs.writeFileSync(outDir + path, svg.outerHTML);
}

const jsdom = new JSDOM();
{
    const t = new Track();
    // dead-ends
    if (!fs.existsSync(outDir + '/dead-ends')) {
        fs.mkdirSync(outDir + '/dead-ends');
    }
    t.add(0, 0, Direction.SOUTH);
    writeTile(t, 0, 0, '/dead-ends/s.svg');
    writeTile(t, 0, 1, '/dead-ends/n.svg');
    t.add(1, 0, Direction.EAST);
    writeTile(t, 1, 0, '/dead-ends/e.svg');
    writeTile(t, 2, 0, '/dead-ends/w.svg');
    // straight tracks
    if (!fs.existsSync(outDir + '/straight')) {
        fs.mkdirSync(outDir + '/straight');
    }
    t.add(0, 1, Direction.SOUTH, { trackWidth: 'narrow' });
    writeTile(t, 0, 1, '/straight/ns.svg');
    t.add(2, 0, Direction.EAST, { trackWidth: 'narrow' });
    writeTile(t, 2, 0, '/straight/ew.svg');
}
{
    const t = new Track();
    // cardinal square track, narrow n/s
    if (!fs.existsSync(outDir + '/cardinal-corners')) {
        fs.mkdirSync(outDir + '/cardinal-corners');
    }
    t.add(0, 0, Direction.SOUTH, { trackWidth: 'narrow' });
    t.add(0, 0, Direction.EAST);
    t.add(1, 1, Direction.NORTH, { trackWidth: 'narrow' });
    t.add(1, 1, Direction.WEST);
    writeTile(t, 0, 0, '/cardinal-corners/se1.svg');
    writeTile(t, 1, 0, '/cardinal-corners/sw1.svg');
    writeTile(t, 1, 1, '/cardinal-corners/nw1.svg');
    writeTile(t, 0, 1, '/cardinal-corners/ne1.svg');
}
{
    const t = new Track();
    // cardinal square track, narrow e/w
    t.add(0, 0, Direction.SOUTH);
    t.add(0, 0, Direction.EAST, { trackWidth: 'narrow' });
    t.add(1, 1, Direction.NORTH);
    t.add(1, 1, Direction.WEST, { trackWidth: 'narrow' });
    writeTile(t, 0, 0, '/cardinal-corners/se2.svg');
    writeTile(t, 1, 0, '/cardinal-corners/sw2.svg');
    writeTile(t, 1, 1, '/cardinal-corners/nw2.svg');
    writeTile(t, 0, 1, '/cardinal-corners/ne2.svg');
}
{
    const t = new Track();
    // three- and four-way intersections
    if (!fs.existsSync(outDir + '/cardinal-others')) {
        fs.mkdirSync(outDir + '/cardinal-others');
    }
    t.add(0, 0, Direction.SOUTH);
    t.add(0, 0, Direction.EAST);
    t.add(1, 0, Direction.SOUTH);
    t.add(1, 0, Direction.EAST);
    t.add(2, 0, Direction.SOUTH);
    t.add(0, 1, Direction.SOUTH);
    t.add(0, 1, Direction.EAST);
    t.add(1, 1, Direction.SOUTH);
    t.add(1, 1, Direction.EAST);
    t.add(2, 1, Direction.SOUTH);
    t.add(0, 2, Direction.EAST);
    t.add(1, 2, Direction.EAST);
    t.add(2, 2, Direction.EAST);
    writeTile(t, 1, 0, '/cardinal-others/sew.svg');
    writeTile(t, 1, 2, '/cardinal-others/new.svg');
    writeTile(t, 0, 1, '/cardinal-others/nse.svg');
    writeTile(t, 2, 1, '/cardinal-others/nsw.svg');
    writeTile(t, 1, 1, '/cardinal-others/nesw.svg');
}
{
    const t = new Track();
    // dead-ends
    if (!fs.existsSync(outDir + '/dead-ends')) {
        fs.mkdirSync(outDir + '/dead-ends');
    }
    t.add(0, 0, Direction.SOUTHEAST);
    writeTile(t, 0, 0, '/dead-ends/se.svg');
    writeTile(t, 1, 1, '/dead-ends/nw.svg');
    t.add(2, 3, Direction.SOUTHWEST);
    writeTile(t, 1, 4, '/dead-ends/ne.svg');
    writeTile(t, 2, 3, '/dead-ends/sw.svg');
    // straight tracks
    if (!fs.existsSync(outDir + '/straight')) {
        fs.mkdirSync(outDir + '/straight');
    }
    t.add(1, 1, Direction.SOUTHEAST, { trackWidth: 'narrow' });
    writeTile(t, 1, 1, '/straight/nwse.svg');
    t.add(1, 4, Direction.SOUTHWEST, { trackWidth: 'narrow' });
    writeTile(t, 1, 4, '/straight/nesw.svg');
}
{
    const t = new Track();
    // diagonal square track, narrow se/nw
    if (!fs.existsSync(outDir + '/diagonal-corners')) {
        fs.mkdirSync(outDir + '/diagonal-corners');
    }
    t.add(1, 0, Direction.SOUTHEAST, { trackWidth: 'narrow' });
    t.add(2, 1, Direction.SOUTHWEST);
    t.add(1, 2, Direction.NORTHWEST, { trackWidth: 'narrow' });
    t.add(0, 1, Direction.NORTHEAST);
    writeTile(t, 1, 0, '/diagonal-corners/swse1.svg');
    writeTile(t, 2, 1, '/diagonal-corners/nwsw1.svg');
    writeTile(t, 1, 2, '/diagonal-corners/nwne1.svg');
    writeTile(t, 0, 1, '/diagonal-corners/nese1.svg');
}
{
    const t = new Track();
    // diagonal square track, narrow ne/sw
    if (!fs.existsSync(outDir + '/diagonal-corners')) {
        fs.mkdirSync(outDir + '/diagonal-corners');
    }
    t.add(1, 0, Direction.SOUTHEAST);
    t.add(2, 1, Direction.SOUTHWEST, { trackWidth: 'narrow' });
    t.add(1, 2, Direction.NORTHWEST);
    t.add(0, 1, Direction.NORTHEAST, { trackWidth: 'narrow' });
    writeTile(t, 1, 0, '/diagonal-corners/swse2.svg');
    writeTile(t, 2, 1, '/diagonal-corners/nwsw2.svg');
    writeTile(t, 1, 2, '/diagonal-corners/nwne2.svg');
    writeTile(t, 0, 1, '/diagonal-corners/nese2.svg');
}
{
    const t = new Track();
    // cardinal to diagonal transitions
    if (!fs.existsSync(outDir + '/transitions')) {
        fs.mkdirSync(outDir + '/transitions');
    }
    t.add(1, 0, Direction.EAST);
    t.add(2, 0, Direction.SOUTHEAST, { trackWidth: 'narrow' });
    t.add(3, 1, Direction.SOUTH);
    t.add(3, 2, Direction.SOUTHWEST, { trackWidth: 'narrow' });
    t.add(2, 3, Direction.WEST);
    t.add(1, 3, Direction.NORTHWEST, { trackWidth: 'narrow' });
    t.add(0, 2, Direction.NORTH);
    t.add(0, 1, Direction.NORTHEAST, { trackWidth: 'narrow' });
    writeTile(t, 2, 0, '/transitions/a.svg');
    writeTile(t, 3, 1, '/transitions/b.svg');
    writeTile(t, 3, 2, '/transitions/c.svg');
    writeTile(t, 2, 3, '/transitions/d.svg');
    writeTile(t, 1, 3, '/transitions/e.svg');
    writeTile(t, 0, 2, '/transitions/f.svg');
    writeTile(t, 0, 1, '/transitions/g.svg');
    writeTile(t, 1, 0, '/transitions/h.svg');
}