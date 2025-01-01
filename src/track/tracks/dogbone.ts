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
    .go(Direction.WEST)
    .checkpoint() // 2
    .go(Direction.NORTH)
    .trackWidth('narrow')
    .go(Direction.NORTHWEST)
    .trackWidth('standard')
    .go(Direction.WEST)
    .checkpoint() // 3
    .go(Direction.NORTH)
    .go(Direction.EAST)
    .go(Direction.EAST)
    .checkpoint() // *
    .toTrack();
