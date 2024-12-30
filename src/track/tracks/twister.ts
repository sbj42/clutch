import { Direction } from "tiled-geometry";
import { TrackBuilder } from "../track-builder";

// 
// .-4   .-.-*
// |  \ /     \
// .   .       .
// |  / \      |
// 5-.   3-.-.-.
//         |    \
//         1     2
//          \   /
//           .-.

export const TWISTER = TrackBuilder.start(4, 0, Direction.EAST)
    .go(Direction.SOUTHEAST)
    .go(Direction.SOUTH)
    .go(Direction.WEST)
    .go(Direction.WEST)
    .go(Direction.SOUTH)
    .checkpoint() // 1
    .go(Direction.SOUTHEAST)
    .trackWidth('narrow')
    .go(Direction.EAST)
    .go(Direction.NORTHEAST)
    .checkpoint() // 2
    .trackWidth('standard')
    .go(Direction.NORTHWEST)
    .go(Direction.WEST)
    .go(Direction.WEST)
    .go(Direction.WEST)
    .checkpoint() // 3
    .go(Direction.NORTHWEST)
    .go(Direction.NORTHWEST)
    .checkpoint() // 4
    .go(Direction.WEST)
    .trackWidth('narrow')
    .go(Direction.SOUTH)
    .go(Direction.SOUTH)
    .checkpoint() // 5
    .go(Direction.EAST)
    .go(Direction.NORTHEAST)
    .go(Direction.NORTHEAST)
    .trackWidth('standard')
    .go(Direction.EAST)
    .go(Direction.EAST)
    .checkpoint() // *
    .toTrack();
