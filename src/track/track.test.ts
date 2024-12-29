import { Direction } from "tiled-geometry";
import { Track } from "./track";
import { TrackBuilder } from "./track-builder";

describe('Track', () => {
    test('simple add', () => {
        const t = new Track();
        expect(t.size.width).toBe(0);
        expect(t.size.height).toBe(0);
        t.add(0, 0, Direction.SOUTH);
        expect(t.size.width).toBe(1);
        expect(t.size.height).toBe(2);
        expect(t.getTile(0, 0)?.getExit(Direction.SOUTH)).toBeDefined();
        expect(t.getTile(0, 0)?.getExit(Direction.NORTH)).toBeUndefined();
        expect(t.getTile(0, 1)?.getExit(Direction.SOUTH)).toBeUndefined();
        expect(t.getTile(0, 1)?.getExit(Direction.NORTH)).toBeDefined();
        t.add(1, 0, Direction.EAST);
        expect(t.size.width).toBe(3);
        expect(t.size.height).toBe(2);
        expect(t.getTile(1, 0)?.getExit(Direction.EAST)).toBeDefined();
        expect(t.getTile(1, 0)?.getExit(Direction.WEST)).toBeUndefined();
        expect(t.getTile(2, 0)?.getExit(Direction.EAST)).toBeUndefined();
        expect(t.getTile(2, 0)?.getExit(Direction.WEST)).toBeDefined();
    });
    test('pathfinder', () => {
        // .-*-.
        // |  \ \
        // .   .-.
        // |     |
        // .-.-.-.
        const tb = new TrackBuilder(1, 0, Direction.WEST)
            .go(Direction.EAST, Direction.SOUTHEAST, Direction.SOUTH, Direction.WEST, Direction.WEST, Direction.WEST, Direction.NORTH, Direction.NORTH);
        tb.moveTo(1, 0)
            .go(Direction.SOUTHEAST, Direction.EAST);
        const t = tb.done();
        const pf = t.getPathfinder(0);
        expect(pf.getNextStep(0, 0)).toEqual([Direction.EAST]);
        expect(pf.getNextStep(1, 2)).toEqual([Direction.WEST]);
        expect(pf.getNextStep(2, 2)).toEqual([Direction.EAST]);
        expect(pf.getNextStep(3, 1).sort()).toEqual([Direction.NORTHWEST, Direction.WEST].sort());
    });
});