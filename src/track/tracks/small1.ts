import { Direction, Offset } from "tiled-geometry";
import { TrackBuilder } from "../track-builder";

// .-.-1
// |   |
// 4-. .
//    \ \
//     . .-2
//     |   |
//     3-.-.

export const SMALL1 = new TrackBuilder(2, 0, Direction.WEST)
    .go(Direction.SOUTH)
    .trackWidth('narrow')
    .go(Direction.SOUTHEAST)
    .trackWidth('standard')
    .go(Direction.EAST)
    .checkpoint()
    .go(Direction.SOUTH, Direction.WEST, Direction.WEST)
    .checkpoint()
    .go(Direction.NORTH)
    .trackWidth('narrow')
    .go(Direction.NORTHWEST)
    .trackWidth('standard')
    .go(Direction.WEST)
    .checkpoint()
    .go(Direction.NORTH, Direction.EAST)
    .done();
