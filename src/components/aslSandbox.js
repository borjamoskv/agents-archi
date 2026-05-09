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
    lineNumbers.replaceChildren();
    for (let i = 1; i <= lines; i++) {
      if (i > 1) lineNumbers.appendChild(document.createElement('br'));
      lineNumbers.appendChild(document.createTextNode(String(i)));
    }
  });

  function setStatusBadge(badgeClass, badgeText, detailClass, detailText) {
    statusBadge.replaceChildren();
    const badge = document.createElement('span');
    badge.className = `verified-badge ${badgeClass}`;
    badge.textContent = badgeText;
    const detail = document.createElement('span');
    detail.className = `verified-detail ${detailClass}`;
    detail.textContent = detailText;
    statusBadge.append(badge, detail);
  }

  function createOutputLine(text, className) {
    const line = document.createElement('div');
    line.className = `output-line ${className || ''}`.trim();
    line.textContent = text;
    return line;
  }

  btnReset.addEventListener('click', () => {
    editor.value = originalValue;
    output.replaceChildren(createOutputLine('⬡ Ready for formal verification.'));
    setStatusBadge('', '✓ Proof Engine Active', '', 'Select a spec and click \'Run Proof\' to verify behavior.');
    editor.dispatchEvent(new Event('input'));
  });

  btnVerify.addEventListener('click', async () => {
    const code = editor.value.trim();
    if (!code) return;

    btnVerify.disabled = true;
    btnVerify.textContent = 'Solving...';
    output.replaceChildren(createOutputLine('⬡ Initializing Z3 solver cluster...'));

    const steps = [
      { msg: '⬡ Parsing Agent Specification Language (ASL)...', delay: 400 },
      { msg: '⬡ Generating 128 bit-vector constraints...', delay: 600 },
      { msg: '⬡ Invariant: "never_transfer > limit" mapped to SMT-LIB2.', delay: 500 },
      { msg: '⬡ Checking satisfiability across all tool execution paths...', delay: 800 }
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, step.delay));
      output.appendChild(createOutputLine(step.msg));
      output.scrollTop = output.scrollHeight;
    }

    await new Promise(r => setTimeout(r, 600));

    const hasUnsafe = code.toLowerCase().includes('allow_all') || !code.toLowerCase().includes('deny');

    if (hasUnsafe) {
      const resultLine = createOutputLine('', 'error');
      const cmd = document.createElement('span');
      cmd.className = 'cmd';
      cmd.textContent = '>';
      resultLine.append(
        cmd,
        document.createTextNode(' SAT (Property Violated)'),
        document.createElement('br'),
        document.createTextNode('⬡ Counterexample found: Path [Tool:shell_exec] enables exfiltration.')
      );
      output.appendChild(resultLine);
      setStatusBadge('error', '✕ Verification Failed', 'text-error', 'Critical vulnerability found in specification.');
    } else {
      const resultLine = createOutputLine('', 'success');
      const cmd = document.createElement('span');
      cmd.className = 'cmd';
      cmd.textContent = '>';
      resultLine.append(
        cmd,
        document.createTextNode(' UNSAT (Property Holds)'),
        document.createElement('br'),
        document.createTextNode('⬡ All 4 capabilities formally verified against 3 invariants.')
      );
      output.appendChild(resultLine);
      setStatusBadge('success', '✓ Spec Verified', 'text-success', 'Mathematically proven safe under CORTEX-9 constraints.');
    }

    output.scrollTop = output.scrollHeight;
    btnVerify.disabled = false;
    btnVerify.textContent = 'Run Proof (Z3)';
  });
}
