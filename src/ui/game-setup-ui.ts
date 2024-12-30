import { Size } from "tiled-geometry";
import { TILE_SIZE } from "../track/tile";
import { CATERPILLAR } from "../track/tracks/caterpillar";
import { DOGBONE } from "../track/tracks/dogbone";
import { TWISTER } from "../track/tracks/twister";
import { BACKGROUND_COLOR, BUTTON_DISABLED_COLOR, GameUi, GREEN_BUTTON_COLOR, makeButton } from "./game-ui";
import { getTileSvg } from "../track/tile-render";
import { getCheckpointSvg } from "../track/checkpoint-render";
import { Track } from "../track/track";

export async function setupUi(gameUi: GameUi, elem: HTMLElement) {
    
    elem.style.setProperty('inset', '0');
    elem.style.setProperty('display', 'flex');
    elem.style.setProperty('flex-direction', 'column');
    elem.style.setProperty('margin', '40px');
    elem.style.setProperty('gap', '20px');

    elem.animate([
        { opacity: 0 },
        { opacity: 1 },
    ], { duration: 400 });

    const instruction = document.createElement('div');
    instruction.textContent = 'CHOOSE A TRACK';
    instruction.style.setProperty('text-align', 'center');
    instruction.style.setProperty('font-size', '60px');
    instruction.style.setProperty('font-style', 'italic');
    instruction.style.setProperty('text-shadow', '0 0 6px rgba(255, 255, 0, 0.75)');
    elem.appendChild(instruction);

    const split = document.createElement('div');
    split.style.setProperty('display', 'flex');
    split.style.setProperty('flex-direction', 'row');
    split.style.setProperty('justify-content', 'center');
    split.style.setProperty('align-items', 'center');
    split.style.setProperty('flex', '1');
    elem.appendChild(split);

    const listSide = document.createElement('div');
    listSide.style.setProperty('display', 'flex');
    listSide.style.setProperty('flex-direction', 'column');
    listSide.style.setProperty('justify-content', 'center');
    listSide.style.setProperty('align-items', 'center');
    split.appendChild(listSide);

    const select = document.createElement('select');
    select.setAttribute('size', '10');
    select.style.setProperty('background', 'inherit');
    select.style.setProperty('color', 'inherit');
    select.style.setProperty('font-family', 'inherit');
    select.style.setProperty('font-size', '20px');
    select.style.setProperty('scrollbar-color', `rgb(121, 58, 48) ${BACKGROUND_COLOR}`);
    select.style.setProperty('overflow', 'auto');
    select.style.setProperty('margin', '10px');
    listSide.appendChild(select);

    const tracks = [
        { name: 'Dogbone', track: DOGBONE },
        { name: 'Caterpillar', track: CATERPILLAR },
        { name: 'Twister', track: TWISTER },
    ];
    for (const track of tracks) {
        const option = document.createElement('option');
        option.style.setProperty('padding', '3px 10px');
        option.textContent = track.name;
        select.appendChild(option);
    }

    const go = () => {
        const track = tracks[select.selectedIndex].track;
        gameUi.doRace(track);
    }

    select.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && select.selectedIndex >= 0) {
            go();
        }
    });

    const goButton = makeButton(BUTTON_DISABLED_COLOR, 'GO', go);
    goButton.setAttribute('disabled', 'disabled');
    goButton.style.setProperty('opacity', '0.5');
    goButton.style.setProperty('margin-top', '20px');
    listSide.appendChild(goButton);

    const previewSide = document.createElement('div');
    previewSide.style.setProperty('display', 'flex');
    previewSide.style.setProperty('flex-direction', 'column');
    previewSide.style.setProperty('justify-content', 'center');
    previewSide.style.setProperty('align-items', 'center');
    previewSide.style.setProperty('flex', '1');
    split.appendChild(previewSide);

    const preview = document.createElement('div');
    previewSide.appendChild(preview);

    select.addEventListener('change', () => {
        goButton.removeAttribute('disabled');
        goButton.style.setProperty('cursor', 'pointer');
        goButton.style.setProperty('background-color', GREEN_BUTTON_COLOR);
        goButton.style.setProperty('opacity', '1');

        const track = tracks[select.selectedIndex].track;
        preview.innerHTML = '';
        trackPreview(preview, track);
    });

    select.focus();
}

function trackPreview(elem: HTMLElement, track: Track) {
    const scale = 600 / Math.max(track.size.width, track.size.height) / TILE_SIZE;
    elem.style.setProperty('width', `${track.size.width * TILE_SIZE * scale}px`);
    elem.style.setProperty('height', `${track.size.height * TILE_SIZE * scale}px`);
    const inner = document.createElement('div');
    inner.style.setProperty('width', `${track.size.width * TILE_SIZE}px`);
    inner.style.setProperty('height', `${track.size.height * TILE_SIZE}px`);
    inner.style.setProperty('transform', `scale(${scale})`);
    inner.style.setProperty('transform-origin', '0 0');
    elem.appendChild(inner);
    
    for (const offset of new Size().copyFrom(track.size).offsets()) {
        const tile = track.getTile(offset.x, offset.y);
        const svg = getTileSvg(document, tile);
        if (svg) {
            svg.style.setProperty('position', 'absolute');
            svg.style.setProperty('left', `${TILE_SIZE * (offset.x - 0.5)}px`);
            svg.style.setProperty('top', `${TILE_SIZE * (offset.y - 0.5)}px`);
            inner.appendChild(svg);
        }
    }
    const start = track.start;
    const startOffset = start.tile.offset;
    const startSvg = getCheckpointSvg(document, start, 'start');
    startSvg.style.setProperty('position', 'absolute');
    startSvg.style.setProperty('left', `${TILE_SIZE * (startOffset.x - 0.5)}px`);
    startSvg.style.setProperty('top', `${TILE_SIZE * (startOffset.y - 0.5)}px`);
    inner.appendChild(startSvg);
}