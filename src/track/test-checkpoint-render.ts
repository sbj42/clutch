import * as fs from 'node:fs';
import { Track } from './track';
import { Direction } from 'tiled-geometry';
import { JSDOM } from 'jsdom';
import { CheckpointState, getCheckpointSvg } from './checkpoint-render';
import type { Checkpoint } from './checkpoint';

const outDir = __dirname + '/../../test-out';
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
}

function writeCheckpoint(t: Track, checkpoint: Checkpoint | undefined, state: CheckpointState, path: string) {
    if (!checkpoint) {
        throw new Error('no checkpoint');
    }
    const svg = getCheckpointSvg(jsdom.window.document, checkpoint, state, { wireframe: true })!;
    fs.writeFileSync(outDir + path, svg.outerHTML);
}
function writeTileCheckpoint(t: Track, x: number, y: number, state: CheckpointState, path: string) {
    writeCheckpoint(t, t.getTile(x, y)?.checkpoint, state, path);
}

const jsdom = new JSDOM();
{
    const t = new Track();
    // checkpoints
    if (!fs.existsSync(outDir + '/checkpoints')) {
        fs.mkdirSync(outDir + '/checkpoints');
    }
    t.add(0, 0, Direction.SOUTH, { checkpoint: true });
    writeTileCheckpoint(t, 0, 1, 'next', '/checkpoints/s-next.svg');
    writeTileCheckpoint(t, 0, 1, 'last', '/checkpoints/s-last.svg');
    writeTileCheckpoint(t, 0, 1, 'inactive', '/checkpoints/s-inactive.svg');
    t.add(1, 0, Direction.SOUTHEAST, { checkpoint: true });
    writeTileCheckpoint(t, 2, 1, 'next', '/checkpoints/se-next.svg');
}
{
    const t = new Track();
    // checkpoints
    if (!fs.existsSync(outDir + '/checkpoints')) {
        fs.mkdirSync(outDir + '/checkpoints');
    }
    t.add(0, 0, Direction.SOUTH);
    t.addCheckpoint(0, 0, Direction.SOUTH);
    writeCheckpoint(t, t.checkpoints[0], 'start', '/checkpoints/s-start.svg');
    writeCheckpoint(t, t.checkpoints[0], 'finish', '/checkpoints/s-finish.svg');
}