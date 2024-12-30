import { Direction } from "tiled-geometry";
import { TrackBuilder } from "../track-builder";

// .-.-*
// |   |
// 3-. .
//    \ \
//     . .-1
//     |   |
//     2-.-.

export const DOGBONE = TrackBuilder.start(1, 0, Direction.EAST)
    .go(Direction.SOUTH)
    .obstacle('cone', 0.5, 0.8, Math.random() * 2 * Math.PI)
    .obstacle('cone', 0.55, 0.8, Math.random() * 2 * Math.PI)
    .obstacle('cone', 0.5, 0.85, Math.random() * 2 * Math.PI)
    .obstacle('cone', 0.55, 0.85, Math.random() * 2 * Math.PI)
    .obstacle('cone', 0.5, 0.9, Math.random() * 2 * Math.PI)
    .trackWidth('narrow')
    .go(Direction.SOUTHEAST)
    .trackWidth('standard')
    .go(Direction.EAST)
    .checkpoint() // 1
    .go(Direction.SOUTH, Direction.WEST, Direction.WEST)
    .checkpoint() // 2
    .go(Direction.NORTH)
    .trackWidth('narrow')
    .go(Direction.NORTHWEST)
    .trackWidth('standard')
    .go(Direction.WEST)
    .checkpoint() // 3
    .go(Direction.NORTH, Direction.EAST, Direction.EAST)
    .checkpoint() // *
    .toTrack();
