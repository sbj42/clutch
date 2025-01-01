import { GameUi, GREEN_BUTTON_COLOR, makeButton, RED_BUTTON_COLOR, YELLOW_BUTTON_COLOR } from "./game-ui";

export async function pauseUi(gameUi: GameUi, elem: HTMLElement) {

    elem.innerHTML = '';
    elem.style.setProperty('inset', '0');
    elem.style.setProperty('display', 'flex');
    elem.style.setProperty('flex-direction', 'column');
    elem.style.setProperty('justify-content', 'center');
    elem.style.setProperty('align-items', 'center');

    const dialog = document.createElement('div');
    dialog.style.setProperty('display', 'flex');
    dialog.style.setProperty('flex-direction', 'row');
    dialog.style.setProperty('gap', '20px');
    dialog.style.setProperty('background-color', 'rgb(0, 0, 0)');
    dialog.style.setProperty('border', '2px solid rgb(49, 49, 49)');
    dialog.style.setProperty('padding', '20px');
    dialog.style.setProperty('box-shadow', '6px 6px 4px rgba(0, 0, 0, 0.5)');
    elem.appendChild(dialog);

    const resumeButton = makeButton(GREEN_BUTTON_COLOR, 'RESUME', () => {
        gameUi.doPause(false);
    });
    dialog.appendChild(resumeButton);
    resumeButton.focus();

    const restartButton = makeButton(YELLOW_BUTTON_COLOR, 'RESTART', () => {
        gameUi.doPause(false);
        if (gameUi.raceUi) {
            const lastRace = gameUi.raceUi.race;
            gameUi.doRace(lastRace.track, lastRace.difficulty);
        }
    });
    dialog.appendChild(restartButton);

    const quitButton = makeButton(RED_BUTTON_COLOR, 'QUIT', () => {
        gameUi.doTitle();
    });
    dialog.appendChild(quitButton);
}