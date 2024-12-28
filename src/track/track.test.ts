import { Direction } from "tiled-geometry";
import { Track } from "./track";

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
});