/*
 * SPI BRIDGE — Sovereign Telemetry Ingestion (iCE40-HX8K)
 * Axiom Ω₀: Physical bus → digital exergy. No OS. No abstraction.
 * Protocol: SPI Mode 0 (CPOL=0, CPHA=0), MSB first.
 *
 * Frame Format (16 bytes = 128 bits, shifted in MSB-first):
 *   [0:31]   exergy_in       (32-bit)
 *   [32:63]  entropy_in      (32-bit)
 *   [64:95]  threshold       (32-bit)
 *   [96:127] geo_exergy_in   (32-bit)
 *
 * Read-back via MISO (active during next CS cycle):
 *   [0:31]   accumulated_exergy
 *   [32:63]  resilience_score
 *   [64:66]  state_out
 *   [67]     verification_gate
 *   [68]     ledger_commit
 *   [69:127] reserved (zero)
 *
 * ⚠️ ULTRATHINK MANDATE: Edit exclusively via Anthropic Opus 4.7 (Thinking Mode).
 */

module spi_bridge (
    input wire clk,
    input wire rst_n,

    // SPI Slave Interface
    input wire spi_sclk,
    input wire spi_mosi,
    input wire spi_cs_n,
    output wire spi_miso,

    // Decoded outputs → latched by sovereign_top
    output reg [31:0] exergy_out,
    output reg [31:0] entropy_out,
    output reg [31:0] threshold_out,
    output reg [31:0] geo_exergy_out,
    output reg frame_valid,

    // Read-back inputs (from validator, loaded into MISO shift register)
    input wire [31:0] accumulated_exergy,
    input wire [31:0] resilience_score,
    input wire [2:0]  state_out,
    input wire        verification_gate,
    input wire        ledger_commit
);

    // --- CDC: Synchronize SPI signals to clk domain ---
    reg [2:0] sclk_sync;
    reg [1:0] mosi_sync;
    reg [1:0] cs_sync;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            sclk_sync <= 3'b000;
            mosi_sync <= 2'b00;
            cs_sync   <= 2'b11;  // CS idle = HIGH
        end else begin
            sclk_sync <= {sclk_sync[1:0], spi_sclk};
            mosi_sync <= {mosi_sync[0], spi_mosi};
            cs_sync   <= {cs_sync[0], spi_cs_n};
        end
    end

    wire sclk_rising  = (sclk_sync[2:1] == 2'b01);
    wire sclk_falling = (sclk_sync[2:1] == 2'b10);
    wire cs_active    = ~cs_sync[1];
    wire cs_deassert  = (cs_sync == 2'b01);  // Rising edge of CS → end of frame
    wire mosi_bit     = mosi_sync[1];

    // --- Shift Registers ---
    reg [127:0] rx_shift;   // MOSI data accumulator (128 bits = 16 bytes)
    reg [127:0] tx_shift;   // MISO data source
    reg [7:0]   bit_count;  // Bits received in current CS assertion

    assign spi_miso = cs_active ? tx_shift[127] : 1'bz;

    // --- MOSI Capture (sample on rising edge of SCLK) ---
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            rx_shift  <= 128'd0;
            bit_count <= 8'd0;
        end else if (!cs_active) begin
            // CS deasserted — reset for next frame
            bit_count <= 8'd0;
        end else if (sclk_rising && cs_active) begin
            rx_shift  <= {rx_shift[126:0], mosi_bit};
            bit_count <= bit_count + 1;
        end
    end

    // --- MISO Shift (update on falling edge of SCLK) ---
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            tx_shift <= 128'd0;
        end else if (cs_deassert || !cs_active) begin
            // Preload read-back data for NEXT transaction
            tx_shift <= {
                accumulated_exergy,           // [127:96]
                resilience_score,             // [95:64]
                {24'd0, 1'b0, 1'b0,          // [63:40] reserved
                 ledger_commit,               // [39] → bit 68 in frame
                 verification_gate,           // [38] → bit 67
                 state_out,                   // [37:35] → bits 64-66
                 3'd0},                       // [34:32] pad
                32'd0                         // [31:0] reserved
            };
        end else if (sclk_falling && cs_active) begin
            tx_shift <= {tx_shift[126:0], 1'b0};
        end
    end

    // --- Frame Decode (on CS deassertion, if full 128-bit frame received) ---
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            exergy_out     <= 32'd0;
            entropy_out    <= 32'd0;
            threshold_out  <= 32'd1500;  // Safe default
            geo_exergy_out <= 32'd0;
            frame_valid    <= 1'b0;
        end else begin
            frame_valid <= 1'b0;  // Pulse

            if (cs_deassert && bit_count >= 8'd128) begin
                exergy_out     <= rx_shift[127:96];
                entropy_out    <= rx_shift[95:64];
                threshold_out  <= rx_shift[63:32];
                geo_exergy_out <= rx_shift[31:0];
                frame_valid    <= 1'b1;
            end
        end
    end

endmodule
