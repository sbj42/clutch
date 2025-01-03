import type { Difficulty } from "../race/race";

export type HighScores = Record<string, TrackScores>;

export type TrackScores = Record<Difficulty, DifficultyScores>;

export type DifficultyScores = Score[];

export type Score = {
    time: number;
};

export function loadHighScores(): HighScores {
    const json = localStorage.getItem('high-scores');
    return json ? JSON.parse(json) : {};
}

export function saveHighScores(highScores: HighScores) {
    localStorage.setItem('high-scores', JSON.stringify(highScores));
}
