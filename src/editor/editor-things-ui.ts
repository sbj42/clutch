import { TILE_SIZE } from "../track/tile";
import { BACKGROUND_COLOR, EditorTrackInfo, type EditorUi } from "./editor-ui";
import { getTileSvg } from "../track/tile-render";
import { getCheckpointSvg } from "../track/checkpoint-render";
import { Track } from "../track/track";
import type { TrackInfo } from "../track/track-info";
import { Size } from "tiled-geometry";
import { getInputDirection } from "../game/input";
import { getObstacleImage, getObstacleSize } from "../game/obstacle-ui";
import { ObstacleType } from "../race/obstacle";
import { ObstacleInfo } from "../track/obstacle";
import { DecorationType, getDecorationCenter, getDecorationImage, getDecorationSize } from "../game/decoration-ui";
import { DecorationInfo } from "../track/decoration";
import * as pressed from 'pressed';
import { Select } from "../ui/ui";
import { fixAngle } from "../geom/angle";

type Tool = 'obstacle' | 'decoration' | 'remove';

const SCROLL_SPEED = TILE_SIZE * 1.5;

function removeObstacle(track: EditorTrackInfo, obstacle: ObstacleInfo) {
    track.obstacles = track.obstacles?.filter((other) => other !== obstacle) ?? [];
    if (track.obstacles.length === 0) {
        delete track.obstacles;
    }
}

function removeDecoration(track: EditorTrackInfo, decoration: DecorationInfo) {
    track.decorations = track.decorations?.filter((other) => other !== decoration) ?? [];
    if (track.decorations.length === 0) {
        delete track.decorations;
    }
}

export async function setupThingsUi(editorUi: EditorUi, elem: HTMLElement) {
    let currentTool: Tool = 'obstacle';
    let currentObstacleType: ObstacleType = 'cone';
    let currentDecorationType: DecorationType = 'palmtree1';
    let currentAngle: number = 0;
    
    elem.innerHTML = '';
    elem.classList.add('row-layout');

    const controlsSide = document.createElement('div');
    controlsSide.classList.add('column-layout');
    controlsSide.classList.add('padded');
    elem.appendChild(controlsSide);

    const toolLabel = document.createElement('div');
    toolLabel.textContent = 'Tool:';
    controlsSide.appendChild(toolLabel);

    const toolSelect = new Select<Tool>(currentTool, (tool) => {
        currentTool = tool;
        updateToolControls();
        addImage.remove();
    });
    controlsSide.appendChild(toolSelect.element);
    toolSelect.element.focus();
    toolSelect.setOptions([
        { label: 'Add Obstacle', key: 'obstacle' },
        { label: 'Add Decoration', key: 'decoration' },
        { label: 'Remove', key: 'remove' },
    ]);

    const obstacleTypeLabel = document.createElement('div');
    obstacleTypeLabel.textContent = 'Obstacle Type:';
    controlsSide.appendChild(obstacleTypeLabel);

    const obstacleTypeSelect = new Select<ObstacleType>(currentObstacleType, (obstacleType) => {
        currentObstacleType = obstacleType;
    });
    controlsSide.appendChild(obstacleTypeSelect.element);
    obstacleTypeSelect.setOptions([
        { label: 'Cone', key: 'cone' },
        { label: 'Barrel', key: 'barrel' },
        { label: 'Tire', key: 'tire' },
    ], 12);

    const decorationTypeLabel = document.createElement('div');
    decorationTypeLabel.textContent = 'Decoration Type:';
    controlsSide.appendChild(decorationTypeLabel);

    const decorationTypeSelect = new Select<DecorationType>(currentDecorationType, (decorationType) => {
        currentDecorationType = decorationType;
    });
    controlsSide.appendChild(decorationTypeSelect.element);
    decorationTypeSelect.setOptions([
        { label: 'Bush 1', key: 'bush1' },
        { label: 'Bush 2', key: 'bush2' },
        { label: 'Palm Tree 1', key: 'palmtree1' },
        { label: 'Palm Tree 2', key: 'palmtree2' },
        { label: 'Palm Tree 3', key: 'palmtree3' },
        { label: 'Barrier 1', key: 'barrier1' },
        { label: 'Barrier 2', key: 'barrier2' },
        { label: 'Chevrons 1', key: 'chevrons1' },
        { label: 'Arrow 1', key: 'arrow1' },
    ], 12);

    function updateToolControls() {
        obstacleTypeLabel.style.setProperty('display', currentTool === 'obstacle' ? 'block' : 'none');
        obstacleTypeSelect.element.style.setProperty('display', currentTool === 'obstacle' ? 'block' : 'none');
        decorationTypeLabel.style.setProperty('display', currentTool === 'decoration' ? 'block' : 'none');
        decorationTypeSelect.element.style.setProperty('display', currentTool === 'decoration' ? 'block' : 'none');
    }
    updateToolControls();

    const trackSide = document.createElement('div');
    trackSide.classList.add('scrollable');
    trackSide.classList.add('container');
    trackSide.style.setProperty('flex', '1');
    elem.appendChild(trackSide);

    const tracksLayer = document.createElement('div');
    tracksLayer.classList.add('layer');
    tracksLayer.style.setProperty('pointer-events', 'none');
    trackSide.appendChild(tracksLayer);

    const thingsLayer = document.createElement('div');
    thingsLayer.classList.add('layer');
    trackSide.appendChild(thingsLayer);

    thingsLayer.addEventListener('mousemove', (event) => {
        if (currentTool === 'obstacle') {
            thingsLayer.appendChild(addImage);
            const size = getObstacleSize(currentObstacleType, false);
            addImage.style.setProperty('top', `${event.offsetY - size.height / 2}px`);
            addImage.style.setProperty('left', `${event.offsetX - size.width / 2}px`);
            addImage.style.setProperty('transform', `rotate(${currentAngle}rad)`);
            addImage.innerHTML = '';
            addImage.appendChild(getObstacleImage(currentObstacleType, false));
        } else if (currentTool === 'decoration') {
            thingsLayer.appendChild(addImage);
            const center = getDecorationCenter(currentDecorationType);
            addImage.style.setProperty('top', `${event.offsetY - center.y}px`);
            addImage.style.setProperty('left', `${event.offsetX - center.x}px`);
            addImage.style.setProperty('transform', `rotate(${currentAngle}rad)`);
            addImage.innerHTML = '';
            addImage.appendChild(getDecorationImage(currentDecorationType));
        }
    });
    thingsLayer.addEventListener('click', (event) => {
        if (currentTool === 'obstacle') {
            const x = event.offsetX / TILE_SIZE;
            const y = event.offsetY / TILE_SIZE;
            editorUi.trackInfo.obstacles ??= [];
            editorUi.trackInfo.obstacles.push({
                type: currentObstacleType,
                location: { x, y },
                angle: currentAngle,
            });
            editorUi.update();
            update();
        } else if (currentTool === 'decoration') {
            const x = event.offsetX / TILE_SIZE;
            const y = event.offsetY / TILE_SIZE;
            editorUi.trackInfo.decorations ??= [];
            editorUi.trackInfo.decorations.push({
                type: currentDecorationType,
                location: { x, y },
                angle: currentAngle,
            });
            editorUi.update();
            update();
        }
    });

    let lastTime = -1;
    function rafCallback(time: number) {
        if (!trackSide.parentNode) {
            return;
        }
        if (lastTime < 0) {
            lastTime = time;
        } else {
            const sec = Math.min(time - lastTime, 16.666) / 1000;
            lastTime = time;
            const input = getInputDirection();
            trackSide.scrollBy(input.x * SCROLL_SPEED * sec, input.y * SCROLL_SPEED * sec);
            if (pressed('Q') && !pressed('Shift')) {
                currentAngle = fixAngle(currentAngle - Math.PI / 2 * sec);
                addImage.style.setProperty('transform', `rotate(${currentAngle}rad)`);
            } else if (pressed('E') && !pressed('Shift')) {
                currentAngle = fixAngle(currentAngle + Math.PI / 2 * sec);
                addImage.style.setProperty('transform', `rotate(${currentAngle}rad)`);
            }
        }
        requestAnimationFrame(rafCallback);
    }
    requestAnimationFrame(rafCallback);

    const onKeydown = (event) => {
        if (event.shiftKey && event.key === 'Q') {
            currentAngle = fixAngle(Math.PI / 8 * Math.ceil(currentAngle / (Math.PI / 8)) - Math.PI / 8);
            addImage.style.setProperty('transform', `rotate(${currentAngle}rad)`);
        } else if (event.shiftKey && event.key === 'E') {
            currentAngle = fixAngle(Math.PI / 8 * Math.floor(currentAngle / (Math.PI / 8)) + Math.PI / 8);
            addImage.style.setProperty('transform', `rotate(${currentAngle}rad)`);
        }
    };
    controlsSide.addEventListener('keydown', onKeydown);
    trackSide.addEventListener('keydown', onKeydown);

    const addImage = document.createElement('div');
    addImage.style.setProperty('position', 'absolute');
    addImage.style.setProperty('pointer-events', 'none');

    function update(first = false) {

        const trackInfo = editorUi.trackInfo;
        const track = new Track(trackInfo as TrackInfo);
        thingsLayer.style.setProperty('width', `${track.size.width * TILE_SIZE}px`);
        thingsLayer.style.setProperty('height', `${track.size.height * TILE_SIZE}px`);

        tracksLayer.innerHTML = '';
        for (const offset of new Size().copyFrom(track.size).offsets()) {
            const tile = track.getTile(offset.x, offset.y);
            const svg = getTileSvg(document, track, tile);
            if (svg) {
                svg.style.setProperty('position', 'absolute');
                svg.style.setProperty('left', `${TILE_SIZE * (offset.x - 0.5)}px`);
                svg.style.setProperty('top', `${TILE_SIZE * (offset.y - 0.5)}px`);
                tracksLayer.appendChild(svg);
            }
        }
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
            if (finsishSameAsStart) {
                continue;
            }
            const status = index <= track.checkpoints.length - 1 ? 'next'
                : 'finish';
            const svg = getCheckpointSvg(document, checkpoint, status);
            svg.style.setProperty('position', 'absolute');
            svg.style.setProperty('left', `${TILE_SIZE * (offset.x - 0.5)}px`);
            svg.style.setProperty('top', `${TILE_SIZE * (offset.y - 0.5)}px`);
            tracksLayer.appendChild(svg);
        }
        if (first) {
            trackSide.scrollTo((track.start.tile.offset.x - 0.5) * TILE_SIZE, (track.start.tile.offset.y - 0.5) * TILE_SIZE);
        }

        thingsLayer.innerHTML = '';
        for (const obstacle of track.obstacles) {
            const type = obstacle.type as ObstacleType;
            const size = getObstacleSize(type as ObstacleType, false);
            const element = document.createElement('div');
            element.style.setProperty('position', 'absolute');
            element.style.setProperty('top', `${obstacle.location.y * TILE_SIZE - size.height / 2}px`);
            element.style.setProperty('left', `${obstacle.location.x * TILE_SIZE - size.width / 2}px`);
            element.style.setProperty('transform', `rotate(${obstacle.angle}rad)`);
            element.style.setProperty('transform-origin', `${size.width / 2}px ${size.height / 2}px`);
            element.appendChild(getObstacleImage(type, false));
            element.addEventListener('click', () => {
                if (currentTool === 'remove') {
                    removeObstacle(trackInfo, obstacle);
                    editorUi.update();
                    update();
                }
            });
            thingsLayer.appendChild(element);
        }
        for (const decoration of track.decorations) {
            const type = decoration.type as DecorationType;
            const size = getDecorationSize(type as DecorationType);
            const element = document.createElement('div');
            element.style.setProperty('position', 'absolute');
            element.style.setProperty('top', `${decoration.location.y * TILE_SIZE - size.height / 2}px`);
            element.style.setProperty('left', `${decoration.location.x * TILE_SIZE - size.width / 2}px`);
            element.style.setProperty('transform', `rotate(${decoration.angle}rad)`);
            element.style.setProperty('transform-origin', `${size.width / 2}px ${size.height / 2}px`);
            element.appendChild(getDecorationImage(type));
            element.addEventListener('click', () => {
                if (currentTool === 'remove') {
                    removeDecoration(trackInfo, decoration);
                    editorUi.update();
                    update();
                }
            });
            thingsLayer.appendChild(element);
        }
    }
    update(true);
}
