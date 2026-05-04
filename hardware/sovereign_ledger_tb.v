`timescale 1ns/1ps

module sovereign_ledger_tb;

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

    // Unit Under Test (UUT)
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
        #1; // Delay to avoid T=0 race conditions
        // Initialize
        rst_n = 0;
        exergy_in = 0;
        entropy_in = 0;
        geo_exergy_in = 0;
        threshold = 32'd1000;
        commit_trigger = 0;
        sector_id = 2'b00;
        chemstrain_mode = 0;

        #20 rst_n = 1;
        #25 commit_trigger = 1;
        #20 commit_trigger = 0;

        $display("\n[TB] --- INICIANDO VALIDACIÓN TEC-Ω ---");

        // PHASE 1: EVALUATING (The Purge)
        // High exergy input to overcome threshold and entropy
        repeat (10) begin
            @(posedge clk);
            exergy_in = 32'd200;
            entropy_in = 32'd10;
            geo_exergy_in = 32'd50;
        end
        
        $display("[TB] T:%t | State: %b | Exergy: %d | Resilience: %d", $time, state_out, accumulated_exergy, resilience_score);

        // Wait for state transition to CRYSTALLIZING
        wait (state_out == 3'b010);
        $display("[TB] T:%t | ENTRANDO EN CRYSTALLIZING", $time);
        
        exergy_in = 32'd0; // No more active exergy input needed
        entropy_in = 32'd1; // Minimal residual noise

        // PHASE 2: CRYSTALLIZING (Solidification)
        // Wait for resilience score to grow
        repeat (50) @(posedge clk);
        $display("[TB] T:%t | Resilience midpoint: %d", $time, resilience_score);

        // TEST: Injection of thermal noise (Entropy Spike)
        $display("[TB] T:%t | INYECTANDO RUIDO TÉRMICO...", $time);
        @(posedge clk);
        entropy_in = 32'd500; // Spike
        @(posedge clk);
        entropy_in = 32'd1;
        $display("[TB] T:%t | Resilience after spike: %d (Should be lower)", $time, resilience_score);

        // PHASE 3: FINAL CRYSTALLIZATION
        wait (state_out == 3'b011); // COMMITTED
        $display("[TB] T:%t | --- COMMIT C5-REAL ALCANZADO ---", $time);
        $display("[TB] LEDGER_COMMIT: %b", ledger_commit);

        #100;
        $finish;
    end

    initial begin
        $dumpfile("sovereign_ledger.vcd");
        $dumpvars(0, sovereign_ledger_tb);
    end

endmodule
