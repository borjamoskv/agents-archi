import asyncio
import sys
import os
from pathlib import Path

# Add project root to path to find cortex package
project_root = Path("/Users/borjafernandezangulo/10_PROJECTS/cortex-persist")
sys.path.append(str(project_root))

from cortex.engine import CortexEngine

async def notarize_lgd200():
    # Initialize engine (this will trigger schema creation/update)
    engine = CortexEngine()
    
    print("🛡️ [NOTARY] Initializing Sovereign Ledger...")
    await engine.init_db()
    
    # Successful LGD-200 metrics from previous run
    # exergy_yield=2840, entropy_level=52, resilience=310+
    # Commits: 12
    
    commitment_hash = "lgd200_success_verified_2026_05_04"
    project = "agents-archi-hardware"
    exergy_yield = 2840
    entropy_level = 52
    resilience = 310
    
    print(f"🛡️ [NOTARY] Recording C5-REAL Hardware Commitment: {commitment_hash}")
    
    try:
        commitment_id = await engine.record_silicon_commitment(
            commitment_hash=commitment_hash,
            project=project,
            exergy_yield=exergy_yield,
            entropy_level=entropy_level,
            resilience=resilience,
            hardware_state="COMMITTED",
            meta={
                "protocol": "CENTURIA-GUARD LGD-200",
                "result": "100% SUCCESS",
                "failures": 0,
                "commits": 12,
                "timestamp": "2026-05-04T22:16:00Z"
            }
        )
        print(f"✅ [NOTARY] Success. Commitment ID: {commitment_id}")
    except Exception as e:
        print(f"❌ [NOTARY] Failed to notarize: {e}")
    finally:
        await engine.close()

if __name__ == "__main__":
    asyncio.run(notarize_lgd200())
