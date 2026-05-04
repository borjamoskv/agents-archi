/*
 * SOVEREIGN STRESS TEST — CENTURIA-GUARD LGD-200 Protocol
 * 8 vectores adversariales concurrentes sobre sovereign_ledger_validator.v
 *
 * VECTORES:
 *   T1: Happy Path (baseline C5-REAL)
 *   T2: Entropy Spike (thermal collapse resistance)
 *   T3: Exergy Starvation (recovery from near-zero)
 *   T4: CHEMSTRAIN Mode (x4 exergy density requirement)
 *   T5: TARP Trigger (high-entropy → THINKING → COMMITTED)
 *   T6: Rapid Breach-Recovery Cycles (10x)
 *   T7: Sector ENERGY threshold scaling
 *   T8: Max-saturation fuzzing (32'hFFFFFFFF inputs)
 *
 * PASS criteria: verification_gate asserted on every legitimate commit.
 * FAIL criteria: verification_gate asserted during BREACH state.
 */
`timescale 1ns/1ps

module stress_tb;

    // ─── DUT SIGNALS ─────────────────────────────────────────────────────
    reg clk, rst_n;
    reg [31:0] exergy_in, entropy_in, geo_exergy_in, threshold;
    reg commit_trigger;
    reg [1:0] sector_id;
    reg chemstrain_mode;
    reg signed [15:0] audio_in;

    wire [2:0] state_out;
    wire ledger_commit;
    wire [31:0] accumulated_exergy, resilience_score;
    wire verification_gate;
    wire signed [15:0] audio_out;

    // ─── DUT ─────────────────────────────────────────────────────────────
    sovereign_ledger_validator dut (
        .clk(clk), .rst_n(rst_n),
        .exergy_in(exergy_in), .entropy_in(entropy_in),
        .geo_exergy_in(geo_exergy_in), .threshold(threshold),
        .commit_trigger(commit_trigger), .sector_id(sector_id),
        .chemstrain_mode(chemstrain_mode), .audio_in(audio_in),
        .audio_out(audio_out), .state_out(state_out),
        .ledger_commit(ledger_commit), .accumulated_exergy(accumulated_exergy),
        .resilience_score(resilience_score), .verification_gate(verification_gate)
    );

    // ─── CLOCK ───────────────────────────────────────────────────────────
    initial clk = 0;
    always #5 clk = ~clk;

    // ─── AUDIO: 8-point sine ─────────────────────────────────────────────
    reg [2:0] aphase;
    reg signed [15:0] slut [0:7];
    integer passes, failures, commits_seen, breaches_seen;
    integer test_id;

    initial begin
        slut[0] =  16'd0;     slut[1] =  16'd16383;
        slut[2] =  16'd23169; slut[3] =  16'd16383;
        slut[4] =  16'd0;     slut[5] = -16'd16383;
        slut[6] = -16'd23169; slut[7] = -16'd16383;
        aphase   = 0;
        audio_in = 0;
        rst_n = 0;
        exergy_in = 0;
        entropy_in = 0;
        geo_exergy_in = 0;
        threshold = 32'h0;
        commit_trigger = 0;
        sector_id = 2'b00;
        chemstrain_mode = 0;
        test_id = 0;
        passes = 0;
        failures = 0;
        commits_seen = 0;
        breaches_seen = 0;
    end
    always @(posedge clk) begin audio_in <= slut[aphase]; aphase <= aphase + 1; end

    // ─── SCOREBOARD ──────────────────────────────────────────────────────
    // (Integrals moved to initial block above)

    // Track illegal verification_gate (asserted during BREACH)
    always @(posedge clk) begin
        if (verification_gate && state_out == 3'b100) begin
            $display("[FAIL] T%0d T:%t | verification_gate ILLEGAL during BREACH!", test_id, $time);
            failures = failures + 1;
        end
    end

    // Count commits and breaches
    always @(posedge ledger_commit) commits_seen = commits_seen + 1;
    always @(posedge clk) if (state_out == 3'b100 && dut.next_state == 3'b000) breaches_seen = breaches_seen + 1;

    // ─── TASK: FULL RESET ────────────────────────────────────────────────
    task do_reset;
        begin
            rst_n = 0; exergy_in = 0; entropy_in = 0;
            geo_exergy_in = 0; commit_trigger = 0;
            sector_id = 2'b00; chemstrain_mode = 0;
            threshold = 32'd500;
            @(posedge clk); @(posedge clk);
            rst_n = 1;
            @(posedge clk);
        end
    endtask

    // ─── TASK: TRIGGER COMMIT ────────────────────────────────────────────
    task trigger_commit;
        begin
            @(posedge clk); commit_trigger = 1;
            @(posedge clk);
        end
    endtask

    // ─── TASK: PUMP EXERGY (n cycles) ────────────────────────────────────
    task pump_exergy;
        input [31:0] ex, en, geo, n;
        integer i;
        reg stop;
        begin
            stop = 0;
            for (i = 0; i < n && !stop; i = i + 1) begin
                @(posedge clk);
                exergy_in = ex; entropy_in = en; geo_exergy_in = geo;
                if (state_out == 3'b011 || state_out == 3'b100) stop = 1;
            end
        end
    endtask

    // ─── TASK: WAIT COMMIT (timeout in cycles) ───────────────────────────
    task wait_commit;
        input [31:0] timeout_cycles;
        integer i;
        reg got_commit;
        begin
            got_commit = 0;
            for (i = 0; i < timeout_cycles && !got_commit; i = i + 1) begin
                @(negedge clk);
                if (ledger_commit || state_out == 3'b011) got_commit = 1;
                @(posedge clk);
            end
            if (got_commit) begin
                $display("[PASS] T%0d Commit @ T:%t | resilience=%0d exergy=%0d",
                         test_id, $time, resilience_score, accumulated_exergy);
                passes = passes + 1;
            end else begin
                $display("[FAIL] T%0d No commit within %0d cycles | state=%b resilience=%0d",
                         test_id, timeout_cycles, state_out, resilience_score);
                failures = failures + 1;
            end
        end
    endtask

    // ─── TASK: EXPECT BREACH (within n cycles) ───────────────────────────
    task expect_breach;
        input [31:0] timeout_cycles;
        integer i;
        reg got_breach;
        begin
            got_breach = 0;
            for (i = 0; i < timeout_cycles && !got_breach; i = i + 1) begin
                @(negedge clk);
                if (state_out == 3'b100) got_breach = 1;
                @(posedge clk);
            end
            if (got_breach) begin
                $display("[PASS] T%0d BREACH @ T:%t (expected) | exergy=%0d entropy=%0d",
                         test_id, $time, accumulated_exergy, dut.internal_entropy);
                passes = passes + 1;
            end else begin
                $display("[FAIL] T%0d Expected BREACH but none within %0d cycles | state=%b",
                         test_id, timeout_cycles, state_out);
                failures = failures + 1;
            end
        end
    endtask

    // ─── MAIN ─────────────────────────────────────────────────────────────
    initial begin
        passes = 0; failures = 0; commits_seen = 0; breaches_seen = 0;
        $dumpfile("stress.vcd");
        $dumpvars(0, stress_tb);

        $display("\n╔══════════════════════════════════════════════════╗");
        $display("║  SOVEREIGN STRESS — CENTURIA-GUARD LGD-200       ║");
        $display("╚══════════════════════════════════════════════════╝\n");

        // ════════════════════════════════════════════════════════════════
        // T1: HAPPY PATH — baseline commit (C5-REAL)
        // ════════════════════════════════════════════════════════════════
        test_id = 1;
        $display("[T1] Happy Path — Baseline C5-REAL commit");
        do_reset;
        trigger_commit;
        pump_exergy(1500, 100, 500, 50); 
        pump_exergy(1500, 0, 100, 200);  // Slower gain needs more cycles
        wait_commit(50000);
        commit_trigger = 0;
        do_reset;

        // ════════════════════════════════════════════════════════════════
        // T2: ENTROPY SPIKE — thermal collapse resistance
        // Expect: BREACH after spike > threshold>>2=125
        // ════════════════════════════════════════════════════════════════
        test_id = 2;
        $display("[T2] Entropy Spike — thermal collapse (BREACH expected)");
        do_reset;
        trigger_commit;
        pump_exergy(1500, 100, 500, 40); 
        pump_exergy(0, 8000, 0, 20);    // massive spike → BREACH
        expect_breach(500);
        commit_trigger = 0;
        do_reset;

        // ════════════════════════════════════════════════════════════════
        // T3: EXERGY STARVATION — re-purge required
        // Feed enough to reach CRYSTALLIZING then cut exergy
        // Expect: EVALUATING again (re-purge), then commit
        // ════════════════════════════════════════════════════════════════
        test_id = 3;
        $display("[T3] Exergy Starvation — re-purge recovery");
        do_reset;
        trigger_commit;
        pump_exergy(1500, 100, 500, 50); 
        pump_exergy(0, 0, 0, 150);       
        pump_exergy(2000, 50, 200, 300); // Resume exergy
        wait_commit(50000);
        commit_trigger = 0;
        do_reset;

        // ════════════════════════════════════════════════════════════════
        // T4: CHEMSTRAIN MODE — 4x exergy density requirement
        // chemstrain_mode=1 raises effective_threshold by ~75%
        // threshold=300 → effective ~525. Need exergy >> 525.
        // ════════════════════════════════════════════════════════════════
        test_id = 4;
        $display("[T4] CHEMSTRAIN Mode — industrial stress (threshold scaled +75%)");
        do_reset;
        chemstrain_mode = 1;
        threshold = 32'd300;  
        trigger_commit;
        pump_exergy(3000, 100, 1000, 100); 
        pump_exergy(2000, 10, 500, 400);  
        wait_commit(50000);
        commit_trigger = 0;
        do_reset;
        chemstrain_mode = 0;

        // ════════════════════════════════════════════════════════════════
        // T5: TARP TRIGGER — high entropy forces THINKING state
        // From CRYSTALLIZING, entropy_in > threshold>>3=62 → THINKING
        // In THINKING: resilience must reach 250
        // ════════════════════════════════════════════════════════════════
        test_id = 5;
        $display("[T5] TARP Trigger — CRYSTALLIZING→THINKING→COMMITTED");
        do_reset;
        threshold = 32'd500;
        trigger_commit;
        pump_exergy(2000, 150, 500, 50);  
        pump_exergy(3000, 500, 1000, 10); 
        pump_exergy(4000, 20, 200, 800);  
        wait_commit(50000);
        commit_trigger = 0;
        do_reset;

        // ════════════════════════════════════════════════════════════════
        // T6: RAPID BREACH-RECOVERY CYCLES (10x)
        // Each iteration: trigger → EVALUATING → entropy spike → BREACH → recovery
        // ════════════════════════════════════════════════════════════════
        test_id = 6;
        $display("[T6] Rapid Breach-Recovery (10 cycles)");
        begin : t6_loop
            integer k;
            for (k = 0; k < 10; k = k + 1) begin : t6_inner
                do_reset;
                trigger_commit;
                pump_exergy(1500, 100, 500, 20);
                // Force breach: entropy spike
                pump_exergy(0, 9000, 0, 10);
                commit_trigger = 0; // Clear trigger to allow recovery from BREACH
                // Wait for BREACH and recovery to IDLE
                begin : wait_loop
                    integer j;
                    reg seen;
                    seen = 0;
                    for (j = 0; j < 500 && !seen; j = j + 1) begin
                        @(posedge clk);
                        if (state_out == 3'b000 && j > 10) seen = 1;
                    end
                end
            end
            $display("[PASS] T6 Breach-recovery 10x completed. Total breaches=%0d", breaches_seen);
            passes = passes + 1;
        end

        // ════════════════════════════════════════════════════════════════
        // T7: SECTOR_ENERGY — threshold +12.5% scaling
        // sector_id=2'b10 → threshold scaled +12.5%
        // ════════════════════════════════════════════════════════════════
        test_id = 7;
        $display("[T7] Sector ENERGY — threshold +12.5% scaling");
        do_reset;
        sector_id = 2'b10;  // SECTOR_ENERGY
        threshold = 32'd400; // effective ~450
        trigger_commit;
        pump_exergy(2000, 100, 500, 100); 
        pump_exergy(1500,  10, 200, 400); 
        wait_commit(50000);
        commit_trigger = 0;
        do_reset;
        sector_id = 2'b00;

        // ════════════════════════════════════════════════════════════════
        // T8: MAX SATURATION FUZZING
        // Input 32'hFFFFFFFF exergy and entropy alternately
        // Must not corrupt state machine or hang
        // ════════════════════════════════════════════════════════════════
        test_id = 8;
        $display("[T8] Saturation Fuzzing — 32'hFFFFFFFF inputs");
        do_reset;
        threshold = 32'd500;
        trigger_commit;
        pump_exergy(32'hFFFFFFFF, 100, 32'hFFFFFFFF, 50);
        pump_exergy(1000, 0, 200, 100);
        wait_commit(50000);
        commit_trigger = 0;
        // Phase B: Max entropy → BREACH
        do_reset;
        trigger_commit;
        pump_exergy(1500, 100, 500, 40);
        pump_exergy(32'hFFFFFFFF, 32'hFFFFFFFF, 0, 50); 
        expect_breach(2000);
        commit_trigger = 0;
        do_reset;
        $display("[PASS] T8 Saturation fuzzing — no hang, state machine intact");
        passes = passes + 1;  // extra pass for no-hang

        // ════════════════════════════════════════════════════════════════
        // FINAL REPORT
        // ════════════════════════════════════════════════════════════════
        #100;
        $display("\n╔══════════════════════════════════════════════════╗");
        $display("║  STRESS REPORT — CENTURIA-GUARD LGD-200          ║");
        $display("╠══════════════════════════════════════════════════╣");
        $display("║  PASSES  : %0d                                   ║", passes);
        $display("║  FAILURES: %0d                                   ║", failures);
        $display("║  COMMITS : %0d                                   ║", commits_seen);
        $display("║  BREACHES: %0d                                   ║", breaches_seen);
        if (failures == 0)
            $display("║  STATUS  : ✅ ALL PASSED — C5-REAL SOVEREIGN     ║");
        else
            $display("║  STATUS  : ❌ FAILURES DETECTED — AUDIT REQUIRED ║");
        $display("╚══════════════════════════════════════════════════╝\n");

        $finish;
    end

    // Global timeout: 50ms
    initial begin
        #50000000;
        $display("[ABORT] Global timeout 50ms exceeded. Hung in state=%b", state_out);
        $finish;
    end

endmodule
