import { makeButton } from "../ui/ui";
import { GameUi } from "./game-ui";

export async function pauseUi(gameUi: GameUi, elem: HTMLElement) {

    elem.innerHTML = '';
    elem.classList.add('column-layout');
    elem.classList.add('fill');
    elem.classList.add('center');

    const dialog = document.createElement('div');
    dialog.classList.add('dialog');
    elem.appendChild(dialog);

    const resumeButton = makeButton('RESUME', 'green', () => {
        gameUi.doPause(false);
    });
    dialog.appendChild(resumeButton);
    resumeButton.focus();

    const restartButton = makeButton('RESTART', 'yellow', () => {
        gameUi.doPause(false);
        if (gameUi.raceUi) {
            const lastRace = gameUi.raceUi.race;
            gameUi.doRace(lastRace.track, lastRace.difficulty);
        }
    });
    dialog.appendChild(restartButton);

    const quitButton = makeButton('QUIT', 'red', () => {
        gameUi.doTitle();
    });
    dialog.appendChild(quitButton);
}