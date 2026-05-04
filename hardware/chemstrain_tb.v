`timescale 1ns/1ps

module sovereign_ledger_validator_tb;

    reg clk;
    reg rst_n;
    reg [31:0] exergy_in;
    reg [31:0] entropy_in;
    reg [31:0] geo_exergy_in;
    reg [31:0] threshold;
    reg [1:0] sector_id;
    reg commit_trigger;
    reg chemstrain_mode;
    
    wire [2:0] state_out;
    wire ledger_commit;
    wire [31:0] accumulated_exergy;
    wire [31:0] resilience_score;

    reg commit_seen;
    always @(posedge clk) begin
        if (!rst_n) commit_seen <= 0;
        else if (ledger_commit) commit_seen <= 1;
    end

    sovereign_ledger_validator uut (
        .clk(clk),
        .rst_n(rst_n),
        .exergy_in(exergy_in),
        .entropy_in(entropy_in),
        .geo_exergy_in(geo_exergy_in),
        .threshold(threshold),
        .sector_id(sector_id),
        .commit_trigger(commit_trigger),
        .chemstrain_mode(chemstrain_mode),
        .state_out(state_out),
        .ledger_commit(ledger_commit),
        .accumulated_exergy(accumulated_exergy),
        .resilience_score(resilience_score)
    );

    // Clock generation
    always #5 clk = ~clk;

    initial begin
        $dumpfile("chemstrain_test.vcd");
        $dumpvars(0, sovereign_ledger_validator_tb);

        // Initialize Inputs
        clk = 0;
        rst_n = 0;
        exergy_in = 0;
        entropy_in = 0;
        geo_exergy_in = 0;
        threshold = 32'd1000; 
        sector_id = 2'b00;
        commit_trigger = 0;
        chemstrain_mode = 0;

        #100;
        rst_n = 1;
        
        // --- Test Case 1: Standard Commit ---
        #20;
        commit_trigger = 1;
        exergy_in = 32'd3000; 
        entropy_in = 32'd50; // Pass density gate (31)
        geo_exergy_in = 32'd100;
        
        #100; // Allow 10 cycles to accumulate entropy (500) and exergy (25000)
        entropy_in = 32'd1; // Reduce to micro-entropy for crystallization
        
        #5000; 
        if (commit_seen)
            $display("[C5-REAL] Standard Commit: SUCCESS");
        else
            $display("[C4-ERROR] Standard Commit: FAILURE. State: %b, Score: %d, Exergy: %d, Entropy: %d", state_out, resilience_score, accumulated_exergy, uut.internal_entropy);

        #20;
        commit_trigger = 0;
        commit_seen = 0;
        #500;

        // --- Test Case 2: CHEMSTRAIN Commit (High Resistance) ---
        #20;
        chemstrain_mode = 1;
        commit_trigger = 1;
        exergy_in = 32'd1500; // Below 1750
        entropy_in = 32'd50;
        geo_exergy_in = 32'd100;
        
        #200;
        if (!ledger_commit)
            $display("[C5-REAL] CHEMSTRAIN Resistance: SUCCESS (Threshold held at 1500)");
        
        #20;
        exergy_in = 32'd4000; // Above 1750
        #100;
        entropy_in = 32'd1;
        
        #10000; 
        if (commit_seen)
            $display("[C5-REAL] CHEMSTRAIN Commit: SUCCESS. Resilience Score: %d", resilience_score);
        else
            $display("[C4-ERROR] CHEMSTRAIN Commit: FAILURE. State: %b, Score: %d, Exergy: %d", state_out, resilience_score, accumulated_exergy);

        // --- Test Case 3: Severe Corrosion ---
        #20;
        commit_trigger = 1;
        exergy_in = 32'd100;
        entropy_in = 32'd2000; 
        
        #500;
        if (resilience_score < 50)
            $display("[C5-REAL] Severe Corrosion: SUCCESS (Score plummeted)");
        else
            $display("[C4-ERROR] Severe Corrosion: FAILURE. Score: %d", resilience_score);

        #100;
        $finish;
    end
      
endmodule
