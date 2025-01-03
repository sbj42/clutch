import { makeButton } from "../ui/ui";
import { delay } from "../util/delay";
import { GameUi } from "./game-ui";

const TITLE_DURATION = 1000;

export async function titleUi(gameUi: GameUi, elem: HTMLElement) {
    
    elem.innerHTML = '';
    elem.classList.add('fill');
    elem.classList.add('column-layout');
    elem.classList.add('center');
    elem.style.setProperty('overflow', 'hidden');

    const title = document.createElement('div');
    title.textContent = 'CLUTCH';
    title.classList.add('glow');
    title.style.setProperty('font-size', '100px');
    elem.appendChild(title);

    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.setProperty('visibility', 'hidden');
    buttonsDiv.style.setProperty('margin-bottom', '20px');
    buttonsDiv.classList.add('container');
    buttonsDiv.classList.add('row-layout');
    buttonsDiv.classList.add('padded');
    const playButton = makeButton('PLAY', 'green', () => {
        gameUi.doSetup();
    });
    buttonsDiv.appendChild(playButton);
    const optionsButton = makeButton('OPTIONS', 'yellow', () => {
        gameUi.doOptions();
    });
    buttonsDiv.appendChild(optionsButton);
    elem.appendChild(buttonsDiv);
    
    await title.animate([
        { letterSpacing: '6em', paddingRight: '6000px' },
        { letterSpacing: '0', paddingRight: '0' },
    ], TITLE_DURATION).finished;

    await delay(0.25);

    buttonsDiv.style.setProperty('visibility', 'visible');
    playButton.focus();
}