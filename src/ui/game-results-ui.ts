import { timeToString } from "../util/time";
import { GameUi, GREEN_BUTTON_COLOR, makeButton, RED_BUTTON_COLOR, YELLOW_BUTTON_COLOR } from "./game-ui";
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

    elem.style.setProperty('inset', '0');
    elem.style.setProperty('display', 'flex');
    elem.style.setProperty('flex-direction', 'column');
    elem.style.setProperty('justify-content', 'center');
    elem.style.setProperty('align-items', 'center');

    const dialog = document.createElement('div');
    dialog.style.setProperty('display', 'flex');
    dialog.style.setProperty('flex-direction', 'column');
    dialog.style.setProperty('background-color', 'rgb(0, 0, 0)');
    dialog.style.setProperty('border', '2px solid rgb(49, 49, 49)');
    dialog.style.setProperty('padding', '20px');
    dialog.style.setProperty('box-shadow', '6px 6px 4px rgba(0, 0, 0, 0.5)');
    elem.appendChild(dialog);

    const split = document.createElement('div');
    split.style.setProperty('display', 'flex');
    split.style.setProperty('flex-direction', 'row');
    split.style.setProperty('gap', '20px');
    dialog.appendChild(split);

    const resultSide = document.createElement('div');
    resultSide.style.setProperty('display', 'flex');
    resultSide.style.setProperty('flex-direction', 'column');
    resultSide.style.setProperty('align-items', 'center');
    split.appendChild(resultSide);

    const label = document.createElement('div');
    label.textContent = 'RESULT';
    label.style.setProperty('font-size', '30px');
    label.style.setProperty('margin-bottom', '20px');
    resultSide.appendChild(label);

    const trackText = document.createElement('div');
    trackText.textContent = race.track.name;
    trackText.style.setProperty('font-size', '30px');
    resultSide.appendChild(trackText);

    const difficultyText = document.createElement('div');
    difficultyText.textContent = race.difficulty;
    difficultyText.style.setProperty('font-size', '30px');
    resultSide.appendChild(difficultyText);

    const placeText = document.createElement('div');
    placeText.textContent = ordinalToString(finished.place) + ' place';
    placeText.style.setProperty('font-size', '30px');
    resultSide.appendChild(placeText);

    const timeText = document.createElement('div');
    timeText.textContent = timeToString(finished.time);
    timeText.style.setProperty('font-size', '30px');
    resultSide.appendChild(timeText);

    const highScoresSide = document.createElement('div');
    highScoresSide.style.setProperty('display', 'flex');
    highScoresSide.style.setProperty('flex-direction', 'column');
    highScoresSide.style.setProperty('align-items', 'center');
    split.appendChild(highScoresSide);

    const highScoresLabel = document.createElement('div');
    highScoresLabel.textContent = 'HIGH SCORES';
    highScoresLabel.style.setProperty('font-size', '30px');
    highScoresLabel.style.setProperty('margin-bottom', '20px');
    highScoresSide.appendChild(highScoresLabel);

    const scores = loadHighScores();
    const trackScores = scores[race.track.name] ?? {};
    const difficultyScores = trackScores[race.difficulty] ?? [];
    const placeIndex = Math.max(0, difficultyScores.findIndex(s => s.time > finished.time));
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
        scoreText.style.setProperty('font-size', '30px');
        if (index === placeIndex) {
            scoreText.style.setProperty('color', 'yellow');
        }
        highScoresSide.appendChild(scoreText);
    }

    const buttons = document.createElement('div');
    buttons.style.setProperty('display', 'flex');
    buttons.style.setProperty('flex-direction', 'row');
    buttons.style.setProperty('margin-top', '20px');
    buttons.style.setProperty('gap', '20px');
    dialog.appendChild(buttons);

    const nextButton = makeButton(GREEN_BUTTON_COLOR, 'NEXT', () => {
        gameUi.doSetup();
    });
    buttons.appendChild(nextButton);
    nextButton.focus();

    const restartButton = makeButton(YELLOW_BUTTON_COLOR, 'RESTART', () => {
        gameUi.doPause(false);
        if (gameUi.raceUi) {
            const lastRace = gameUi.raceUi.race;
            gameUi.doRace(lastRace.track, lastRace.difficulty);
        }
    });
    buttons.appendChild(restartButton);

}