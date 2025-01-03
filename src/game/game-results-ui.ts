import { makeButton } from "../ui/ui";
import { timeToString } from "../util/time";
import { GameUi } from "./game-ui";
import { loadHighScores, saveHighScores } from "./high-scores";

function ordinalToString(place: number) {
    switch (place) {
        case 1: return '1st';
        case 2: return '2nd';
        case 3: return '3rd';
        default: return `${place}th`;
    }
}

const MAX_HIGH_SCORES = 5;

export async function resultsUi(gameUi: GameUi, elem: HTMLElement) {
    const race = gameUi.raceUi?.race;
    if (!race) {
        return;
    }
    const finished = race.player.finished;
    if (!finished) {
        return;
    }

    elem.innerHTML = '';
    elem.classList.add('column-layout');
    elem.classList.add('fill');
    elem.classList.add('center');

    const dialog = document.createElement('div');
    dialog.classList.add('dialog');
    elem.appendChild(dialog);

    const split = document.createElement('div');
    split.classList.add('row-layout');
    dialog.appendChild(split);

    const resultSide = document.createElement('div');
    resultSide.classList.add('column-layout');
    resultSide.classList.add('padded');
    resultSide.style.setProperty('align-items', 'center');
    split.appendChild(resultSide);

    const label = document.createElement('div');
    label.textContent = 'RESULT';
    resultSide.appendChild(label);

    const trackText = document.createElement('div');
    trackText.textContent = race.track.name;
    resultSide.appendChild(trackText);

    const difficultyText = document.createElement('div');
    difficultyText.textContent = race.difficulty;
    resultSide.appendChild(difficultyText);

    const placeText = document.createElement('div');
    placeText.textContent = ordinalToString(finished.place) + ' place';
    resultSide.appendChild(placeText);

    const timeText = document.createElement('div');
    timeText.textContent = timeToString(finished.time);
    resultSide.appendChild(timeText);

    const highScoresSide = document.createElement('div');
    highScoresSide.classList.add('column-layout');
    highScoresSide.classList.add('padded');
    highScoresSide.style.setProperty('align-items', 'center');
    split.appendChild(highScoresSide);

    const highScoresLabel = document.createElement('div');
    highScoresLabel.textContent = 'HIGH SCORES';
    highScoresSide.appendChild(highScoresLabel);

    const scores = loadHighScores();
    const trackScores = scores[race.track.name] ?? {};
    const difficultyScores = trackScores[race.difficulty] ?? [];
    const placeIndex = Math.min(difficultyScores.length, difficultyScores.findIndex(s => s.time > finished.time));
    if (placeIndex < MAX_HIGH_SCORES) {
        difficultyScores.splice(placeIndex, 0, { time: finished.time });
        difficultyScores.splice(MAX_HIGH_SCORES);
        trackScores[race.difficulty] = difficultyScores;
        scores[race.track.name] = trackScores;
        saveHighScores(scores);
    }

    for (let index = 0; index < MAX_HIGH_SCORES; index++) {
        const score = difficultyScores[index];
        const scoreText = document.createElement('div');
        scoreText.textContent = `${index + 1}. ${timeToString(score?.time)}`;
        if (index === placeIndex) {
            scoreText.style.setProperty('color', 'yellow');
        }
        highScoresSide.appendChild(scoreText);
    }

    const buttons = document.createElement('div');
    buttons.classList.add('row-layout');
    buttons.classList.add('padded');
    dialog.appendChild(buttons);

    const nextButton = makeButton('NEXT', 'green', () => {
        gameUi.doSetup();
    });
    buttons.appendChild(nextButton);
    nextButton.focus();

    const restartButton = makeButton('RESTART', 'yellow', () => {
        gameUi.doPause(false);
        if (gameUi.raceUi) {
            const lastRace = gameUi.raceUi.race;
            gameUi.doRace(lastRace.track, lastRace.difficulty);
        }
    });
    buttons.appendChild(restartButton);

}