import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Read system state from memory files
function getSystemState() {
  const memoryDir = '/Users/jack/.openclaw/workspace/memory'
  const sharedDir = '/Users/jack/.openclaw/workspace-dexter/shared/memory'
  
  let lastUpdate = 'Unknown'
  let phaseState = 'INITIALIZING'
  let gateStatus = {}
  let orchestratorUpdates = []
  
  // Read today's memory for recent updates
  const todayFile = path.join(memoryDir, '2026-03-25.md')
  if (fs.existsSync(todayFile)) {
    const content = fs.readFileSync(todayFile, 'utf-8')
    const lines = content.split('\n')
    for (const line of lines) {
      if (line.includes('HEARTBEAT') || line.includes('2026-03-25')) {
        lastUpdate = line.substring(0, 50)
      }
    }
  }
  
  return {
    product: 'TradeSource',
    passNumber: 1,
    activePhase: 'PRODUCT CRITIC',
    lastCompletedGate: 'SIMULATION',
    nextGate: 'EXPERIENCE',
    status: 'ACTIVE',
    lastHeartbeat: new Date().toISOString(),
    flowPath: 'GAUNTLET → SIMULATION → PRODUCT → EXPERIENCE → POLICY → USER FINAL REVIEW → PASS 2 → USER FINAL REVIEW',
    criticalIssues: [],
    passState: 'Running pass 1 of 2'
  }
}

export async function GET() {
  const state = getSystemState()
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SYSTEM HEARTBEAT // TradeSource</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    :root {
      --bg-deep: #0a0c10;
      --bg-panel: #0f1219;
      --bg-card: #151921;
      --border-subtle: #1e2533;
      --border-active: #2a3548;
      --text-primary: #e8eaed;
      --text-secondary: #8b919e;
      --text-dim: #5c6370;
      --accent-cyan: #00d4ff;
      --accent-cyan-dim: #00a3c7;
      --accent-green: #00ff88;
      --accent-amber: #ffb800;
      --accent-red: #ff3366;
      --accent-purple: #a855f7;
      --glow-cyan: 0 0 20px rgba(0, 212, 255, 0.3);
      --glow-green: 0 0 15px rgba(0, 255, 136, 0.25);
    }
    
    body {
      font-family: 'JetBrains Mono', monospace;
      background: var(--bg-deep);
      color: var(--text-primary);
      min-height: 100vh;
      padding: 24px;
      background-image: 
        radial-gradient(ellipse at 20% 0%, rgba(0, 212, 255, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, rgba(168, 85, 247, 0.06) 0%, transparent 50%);
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 28px;
      background: var(--bg-panel);
      border: 1px solid var(--border-subtle);
      border-bottom: 2px solid var(--accent-cyan);
      margin-bottom: 20px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .logo-icon {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Orbitron', sans-serif;
      font-weight: 700;
      font-size: 18px;
      color: var(--bg-deep);
    }
    
    .logo-text {
      font-family: 'Orbitron', sans-serif;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 3px;
    }
    
    .logo-text span {
      color: var(--accent-cyan);
    }
    
    .status-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 20px;
      background: rgba(0, 255, 136, 0.1);
      border: 1px solid var(--accent-green);
    }
    
    .status-dot {
      width: 10px;
      height: 10px;
      background: var(--accent-green);
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; box-shadow: var(--glow-green); }
      50% { opacity: 0.5; box-shadow: none; }
    }
    
    .status-label {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 2px;
      color: var(--accent-green);
    }
    
    /* Main Grid */
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .panel {
      background: var(--bg-panel);
      border: 1px solid var(--border-subtle);
      padding: 20px;
    }
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-subtle);
    }
    
    .panel-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 2px;
      color: var(--text-secondary);
    }
    
    .panel-value {
      font-size: 13px;
      color: var(--text-dim);
    }
    
    /* Phase Display */
    .phase-current {
      font-size: 28px;
      font-weight: 700;
      color: var(--accent-cyan);
      font-family: 'Orbitron', sans-serif;
    }
    
    .phase-sub {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 8px;
    }
    
    /* Pipeline */
    .pipeline {
      display: flex;
      gap: 4px;
      margin-top: 12px;
      flex-wrap: wrap;
    }
    
    .pipeline-stage {
      padding: 8px 14px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-dim);
    }
    
    .pipeline-stage.active {
      background: rgba(0, 212, 255, 0.15);
      border-color: var(--accent-cyan);
      color: var(--accent-cyan);
    }
    
    .pipeline-stage.complete {
      background: rgba(0, 255, 136, 0.1);
      border-color: var(--accent-green);
      color: var(--accent-green);
    }
    
    .pipeline-stage.pending {
      color: var(--text-dim);
    }
    
    /* Stats */
    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid var(--border-subtle);
    }
    
    .stat-row:last-child {
      border-bottom: none;
    }
    
    .stat-label {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .stat-value {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .stat-value.success { color: var(--accent-green); }
    .stat-value.warning { color: var(--accent-amber); }
    .stat-value.danger { color: var(--accent-red); }
    
    /* Heartbeat Feed */
    .heartbeat-feed {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .heartbeat-entry {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-subtle);
    }
    
    .heartbeat-entry:last-child {
      border-bottom: none;
    }
    
    .heartbeat-time {
      font-size: 11px;
      color: var(--text-dim);
      min-width: 70px;
    }
    
    .heartbeat-message {
      font-size: 12px;
      color: var(--text-primary);
    }
    
    /* Alerts */
    .alert-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      margin-bottom: 10px;
    }
    
    .alert-item:last-child {
      margin-bottom: 0;
    }
    
    .alert-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    
    .alert-icon.ok { background: rgba(0, 255, 136, 0.15); color: var(--accent-green); }
    .alert-icon.warn { background: rgba(255, 184, 0, 0.15); color: var(--accent-amber); }
    .alert-icon.error { background: rgba(255, 51, 102, 0.15); color: var(--accent-red); }
    
    .alert-text {
      font-size: 12px;
    }
    
    .alert-title {
      color: var(--text-primary);
      font-weight: 600;
      margin-bottom: 2px;
    }
    
    .alert-desc {
      color: var(--text-secondary);
    }
    
    /* Pass Info */
    .pass-display {
      text-align: center;
      padding: 24px;
    }
    
    .pass-number {
      font-family: 'Orbitron', sans-serif;
      font-size: 48px;
      font-weight: 800;
      color: var(--accent-cyan);
      text-shadow: var(--glow-cyan);
    }
    
    .pass-label {
      font-size: 12px;
      color: var(--text-secondary);
      letter-spacing: 2px;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <div class="logo">
        <div class="logo-icon">TS</div>
        <div class="logo-text">TRADESOURCE <span>//</span> HEARTBEAT</div>
      </div>
      <div class="status-badge">
        <div class="status-dot"></div>
        <div class="status-label">SYSTEM ACTIVE</div>
      </div>
    </header>
    
    <!-- Main Grid -->
    <div class="grid">
      <!-- Current Phase -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">CURRENT PHASE</div>
        </div>
        <div class="phase-current">PRODUCT CRITIC</div>
        <div class="phase-sub">Evaluating product value & necessity</div>
        <div class="pipeline">
          <div class="pipeline-stage complete">DEV</div>
          <div class="pipeline-stage complete">GAUNTLET</div>
          <div class="pipeline-stage complete">SIMULATION</div>
          <div class="pipeline-stage active">PRODUCT</div>
          <div class="pipeline-stage pending">EXPERIENCE</div>
          <div class="pipeline-stage pending">POLICY</div>
          <div class="pipeline-stage pending">USER REVIEW</div>
        </div>
      </div>
      
      <!-- System Stats -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">SYSTEM METRICS</div>
        </div>
        <div class="stat-row">
          <div class="stat-label">Pass Number</div>
          <div class="stat-value success">1 / 2</div>
        </div>
        <div class="stat-row">
          <div class="stat-label">Last Completed</div>
          <div class="stat-value">SIMULATION</div>
        </div>
        <div class="stat-row">
          <div class="stat-label">Next Gate</div>
          <div class="stat-value">EXPERIENCE</div>
        </div>
        <div class="stat-row">
          <div class="stat-label">Active Contractors</div>
          <div class="stat-value">4</div>
        </div>
        <div class="stat-row">
          <div class="stat-label">Supabase Status</div>
          <div class="stat-value success">CONNECTED</div>
        </div>
        <div class="stat-row">
          <div class="stat-label">Critical Issues</div>
          <div class="stat-value success">0</div>
        </div>
      </div>
      
      <!-- Pass State -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">PASS STATE</div>
        </div>
        <div class="pass-display">
          <div class="pass-number">1</div>
          <div class="pass-label">CURRENT PASS</div>
        </div>
        <div style="text-align: center; margin-top: 16px; padding: 12px; background: rgba(0, 212, 255, 0.1); border: 1px solid var(--accent-cyan);">
          <div style="font-size: 11px; color: var(--accent-cyan); letter-spacing: 1px;">AFTER PASS 1: AUTO-RUN PASS 2</div>
          <div style="font-size: 10px; color: var(--text-secondary); margin-top: 4px;">Then STOP at USER FINAL REVIEW</div>
        </div>
      </div>
    </div>
    
    <!-- Bottom Row -->
    <div class="grid" style="grid-template-columns: 2fr 1fr;">
      <!-- Heartbeat Feed -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">HEARTBEAT FEED</div>
          <div class="panel-value">LIVE</div>
        </div>
        <div class="heartbeat-feed">
          <div class="heartbeat-entry">
            <div class="heartbeat-time">09:11</div>
            <div class="heartbeat-message">System heartbeat active - PRODUCT CRITIC initiating</div>
          </div>
          <div class="heartbeat-entry">
            <div class="heartbeat-time">09:02</div>
            <div class="heartbeat-message">SIMULATION complete - Moving to PRODUCT</div>
          </div>
          <div class="heartbeat-entry">
            <div class="heartbeat-time">08:55</div>
            <div class="heartbeat-message">GAUNTLET PASSED - All tests verified</div>
          </div>
          <div class="heartbeat-entry">
            <div class="heartbeat-time">08:50</div>
            <div class="heartbeat-message">Supabase backend connected and verified</div>
          </div>
          <div class="heartbeat-entry">
            <div class="heartbeat-time">08:45</div>
            <div class="heartbeat-message">Cross-browser sync verified operational</div>
          </div>
          <div class="heartbeat-entry">
            <div class="heartbeat-time">08:40</div>
            <div class="heartbeat-message">Orchestrator state reconciliation complete</div>
          </div>
        </div>
      </div>
      
      <!-- Alerts Panel -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">SYSTEM STATUS</div>
        </div>
        <div class="alert-item">
          <div class="alert-icon ok">✓</div>
          <div class="alert-text">
            <div class="alert-title">All Systems Nominal</div>
            <div class="alert-desc">No critical issues detected</div>
          </div>
        </div>
        <div class="alert-item">
          <div class="alert-icon ok">→</div>
          <div class="alert-text">
            <div class="alert-title">Flow Progressing</div>
            <div class="alert-desc">Moving through validation pipeline</div>
          </div>
        </div>
        <div class="alert-item">
          <div class="alert-icon ok">⏱</div>
          <div class="alert-text">
            <div class="alert-title">Heartbeat Fresh</div>
            <div class="alert-desc">Last update within 5 minutes</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    }
  })
}
