/*
 * TESTBENCH: Sovereign Ideal Commitment (Ω-IDEAL)
 * Verification of successful state transition under High Exergy.
 */
`timescale 1ns/1ps

module tb_sovereign_validator_ideal;

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

    // Instantiate Validator
    sovereign_ledger_validator uut (
        .clk(clk),
        .rst_n(rst_n),
        .exergy_in(exergy_in),
        .entropy_in(entropy_in),
        .geo_exergy_in(32'd500), // Strong geo signal
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
        $display("[TB] --- STARTING IDEAL SCENARIO (C5-REAL VALIDATION) ---");
        clk = 0;
        rst_n = 0;
        exergy_in = 0;
        entropy_in = 0;
        threshold = 32'd1500;
        commit_trigger = 0;
        sector_id = 2'b00;
        chemstrain_mode = 0; // Standard Mode
        audio_in = 0;

        #20 rst_n = 1;
        #10 commit_trigger = 1;

        // Phase 1: High Exergy, Sufficient Entropy for the Purge Gate (threshold >> 5 = 46)
        exergy_in = 32'd5000;
        entropy_in = 32'd50; 
        #20;
        entropy_in = 32'd5; // Reduce entropy to maintain stability in CRYSTALLIZING
        
        $display("[TB] Waiting for CRYSTALLIZING...");
        wait(state_out == 3'b010); // CRYSTALLIZING
        $display("[TB] CRYSTALLIZING reached. Score: %d", resilience_score);
        
        #100;
        // Inject high entropy to trigger TARP (THINKING)
        $display("[TB] Injecting High Entropy to invoke TARP...");
        entropy_in = 32'd250; // > (1500 >> 3) which is 187
        
        $display("[TB] Waiting for THINKING...");
        wait(state_out == 3'b101); // THINKING
        $display("[TB] THINKING reached. Score: %d", resilience_score);

        // Lower entropy to 0 to prevent breach, and inject maximum audio_in to build sonic exergy
        #20;
        entropy_in = 32'd0; 
        audio_in = 16'h7FFF; // Max positive amplitude for sonic foundry

        // Maintain stability for 250 cycles
        $display("[TB] Finalizing stability cycles...");
        wait(state_out == 3'b011); // COMMITTED

        commit_trigger = 0; // Prevent infinite loop after commit

        $display("[TB] --- COMMITMENT SUCCESS ---");
        $display("[TB] State: %b | Resilience: %d | Exergy: %d", state_out, resilience_score, accumulated_exergy);
        if (verification_gate) 
            $display("💎 [SOVEREIGN COMMITMENT] IDEAL HASH SECURED.");
        
        #100;
        $finish;
    end

endmodule
