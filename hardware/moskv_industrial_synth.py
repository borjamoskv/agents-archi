import numpy as np
from scipy.io import wavfile
import os

# --- Configurations (Ω-2026) ---
SR = 44100  # Sample Rate
BPM = 132
DURATION = 8.0  # seconds (approx 4 bars)
AMP = 0.5

def generate_industrial_loop():
    t = np.linspace(0, DURATION, int(SR * DURATION), endpoint=False)
    output = np.zeros_like(t)
    
    # 1. Temporal Drive (Kick)
    # 132 BPM = 2.2 beats per second = ~0.45s per beat
    beat_duration = 60.0 / BPM
    for i in range(int(DURATION / beat_duration)):
        start = int(i * beat_duration * SR)
        end = start + int(0.2 * SR) # 200ms kick
        if end > len(t): break
        
        # Kick synthesis: Sine sweep from 90Hz to 30Hz
        kt = np.linspace(0, 0.2, int(0.2 * SR))
        freq = np.geomspace(90, 30, len(kt))
        kick = np.sin(2 * np.pi * freq * kt) * np.exp(-15 * kt) # Fast decay
        output[start:end] += kick * 0.8

    # 2. Industrial Texture (Entropy Noise)
    noise = (np.random.rand(len(t)) * 2 - 1) * 0.1
    # Rhythmic gate for noise
    gate = (np.sin(2 * np.pi * (BPM/120) * t) > 0.8).astype(float)
    output += noise * gate

    # 3. Bitcrusher (Ω1 Foundry Simulation)
    # Quantize to 4-bit for that Industrial Noir grit
    bits = 4
    levels = 2**bits
    output = np.round(output * (levels/2)) / (levels/2)

    # Normalize
    output = output / np.max(np.abs(output)) * 0.7
    
    return output

# --- EXECUTE SYNTHESIS ---
audio_data = generate_industrial_loop()
# Convert to 16-bit PCM
audio_int16 = (audio_data * 32767).astype(np.int16)

filename = "/Users/borjafernandezangulo/.gemini/antigravity/brain/a749a74d-ac5b-47a5-9aa9-49456255fac4/CORTEX_BREACH_LOOP.wav"
wavfile.write(filename, SR, audio_int16)

print(f"C5-REAL: Synthesis complete. File saved to: {filename}")
