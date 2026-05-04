/*
 * TESTBENCH: Sovereign Sonic Verification (Ω-01-TB)
 * Integrated with Rust Neural DAW HEX artifacts.
 */
`timescale 1ns/1ps

module tb_sovereign_validator_sonic;

    reg clk;
    reg rst_n;
    reg [31:0] exergy_in;
    reg [31:0] entropy_in;
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
    wire verification_gate;

    // Buffers for HEX ingestion
    reg [15:0] audio_mem [0:65535];
    reg [31:0] oracle_mem [0:1023]; // Spectral Metadata (Exergy | Entropy)
    integer i, chunk_ptr;

    // Instantiate Validator
    sovereign_ledger_validator uut (
        .clk(clk),
        .rst_n(rst_n),
        .exergy_in(exergy_in),
        .entropy_in(entropy_in),
        .geo_exergy_in(32'd100),
        .threshold(threshold),
        .commit_trigger(commit_trigger),
        .sector_id(sector_id),
        .chemstrain_mode(chemstrain_mode),
        .audio_in(audio_in),
        .audio_out(audio_out),
        .state_out(state_out),
        .ledger_commit(ledger_commit),
        .accumulated_exergy(accumulated_exergy),
        .resilience_score(resilience_score),
        .verification_gate(verification_gate)
    );

    // Clock generation
    always #5 clk = ~clk;

    initial begin
        // Initialize
        $display("[TB] Loading Silicon Artifact: audio_silicon_ingest.hex");
        $readmemh("audio_silicon_ingest.hex", audio_mem);
        $display("[TB] Loading Oracle Metadata: oracle_exergy.mem");
        $readmemh("oracle_exergy.mem", oracle_mem);

        clk = 0;
        rst_n = 0;
        exergy_in = 0;
        entropy_in = 0;
        threshold = 32'd2000;
        commit_trigger = 0;
        sector_id = 2'b00;
        chemstrain_mode = 1; // Industrial Stress Mode Activated
        audio_in = 0;

        #20 rst_n = 1;
        #10 commit_trigger = 1;

        // Phase 1: EVALUATING
        $display("[TB] --- PHASE 1: EVALUATING ---");
        exergy_in = 32'd500;
        entropy_in = 32'd50; 
        #100;

        // Phase 2: CRYSTALLIZING
        $display("[TB] --- PHASE 2: CRYSTALLIZING ---");
        exergy_in = 32'd600;
        entropy_in = 32'd20; 
        #100;

        // Phase 3: THINKING (Invoke TARP / Ultrathink)
        $display("[TB] --- PHASE 3: THINKING (Ultrathink @ 250 cycles) ---");
        entropy_in = 32'd300; // Trigger HET (threshold >> 3 = 250)
        
        // Loop through ingested samples (Extended for stability verification)
        chunk_ptr = 0;
        for (i = 0; i < 16384; i = i + 1) begin
            audio_in = audio_mem[i];
            
            // Update Oracle metrics every 1024 samples (matching bridge chunk size)
            if (i % 1024 == 0) begin
                exergy_in  = oracle_mem[chunk_ptr][31:16];
                entropy_in = oracle_mem[chunk_ptr][15:0];
                chunk_ptr = chunk_ptr + 1;
            end
            
            #10;
            if (ledger_commit) begin
                $display("[TB] >>> LEDGER COMMIT DETECTED AT SAMPLE %d <<<", i);
                i = 16384; // Break loop
            end
        end

        $display("[TB] --- FINAL STATE CHECK ---");
        $display("[TB] State: %b | Resilience: %d | Exergy: %d", state_out, resilience_score, accumulated_exergy);
        if (verification_gate) 
            $display("💎 [SOVEREIGN COMMITMENT] BIZKAIA_BFA_FINAL HASH MATCHED.");
        else
            $display("❌ [SOVEREIGN FAILURE] COMMITMENT HASH NOT REACHED.");
        #100;
        $finish;
    end

endmodule
