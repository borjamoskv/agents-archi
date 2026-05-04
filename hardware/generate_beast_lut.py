import numpy as np

def generate_tanh_lut(size=4096, drive=2.5):
    """
    Generates a 16-bit Tanh Look-Up Table for Verilog.
    Mapping: Input 16-bit signed -> Output 16-bit signed.
    LUT index is the top bits of the input signal.
    """
    # 16-bit signed range: -32768 to 32767
    x_int = np.linspace(-32768, 32767, size)
    
    # Normalize input for tanh
    x_norm = x_int / 32768.0
    
    # Calculate tanh
    y_norm = np.tanh(x_norm * drive) / np.tanh(drive)
    
    # Map back to 16-bit signed
    y_int = (y_norm * 32767).astype(np.int16)
    
    # Convert to hex for Verilog $readmemh (using uint16 cast for signed-to-unsigned conversion)
    hex_values = [format(np.uint16(val), '04x') for val in y_int]
    
    return hex_values

LUT_SIZE = 4096
DRIVE = 2.5

print(f"[*] Generating BEAST MODE Tanh LUT (Size: {LUT_SIZE}, Drive: {DRIVE})...")
lut = generate_tanh_lut(size=LUT_SIZE, drive=DRIVE)

output_path = "/Users/borjafernandezangulo/10_PROJECTS/agents-archi/hardware/beast_tanh_lut.mem"
with open(output_path, "w") as f:
    for val in lut:
        f.write(f"{val}\n")

print(f"[C5-REAL] LUT generated: {output_path}")
