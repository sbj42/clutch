import { makeButton } from "../ui/ui";
import { EditorUi } from "./editor-ui";

export async function unsavedUi(editorUi: EditorUi, elem: HTMLElement, onKeep: () => void, onDiscard: () => void) {

    elem.innerHTML = '';
    elem.classList.add('column-layout');
    elem.classList.add('fill');
    elem.classList.add('center');

    const dialog = document.createElement('div');
    elem.classList.add('dialog');
    elem.appendChild(dialog);

    const instruction = document.createElement('div');
    instruction.textContent = 'UNSAVED CHANGES';
    dialog.appendChild(instruction);

    const buttons = document.createElement('div');
    buttons.classList.add('row-layout');
    buttons.classList.add('padded');
    dialog.appendChild(buttons);

    const keepButton = makeButton('KEEP', 'green', () => {
        onKeep();
    });
    buttons.appendChild(keepButton);
    keepButton.focus();

    const discardButton = makeButton('DISCARD', 'red', () => {
        onDiscard();
    });
    buttons.appendChild(discardButton);
}