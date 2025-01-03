import { directionAddTurn, directionOpposite, DIRECTIONS, directionToString, Offset, Size, Turn, type OffsetLike } from "tiled-geometry";
import { TILE_SIZE, TileInfo } from "../track/tile";
import { BACKGROUND_COLOR, type EditorTrackInfo, type EditorUi } from "./editor-ui";
import { getTileSvg } from "../track/tile-render";
import { getCheckpointSvg } from "../track/checkpoint-render";
import { Track } from "../track/track";
import type { Material, TrackInfo } from "../track/track-info";
import type { TrackWidth } from "../track/tile-exit";
import { makeLayer, makeTextField, Select, SelectOption } from "../ui/ui";

const SCALE = 1 / 6;

const GRID_COLOR = 'rgba(42, 198, 245, 0.5)';
const GRID_HOVER_COLOR = 'rgba(242, 245, 42, 0.75)';
const GRID_INVALID_COLOR = 'rgba(245, 42, 42, 0.75)';
const GRID_SELECT_COLOR = 'rgba(242, 245, 42, 0.25)';

type Tool = 'delete' | 'standard' | 'narrow' | 'start' | 'add-checkpoint' | 'remove-checkpoint';

export async function setupTrackUi(editorUi: EditorUi, elem: HTMLElement) {
    let currentTool: Tool = 'standard';
    
    elem.innerHTML = '';
    elem.classList.add('row-layout');

    const controlsSide = document.createElement('div');
    controlsSide.classList.add('column-layout');
    controlsSide.classList.add('padded');
    elem.appendChild(controlsSide);

    const nameLabel = document.createElement('div');
    nameLabel.textContent = 'Track Name:';
    controlsSide.appendChild(nameLabel);

    const nameField = makeTextField(editorUi.trackInfo.name, 'Track Name', (value) => {
        editorUi.trackInfo.name = value;
        editorUi.update();
    });
    nameField.setAttribute('size', '10');
    controlsSide.appendChild(nameField);
    nameField.focus();

    const materialLabel = document.createElement('div');
    materialLabel.textContent = 'Material:';
    controlsSide.appendChild(materialLabel);

    const materialSelect = new Select<Material>(editorUi.trackInfo.material, (value) => {
        editorUi.trackInfo.material = value;
        editorUi.update();
        update();
    });
    controlsSide.appendChild(materialSelect.element);
    materialSelect.setOptions([
        { label: 'Road', key: 'road' },
        { label: 'Dirt', key: 'dirt' },
    ]);

    const toolLabel = document.createElement('div');
    toolLabel.textContent = 'Tool:';
    controlsSide.appendChild(toolLabel);

    const toolSelect = new Select<Tool>(currentTool, (value) => {
        currentTool = value;
    });
    controlsSide.appendChild(toolSelect.element);

    function updateTools(track: Track | undefined = undefined) {
        const tools: SelectOption<Tool>[] = [];
        tools.push(
            { label: 'Standard', key: 'standard' },
            { label: 'Narrow', key: 'narrow' },
        );
        if (track) {
            tools.push(
                { label: 'Delete', key: 'delete' },
                { label: `Move Start`, key: 'start' },
                { label: `Add Checkpoint`, key: 'add-checkpoint' },
                { label: `Remove Checkpoint`, key: 'remove-checkpoint' },
            );
        }
        toolSelect.setOptions(tools, tools.length);
    }

    const trackSide = document.createElement('div');
    trackSide.classList.add('scrollable');
    trackSide.style.setProperty('flex', '1');
    elem.appendChild(trackSide);

    function update() {

        const trackInfo = editorUi.trackInfo;
        let track: Track | undefined;
        if ('start' in trackInfo) {
            track = new Track(trackInfo as TrackInfo);
        }
        updateTools(track);
        const size = new Size();
        if (track) {
            size.copyFrom(track.size);
        }
        size.width = Math.max(size.width + 4, 8);
        size.height = Math.max(size.height + 4, 8);

        trackSide.innerHTML = '';
        
        const trackSideInner = document.createElement('div');
        trackSideInner.style.setProperty('width', `${size.width * SCALE * TILE_SIZE}px`);
        trackSideInner.style.setProperty('height', `${size.height * SCALE * TILE_SIZE}px`);
        trackSideInner.classList.add('container');
        trackSide.appendChild(trackSideInner);

        const tracksLayer = makeLayer('tracks');
        tracksLayer.style.setProperty('width', `${size.width * TILE_SIZE}px`);
        tracksLayer.style.setProperty('height', `${size.height * TILE_SIZE}px`);
        tracksLayer.style.setProperty('transform', `scale(${SCALE})`);
        tracksLayer.style.setProperty('transform-origin', '0 0');
        tracksLayer.style.setProperty('pointer-events', 'none');
        trackSideInner.appendChild(tracksLayer);

        const gridLayer = makeLayer('grid');
        trackSideInner.appendChild(gridLayer);

        let mouseDownOffset: OffsetLike | undefined;
        let mouseOverOffset: OffsetLike | undefined;
        let mouseDownGridRect: HTMLElement | undefined;
        
        for (const offset of size.offsets()) {
            const gridRect = document.createElement('div');
            gridRect.style.setProperty('position', 'absolute');
            gridRect.style.setProperty('left', `${TILE_SIZE * SCALE * offset.x}px`);
            gridRect.style.setProperty('top', `${TILE_SIZE * SCALE * offset.y}px`);
            gridRect.style.setProperty('width', `${TILE_SIZE * SCALE + 1}px`);
            gridRect.style.setProperty('height', `${TILE_SIZE * SCALE + 1}px`);
            gridRect.style.setProperty('border', `1px dashed ${GRID_COLOR}`);
            gridRect.style.setProperty('box-sizing', 'border-box');
            gridLayer.appendChild(gridRect);
            gridRect.addEventListener('mouseenter', () => {
                mouseOverOffset = offset;
                if (mouseDownOffset !== undefined && !isExitValid(trackInfo, mouseDownOffset, offset)) {
                    gridRect.style.setProperty('border-color', GRID_INVALID_COLOR);
                } else {
                    gridRect.style.setProperty('border-color', GRID_HOVER_COLOR);
                }
                gridRect.style.setProperty('z-index', '1');
            });
            gridRect.addEventListener('mouseleave', () => {
                mouseOverOffset = undefined;
                gridRect.style.setProperty('border-color', GRID_COLOR);
                gridRect.style.removeProperty('z-index');
            });
            gridRect.addEventListener('mousedown', (event) => {
                if (currentTool === 'remove-checkpoint') {
                    removeCheckpoint(trackInfo, offset);
                    editorUi.update();
                    update();
                } else {
                    mouseDownOffset = offset;
                    mouseDownGridRect = gridRect;
                    gridRect.style.setProperty('background-color', GRID_SELECT_COLOR);
                }
                event.preventDefault();
            }, { capture: true });

            if (track && offset.x < track.size.width && offset.y < track.size.height) {
                const tile = track.getTile(offset.x, offset.y);
                const svg = getTileSvg(document, track, tile);
                if (svg) {
                    svg.style.setProperty('position', 'absolute');
                    svg.style.setProperty('left', `${TILE_SIZE * (offset.x - 0.5)}px`);
                    svg.style.setProperty('top', `${TILE_SIZE * (offset.y - 0.5)}px`);
                    tracksLayer.appendChild(svg);
                }
            }
        }

        gridLayer.addEventListener('mouseup', () => {
            if (mouseDownOffset !== undefined && mouseOverOffset !== undefined && isExitValid(trackInfo, mouseDownOffset, mouseOverOffset)) {
                if (currentTool === 'standard' || currentTool === 'narrow') {
                    addTrack(trackInfo, mouseDownOffset, mouseOverOffset, currentTool);
                } else if (currentTool === 'delete') {
                    removeTrack(trackInfo, mouseDownOffset, mouseOverOffset);
                } else if (currentTool === 'start') {
                    setStart(trackInfo, mouseDownOffset, mouseOverOffset);
                } else if (track && currentTool === 'add-checkpoint') {
                    addCheckpoint(trackInfo, mouseDownOffset, mouseOverOffset, track.checkpoints.length);
                }
                editorUi.update();
                update();
            } else {
                mouseDownGridRect?.style.removeProperty('background-color');
            }
            mouseDownOffset = undefined;
            mouseDownGridRect = undefined;
        });

        if (track) {
            const start = track.start;
            const startOffset = start.tile.offset;
            const startSvg = getCheckpointSvg(document, start, 'start');
            startSvg.style.setProperty('position', 'absolute');
            startSvg.style.setProperty('left', `${TILE_SIZE * (startOffset.x - 0.5)}px`);
            startSvg.style.setProperty('top', `${TILE_SIZE * (startOffset.y - 0.5)}px`);
            tracksLayer.appendChild(startSvg);

            for (let index = 0; index < track.checkpoints.length; index++) {
                const checkpoint = track.checkpoints[index];
                const offset = checkpoint.tile.offset;
                const finsishSameAsStart = index === track.checkpoints.length - 1 && offset.x === startOffset.x && offset.y === startOffset.y;
                const status = index <= track.checkpoints.length - 1 ? 'next'
                    : finsishSameAsStart ? 'next'
                    : 'finish';
                const svg = getCheckpointSvg(document, checkpoint, status, { showIndex: true});
                svg.style.setProperty('position', 'absolute');
                svg.style.setProperty('left', `${TILE_SIZE * (offset.x - 0.5)}px`);
                svg.style.setProperty('top', `${TILE_SIZE * (offset.y - 0.5)}px`);
                tracksLayer.appendChild(svg);
            }
        }
    }
    update();
}

function findDirection(from: Offset, to: Offset) {
    for (const dir of DIRECTIONS) {
        const neighbor = new Offset().copyFrom(from).addDirection(dir);
        if (neighbor.equals(to)) {
            return dir;
        }
    }
    return undefined;
}

function isExitValid(track: EditorTrackInfo, from_: OffsetLike, to_: OffsetLike) {
    const from = new Offset().copyFrom(from_);
    const to = new Offset().copyFrom(to_);
    const direction = findDirection(from, to);
    if (direction === undefined) {
        return false;
    }
    const fromTile = track.tiles[from.toString()];
    if (fromTile?.exits[directionToString(direction)]) {
        return true;
    }
    if (fromTile?.exits[directionToString(directionAddTurn(direction, Turn.L_45))]
        || fromTile?.exits[directionToString(directionAddTurn(direction, Turn.R_45))]) {
        return false;
    }
    const toTile = track.tiles[to.toString()];
    const opposite = directionOpposite(direction);
    if (toTile?.exits[directionToString(directionAddTurn(opposite, Turn.L_45))]
        || toTile?.exits[directionToString(directionAddTurn(opposite, Turn.R_45))]) {
        return false;
    }
    return true;
}

function addTrack(track: EditorTrackInfo, from_: OffsetLike, to_: OffsetLike, trackWidth: TrackWidth) {
    const from = new Offset().copyFrom(from_);
    const to = new Offset().copyFrom(to_);
    const direction = findDirection(from, to);
    if (direction === undefined) {
        return;
    }
    const opposite = directionOpposite(direction);
    let fromTile = track.tiles[from.toString()];
    if (!fromTile) {
        fromTile = track.tiles[from.toString()] = {
            exits: {},
        };
    }
    let toTile = track.tiles[to.toString()];
    if (!toTile) {
        toTile = track.tiles[to.toString()] = {
            exits: {},
        };
    }
    fromTile.exits[directionToString(direction)] = { trackWidth };
    toTile.exits[directionToString(opposite)] = { trackWidth };
    if (!('start' in track)) {
        track.start = {
            offset: to.toString(),
            direction: directionToString(opposite),
        };
    }
}

function setStart(track: EditorTrackInfo, from_: OffsetLike, to_: OffsetLike) {
    const from = new Offset().copyFrom(from_);
    const to = new Offset().copyFrom(to_);
    const direction = findDirection(from, to);
    if (direction === undefined) {
        return;
    }
    const opposite = directionOpposite(direction);
    track.start = {
        offset: to.toString(),
        direction: directionToString(opposite),
    };
}

function removeTrack(track: EditorTrackInfo, from_: OffsetLike, to_: OffsetLike) {
    const from = new Offset().copyFrom(from_);
    const to = new Offset().copyFrom(to_);
    const direction = findDirection(from, to);
    if (direction === undefined) {
        return;
    }
    const opposite = directionOpposite(direction);
    const fromTile = track.tiles[from.toString()];
    const toTile = track.tiles[to.toString()];
    if (!fromTile || !toTile) {
        return;
    }
    delete fromTile.exits[directionToString(direction)];
    if (fromTile.checkpoint?.direction === directionToString(direction)) {
        _removeCheckpointHelper(track, fromTile);
    }
    if (Object.keys(fromTile.exits).length === 0) {
        delete track.tiles[from.toString()];
    }
    delete toTile.exits[directionToString(opposite)];
    if (toTile.checkpoint?.direction === directionToString(opposite)) {
        _removeCheckpointHelper(track, toTile);
    }
    if (Object.keys(toTile.exits).length === 0) {
        delete track.tiles[to.toString()];
    }
}

function addCheckpoint(track: EditorTrackInfo, from_: OffsetLike, to_: OffsetLike, index: number) {
    const from = new Offset().copyFrom(from_);
    const to = new Offset().copyFrom(to_);
    const direction = findDirection(from, to);
    if (direction === undefined) {
        return;
    }
    const opposite = directionOpposite(direction);
    const toTile = track.tiles[to.toString()];
    if (!toTile) {
        return;
    }
    toTile.checkpoint = {
        index,
        direction: directionToString(opposite),
    };
}

function removeCheckpoint(track: EditorTrackInfo, off_: OffsetLike) {
    const off = new Offset().copyFrom(off_);
    const tile = track.tiles[off.toString()];
    if (!tile) {
        return;
    }
    _removeCheckpointHelper(track, tile);
}

function _removeCheckpointHelper(track: EditorTrackInfo, tile: TileInfo) {
    const checkpoint = tile.checkpoint;
    tile.checkpoint = undefined;
    if (checkpoint) {
        for (const offsetStr in track.tiles) {
            const tile = track.tiles[offsetStr];
            if (tile?.checkpoint) {
                if (tile.checkpoint.index > checkpoint.index) {
                    tile.checkpoint.index--;
                }
            }
        }
    }
}
