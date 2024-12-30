import { GameUi, GREEN_BUTTON_COLOR, makeButton, RED_BUTTON_COLOR, YELLOW_BUTTON_COLOR } from "./game-ui";

export async function pauseUi(gameUi: GameUi, elem: HTMLElement) {

    elem.style.setProperty('inset', '0');
    elem.style.setProperty('display', 'flex');
    elem.style.setProperty('flex-direction', 'column');
    elem.style.setProperty('justify-content', 'center');
    elem.style.setProperty('align-items', 'center');

    const menu = document.createElement('div');
    menu.style.setProperty('display', 'flex');
    menu.style.setProperty('flex-direction', 'row');
    menu.style.setProperty('gap', '20px');
    menu.style.setProperty('background-color', 'rgb(0, 0, 0)');
    menu.style.setProperty('border', '2px solid rgb(49, 49, 49)');
    menu.style.setProperty('padding', '20px');
    menu.style.setProperty('box-shadow', '6px 6px 4px rgba(0, 0, 0, 0.5)');
    elem.appendChild(menu);

    const resumeButton = makeButton(GREEN_BUTTON_COLOR, 'RESUME', () => {
        gameUi.doPause(false);
    });
    menu.appendChild(resumeButton);
    resumeButton.focus();

    const restartButton = makeButton(YELLOW_BUTTON_COLOR, 'RESTART', () => {
        gameUi.doPause(false);
        if (gameUi.raceUi) {
            gameUi.doRace(gameUi.raceUi.race.track);
        }
    });
    menu.appendChild(restartButton);

    const quitButton = makeButton(RED_BUTTON_COLOR, 'QUIT', () => {
        gameUi.doTitle();
    });
    menu.appendChild(quitButton);
}