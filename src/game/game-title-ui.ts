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

    const optionsDiv = document.createElement('div');
    optionsDiv.style.setProperty('visibility', 'hidden');
    optionsDiv.style.setProperty('margin-bottom', '20px');
    optionsDiv.classList.add('container');
    optionsDiv.classList.add('row-layout');
    optionsDiv.classList.add('padded');
    const playButton = makeButton('PLAY', 'green', () => {
        gameUi.doSetup();
    });
    optionsDiv.appendChild(playButton);
    elem.appendChild(optionsDiv);
    
    await title.animate([
        { letterSpacing: '6em', paddingRight: '6000px' },
        { letterSpacing: '0', paddingRight: '0' },
    ], TITLE_DURATION).finished;

    await delay(0.25);

    optionsDiv.style.setProperty('visibility', 'visible');
    playButton.focus();
}