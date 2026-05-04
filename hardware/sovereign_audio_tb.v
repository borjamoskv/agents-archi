/*
 * SOVEREIGN AUDIO TESTBENCH — Silicon-Audio Ingestion (C5-REAL)
 * Loads .hex audio data exported from the Rust Remix Engine.
 */

`timescale 1ns/1ps

module sovereign_audio_tb;
    reg clk;
    reg rst_n;
    reg [31:0] exergy_in;
    reg [31:0] entropy_in;
    reg [31:0] geo_exergy_in;
    reg [31:0] threshold;
    reg commit_trigger;
    reg [1:0] sector_id;
    reg chemstrain_mode;
    reg signed [15:0] audio_in;
    
    wire signed [15:0] audio_out;
    wire [2:0] state_out;
    wire ledger_commit;
    wire [31:0] accumulated_exergy;
    wire [31:0] resilience_score;

    // Memory to hold the audio samples from Rust
    reg [15:0] audio_mem [0:4095];
    integer i;

    sovereign_ledger_validator uut (
        .clk(clk),
        .rst_n(rst_n),
        .exergy_in(exergy_in),
        .entropy_in(entropy_in),
        .geo_exergy_in(geo_exergy_in),
        .threshold(threshold),
        .commit_trigger(commit_trigger),
        .sector_id(sector_id),
        .chemstrain_mode(chemstrain_mode),
        .audio_in(audio_in),
        .audio_out(audio_out),
        .state_out(state_out),
        .ledger_commit(ledger_commit),
        .accumulated_exergy(accumulated_exergy),
        .resilience_score(resilience_score)
    );

    always #5 clk = ~clk;

    initial begin
        $dumpfile("audio_sim.vcd");
        $dumpvars(0, sovereign_audio_tb);
        
        // Initialize
        clk = 0;
        rst_n = 0;
        exergy_in = 32'd80;
        entropy_in = 32'd10;
        geo_exergy_in = 32'd0;
        threshold = 32'd100;
        commit_trigger = 0;
        sector_id = 2'b00;
        chemstrain_mode = 0;
        audio_in = 16'd0;

        // Load Silicon Ingest Data
        $readmemh("audio_silicon_ingest.hex", audio_mem);

        #20 rst_n = 1;
        #20 commit_trigger = 1;

        // Feed audio samples into silicon
        for (i = 0; i < 4096; i = i + 1) begin
            @(posedge clk);
            audio_in <= audio_mem[i];
        end

        #100 $finish;
    end
endmodule
