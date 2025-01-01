import * as fs from 'node:fs';
import { Track } from './track';
import { Direction } from 'tiled-geometry';
import { JSDOM } from 'jsdom';
import { CheckpointState, getCheckpointSvg } from './checkpoint-render';
import type { Checkpoint } from './checkpoint';
import { TrackBuilder } from './track-builder';

const outDir = __dirname + '/../../test-out';
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
}

function writeCheckpoint(checkpoint: Checkpoint | undefined, state: CheckpointState, path: string) {
    if (!checkpoint) {
        throw new Error('no checkpoint');
    }
    const svg = getCheckpointSvg(jsdom.window.document, checkpoint, state, { wireframe: true })!;
    fs.writeFileSync(outDir + path, svg.outerHTML);
}

const jsdom = new JSDOM();

if (!fs.existsSync(outDir + '/checkpoints')) {
    fs.mkdirSync(outDir + '/checkpoints');
}

{
    const t = TrackBuilder.start('test', 0, 0, Direction.EAST)
        .checkpoint()
        .go(Direction.SOUTHEAST)
        .checkpoint()
        .toTrack();
    writeCheckpoint(t.checkpoints[0], 'next', '/checkpoints/w-next.svg');
    writeCheckpoint(t.checkpoints[0], 'last', '/checkpoints/w-last.svg');
    writeCheckpoint(t.checkpoints[0], 'inactive', '/checkpoints/w-inactive.svg');
    writeCheckpoint(t.checkpoints[1], 'next', '/checkpoints/nw-next.svg');
    writeCheckpoint(t.start, 'start', '/checkpoints/w-start.svg');
    writeCheckpoint(t.checkpoints[1], 'finish', '/checkpoints/nw-finish.svg');
}
