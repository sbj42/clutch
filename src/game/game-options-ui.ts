import { GameUi } from "./game-ui";
import { makeButton, makeCheckbox, makeLayer } from "../ui/ui";
import { resetHighScoresUi } from "./game-reset-high-scores-ui";
import { resetHighScores } from "./high-scores";
import { loadOptions, resetOptions, saveOptions } from "./options";
import { CarAudio } from "./car-audio";

export async function optionsUi(gameUi: GameUi, elem: HTMLElement) {
    const options = loadOptions();

    elem.innerHTML = '';
    elem.classList.add('fill');
    elem.classList.add('container');

    const topLayer = makeLayer('game-options-top');
    topLayer.classList.add('column-layout');
    topLayer.classList.add('padded');
    topLayer.classList.add('fill');
    elem.appendChild(topLayer);

    const resetHighScoresLayer = makeLayer('game-options-reset');
    resetHighScoresLayer.classList.add('container');

    elem.animate([
        { opacity: 0 },
        { opacity: 1 },
    ], { duration: 400 });

    const instruction = document.createElement('div');
    instruction.textContent = 'OPTIONS';
    instruction.classList.add('glow');
    instruction.style.setProperty('text-align', 'center');
    instruction.style.setProperty('font-size', '300%');
    topLayer.appendChild(instruction);

    const optionsDiv = document.createElement('div');
    optionsDiv.classList.add('column-layout');
    optionsDiv.classList.add('center');
    optionsDiv.classList.add('padded');
    optionsDiv.style.setProperty('flex', '1');
    topLayer.appendChild(optionsDiv);

    const engineVolume = document.createElement('div');
    optionsDiv.appendChild(engineVolume);

    const engineVolumeLabel = document.createElement('label');
    engineVolumeLabel.textContent = 'ENGINE VOLUME: ';
    engineVolume.appendChild(engineVolumeLabel);

    const engineVolumeSlider = document.createElement('input');
    engineVolumeSlider.type = 'range';
    engineVolumeSlider.min = '0';
    engineVolumeSlider.max = '1';
    engineVolumeSlider.step = '0.01';
    engineVolumeSlider.value = options.engineVolume.toString();
    engineVolumeSlider.addEventListener('input', () => {
        options.engineVolume = parseFloat(engineVolumeSlider.value);
        saveOptions(options);
        CarAudio.testEngine(options.engineVolume)
    });
    engineVolume.appendChild(engineVolumeSlider);

    const skidMarks = document.createElement('div');
    optionsDiv.appendChild(skidMarks);

    const skidMarksCheckbox = makeCheckbox(options.skidMarks, () => {
        options.skidMarks = skidMarksCheckbox.checked;
        saveOptions(options);
    });
    skidMarksCheckbox.id = 'game-options-skidmarks';
    skidMarks.appendChild(skidMarksCheckbox);

    const skidMarksLabel = document.createElement('label');
    skidMarksLabel.textContent = 'DRAW SKID MARKS';
    skidMarksLabel.htmlFor = 'game-options-skidmarks';
    skidMarks.appendChild(skidMarksLabel);

    const exhaust = document.createElement('div');
    optionsDiv.appendChild(exhaust);

    const exhaustCheckbox = makeCheckbox(options.exhaust, () => {
        options.exhaust = exhaustCheckbox.checked;
        saveOptions(options);
    });
    exhaustCheckbox.id = 'game-options-exhaust';
    exhaust.appendChild(exhaustCheckbox);

    const exhaustLabel = document.createElement('label');
    exhaustLabel.textContent = 'DRAW EXHAUST';
    exhaustLabel.htmlFor = 'game-options-exhaust';
    exhaust.appendChild(exhaustLabel);

    const defaultOptionsButton = makeButton('RESET OPTIONS', 'yellow', () => {
        resetOptions();
        optionsUi(gameUi, elem);
    });
    optionsDiv.appendChild(defaultOptionsButton);

    const resetHighScoresButton = makeButton('RESET HIGH SCORES', 'red', () => {
        elem.appendChild(resetHighScoresLayer);
        resetHighScoresUi(gameUi, resetHighScoresLayer, () => {
            resetHighScoresLayer.remove();
        }, () => {
            resetHighScores();
            resetHighScoresLayer.remove();
        });
    });
    resetHighScoresButton.style.setProperty('margin-top', '20px');
    optionsDiv.appendChild(resetHighScoresButton);
    
    const backButton = makeButton('BACK', 'green', () => {
        gameUi.doTitle();
    });
    backButton.style.setProperty('margin-top', '20px');
    optionsDiv.appendChild(backButton);
}
