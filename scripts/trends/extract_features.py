import argparse
import json
import sys
from pathlib import Path

import librosa
import numpy as np

PITCH_CLASS_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']


def analyse_audio(audio_path: Path) -> dict:
    if not audio_path.exists():
        raise FileNotFoundError(f'Audio file not found: {audio_path}')

    y, sr = librosa.load(audio_path.as_posix(), sr=None)

    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    rms = librosa.feature.rms(y=y)
    rms_mean = float(np.mean(rms)) if rms.size else None
    loudness_db = float(np.mean(librosa.amplitude_to_db(rms, ref=1.0))) if rms.size else None

    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    spectral_flux = float(np.mean(onset_env)) if onset_env.size else None

    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    pitch_index = int(np.argmax(np.mean(chroma, axis=1))) if chroma.size else None
    musical_key = PITCH_CLASS_NAMES[pitch_index] if pitch_index is not None else None

    return {
        'bpm': round(float(tempo), 2) if tempo else None,
        'energy': rms_mean,
        'loudness': loudness_db,
        'spectralFlux': spectral_flux,
        'musicalKey': musical_key,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description='Extract audio descriptors using librosa')
    parser.add_argument('--input', required=True, help='Path to the audio file to analyse')
    args = parser.parse_args()

    audio_path = Path(args.input)

    try:
        payload = analyse_audio(audio_path)
        print(json.dumps(payload))
    except Exception as exc:  # noqa: BLE001
        print(json.dumps({'error': str(exc)}))
        sys.exit(1)


if __name__ == '__main__':
    main()
