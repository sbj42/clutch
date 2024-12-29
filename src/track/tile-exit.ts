export type TrackWidth = 'standard' | 'narrow';

export type TileExitInfo = {
    readonly trackWidth: string;
};

const STANDARD_TRACK_WIDTH = 0.5;
const NARROW_TRACK_WIDTH = 0.3;

function trackWidthFromString(str: string) {
    switch (str) {
        case 'narrow': return NARROW_TRACK_WIDTH;
        case 'standard': return STANDARD_TRACK_WIDTH;
        default: throw new Error('invalid track width ' + str);
    }
}

export class TileExit {
    readonly trackWidth: number; // as fraction of tile size

    constructor(info: TileExitInfo) {
        this.trackWidth = trackWidthFromString(info.trackWidth);
    }
}
