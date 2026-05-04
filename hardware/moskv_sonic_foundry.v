/*
 * MOSKV SONIC FOUNDRY v1.0 — Industrial Noir DSP Substrate
 * Axiom Ω1: Signal purity through recursive crystallization.
 */

module moskv_sonic_foundry (
    input wire clk,
    input wire rst_n,
    input wire signed [15:0] audio_in,
    input wire [7:0] exergy_stress, // 0-255: Filter intensity
    input wire [1:0] mode,          // 00: Bypass, 01: LPF, 10: Bitcrusher, 11: Saturation
    output reg signed [15:0] audio_out,
    output wire [15:0] peak_level
);

    // --- IIR Low-Pass Filter (Simple 1st order) ---
    // y[n] = y[n-1] + (x[n] - y[n-1]) >> alpha
    reg signed [15:0] lpf_reg;
    wire [3:0] alpha = exergy_stress[7:4]; // Shift amount (higher = lower cutoff frequency)

    // --- Bitcrusher Logic ---
    wire [3:0] crush_bits = exergy_stress[3:0]; // Number of bits to zero out
    wire signed [15:0] crushed_audio = (audio_in >>> crush_bits) << crush_bits;

    // --- Beast Mode Tanh Saturation (LUT Based) ---
    // Mapping: Input 16-bit signed -> Index 0-4095. Index = (audio_in + 32768) >> 4
    reg [15:0] tanh_lut [0:4095];
    initial $readmemh("beast_tanh_lut.mem", tanh_lut);
    
    wire [11:0] lut_index = (audio_in + 16'h8000) >> 4;
    wire signed [15:0] saturated_audio = tanh_lut[lut_index];

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            lpf_reg   <= 16'd0;
            audio_out <= 16'd0;
        end else begin
            // Update LPF (Continuous background process)
            lpf_reg <= lpf_reg + ((audio_in - lpf_reg) >>> alpha);

            case (mode)
                2'b00: audio_out <= audio_in;
                2'b01: audio_out <= lpf_reg;
                2'b10: audio_out <= crushed_audio;
                2'b11: audio_out <= saturated_audio;
                default: audio_out <= audio_in;
            endcase
        end
    end

    // Absolute peak detector for telemetry
    assign peak_level = (audio_out[15]) ? -audio_out : audio_out;

endmodule
