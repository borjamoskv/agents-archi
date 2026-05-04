/*
 * UART TX Module — Sovereign Telemetry Bridge
 * Baud: 115200 @ 12MHz clock (CLK_DIV = 104)
 * Protocol: 8N1 (8 data bits, no parity, 1 stop bit)
 * ⚠️ ULTRATHINK MANDATE: Edit exclusively via Anthropic Opus 4.7 (Thinking Mode).
 */

module uart_tx #(
    parameter CLK_DIV = 104  // 12_000_000 / 115_200 ≈ 104
)(
    input wire clk,
    input wire rst_n,
    input wire [7:0] data_in,
    input wire tx_start,
    output reg tx_out,
    output reg tx_busy
);

    localparam IDLE  = 2'b00;
    localparam START = 2'b01;
    localparam DATA  = 2'b10;
    localparam STOP  = 2'b11;

    reg [1:0] state;
    reg [15:0] baud_counter;
    reg [2:0] bit_index;
    reg [7:0] shift_reg;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            state        <= IDLE;
            tx_out       <= 1'b1;  // UART idle = HIGH
            tx_busy      <= 1'b0;
            baud_counter <= 16'd0;
            bit_index    <= 3'd0;
            shift_reg    <= 8'd0;
        end else begin
            case (state)
                IDLE: begin
                    tx_out  <= 1'b1;
                    tx_busy <= 1'b0;
                    if (tx_start) begin
                        state     <= START;
                        shift_reg <= data_in;
                        tx_busy   <= 1'b1;
                        baud_counter <= 16'd0;
                    end
                end

                START: begin
                    tx_out <= 1'b0;  // Start bit = LOW
                    if (baud_counter == CLK_DIV - 1) begin
                        baud_counter <= 16'd0;
                        state        <= DATA;
                        bit_index    <= 3'd0;
                    end else begin
                        baud_counter <= baud_counter + 1;
                    end
                end

                DATA: begin
                    tx_out <= shift_reg[bit_index];  // LSB first
                    if (baud_counter == CLK_DIV - 1) begin
                        baud_counter <= 16'd0;
                        if (bit_index == 3'd7) begin
                            state <= STOP;
                        end else begin
                            bit_index <= bit_index + 1;
                        end
                    end else begin
                        baud_counter <= baud_counter + 1;
                    end
                end

                STOP: begin
                    tx_out <= 1'b1;  // Stop bit = HIGH
                    if (baud_counter == CLK_DIV - 1) begin
                        baud_counter <= 16'd0;
                        state        <= IDLE;
                    end else begin
                        baud_counter <= baud_counter + 1;
                    end
                end

                default: state <= IDLE;
            endcase
        end
    end

endmodule
