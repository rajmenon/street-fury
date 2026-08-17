"""Synthesize Street Fury combat and UI sound effects as 16-bit mono WAVs."""

from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path

SR = 44100
OUT = Path(__file__).resolve().parents[1] / "public" / "assets" / "sfx"


def clamp(value: float, lo: float = -1.0, hi: float = 1.0) -> float:
    return lo if value < lo else hi if value > hi else value


def write_wav(name: str, samples: list[float]) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    with wave.open(str(path), "w") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SR)
        wav.writeframes(b"".join(struct.pack("<h", int(clamp(s) * 32767)) for s in samples))
    print(f"wrote {path} ({len(samples) / SR:.3f}s)")


def env_ad(t: float, attack: float, decay: float) -> float:
    if t < 0:
        return 0.0
    if t < attack:
        return t / attack if attack > 0 else 1.0
    if t < attack + decay:
        return 1.0 - (t - attack) / decay
    return 0.0


def env_exp(t: float, decay: float) -> float:
    return math.exp(-t / decay) if t >= 0 and decay > 0 else 0.0


def noise() -> float:
    return random.uniform(-1.0, 1.0)


def sine(t: float, freq: float, phase: float = 0.0) -> float:
    return math.sin(2 * math.pi * freq * t + phase)


def render(seconds: float, fn) -> list[float]:
    n = int(SR * seconds)
    return [clamp(fn(i / SR)) for i in range(n)]


def kick() -> list[float]:
    """Whoosh plus a snapping instep impact."""

    def sample(t: float) -> float:
        whoosh = 0.0
        if 0.0 <= t < 0.16:
            sweep = 1400 - 900 * (t / 0.16)
            whoosh = noise() * env_ad(t, 0.012, 0.14) * 0.28
            whoosh += sine(t, sweep) * env_ad(t, 0.01, 0.12) * 0.12
        impact_t = t - 0.09
        thud = sine(impact_t, 92) * env_exp(impact_t, 0.07) * 0.72
        slap = noise() * env_ad(impact_t, 0.002, 0.035) * 0.38
        mid = sine(impact_t, 210) * env_exp(impact_t, 0.04) * 0.28
        return whoosh + thud + slap + mid

    return render(0.32, sample)


def hit() -> list[float]:
    """Meaty body shot — the sound of getting tagged."""

    def sample(t: float) -> float:
        body = sine(t, 68) * env_exp(t, 0.11) * 0.85
        body += sine(t, 118) * env_exp(t, 0.07) * 0.4
        crack = noise() * env_ad(t, 0.001, 0.028) * 0.55
        bone = sine(t, 340 + 80 * math.sin(40 * t)) * env_exp(t, 0.03) * 0.22
        tail = sine(t, 52) * env_exp(t, 0.16) * 0.2
        return body + crack + bone + tail

    return render(0.28, sample)


def punch() -> list[float]:
    """Sharper glove/fist impact."""

    def sample(t: float) -> float:
        snap = sine(t, 160) * env_exp(t, 0.045) * 0.55
        low = sine(t, 78) * env_exp(t, 0.07) * 0.4
        leather = noise() * env_ad(t, 0.001, 0.022) * 0.42
        return snap + low + leather

    return render(0.2, sample)


def block() -> list[float]:
    def sample(t: float) -> float:
        clack = sine(t, 520) * env_exp(t, 0.025) * 0.35
        wood = sine(t, 190) * env_exp(t, 0.05) * 0.3
        click = noise() * env_ad(t, 0.001, 0.018) * 0.28
        return clack + wood + click

    return render(0.14, sample)


def jump() -> list[float]:
    def sample(t: float) -> float:
        return noise() * env_ad(t, 0.008, 0.09) * 0.18 + sine(t, 420 - 180 * t) * env_ad(t, 0.01, 0.1) * 0.12

    return render(0.16, sample)


def ko() -> list[float]:
    def sample(t: float) -> float:
        boom = sine(t, 48) * env_exp(t, 0.28) * 0.9
        boom += sine(t, 76) * env_exp(t, 0.18) * 0.35
        gong = sine(t, 220) * env_exp(t, 0.35) * 0.22
        crash = noise() * env_ad(t, 0.004, 0.12) * 0.3
        return boom + gong + crash

    return render(0.7, sample)


def select() -> list[float]:
    def sample(t: float) -> float:
        return sine(t, 660) * env_ad(t, 0.004, 0.07) * 0.28 + sine(t, 990) * env_ad(t, 0.004, 0.05) * 0.12

    return render(0.1, sample)


def go() -> list[float]:
    def sample(t: float) -> float:
        sting = sine(t, 196) * env_exp(t, 0.12) * 0.4
        sting += sine(t, 392) * env_exp(t, 0.1) * 0.22
        hit_layer = noise() * env_ad(t, 0.002, 0.04) * 0.2
        return sting + hit_layer

    return render(0.28, sample)


def land() -> list[float]:
    def sample(t: float) -> float:
        return sine(t, 90) * env_exp(t, 0.05) * 0.35 + noise() * env_ad(t, 0.001, 0.03) * 0.2

    return render(0.12, sample)


def main() -> None:
    random.seed(7)
    write_wav("kick.wav", kick())
    write_wav("hit.wav", hit())
    write_wav("punch.wav", punch())
    write_wav("block.wav", block())
    write_wav("jump.wav", jump())
    write_wav("ko.wav", ko())
    write_wav("select.wav", select())
    write_wav("go.wav", go())
    write_wav("land.wav", land())


if __name__ == "__main__":
    main()
