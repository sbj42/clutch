import { timeToString } from "../util/time";
import { GameUi, GREEN_BUTTON_COLOR, makeButton, RED_BUTTON_COLOR, YELLOW_BUTTON_COLOR } from "./game-ui";

function placeText(place: number) {
    switch (place) {
        case 1: return '1st';
        case 2: return '2nd';
        case 3: return '3rd';
        default: return `${place}th`;
    }
}

export async function resultsUi(gameUi: GameUi, elem: HTMLElement) {

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
    dialog.style.setProperty('align-items', 'center');
    elem.appendChild(dialog);

    const label = document.createElement('div');
    label.textContent = 'RESULT';
    label.style.setProperty('font-size', '30px');
    label.style.setProperty('margin-bottom', '20px');
    dialog.appendChild(label);

    const place = document.createElement('div');
    place.textContent = placeText(gameUi.raceUi?.race.player.finished?.place ?? 0) + ' place';
    place.style.setProperty('font-size', '30px');
    dialog.appendChild(place);

    const time = document.createElement('div');
    time.textContent = timeToString(gameUi.raceUi?.race.player.finished?.time ?? 0);
    time.style.setProperty('font-size', '30px');
    dialog.appendChild(time);

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