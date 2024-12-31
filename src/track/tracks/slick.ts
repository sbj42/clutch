import { Direction } from "tiled-geometry";
import { TrackBuilder } from "../track-builder";

//   .-.
//   |  \
//   .   2
//  /     \
// .   .   .
// |  / \  |
// . .   .-.
// |  \
// 3   .-1-.
// |       |
// .       .
// |       |
// .-.-.-*-.    

export const SLICK = TrackBuilder.start('Slick', 2, 6, Direction.EAST, { material: 'road' })
    .go(Direction.EAST)
    .go(Direction.NORTH)
    .go(Direction.NORTH)
    .go(Direction.WEST)
    .checkpoint() // 1
    .go(Direction.WEST)
    .go(Direction.NORTHWEST)
    .go(Direction.NORTHEAST)
    .go(Direction.SOUTHEAST)
    .go(Direction.EAST)
    .go(Direction.NORTH)
    .go(Direction.NORTHWEST)
    .checkpoint() // 2
    .go(Direction.NORTHWEST)
    .go(Direction.WEST)
    .go(Direction.SOUTH)
    .trackWidth('narrow')
    .go(Direction.SOUTHWEST)
    .go(Direction.SOUTH)
    .go(Direction.SOUTH)
    .checkpoint() // 3
    .go(Direction.SOUTH)
    .trackWidth('standard')
    .go(Direction.SOUTH)
    .go(Direction.EAST)
    .go(Direction.EAST)
    .go(Direction.EAST)
    .checkpoint() // *
    .toTrack();
