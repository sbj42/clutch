import { Size } from "tiled-geometry";
import { TILE_SIZE } from "../track/tile";
import { GameUi } from "./game-ui";
import { getTileSvg } from "../track/tile-render";
import { getCheckpointSvg } from "../track/checkpoint-render";
import { Track } from "../track/track";
import { Difficulty } from "../race/race";
import { TRACKS } from "../track/tracks";
import { makeButton, Select } from "../ui/ui";
import { TrackInfo } from "../track/track-info";
import { getDecorationUi } from "./decoration-ui";
import { loadHighScores, MAX_HIGH_SCORES } from "./high-scores";
import { timeToString } from "../util/time";

export async function setupUi(gameUi: GameUi, elem: HTMLElement) {

    let track: TrackInfo | undefined;
    let difficulty: Difficulty = 'normal';

    const go = () => {
        if (track) {
            gameUi.doRace(new Track(track), difficulty);
        }
    };
    
    elem.innerHTML = '';
    elem.classList.add('fill');
    elem.classList.add('column-layout');
    elem.classList.add('padded');

    elem.animate([
        { opacity: 0 },
        { opacity: 1 },
    ], { duration: 400 });

    const instruction = document.createElement('div');
    instruction.textContent = 'GET READY';
    instruction.classList.add('glow');
    instruction.style.setProperty('text-align', 'center');
    instruction.style.setProperty('font-size', '300%');
    elem.appendChild(instruction);

    const split = document.createElement('div');
    split.classList.add('row-layout');
    split.style.setProperty('flex', '1');
    elem.appendChild(split);

    const buttons = document.createElement('div');
    buttons.classList.add('row-layout');
    buttons.classList.add('center');
    buttons.classList.add('padded');
    elem.appendChild(buttons);

    const backButton = makeButton('BACK', 'green', () => {
        gameUi.doTitle();
    });
    buttons.appendChild(backButton);

    const listSide = document.createElement('div');
    listSide.classList.add('column-layout');
    listSide.classList.add('padded');
    split.appendChild(listSide);

    const trackLabel = document.createElement('div');
    trackLabel.textContent = 'TRACK:';
    listSide.appendChild(trackLabel);

    const trackSelect = new Select<string>(undefined, (trackName) => {
        goButton.removeAttribute('disabled');

        track = TRACKS.find((track) => track.name === trackName);
        preview.innerHTML = '';
        updateHighScores(track, difficulty, highScores);
        if (track) {
            trackPreview(preview, new Track(track));
        }
    });
    trackSelect.setOptions(TRACKS.map((track) => ({ label: track.name, key: track.name })), 10);
    listSide.appendChild(trackSelect.element);
    trackSelect.element.focus();

    trackSelect.element.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            go();
        }
    });

    const difficultyLabel = document.createElement('div');
    difficultyLabel.textContent = 'DIFFICULTY:';
    listSide.appendChild(difficultyLabel);

    const difficultySelect = new Select<Difficulty>(difficulty, (value) => {
        difficulty = value;
        updateHighScores(track, difficulty, highScores);
    });
    difficultySelect.setOptions([
        { label: 'EASY', key: 'easy' },
        { label: 'NORMAL', key: 'normal' },
        { label: 'HARD', key: 'hard' },
    ]);
    listSide.appendChild(difficultySelect.element);

    const goButton = makeButton('GO', 'green', go);
    goButton.setAttribute('disabled', 'disabled');
    goButton.style.setProperty('margin-top', '20px');
    listSide.appendChild(goButton);

    const previewSide = document.createElement('div');
    previewSide.classList.add('column-layout');
    previewSide.classList.add('center');
    previewSide.style.setProperty('flex', '1');
    split.appendChild(previewSide);

    const preview = document.createElement('div');
    previewSide.appendChild(preview);

    const highScoresSide = document.createElement('div');
    highScoresSide.classList.add('column-layout');
    highScoresSide.classList.add('padded');
    split.appendChild(highScoresSide);

    const highScoresLabel = document.createElement('div');
    highScoresLabel.textContent = 'HIGH SCORES:';
    highScoresSide.appendChild(highScoresLabel);

    const highScores = document.createElement('div');
    highScoresSide.appendChild(highScores);
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
        const svg = getTileSvg(document, track, tile);
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

    for (const decoration of track.decorations) {
        inner.appendChild(getDecorationUi(decoration));
    }
}

function updateHighScores(track: TrackInfo | undefined, difficulty: Difficulty, highScores: HTMLElement) {
    highScores.innerHTML = '';
    const scores = loadHighScores();
    const trackScores = scores[track?.name ?? ''] ?? {};
    const difficultyScores = trackScores[difficulty] ?? [];
    for (let index = 0; index < MAX_HIGH_SCORES; index++) {
        const score = difficultyScores[index];
        const scoreText = document.createElement('div');
        scoreText.textContent = `${index + 1}. ${timeToString(score?.time)}`;
        highScores.appendChild(scoreText);
    }
}