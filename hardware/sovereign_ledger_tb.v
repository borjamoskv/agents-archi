`timescale 1ns/1ps

module sovereign_ledger_tb;

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

    sovereign_ledger_validator uut (
        .clk(clk), .rst_n(rst_n),
        .exergy_in(exergy_in), .entropy_in(entropy_in),
        .geo_exergy_in(geo_exergy_in), .threshold(threshold),
        .commit_trigger(commit_trigger), .sector_id(sector_id),
        .chemstrain_mode(chemstrain_mode), .audio_in(audio_in),
        .audio_out(audio_out), .state_out(state_out),
        .ledger_commit(ledger_commit), .accumulated_exergy(accumulated_exergy),
        .resilience_score(resilience_score), .verification_gate(verification_gate)
    );

    // 100 MHz clock
    initial clk = 0;
    always #5 clk = ~clk;

    // Synthetic audio: 8-entry sine LUT
    reg [2:0] audio_phase;
    reg signed [15:0] sine_lut [0:7];
    initial begin
        sine_lut[0] =  16'd0;
        sine_lut[1] =  16'd16383;
        sine_lut[2] =  16'd23169;
        sine_lut[3] =  16'd16383;
        sine_lut[4] =  16'd0;
        sine_lut[5] = -16'd16383;
        sine_lut[6] = -16'd23169;
        sine_lut[7] = -16'd16383;
        audio_phase  = 0;
    end
    always @(posedge clk) begin
        audio_in    <= sine_lut[audio_phase];
        audio_phase <= audio_phase + 1;
    end

    // ─── MAIN TEST SEQUENCE ────────────────────────────────────────────
    integer commit_seen;
    initial begin
        commit_seen   = 0;

        // Initial state
        rst_n = 0; exergy_in = 0; entropy_in = 0;
        geo_exergy_in = 0; threshold = 32'd500;
        commit_trigger = 0; sector_id = 2'b00; chemstrain_mode = 0;

        #20 rst_n = 1;
        #25 commit_trigger = 1;
        #10 commit_trigger = 0;

        $display("\n[TB] === SOVEREIGN LEDGER VALIDATOR — TEC-Ω FULL SWEEP ===");

        // ─── PHASE 1: EVALUATING ─────────────────────────────────────
        // exergy=800 >> decay(~3) → net +797/cycle
        // entropy=20 → 5 cycles → accum ~100 satisfies density gate (th>>5=15) AND < thermal limit (th>>2=125)
        $display("[TB] Phase 1: EVALUATING — Purge sequence");
        repeat (5) begin
            @(posedge clk);
            exergy_in = 32'd800; entropy_in = 32'd20; geo_exergy_in = 32'd200;
        end
        // Sustain with zero entropy so accum stays < 125
        repeat (30) begin
            @(posedge clk);
            exergy_in = 32'd600; entropy_in = 32'd0; geo_exergy_in = 32'd100;
        end

        // ─── PHASE 2: CRYSTALLIZING ───────────────────────────────────
        // Wait for CRYSTALLIZING (010)
        while (state_out !== 3'b010) @(posedge clk);
        $display("[TB] T:%t | → CRYSTALLIZING (resilience=%d)", $time, resilience_score);

        // Sustain: low exergy keeps state, zero entropy prevents breach
        exergy_in = 32'd50; entropy_in = 32'd0; geo_exergy_in = 32'd0;

        // Wait for COMMITTED (011) — captured via posedge on ledger_commit
        @(posedge ledger_commit);
        commit_seen = 1;
        $display("[TB] T:%t | === C5-REAL COMMIT ACHIEVED ===", $time);
        $display("[TB]   resilience_score : %0d", resilience_score);
        $display("[TB]   accumulated_exergy: %0d", accumulated_exergy);
        $display("[TB]   verification_gate : %b", verification_gate);
        $display("[TB]   audio_out sample  : %0d", audio_out);

        if (verification_gate !== 1'b1)
            $display("[TB] WARN: verification_gate NOT asserted!");
        else
            $display("[TB] OK: verification_gate ASSERTED — Sovereign Hash valid.");

        #100 $finish;
    end

    // Timeout guard: 5ms
    initial begin
        #5000000;
        $display("[TB] TIMEOUT — 5ms exceeded. BREACH or stall. Last state: %b", state_out);
        $finish;
    end

    initial begin
        $dumpfile("sovereign_ledger.vcd");
        $dumpvars(0, sovereign_ledger_tb);
    end

endmodule
