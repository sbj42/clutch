import { Direction, Offset } from "tiled-geometry";
import { TrackBuilder } from "../track-builder";

// 2-*   .-. .-.
//    \ /  | |  \
//     .   .-.   .-1

export const CATERPILLAR = TrackBuilder.start('Caterpillar', 0, 0, Direction.EAST, { material: 'dirt' })
    .go(Direction.SOUTHEAST, Direction.NORTHEAST, Direction.EAST, Direction.SOUTH, Direction.EAST, Direction.NORTH, Direction.EAST, Direction.SOUTHEAST, Direction.EAST)
    .checkpoint() // 1
    .moveTo(1, 0)
    .go(Direction.WEST)
    .checkpoint() // 2
    .toTrack();
