import numpy as np
from scipy.fft import fft
from scipy.stats import gmean
import os

def calculate_spectral_exergy(samples_hex_path):
    if not os.path.exists(samples_hex_path):
        print(f"Error: {samples_hex_path} not found.")
        return []

    # Cargar audio desde el HEX de Rust
    with open(samples_hex_path, 'r') as f:
        hex_data = [int(line.strip(), 16) for line in f]
    
    # Convertir hex (unsigned 16-bit) a signed f32 [-1, 1]
    samples = np.array([(val if val < 32768 else val - 65536) / 32768.0 for val in hex_data])
    
    chunk_size = 1024
    metadata = []

    print(f"[*] Analyzing {len(samples)} samples in chunks of {chunk_size}...")

    for i in range(0, len(samples), chunk_size):
        chunk = samples[i:i+chunk_size]
        if len(chunk) < chunk_size: break
        
        # FFT Analysis
        spectrum = np.abs(fft(chunk))[:chunk_size//2]
        spectrum = np.where(spectrum == 0, 1e-10, spectrum)
        
        # Spectral Flatness Measure (SFM)
        sfm = gmean(spectrum) / np.mean(spectrum)
        
        # Mapeo a Hardware (32-bit registers)
        # Exergy based on harmonic density (1-SFM)
        exergy_in = int((1.0 - sfm) * 5000) 
        # Entropy based on noisiness (SFM)
        entropy_in = int(sfm * 2500)
        
        # Crest Factor penalty (Entropy boost)
        peak = np.max(np.abs(chunk))
        rms = np.sqrt(np.mean(chunk**2))
        crest_factor = peak / rms if rms > 0 else 0
        if crest_factor < 1.8: # Heavy clipping detected
             entropy_in += 1000
        
        # Formato Verilog HEX (32-bit: Exergy[31:16] | Entropy[15:0])
        combined = ((exergy_in & 0xFFFF) << 16) | (entropy_in & 0xFFFF)
        metadata.append(format(combined, '08x'))

    return metadata

# Main Execution
rust_hex_path = "/Users/borjafernandezangulo/10_PROJECTS/agents-archi/sonic_remix_engine/moskv_remix_engine_rs/audio_silicon_ingest.hex"
metadata_hex = calculate_spectral_exergy(rust_hex_path)

if metadata_hex:
    output_path = "/Users/borjafernandezangulo/10_PROJECTS/agents-archi/hardware/oracle_exergy.mem"
    with open(output_path, "w") as f:
        for line in metadata_hex:
            f.write(line + "\n")
    print(f"[C5-REAL] Oracle Metadata Forged: {output_path} ({len(metadata_hex)} chunks)")
else:
    print("Failure: No metadata generated.")
