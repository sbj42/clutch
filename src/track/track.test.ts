import { Direction } from "tiled-geometry";
import { Track } from "./track";
import { TrackBuilder } from "./track-builder";

describe('Track', () => {
    test('basic', () => {
        const t = TrackBuilder.start('test', 0 , 0, Direction.SOUTH).toTrack();
        expect(t.size.width).toBe(1);
        expect(t.size.height).toBe(2);
        expect(t.getTile(0, 0)?.getExit(Direction.SOUTH)).toBeDefined();
        expect(t.getTile(0, 0)?.getExit(Direction.NORTH)).toBeUndefined();
        expect(t.getTile(0, 1)?.getExit(Direction.SOUTH)).toBeUndefined();
        expect(t.getTile(0, 1)?.getExit(Direction.NORTH)).toBeDefined();
    });
    test('pathfinder', () => {
        // .-*-.
        // |  \ \
        // .   .-.
        // |     |
        // .-.-.-.
        const tb = TrackBuilder.start('test', 0, 0, Direction.EAST)
            .checkpoint()
            .go(Direction.EAST, Direction.SOUTHEAST, Direction.SOUTH, Direction.WEST, Direction.WEST, Direction.WEST, Direction.NORTH, Direction.NORTH);
        tb.moveTo(1, 0)
            .go(Direction.SOUTHEAST, Direction.EAST);
        const t = tb.toTrack();
        const pf = t.pathfinders[0];
        expect(pf.getNextStep(0, 0)).toEqual([Direction.EAST]);
        expect(pf.getNextStep(1, 2)).toEqual([Direction.WEST]);
        expect(pf.getNextStep(2, 2)).toEqual([Direction.EAST]);
        expect(pf.getNextStep(3, 1).sort()).toEqual([Direction.NORTHWEST, Direction.WEST].sort());
    });
});