import type { StartInfo } from './checkpoint';
import type { DecorationInfo } from './decoration';
import type { ObstacleInfo } from './obstacle';
import type { TileInfo } from './tile';

export type Material = 'dirt' | 'road';

export type TrackInfo = {
    name: string;
    material: Material;
    startOffset: string;
    start: StartInfo;
    tiles: Record<string, TileInfo | undefined>;
    obstacles?: ObstacleInfo[];
    decorations?: DecorationInfo[];
};

export function copyTrackInfo(info: TrackInfo): TrackInfo {
    return {
        name: info.name,
        material: info.material,
        startOffset: info.startOffset,
        start: { ...info.start },
        tiles: { ...info.tiles },
        obstacles: info.obstacles?.map(obstacle => ({ ...obstacle })),
        decorations: info.decorations?.map(decoration => ({ ...decoration })),
    };
}
