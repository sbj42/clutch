export function makeLink(text: string, callback: () => void) {
    const ret = document.createElement('a');
    ret.textContent = text;
    ret.addEventListener('click', callback);
    return ret;
}

export function makeTextField(value: string, placeholder: string, onChange: (value: string) => void) {
    const ret = document.createElement('input');
    ret.setAttribute('type', 'text');
    ret.setAttribute('placeholder', placeholder);
    ret.setAttribute('value', value);
    ret.setAttribute('size', '10');
    ret.setAttribute('spellcheck', 'false');
    ret.addEventListener('change', () => {
        onChange(ret.value);
    });
    return ret;
}

export type SelectOption<K extends string> = { label: string; key: K; };

export class Select<K extends string> {
    private _element = document.createElement('select');
    private _options: SelectOption<K>[] = [];
    private _selected: K | undefined;

    constructor(selected: K | undefined, onChange: (key: K) => void) {
        this._selected = selected;
        this._element.addEventListener('change', () => {
            this._selected = this._options[this._element.selectedIndex].key;
            onChange(this._selected);
        });
    }

    get element() {
        return this._element;
    }

    setOptions(options: SelectOption<K>[], size?: number) {
        this._element.innerHTML = '';
        if (size !== undefined) {
            this._element.size = size;
        }
        this._options = options;
        for (const option of options) {
            const elem = document.createElement('option');
            elem.textContent = option.label;
            elem.value = option.key;
            if (option.key === this._selected) {
                elem.selected = true;
            }
            this._element.appendChild(elem);
        }
    }
}

export function makeLayer(id: string) {
    const ret = document.createElement('div');
    ret.id = id;
    ret.classList.add('layer');
    return ret;
}

export function makeButton(text: string, className: 'green' | 'yellow' | 'red', callback: () => void) {
    const button = document.createElement('button');
    button.classList.add('button');
    button.classList.add(className);
    button.textContent = text;
    button.addEventListener('mouseenter', () => {
        if (!button.hasAttribute('disabled')) {
            button.style.setProperty('filter', 'brightness(1.2)');
        }
    });
    button.addEventListener('mouseleave', () => {
        button.style.setProperty('filter', 'brightness(1)');
    });
    button.addEventListener('click', () => {
        callback();
    });
    return button;
}
