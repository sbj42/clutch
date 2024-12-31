import { Direction } from "tiled-geometry";
import { TrackBuilder } from "../track-builder";

// .-.-*
// |   |
// 3-. .
//    \ \
//     . .-1
//     |   |
//     2-.-.

export const DOGBONE = TrackBuilder.start('Dogbone', 1, 0, Direction.EAST, { material: 'dirt' })
    .go(Direction.SOUTH)
    .trackWidth('narrow')
    .go(Direction.SOUTHEAST)
    .trackWidth('standard')
    .go(Direction.EAST)
    .checkpoint() // 1
    .go(Direction.SOUTH)
    .go(Direction.WEST)
    .obstacle('barrel', 0.5, 0.3, Math.random() * 2 * Math.PI)
    .obstacle('barrel', 0.45, 0.33, Math.random() * 2 * Math.PI)
    .go(Direction.WEST)
    .checkpoint() // 2
    .go(Direction.NORTH)
    .trackWidth('narrow')
    .go(Direction.NORTHWEST)
    .trackWidth('standard')
    .go(Direction.WEST)
    .checkpoint() // 3
    .obstacle('cone', 0.72, 0, Math.random() * 2 * Math.PI)
    .obstacle('cone', 0.68, 0.01, Math.random() * 2 * Math.PI)
    .obstacle('cone', 0.64, 0.02, Math.random() * 2 * Math.PI)
    .go(Direction.NORTH)
    .go(Direction.EAST)
    .go(Direction.EAST)
    .checkpoint() // *
    .toTrack();
