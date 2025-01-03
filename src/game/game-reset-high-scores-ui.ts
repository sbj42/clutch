import { makeButton } from "../ui/ui";
import { GameUi } from "./game-ui";

export async function resetHighScoresUi(gameUi: GameUi, elem: HTMLElement, onCancel: () => void, onConfirm: () => void) {

    elem.innerHTML = '';
    elem.classList.add('column-layout');
    elem.classList.add('fill');
    elem.classList.add('center');

    const dialog = document.createElement('div');
    dialog.classList.add('dialog');
    elem.appendChild(dialog);

    const instruction = document.createElement('div');
    instruction.textContent = 'RESET HIGH SCORES: ARE YOU SURE?';
    dialog.appendChild(instruction);

    const buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('row-layout');
    buttonsDiv.classList.add('center');
    buttonsDiv.classList.add('padded');
    dialog.appendChild(buttonsDiv);

    const cancelButton = makeButton('CANCEL', 'green', () => {
        onCancel();
    });
    buttonsDiv.appendChild(cancelButton);
    cancelButton.focus();

    const confirmButton = makeButton('DO IT', 'red', () => {
        onConfirm();
    });
    buttonsDiv.appendChild(confirmButton);
}
