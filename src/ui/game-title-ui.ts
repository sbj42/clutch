import { delay } from "../util/delay";
import { GameUi, GREEN_BUTTON_COLOR, makeButton } from "./game-ui";

const TITLE_DURATION = 1000;

export async function titleUi(gameUi: GameUi, elem: HTMLElement) {
    
    elem.innerHTML = '';
    elem.style.setProperty('inset', '0');
    elem.style.setProperty('display', 'flex');
    elem.style.setProperty('flex-direction', 'column');
    elem.style.setProperty('justify-content', 'center');
    elem.style.setProperty('align-items', 'center');

    const title = document.createElement('div');
    title.textContent = 'CLUTCH';
    title.style.setProperty('font-size', '100px');
    title.style.setProperty('font-style', 'italic');
    title.style.setProperty('text-shadow', '0 0 10px rgba(255, 255, 0, 0.75)');
    elem.appendChild(title);
    await title.animate([
        { letterSpacing: '6em', paddingRight: '6000px' },
        { letterSpacing: '0', paddingRight: '0' },
    ], TITLE_DURATION).finished;

    await delay(0.25);

    const optionsDiv = document.createElement('div');
    optionsDiv.style.setProperty('position', 'relative');
    optionsDiv.style.setProperty('height', '0');
    const playButton = makeButton(GREEN_BUTTON_COLOR, 'PLAY', () => {
        gameUi.doSetup();
    });
    playButton.style.setProperty('margin-top', '20px');
    optionsDiv.appendChild(playButton);
    elem.appendChild(optionsDiv);
    playButton.focus();
}