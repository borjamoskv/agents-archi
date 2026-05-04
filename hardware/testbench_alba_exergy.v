/*
 * TESTBENCH: ALBA EXERGY VALIDATION
 * Targets: sovereign_ledger_validator.v
 * Scenario: High-Stakes Industrial Capital Verification
 */

`timescale 1ns/1ps

module testbench_alba_exergy;

    reg clk;
    reg rst_n;
    reg [31:0] exergy_in;
    reg [31:0] entropy_in;
    reg [31:0] geo_exergy_in;
    reg [31:0] threshold;
    reg commit_trigger;
    reg [1:0] sector_id;
    reg chemstrain_mode;

    wire [1:0] state_out;
    wire ledger_commit;
    wire [31:0] accumulated_exergy;
    wire [31:0] resilience_score;

    // Instantiate UUT
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
        .state_out(state_out),
        .ledger_commit(ledger_commit),
        .accumulated_exergy(accumulated_exergy),
        .resilience_score(resilience_score)
    );

    // Clock generation
    initial clk = 0;
    always #5 clk = ~clk;

    initial begin
        // Initialize Signals
        rst_n = 0;
        exergy_in = 0;
        entropy_in = 0;
        geo_exergy_in = 0;
        threshold = 100;
        commit_trigger = 0;
        sector_id = 2'b00; // Generic
        chemstrain_mode = 0;

        $display("--- INITIALIZING ALBA EXERGY TEST ---");
        #20 rst_n = 1;

        // SCENARIO 1: Generic Sector — Normal Commitment
        $display("[SCENARIO 1] Generic Sector Validation");
        commit_trigger = 1;
        exergy_in = 50;
        entropy_in = 10;
        geo_exergy_in = 1;
        #20;
        exergy_in = 80;
        #20;
        if (ledger_commit) $display("[SUCCESS] Generic Ledger Committed at T=%t", $time);
        commit_trigger = 0;
        #50;

        // SCENARIO 2: Construction Sector — CHEMSTRAIN (High Stress)
        $display("[SCENARIO 2] Construction Sector (CHEMSTRAIN Mode)");
        sector_id = 2'b01; // Construction (+25% Threshold)
        chemstrain_mode = 1; // +50% Threshold total
        threshold = 100; // Effective threshold should be ~187
        commit_trigger = 1;
        exergy_in = 100;
        entropy_in = 40; // High entropy
        geo_exergy_in = 5;
        #100;
        if (!ledger_commit) $display("[INFO] Resilience Test: Ledger held in EVALUATING due to stress.");
        
        exergy_in = 250; // Injecting massive exergy to overcome stress
        #20;
        if (ledger_commit) $display("[SUCCESS] Construction Ledger Committed under CHEMSTRAIN at T=%t", $time);
        commit_trigger = 0;
        #50;

        // SCENARIO 3: Energy Sector — High Throughput Validation
        $display("[SCENARIO 3] Energy Sector Validation");
        sector_id = 2'b10; // Energy (+12.5% Threshold)
        chemstrain_mode = 0;
        threshold = 500;
        commit_trigger = 1;
        exergy_in = 600;
        entropy_in = 50;
        geo_exergy_in = 10;
        #20;
        if (ledger_commit) $display("[SUCCESS] Energy Ledger Committed at T=%t", $time);
        commit_trigger = 0;

        #100;
        $display("--- ALBA EXERGY TEST COMPLETE ---");
        $finish;
    end

endmodule
