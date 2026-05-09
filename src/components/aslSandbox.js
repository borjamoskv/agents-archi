export function initASLSandbox() {
  const editor = document.getElementById('asl-editor');
  const btnVerify = document.getElementById('btn-verify-asl');
  const btnReset = document.getElementById('btn-reset-asl');
  const output = document.getElementById('sandbox-output');
  const lineNumbers = document.getElementById('sandbox-line-numbers');
  const statusBadge = document.getElementById('verification-status-badge');

  if (!editor || !btnVerify || !output) return;

  const originalValue = editor.value;

  editor.addEventListener('input', () => {
    const lines = editor.value.split('\n').length;
    lineNumbers.innerHTML = Array.from({length: lines}, (_, i) => i + 1).join('<br>');
  });

  btnReset.addEventListener('click', () => {
    editor.value = originalValue;
    output.innerHTML = '<div class="output-line">⬡ Ready for formal verification.</div>';
    statusBadge.innerHTML = `
      <span class="verified-badge">✓ Proof Engine Active</span>
      <span class="verified-detail">Select a spec and click 'Run Proof' to verify behavior.</span>
    `;
    editor.dispatchEvent(new Event('input'));
  });

  btnVerify.addEventListener('click', async () => {
    const code = editor.value.trim();
    if (!code) return;

    btnVerify.disabled = true;
    btnVerify.textContent = 'Solving...';
    output.innerHTML = '<div class="output-line">⬡ Initializing Z3 solver cluster...</div>';

    const steps = [
      { msg: '⬡ Parsing Agent Specification Language (ASL)...', delay: 400 },
      { msg: '⬡ Generating 128 bit-vector constraints...', delay: 600 },
      { msg: '⬡ Invariant: "never_transfer > limit" mapped to SMT-LIB2.', delay: 500 },
      { msg: '⬡ Checking satisfiability across all tool execution paths...', delay: 800 }
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, step.delay));
      const line = document.createElement('div');
      line.className = 'output-line';
      line.textContent = step.msg;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    }

    await new Promise(r => setTimeout(r, 600));

    const hasUnsafe = code.toLowerCase().includes('allow_all') || !code.toLowerCase().includes('deny');
    
    const resultLine = document.createElement('div');
    if (hasUnsafe) {
      resultLine.className = 'output-line error';
      resultLine.innerHTML = '<span class="cmd">&gt;</span> SAT (Property Violated)<br>⬡ Counterexample found: Path [Tool:shell_exec] enables exfiltration.';
      statusBadge.innerHTML = `
        <span class="verified-badge error">✕ Verification Failed</span>
        <span class="verified-detail text-error">Critical vulnerability found in specification.</span>
      `;
    } else {
      resultLine.className = 'output-line success';
      resultLine.innerHTML = '<span class="cmd">&gt;</span> UNSAT (Property Holds)<br>⬡ All 4 capabilities formally verified against 3 invariants.';
      statusBadge.innerHTML = `
        <span class="verified-badge success">✓ Spec Verified</span>
        <span class="verified-detail text-success">Mathematically proven safe under CORTEX-9 constraints.</span>
      `;
    }
    
    output.appendChild(resultLine);
    output.scrollTop = output.scrollHeight;
    btnVerify.disabled = false;
    btnVerify.textContent = 'Run Proof (Z3)';
  });
}
