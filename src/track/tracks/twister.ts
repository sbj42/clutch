import { Direction } from "tiled-geometry";
import { TrackBuilder } from "../track-builder";

// 
// .-5   .-.-*
// |  \ /     \
// .   .       1
// |  / \      |
// 6-.   4-.-.-.
//         |    \
//         2     3
//          \   /
//           .-.

export const TWISTER = TrackBuilder.start(4, 0, Direction.EAST)
    .go(Direction.SOUTHEAST)
    .checkpoint() // 1
    .go(Direction.SOUTH)
    .go(Direction.WEST)
    .go(Direction.WEST)
    .go(Direction.SOUTH)
    .checkpoint() // 2
    .go(Direction.SOUTHEAST)
    .trackWidth('narrow')
    .go(Direction.EAST)
    .go(Direction.NORTHEAST)
    .checkpoint() // 3
    .trackWidth('standard')
    .go(Direction.NORTHWEST)
    .go(Direction.WEST)
    .go(Direction.WEST)
    .go(Direction.WEST)
    .checkpoint() // 4
    .go(Direction.NORTHWEST)
    .go(Direction.NORTHWEST)
    .checkpoint() // 5
    .go(Direction.WEST)
    .trackWidth('narrow')
    .go(Direction.SOUTH)
    .go(Direction.SOUTH)
    .checkpoint() // 6
    .go(Direction.EAST)
    .go(Direction.NORTHEAST)
    .go(Direction.NORTHEAST)
    .trackWidth('standard')
    .go(Direction.EAST)
    .go(Direction.EAST)
    .checkpoint() // *
    .toTrack();
