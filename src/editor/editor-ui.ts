import { type TrackInfo } from '../track/track-info';
import { makeLayer, makeLink, Select, SelectOption } from '../ui/ui';
import { setupThingsUi } from './editor-things-ui';
import { setupTrackUi } from './editor-track-ui';
import { unsavedUi } from './editor-unsaved-ui';
import { saveAs } from 'file-saver';

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
    private _changed = false;

    private _elem: HTMLElement;
    private _fileInput = document.createElement('input');
    private _mainArea: HTMLElement;
    private _modeSelect: Select<Mode>;
    private _trackLayer = makeLayer('editor-track');
    private _thingsLayer = makeLayer('editor-things');
    private _unsavedLayer = makeLayer('editor-unsaved');

    constructor(elem: HTMLElement) {
        this._elem = elem;
        this._elem.classList.add('container');
        
        this._unsavedLayer.classList.add('container');

        const topLayer = makeLayer('editor-top');
        topLayer.classList.add('column-layout');
        topLayer.classList.add('fill');
        elem.appendChild(topLayer);

        const controlsArea = document.createElement('div');
        controlsArea.classList.add('row-layout');
        controlsArea.classList.add('padded');
        topLayer.appendChild(controlsArea);
        
        this._fileInput.style.setProperty('display', 'none');
        this._fileInput.type = 'file';
        this._fileInput.accept = '.json';
        this._fileInput.addEventListener('change', () => {
            void this._onFileChange();
        });
        controlsArea.appendChild(this._fileInput);

        controlsArea.appendChild(makeLink('New', () => {
            this._onNew();
        }));
        controlsArea.appendChild(makeLink('Load', () => {
            this._onLoad();
        }));
        controlsArea.appendChild(makeLink('Save', () => {
            this._onSave();
        }));

        this._modeSelect = new Select(this._mode, (mode) => {
            this._mode = mode;
            switch (mode) {
                case 'track':
                    this.doTrack();
                    break;
                case 'things':
                    this.doThings();
                    break;
            }
        });
        controlsArea.appendChild(this._modeSelect.element);

        this._mainArea = document.createElement('div');
        this._mainArea.classList.add('container');
        this._mainArea.style.setProperty('flex', '1');
        topLayer.appendChild(this._mainArea);

        this._trackLayer.classList.add('fill');
        this._thingsLayer.classList.add('fill');

        this._trackInfo = makeNewTrack();
        this.doTrack();
        this._updateModeSelect();

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
        this._updateModeSelect();
        this._changed = true;
    }

    //#region Internal

    private _checkUnsaved(next: () => void) {
        if (this._changed) {
            this._elem.appendChild(this._unsavedLayer);
            unsavedUi(this, this._unsavedLayer, () => {
                this._elem.removeChild(this._unsavedLayer);
            }, () => {
                this._elem.removeChild(this._unsavedLayer);
                next();
            });
        } else {
            next();
        }
    }

    private _onKeydown(event: KeyboardEvent) {
    }

    private _onNew() {
        this._checkUnsaved(() => {
            this._trackInfo = makeNewTrack();
            this.update();
            setupTrackUi(this, this._trackLayer);
            this._changed = false;
        });
    }

    private _onLoad() {
        this._checkUnsaved(() => {
            this._fileInput.click();
        });
    }

    private _onSave() {
        const blob = new Blob([JSON.stringify(this._trackInfo, undefined, 2)], { type: 'application/json;charset=utf-8' });
        saveAs(blob, (this._trackInfo.name || 'track') + '.json');
        this._changed = false;
    }

    private async _onFileChange() {
        if (this._fileInput.files) {
            const file = this._fileInput.files[0];
            if (!file) {
                return;
            }
            const text = await file.text();
            const trackInfo = JSON.parse(text);
            this._trackInfo = trackInfo;
            this._updateModeSelect();
            this._changed = false;
            this.doTrack();
        }
    }

    private _updateModeSelect() {
        const modes: SelectOption<Mode>[] = [
            { label: 'Track', key: 'track' },
        ];
        if ('start' in this._trackInfo) {
            modes.push({ label: 'Things', key: 'things' });
        } else if (this._mode === 'things') {
            this.doTrack();
        }

        this._modeSelect.setOptions(modes);
    }

    //#endregion
}
