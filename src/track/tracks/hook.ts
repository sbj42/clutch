import { Direction } from "tiled-geometry";
import { TrackBuilder } from "../track-builder";

// 
// 2-.-.   .-1`
// |   |  /  |
// . .-. . .-.
// | |  / /
// . .-. .
// |     |
// .-.-*-.

export const HOOK = TrackBuilder.start('Hook', 1, 3, Direction.EAST, { material: 'road' })
    .go(Direction.EAST)
    .go(Direction.NORTH)
    .go(Direction.NORTHEAST)
    .go(Direction.EAST)
    .go(Direction.NORTH)
    .checkpoint() // 1
    .go(Direction.WEST)
    .go(Direction.SOUTHWEST)
    .go(Direction.SOUTHWEST)
    .go(Direction.WEST)
    .go(Direction.NORTH)
    .trackWidth('narrow')
    .go(Direction.EAST)
    .trackWidth('standard')
    .go(Direction.NORTH)
    .go(Direction.WEST)
    .checkpoint() // 2
    .go(Direction.WEST)
    .go(Direction.SOUTH)
    .go(Direction.SOUTH)
    .go(Direction.SOUTH)
    .go(Direction.EAST)
    .go(Direction.EAST)
    .checkpoint() // *
    .toTrack();
