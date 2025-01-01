import { Track } from '../track/track';
import { type TrackInfo } from '../track/track-info';
import { DOGBONE } from '../track/tracks/dogbone';
import { setupThingsUi } from './editor-things-ui';
import { setupTrackUi } from './editor-track-ui';

export const BACKGROUND_COLOR = 'rgb(29, 29, 29)';

export type EditorTrackInfo = Omit<TrackInfo, 'startOffset' | 'start'> & Partial<TrackInfo>;

export type Mode = 'track' | 'things';

function makeNewTrack(): EditorTrackInfo {
    return {
        name: '',
        material: 'road',
        tiles: {},
    };
}

export class EditorUi {
    private _mode: Mode = 'track';

    private _trackInfo: EditorTrackInfo;

    private _saveLink: HTMLElement;
    private _mainArea: HTMLElement;
    private _trackLayer = this._makeLayer('editor-track');
    private _thingsLayer = this._makeLayer('editor-things');

    constructor(elem: HTMLElement) {
        elem.style.setProperty('background-color', BACKGROUND_COLOR);
        elem.style.setProperty('color', 'white');
        elem.style.setProperty('font-family', 'sans-serif');
        elem.style.setProperty('display', 'flex');
        elem.style.setProperty('flex-direction', 'column');

        const controlsArea = document.createElement('div');
        controlsArea.style.setProperty('display', 'flex');
        controlsArea.style.setProperty('flex-direction', 'row');
        controlsArea.style.setProperty('gap', '20px');
        controlsArea.style.setProperty('margin', '20px');
        elem.appendChild(controlsArea);
        
        const fileInput = document.createElement('input');
        fileInput.style.setProperty('display', 'none');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.addEventListener('change', async () => {
            if (fileInput.files) {
                const file = fileInput.files[0];
                const text = await file.text();
                const trackInfo = JSON.parse(text);
                this._trackInfo = trackInfo;
                this.update();
                setupTrackUi(this, this._trackLayer);
            }
        });
        controlsArea.appendChild(fileInput);

        const newLink = document.createElement('a');
        newLink.textContent = 'New';
        newLink.style.setProperty('background-color', 'inherit');
        newLink.style.setProperty('color', 'inherit');
        newLink.style.setProperty('font', 'inherit');
        newLink.style.setProperty('text-decoration', 'none');
        controlsArea.appendChild(newLink);
        newLink.addEventListener('click', () => {
            this._trackInfo = makeNewTrack();
            this.update();
            setupTrackUi(this, this._trackLayer);
        });

        const loadLink = document.createElement('a');
        loadLink.textContent = 'Load';
        loadLink.style.setProperty('background-color', 'inherit');
        loadLink.style.setProperty('color', 'inherit');
        loadLink.style.setProperty('font', 'inherit');
        loadLink.style.setProperty('text-decoration', 'none');
        controlsArea.appendChild(loadLink);
        loadLink.addEventListener('click', () => {
            fileInput.click();
        });

        this._saveLink = document.createElement('a');
        this._saveLink.setAttribute('href', '#');
        this._saveLink.textContent = 'Save';
        this._saveLink.style.setProperty('background-color', 'inherit');
        this._saveLink.style.setProperty('color', 'inherit');
        this._saveLink.style.setProperty('font', 'inherit');
        this._saveLink.style.setProperty('text-decoration', 'none');
        controlsArea.appendChild(this._saveLink);

        const modeSelect = document.createElement('select');
        modeSelect.style.setProperty('background', 'inherit');
        modeSelect.style.setProperty('color', 'inherit');
        modeSelect.style.setProperty('font', 'inherit');
        modeSelect.style.setProperty('scrollbar-color', `rgb(121, 58, 48) ${BACKGROUND_COLOR}`);
        modeSelect.style.setProperty('overflow', 'auto');
        controlsArea.appendChild(modeSelect);

        const modes: { label: string, value: Mode }[] = [
            { label: 'Track', value: 'track' },
            { label: 'Things', value: 'things' },
        ];
        
        for (const mode of modes) {
            const option = document.createElement('option');
            option.style.setProperty('background', BACKGROUND_COLOR);
            option.style.setProperty('color', 'white');
            option.style.setProperty('font-family', 'sans-serif');
            option.style.setProperty('font-size', '20px');
            option.style.setProperty('padding', '3px 10px');
            option.textContent = mode.label;
            if (mode.value === this._mode) {
                option.setAttribute('selected', 'selected');
            }
            modeSelect.appendChild(option);
        }
        modeSelect.addEventListener('change', () => {
            this._mode = modes[modeSelect.selectedIndex].value;
            switch (this._mode) {
                case 'track':
                    this.doTrack();
                    break;
                case 'things':
                    this.doThings();
                    break;
            }
        });

        this._mainArea = document.createElement('div');
        this._mainArea.style.setProperty('position', 'relative');
        this._mainArea.style.setProperty('flex', '1');
        elem.appendChild(this._mainArea);

        this._trackInfo = DOGBONE.getInfo();
        this.doTrack();

        document.addEventListener('keydown', (event) => this._onKeydown(event));
    }

    get trackInfo() {
        return this._trackInfo;
    }

    doTrack() {
        this._mode = 'track';
        this._mainArea.innerHTML = '';
        this._mainArea.appendChild(this._trackLayer);
        setupTrackUi(this, this._trackLayer);
    }

    doThings() {
        this._mode = 'things';
        this._mainArea.innerHTML = '';
        this._mainArea.appendChild(this._thingsLayer);
        setupThingsUi(this, this._thingsLayer);
    }

    update() {
        this._saveLink.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this._trackInfo)));        
        this._saveLink.setAttribute('download', (this._trackInfo.name || 'track') + '.json');
    }

    //#region Internal

    private _makeLayer(id: string) {
        const layer = document.createElement('div');
        layer.id = id;
        layer.style.setProperty('position', 'absolute');
        return layer;
    }

    private _onKeydown(event: KeyboardEvent) {
    }

    //#endregion
}
