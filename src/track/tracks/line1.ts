import { Direction, Offset } from "tiled-geometry";
import { TrackBuilder } from "../track-builder";

// 2-*   .-. .-.
//    \ /  | |  \
//     .   .-.   .-1

export const LINE1 = TrackBuilder.start(0, 0, Direction.EAST)
    .go(Direction.SOUTHEAST, Direction.NORTHEAST, Direction.EAST, Direction.SOUTH, Direction.EAST, Direction.NORTH, Direction.EAST, Direction.SOUTHEAST, Direction.EAST)
    .checkpoint() // 1
    .moveTo(1, 0)
    .go(Direction.WEST)
    .checkpoint() // 2
    .toTrack();
