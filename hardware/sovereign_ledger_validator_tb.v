`timescale 1ns/1ps

module sovereign_ledger_validator_tb;
    reg clk;
    reg rst_n;
    reg [31:0] exergy_in;
    reg [31:0] entropy_in;
    reg [31:0] geo_exergy_in;
    reg [31:0] threshold;
    reg commit_trigger;
    reg [1:0] sector_id;
    reg chemstrain_mode;
    
    wire [2:0] state_out;
    wire ledger_commit;
    wire [31:0] accumulated_exergy;
    wire [31:0] resilience_score;

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
    always #5 clk = ~clk;

    initial begin
        // Initialize
        clk = 0;
        rst_n = 0;
        exergy_in = 0;
        entropy_in = 0;
        geo_exergy_in = 0;
        threshold = 32'd1000;
        commit_trigger = 0;
        sector_id = 2'b00;
        chemstrain_mode = 0;

        $display("🚀 Starting TEC-Ω Hardware Validation...");
        #20 rst_n = 1;
        
        // Trigger Evaluation
        #20 commit_trigger = 1;
        exergy_in = 32'd500;
        entropy_in = 32'd50;
        geo_exergy_in = 32'd100;
        
        #10 commit_trigger = 0;
        
        // Wait for EVALUATING -> CRYSTALLIZING
        // Needs internal_exergy >= effective_threshold (1000)
        // Currently internal_exergy is 450 (500 - 50) per cycle? 
        // No, in EVALUATING it accumulates.
        
        repeat (10) #10; 
        
        $display("--- Monitoring Transitions ---");
        
        // Feed more exergy to reach threshold
        exergy_in = 32'd200;
        entropy_in = 32'd10;
        
        repeat (50) #10;

        // Check if we hit CRYSTALLIZING
        if (state_out == 3'b010) 
            $display("✅ [SUCCESS] CRYSTALLIZING Phase Reached.");
        else
            $display("⚠️ [PENDING] State is %b", state_out);

        // Feed stability to hit COMMITTED
        exergy_in = 32'd10;
        entropy_in = 32'd0; // Zero entropy for stability
        
        repeat (120) #10;

        if (ledger_commit)
            $display("💎 [SUCCESS] C5-REAL COMMITTED.");
        else
            $display("❌ [FAILURE] Target state not reached. Resilience: %d", resilience_score);

        $finish;
    end

endmodule
