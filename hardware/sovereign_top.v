/*
 * SOVEREIGN TOP — FPGA Top-Level Integration Module (iCE40-HX8K)
 * Bridges SPI input, UART output, and the core ledger validator.
 * This is the synthesis target for `make synth`.
 * ⚠️ ULTRATHINK MANDATE: Edit exclusively via Anthropic Opus 4.7 (Thinking Mode).
 */

module sovereign_top (
    input wire clk,
    input wire rst_n,

    // SPI Slave Interface (host → FPGA)
    input wire spi_sclk,
    input wire spi_mosi,
    input wire spi_cs_n,
    output wire spi_miso,

    // UART TX (FPGA → host telemetry)
    output wire uart_tx,

    // Direct control signals
    input wire commit_trigger,
    input wire [1:0] sector_id,
    input wire chemstrain_mode,
    input wire force_verify,

    // Audio I/O (directly to external ADC/DAC)
    input wire signed [15:0] audio_in,
    output wire signed [15:0] audio_out,

    // Direct output signals (directly readable / LED-mappable)
    output wire [2:0] state_out,
    output wire ledger_commit,
    output wire verification_gate
);

    // --- Internal wires from SPI bridge ---
    wire [31:0] spi_exergy;
    wire [31:0] spi_entropy;
    wire [31:0] spi_threshold;
    wire [31:0] spi_geo_exergy;
    wire        spi_frame_valid;

    // --- Internal wires from validator ---
    wire [31:0] accumulated_exergy;
    wire [31:0] resilience_score;
    wire [31:0] entropy_ma;
    wire [2:0]  state_out_internal;
    wire        ledger_commit_internal;
    wire        verification_gate_internal;

    // --- Latched inputs (hold SPI values until next frame) ---
    reg [31:0] latched_exergy;
    reg [31:0] latched_entropy;
    reg [31:0] latched_threshold;
    reg [31:0] latched_geo_exergy;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            latched_exergy     <= 32'd0;
            latched_entropy    <= 32'd0;
            latched_threshold  <= 32'd1500;
            latched_geo_exergy <= 32'd0;
        end else if (spi_frame_valid) begin
            latched_exergy     <= spi_exergy;
            latched_entropy    <= spi_entropy;
            latched_threshold  <= spi_threshold;
            latched_geo_exergy <= spi_geo_exergy;
        end
    end

    // --- SPI Bridge ---
    spi_bridge spi_inst (
        .clk(clk),
        .rst_n(rst_n),
        .spi_sclk(spi_sclk),
        .spi_mosi(spi_mosi),
        .spi_cs_n(spi_cs_n),
        .spi_miso(spi_miso),
        .exergy_out(spi_exergy),
        .entropy_out(spi_entropy),
        .threshold_out(spi_threshold),
        .geo_exergy_out(spi_geo_exergy),
        .frame_valid(spi_frame_valid),
        .accumulated_exergy(accumulated_exergy),
        .resilience_score(resilience_score),
        .state_out(state_out_internal),
        .verification_gate(verification_gate_internal),
        .ledger_commit(ledger_commit_internal)
    );

    // --- Core Validator ---
    sovereign_ledger_validator validator_inst (
        .clk(clk),
        .rst_n(rst_n),
        .exergy_in(latched_exergy),
        .entropy_in(latched_entropy),
        .geo_exergy_in(latched_geo_exergy),
        .threshold(latched_threshold),
        .commit_trigger(commit_trigger),
        .sector_id(sector_id),
        .chemstrain_mode(chemstrain_mode),
        .audio_in(audio_in),
        .force_verify(force_verify),
        .audio_out(audio_out),
        .state_out(state_out_internal),
        .ledger_commit(ledger_commit_internal),
        .accumulated_exergy(accumulated_exergy),
        .resilience_score(resilience_score),
        .entropy_ma_out(entropy_ma),
        .verification_gate(verification_gate_internal)
    );

    // --- UART State Serializer ---
    // Sends a 16-byte frame on every state transition:
    // [SYNC:0x5F] [state:8] [exergy:32] [entropy:32] [resilience:32] [flags:8] [CRC8:8]
    // Total: 14 bytes

    reg [2:0] prev_state;
    reg       uart_send_trigger;
    reg [7:0] uart_byte;
    reg       uart_start;
    wire      uart_busy;

    // Byte counter for serialization
    reg [4:0] tx_byte_idx;
    reg [127:0] tx_frame; // 16 bytes = 128 bits
    reg tx_active;

    // CRC-8 (x^8 + x^2 + x + 1) — Polynomial 0x07
    function [7:0] crc8;
        input [7:0] crc_in;
        input [7:0] data;
        reg [7:0] crc;
        integer i;
        begin
            crc = crc_in ^ data;
            for (i = 0; i < 8; i = i + 1) begin
                if (crc[7])
                    crc = (crc << 1) ^ 8'h07;
                else
                    crc = crc << 1;
            end
            crc8 = crc;
        end
    endfunction

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            prev_state   <= 3'b000;
            tx_active    <= 1'b0;
            tx_byte_idx  <= 4'd0;
            tx_frame     <= 112'd0;
            uart_start   <= 1'b0;
            uart_byte    <= 8'd0;
        end else begin
            uart_start <= 1'b0; // Default: no start pulse

            // Detect state transition → trigger frame send
            if (state_out_internal != prev_state && !tx_active) begin
                prev_state <= state_out_internal;
                // Build frame (16 bytes): 
                // [0] SYNC(5F) | [1] STATE | [2-5] EXERGY | [6-9] ENTROPY_MA | [10-13] RESILIENCE | [14] FLAGS | [15] CRC
                tx_frame <= {
                    8'h5F,                                        // Byte 0: SYNC
                    5'd0, state_out_internal,                     // Byte 1: State
                    accumulated_exergy,                           // Bytes 2-5: Exergy
                    entropy_ma,                                   // Bytes 6-9: Entropy (Smoothed)
                    resilience_score,                             // Bytes 10-13: Resilience
                    6'd0, verification_gate_internal, ledger_commit_internal, // Byte 14: Flags
                    8'h00                                         // Byte 15: CRC (Placeholder)
                };
                tx_active   <= 1'b1;
                tx_byte_idx <= 5'd0;
            end

            // Serialize bytes over UART
            if (tx_active && !uart_busy) begin
                if (tx_byte_idx < 5'd16) begin
                    // Send byte from frame (MSB first in frame)
                    uart_byte <= tx_frame[127:120];
                    tx_frame  <= {tx_frame[119:0], 8'd0}; // Shift left
                    uart_start <= 1'b1;
                    tx_byte_idx <= tx_byte_idx + 1;
                end else begin
                    tx_active <= 1'b0; // Frame complete
                end
            end
        end
    end

    // --- UART TX Instance ---
    uart_tx #(.CLK_DIV(104)) uart_inst (
        .clk(clk),
        .rst_n(rst_n),
        .data_in(uart_byte),
        .tx_start(uart_start),
        .tx_out(uart_tx),
        .tx_busy(uart_busy)
    );

    // --- Output assignments ---
    assign state_out          = state_out_internal;
    assign ledger_commit      = ledger_commit_internal;
    assign verification_gate  = verification_gate_internal;

endmodule
