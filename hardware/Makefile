# ============================================================================
# Sovereign Silicon Forge — Makefile (iCE40-HX8K Target)
# Axiom Ω₀: The software is a temporal abstraction; the hardware is truth.
# ============================================================================

DEVICE  = hx8k
PACKAGE = ct256
PCF     = sovereign_validator.pcf
TOP     = sovereign_top

SOURCES = sovereign_top.v \
          sovereign_ledger_validator.v \
          moskv_sonic_foundry.v \
          spi_bridge.v \
          uart_tx.v

BUILD   = build

# ---- Phase 1: Synthesis (RTL → JSON Netlist) ----
synth: $(SOURCES) | $(BUILD)
	yosys -p "read_verilog $(SOURCES); synth_ice40 -top $(TOP) -json $(BUILD)/$(TOP).json"

# ---- Phase 2: Place & Route (JSON → ASC) ----
pnr: synth
	nextpnr-ice40 --$(DEVICE) --package $(PACKAGE) --pcf $(PCF) --pcf-allow-unconstrained \
		--json $(BUILD)/$(TOP).json --asc $(BUILD)/$(TOP).asc

# ---- Phase 3: Bitstream Packing (ASC → BIN) ----
pack: pnr
	icepack $(BUILD)/$(TOP).asc $(BUILD)/$(TOP).bin

# ---- Phase 4: Flash to FPGA via USB ----
flash: pack
	iceprog $(BUILD)/$(TOP).bin

# ---- Simulation (existing iverilog flow, no hardware needed) ----
sim-ideal: $(SOURCES) tb_sovereign_validator_ideal.v | $(BUILD)
	iverilog -o $(BUILD)/ideal_sim sovereign_ledger_validator.v moskv_sonic_foundry.v tb_sovereign_validator_ideal.v
	vvp $(BUILD)/ideal_sim

sim-chemstrain: $(SOURCES) chemstrain_tb.v | $(BUILD)
	iverilog -o $(BUILD)/chemstrain_sim sovereign_ledger_validator.v moskv_sonic_foundry.v chemstrain_tb.v
	vvp $(BUILD)/chemstrain_sim

sim-all: sim-ideal sim-chemstrain
	@echo "[C5-GATE] All simulations passed."

# ---- Lint (Verilator static analysis) ----
lint: $(SOURCES)
	verilator --lint-only -Wall $(SOURCES) 2>&1 || true

# ---- Resource Report ----
report: synth
	yosys -p "read_verilog $(SOURCES); synth_ice40 -top $(TOP); stat" 2>&1 | tail -30

# ---- Build directory ----
$(BUILD):
	mkdir -p $(BUILD)

# ---- Clean ----
clean:
	rm -rf $(BUILD)

.PHONY: synth pnr pack flash sim-ideal sim-chemstrain sim-all lint report clean
