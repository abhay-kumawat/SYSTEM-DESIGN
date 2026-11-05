/**
 * SPSU UDAIPUR CHAMPIONSHIP - SYSTEM DESIGN WAR ARENA
 * Campus Placement Drive Management System (CPDMS)
 * Interactive Application & Simulation Engine
 */

// Sound FX Engine (Pure Web Audio API - no external assets required)
const SoundFX = {
  enabled: true,
  ctx: null,
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.05) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio fallback silent
    }
  },
  click() { this.playTone(600, 'sine', 0.06, 0.04); },
  success() {
    this.playTone(523.25, 'triangle', 0.08, 0.06);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.1, 0.06), 80);
    setTimeout(() => this.playTone(783.99, 'triangle', 0.15, 0.06), 160);
  },
  error() {
    this.playTone(280, 'sawtooth', 0.15, 0.05);
    setTimeout(() => this.playTone(220, 'sawtooth', 0.2, 0.05), 100);
  },
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
};

// Toast Notification System
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') {
    icon = '✅';
    SoundFX.success();
  } else if (type === 'error') {
    icon = '❌';
    SoundFX.error();
  } else {
    SoundFX.click();
  }

  toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Global CPDMS State (Persisted in localStorage with pre-seeded data)
const DefaultData = {
  companies: [
    { id: 'comp_1', name: 'Google', industry: 'Software / Cloud', website: 'https://careers.google.com' },
    { id: 'comp_2', name: 'Microsoft', industry: 'Software & AI', website: 'https://careers.microsoft.com' },
    { id: 'comp_3', name: 'Zomato', industry: 'FoodTech / Consumer', website: 'https://zomato.com/careers' },
    { id: 'comp_4', name: 'TCS Digital', industry: 'IT Services', website: 'https://tcs.com/careers' }
  ],
  drives: [
    {
      id: 'drv_101',
      companyId: 'comp_1',
      role: 'Software Development Engineer I',
      packageLpa: 24.5,
      minCgpa: 8.0,
      deadline: '2026-11-30',
      description: 'Full-stack engineering role working on high-scale distributed systems and cloud infrastructure.'
    },
    {
      id: 'drv_102',
      companyId: 'comp_2',
      role: 'Cloud Solutions Associate',
      packageLpa: 28.0,
      minCgpa: 8.5,
      deadline: '2026-12-05',
      description: 'Designing resilient Azure enterprise cloud solutions and AI copilots.'
    },
    {
      id: 'drv_103',
      companyId: 'comp_3',
      role: 'Backend Product Engineer',
      packageLpa: 18.0,
      minCgpa: 7.0,
      deadline: '2026-11-25',
      description: 'Microservices architecture, Go / Node.js, high-throughput hyper-local logistics.'
    },
    {
      id: 'drv_104',
      companyId: 'comp_4',
      role: 'Systems Engineer',
      packageLpa: 7.5,
      minCgpa: 6.5,
      deadline: '2026-11-20',
      description: 'Enterprise consulting, DevOps tooling, automated CI/CD and modernization.'
    }
  ],
  students: [
    { id: 'std_01', name: 'Rahul Sharma', email: 'rahul.s@spsu.ac.in', branch: 'Computer Science', cgpa: 8.4 },
    { id: 'std_02', name: 'Priya Patel', email: 'priya.p@spsu.ac.in', branch: 'Information Technology', cgpa: 7.2 },
    { id: 'std_03', name: 'Aman Verma', email: 'aman.v@spsu.ac.in', branch: 'Mechanical Eng.', cgpa: 6.1 }
  ],
  applications: [
    {
      id: 'app_901',
      studentId: 'std_01',
      driveId: 'drv_103',
      status: 'Shortlisted',
      appliedAt: '2026-11-01 10:30'
    },
    {
      id: 'app_902',
      studentId: 'std_02',
      driveId: 'drv_104',
      status: 'Applied',
      appliedAt: '2026-11-02 14:15'
    }
  ]
};

// LocalStorage Manager
const DB = {
  load() {
    const raw = localStorage.getItem('spsu_cpdms_db');
    if (!raw) {
      this.save(DefaultData);
      return JSON.parse(JSON.stringify(DefaultData));
    }
    try {
      return JSON.parse(raw);
    } catch {
      return JSON.parse(JSON.stringify(DefaultData));
    }
  },
  save(data) {
    localStorage.setItem('spsu_cpdms_db', JSON.stringify(data));
  },
  reset() {
    this.save(DefaultData);
    return JSON.parse(JSON.stringify(DefaultData));
  }
};

let store = DB.load();
let currentStudentId = 'std_01'; // Default logged in student

// Particle Network Animation on Hero Canvas
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
    initParticles();
  }

  function initParticles() {
    particles = [];
    const count = Math.floor(width / 35);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw links
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.18 * (1 - dist / 110)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34, 211, 238, ${p.alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
}

// Navigation Tabs Manager
function initNavigation() {
  const tabs = document.querySelectorAll('.nav-tab-btn');
  const panels = document.querySelectorAll('.section-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      SoundFX.click();
      const targetId = tab.dataset.target;

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active-panel'));

      tab.classList.add('active');
      tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      const activePanel = document.getElementById(targetId);
      if (activePanel) {
        activePanel.classList.add('active-panel');
        // Scroll slightly down to panel start if needed
        activePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Sound Toggle Button
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const isEnabled = SoundFX.toggle();
      soundBtn.classList.toggle('active', isEnabled);
      soundBtn.title = isEnabled ? 'Audio Effects: ON' : 'Audio Effects: OFF';
      showToast(isEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted', 'info');
    });
  }
}

// HLD Architectural Interactive Simulation
const HLD_DATA = {
  components: {
    'hld-browser': {
      title: 'Student & Admin Client (SPA)',
      role: 'Web Application Layer',
      desc: 'Single-page responsive application developed with modern micro-frontend principles. Features client-side form validation, skeleton loading screens, state management, and real-time status polling/WebSockets.',
      stack: 'HTML5, Modern CSS3, Vanilla ES6 / React, Responsive Mobile & Desktop'
    },
    'hld-api': {
      title: 'API Gateway & Reverse Proxy',
      role: 'Edge Routing & Security',
      desc: 'Unified entry point for all incoming HTTP requests. Handles SSL termination, rate limiting, request throttling, CORS policy enforcement, and forwards authenticated requests to internal microservices.',
      stack: 'NGINX / Envoy Gateway, JWT Token Validation, Rate Limiter (Token Bucket)'
    },
    'hld-auth': {
      title: 'Auth & RBAC Service',
      role: 'Authentication & Permissions',
      desc: 'Validates university SSO credentials, issues signed RS256 JWT tokens, and verifies role authorizations: Student vs Placement Admin vs TPO Team.',
      stack: 'OAuth2 / SAML 2.0, Redis Session Store, JWT'
    },
    'hld-drive': {
      title: 'Placement Drive Service',
      role: 'Company & Drive Lifecycle',
      desc: 'Handles company profile management, placement drive creation, deadline tracking, eligibility criteria publication, and job description indexing.',
      stack: 'RESTful API, Node.js/Go, Read-through Redis Cache'
    },
    'hld-app': {
      title: 'Application & Eligibility Service',
      role: 'Candidate Application Workflow',
      desc: 'Enforces business rules: CGPA threshold validation, deadline cutoff verification, and duplicate application prevention. Manages the state machine (Applied -> Shortlisted -> Selected/Rejected).',
      stack: 'Event-driven Architecture, Transactional DB Writes'
    },
    'hld-db': {
      title: 'Relational Database (PostgreSQL)',
      role: 'ACID Persistent Storage',
      desc: 'Primary datastore with foreign key referential integrity. Enforces a UNIQUE composite constraint on (student_id, drive_id) ensuring no double applications can ever be committed.',
      stack: 'PostgreSQL 16, Primary-Replica Architecture, Read Replicas for Drive Browsing'
    },
    'hld-notify': {
      title: 'Notification & Email Service',
      role: 'Async Alerting & Dispatch',
      desc: 'Subscribes to placement drive events and application status updates via message queue. Dispatches email alerts, SMS, and in-app notifications to students.',
      stack: 'Kafka / RabbitMQ, AWS SES / SendGrid'
    }
  }
};

function initHLDInteractive() {
  const nodes = document.querySelectorAll('.hld-node');
  const inspector = document.getElementById('hld-inspector');
  const inspTitle = document.getElementById('inspector-title');
  const inspRole = document.getElementById('inspector-role');
  const inspDesc = document.getElementById('inspector-desc');
  const inspStack = document.getElementById('inspector-stack');

  nodes.forEach(node => {
    node.addEventListener('click', () => {
      SoundFX.click();
      nodes.forEach(n => n.classList.remove('selected-node'));
      node.classList.add('selected-node');

      const id = node.id;
      const data = HLD_DATA.components[id];
      if (data && inspector) {
        inspTitle.textContent = data.title;
        inspRole.textContent = data.role;
        inspDesc.textContent = data.desc;
        inspStack.textContent = data.stack;
        inspector.classList.add('active');
        inspector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  // Flow Simulation Button
  const simBtn = document.getElementById('btn-sim-flow');
  if (simBtn) {
    simBtn.addEventListener('click', runHLDFlowSimulation);
  }
}

function runHLDFlowSimulation() {
  SoundFX.click();
  const sequence = [
    { id: 'hld-browser', label: '1. Student clicks "Apply to Drive"' },
    { id: 'hld-api', label: '2. Gateway validates SSL & Rate Limit' },
    { id: 'hld-auth', label: '3. Auth verifies JWT Student Role' },
    { id: 'hld-app', label: '4. App Service executes eligibility check' },
    { id: 'hld-db', label: '5. DB checks UNIQUE constraint & commits' },
    { id: 'hld-notify', label: '6. Async Event triggers Student Email Alert' },
    { id: 'hld-browser', label: '7. 201 Created sent back to Student UI' }
  ];

  const statusLabel = document.getElementById('sim-status-label');
  let step = 0;

  function nextStep() {
    if (step >= sequence.length) {
      document.querySelectorAll('.hld-node').forEach(n => n.classList.remove('active-packet'));
      if (statusLabel) statusLabel.innerHTML = '✨ <strong>Flow Completed:</strong> Application committed and student notified within 140ms!';
      showToast('Architecture Flow Simulation Complete: End-to-end verified', 'success');
      return;
    }

    const item = sequence[step];
    document.querySelectorAll('.hld-node').forEach(n => n.classList.remove('active-packet'));
    const target = document.getElementById(item.id);
    if (target) {
      target.classList.add('active-packet');
      SoundFX.playTone(400 + step * 80, 'sine', 0.1, 0.04);
    }
    if (statusLabel) {
      statusLabel.innerHTML = `📡 <strong>Active Step:</strong> ${item.label}`;
    }

    step++;
    setTimeout(nextStep, 700);
  }

  nextStep();
}

// ER Diagram Interactivity & Constraints Explorer
function initERDiagram() {
  const cards = document.querySelectorAll('.er-entity-card');
  const infoBox = document.getElementById('er-constraint-info');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      SoundFX.click();
      cards.forEach(c => c.classList.remove('highlighted'));
      card.classList.add('highlighted');

      const entity = card.dataset.entity;
      if (infoBox) {
        if (entity === 'APPLICATION') {
          infoBox.innerHTML = `
            <div class="callout callout-warning">
              <div>
                <strong>⚠️ Critical Architectural Rule: Composite Unique Constraint</strong><br>
                Database Schema: <code>CONSTRAINT uq_student_drive UNIQUE (student_id, drive_id);</code><br>
                This ensures even concurrent double-clicks or malicious duplicate POST requests are rejected by the database engine with an ACID guarantee.
              </div>
            </div>
          `;
        } else if (entity === 'PLACEMENT_DRIVE') {
          infoBox.innerHTML = `
            <div class="callout callout-info">
              <div>
                <strong>Drive Eligibility & Foreign Keys:</strong><br>
                Linked to <code>COMPANY (company_id)</code>. Contains business validation thresholds: <code>min_cgpa</code> and <code>deadline</code>. Students with lower CGPA are blocked by the Application Service before insertion.
              </div>
            </div>
          `;
        } else if (entity === 'COMPANY') {
          infoBox.innerHTML = `
            <div class="callout callout-info">
              <div>
                <strong>Company Profile Entity:</strong><br>
                Holds master company records (Name, Industry, Website). One company can conduct multiple drives across semesters (1-to-N relationship with PLACEMENT_DRIVE).
              </div>
            </div>
          `;
        } else if (entity === 'STUDENT') {
          infoBox.innerHTML = `
            <div class="callout callout-info">
              <div>
                <strong>Student Entity:</strong><br>
                Stores verified academic data (CGPA, Branch, Email). Immutable during the application process; eligibility is calculated against drive criteria in real time.
              </div>
            </div>
          `;
        }
      }
    });
  });
}

// LLD Pseudo-code Interactive Stepper
const LLD_SCENARIOS = {
  happy: {
    student: { name: 'Rahul Sharma', cgpa: 8.4 },
    drive: { company: 'Google', minCgpa: 8.0, deadline: '2026-11-30' },
    alreadyApplied: false,
    dateValid: true,
    expectedExitLine: 11,
    outcome: 'SUCCESS: "Application submitted successfully"'
  },
  low_cgpa: {
    student: { name: 'Priya Patel', cgpa: 7.2 },
    drive: { company: 'Microsoft', minCgpa: 8.5, deadline: '2026-12-05' },
    alreadyApplied: false,
    dateValid: true,
    expectedExitLine: 8,
    outcome: 'ERROR: "You do not meet eligibility criteria (CGPA 7.2 < 8.5)"'
  },
  deadline_passed: {
    student: { name: 'Rahul Sharma', cgpa: 8.4 },
    drive: { company: 'Expired Corp', minCgpa: 6.0, deadline: '2026-10-15' },
    alreadyApplied: false,
    dateValid: false,
    expectedExitLine: 7,
    outcome: 'ERROR: "Application deadline has passed"'
  },
  duplicate: {
    student: { name: 'Rahul Sharma', cgpa: 8.4 },
    drive: { company: 'Zomato', minCgpa: 7.0, deadline: '2026-11-25' },
    alreadyApplied: true,
    dateValid: true,
    expectedExitLine: 9,
    outcome: 'ERROR: "You have already applied to this drive"'
  }
};

let lldCurrentStep = 0;
let lldActiveScenarioKey = 'happy';

function initLLDStepper() {
  const scenarioSelect = document.getElementById('lld-scenario-select');
  const btnNext = document.getElementById('lld-btn-next');
  const btnReset = document.getElementById('lld-btn-reset');

  if (scenarioSelect) {
    scenarioSelect.addEventListener('change', (e) => {
      SoundFX.click();
      lldActiveScenarioKey = e.target.value;
      resetLLDStepper();
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      SoundFX.click();
      stepLLD();
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      SoundFX.click();
      resetLLDStepper();
    });
  }

  resetLLDStepper();
  initAPITabs();
}

function resetLLDStepper() {
  lldCurrentStep = 0;
  document.querySelectorAll('.code-line').forEach(line => {
    line.classList.remove('active-line', 'return-success', 'return-error');
  });

  const scen = LLD_SCENARIOS[lldActiveScenarioKey];
  updateLLDWatchVariables({
    studentId: 'std_01 (' + scen.student.name + ')',
    studentCGPA: scen.student.cgpa,
    driveId: 'drv_99 (' + scen.drive.company + ')',
    minCGPA: scen.drive.minCgpa,
    deadline: scen.drive.deadline,
    isExpired: !scen.dateValid,
    alreadyApplied: scen.alreadyApplied,
    execStatus: 'Ready to execute applyToDrive()'
  });

  const traceLog = document.getElementById('lld-trace-log');
  if (traceLog) traceLog.textContent = 'Click "Step Forward" to trace execution line-by-line.';
}

function stepLLD() {
  const scen = LLD_SCENARIOS[lldActiveScenarioKey];
  const lines = document.querySelectorAll('.code-line');
  if (lldCurrentStep >= lines.length) return;

  // Clear previous active
  lines.forEach(l => l.classList.remove('active-line'));

  lldCurrentStep++;
  const activeLine = document.querySelector(`.code-line[data-line="${lldCurrentStep}"]`);
  const traceLog = document.getElementById('lld-trace-log');

  if (activeLine) {
    activeLine.classList.add('active-line');
    activeLine.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Check exit conditions
  if (lldCurrentStep === scen.expectedExitLine) {
    if (scen.expectedExitLine === 11) {
      activeLine.classList.remove('active-line');
      activeLine.classList.add('return-success');
      SoundFX.success();
      if (traceLog) traceLog.innerHTML = `<span style="color: var(--emerald-400)">✔ ${scen.outcome}</span>`;
      showToast('Application successfully created (201 Created)', 'success');
    } else {
      activeLine.classList.remove('active-line');
      activeLine.classList.add('return-error');
      SoundFX.error();
      if (traceLog) traceLog.innerHTML = `<span style="color: var(--rose-400)">✖ ${scen.outcome}</span>`;
      showToast(scen.outcome, 'error');
    }
  } else if (lldCurrentStep < scen.expectedExitLine) {
    if (traceLog) traceLog.textContent = `Executed Line ${lldCurrentStep}: Validation passed, moving to next guard condition.`;
  }
}

function updateLLDWatchVariables(obj) {
  for (const key in obj) {
    const el = document.getElementById(`watch-${key}`);
    if (el) el.textContent = obj[key];
  }
}

// API Tabs
function initAPITabs() {
  const tabs = document.querySelectorAll('.api-tab-btn');
  const panels = document.querySelectorAll('.api-spec-body');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      SoundFX.click();
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.style.display = 'none');

      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.target);
      if (target) target.style.display = 'block';
    });
  });
}

// UI/UX 6 Screen States Explorer
const SCREEN_STATES_DATA = {
  login: {
    title: 'Screen 1: Login / Access Portal',
    desc: 'Dual-role university authentication gateway with instant student/admin switching and input validation.',
    states: {
      input: `
        <div style="max-width: 380px; margin: 2rem auto; text-align: center;">
          <div style="width: 50px; height: 50px; border-radius: 12px; background: linear-gradient(135deg, var(--indigo-600), var(--purple-600)); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.5rem;">🎓</div>
          <h3 style="margin-bottom: 0.25rem;">SPSU Placement Portal</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Single sign-on for students and CDC officers</p>
          <div class="form-group" style="text-align: left;">
            <label class="form-label">University Email</label>
            <input type="email" class="form-input" placeholder="e.g. rahul.s@spsu.ac.in" value="rahul.s@spsu.ac.in">
          </div>
          <div class="form-group" style="text-align: left;">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" placeholder="••••••••••••" value="password123">
          </div>
          <button class="btn btn-primary" style="width: 100%; margin-top: 0.75rem;">Sign In to Dashboard</button>
        </div>
      `,
      loading: `
        <div style="max-width: 380px; margin: 2rem auto; text-align: center;">
          <div class="skeleton-box" style="width: 50px; height: 50px; border-radius: 12px; margin: 0 auto 1rem;"></div>
          <div class="skeleton-box" style="width: 70%; height: 24px; margin: 0 auto 0.75rem;"></div>
          <div class="skeleton-box" style="width: 90%; height: 16px; margin: 0 auto 1.5rem;"></div>
          <div class="skeleton-box" style="width: 100%; height: 42px; margin-bottom: 1rem;"></div>
          <div class="skeleton-box" style="width: 100%; height: 42px; margin-bottom: 1rem;"></div>
          <div class="skeleton-box" style="width: 100%; height: 44px;"></div>
        </div>
      `,
      empty: `
        <div style="max-width: 380px; margin: 2rem auto; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">👤</div>
          <h3>No User Profile Found</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">The requested university roll number is not registered in the student master ledger.</p>
          <button class="btn btn-secondary">Contact CDC Helpdesk</button>
        </div>
      `,
      validation: `
        <div style="max-width: 380px; margin: 2rem auto; text-align: center;">
          <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(239, 68, 68, 0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.5rem;">⚠️</div>
          <h3 style="margin-bottom: 0.25rem;">Login Validation Failed</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Please correct the highlighted errors</p>
          <div class="form-group" style="text-align: left;">
            <label class="form-label">University Email</label>
            <input type="email" class="form-input is-invalid" value="rahul.invalid-email">
            <div class="form-feedback error">❌ Please enter a valid university domain email (@spsu.ac.in)</div>
          </div>
          <div class="form-group" style="text-align: left;">
            <label class="form-label">Password</label>
            <input type="password" class="form-input is-invalid" value="123">
            <div class="form-feedback error">❌ Password must be at least 8 characters</div>
          </div>
          <button class="btn btn-primary" style="width: 100%; margin-top: 0.75rem;" disabled>Sign In</button>
        </div>
      `,
      error: `
        <div style="max-width: 380px; margin: 2rem auto; text-align: center;">
          <div class="callout callout-danger" style="text-align: left; margin-bottom: 1.5rem;">
            <div>
              <strong>Authentication Error (HTTP 401)</strong><br>
              Invalid credentials provided. Account locked after 5 consecutive failed attempts. Please reset your password.
            </div>
          </div>
          <button class="btn btn-secondary" style="width: 100%;">Reset Password</button>
        </div>
      `,
      success: `
        <div style="max-width: 380px; margin: 2rem auto; text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
          <h3>Welcome Back, Rahul!</h3>
          <p style="font-size: 0.85rem; color: var(--emerald-400); margin-bottom: 1.25rem;">JWT session verified. Redirecting to Student Dashboard...</p>
          <div class="skeleton-box" style="width: 100%; height: 8px; border-radius: 4px;"></div>
        </div>
      `
    }
  },
  admin_dashboard: {
    title: 'Screen 2: Admin Placement Dashboard',
    desc: 'High-level executive metrics for CDC leaders: active drives, application volumes, shortlist rates, and recent actions.',
    states: {
      input: `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
              <h3>Placement Operations Hub</h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">SPSU Career Development Cell • 2026 Season</p>
            </div>
            <button class="btn btn-primary btn-sm">+ Launch Placement Drive</button>
          </div>
          <div class="grid-4" style="margin-bottom: 1.5rem;">
            <div class="stat-chip"><span class="chip-value">14</span><span class="chip-label">Active Drives</span></div>
            <div class="stat-chip"><span class="chip-value">482</span><span class="chip-label">Applications</span></div>
            <div class="stat-chip"><span class="chip-value">128</span><span class="chip-label">Shortlisted</span></div>
            <div class="stat-chip"><span class="chip-value">84.2%</span><span class="chip-label">Eligibility Rate</span></div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem;">
            <h4 style="margin-bottom: 0.75rem; font-size: 0.9rem;">Recent Placement Drives</h4>
            <div style="display: flex; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.85rem;">
              <span><strong>Google</strong> • SDE I</span>
              <span class="badge badge-emerald">24.5 LPA • Active</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.6rem 0; font-size: 0.85rem;">
              <span><strong>Microsoft</strong> • Cloud Solutions</span>
              <span class="badge badge-cyan">28.0 LPA • Active</span>
            </div>
          </div>
        </div>
      `,
      loading: `
        <div>
          <div class="skeleton-box" style="width: 40%; height: 28px; margin-bottom: 1.5rem;"></div>
          <div class="grid-4" style="margin-bottom: 1.5rem;">
            <div class="skeleton-box" style="height: 70px;"></div>
            <div class="skeleton-box" style="height: 70px;"></div>
            <div class="skeleton-box" style="height: 70px;"></div>
            <div class="skeleton-box" style="height: 70px;"></div>
          </div>
          <div class="skeleton-box" style="height: 180px;"></div>
        </div>
      `,
      empty: `
        <div style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
          <h3>No Placement Drives Created Yet</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 400px; margin: 0 auto 1.5rem;">Start by adding your first partnering company and creating an active drive with eligibility rules.</p>
          <button class="btn btn-primary">+ Create First Drive</button>
        </div>
      `,
      validation: `
        <div class="callout callout-warning">
          <div>
            <strong>Missing Configuration Alert:</strong><br>
            Current semester academic cutoff policies have not been updated. Automated CGPA validation will default to university standard 6.0.
          </div>
        </div>
      `,
      error: `
        <div class="callout callout-danger">
          <div>
            <strong>Failed to Load Placement Metrics (500 Internal Error):</strong><br>
            Analytics ingestion pipeline timed out. Showing cached offline data snapshot from 10 minutes ago.
          </div>
        </div>
      `,
      success: `
        <div class="callout callout-success">
          <div>
            <strong>Placement Drive Published Successfully!</strong><br>
            420 eligible candidates automatically notified via SMS & Email.
          </div>
        </div>
      `
    }
  },
  create_drive: {
    title: 'Screen 3: Create Placement Drive',
    desc: 'CDC Admin form for registering company drives, job role, package, minimum CGPA, and future deadline dates.',
    states: {
      input: `
        <div style="max-width: 520px; margin: 0 auto;">
          <h3 style="margin-bottom: 1.25rem;">Create Placement Drive</h3>
          <div class="form-group">
            <label class="form-label">Company Name <span class="required">*</span></label>
            <input type="text" class="form-input" placeholder="e.g. Google India Pvt. Ltd.">
          </div>
          <div class="form-group">
            <label class="form-label">Job Role <span class="required">*</span></label>
            <input type="text" class="form-input" placeholder="e.g. Software Engineer (Backend)">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Package (LPA) <span class="required">*</span></label>
              <input type="number" class="form-input" placeholder="e.g. 18.5" step="0.5">
            </div>
            <div class="form-group">
              <label class="form-label">Minimum CGPA <span class="required">*</span></label>
              <input type="number" class="form-input" placeholder="e.g. 7.5" step="0.1" min="0" max="10">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Application Deadline <span class="required">*</span></label>
            <input type="date" class="form-input" value="2026-11-30">
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
            <button class="btn btn-secondary">Cancel</button>
            <button class="btn btn-primary">Publish Placement Drive</button>
          </div>
        </div>
      `,
      loading: `
        <div style="max-width: 520px; margin: 0 auto;">
          <div class="skeleton-box" style="width: 50%; height: 26px; margin-bottom: 1.25rem;"></div>
          <div class="skeleton-box" style="height: 42px; margin-bottom: 1rem;"></div>
          <div class="skeleton-box" style="height: 42px; margin-bottom: 1rem;"></div>
          <div class="skeleton-box" style="height: 42px; margin-bottom: 1rem;"></div>
          <div class="skeleton-box" style="height: 42px; margin-bottom: 1.5rem;"></div>
          <div class="skeleton-box" style="width: 40%; height: 42px; margin-left: auto;"></div>
        </div>
      `,
      empty: `
        <div style="text-align: center; padding: 2rem;">
          <p style="color: var(--text-secondary);">Fill all mandatory fields marked with an asterisk to generate a drive invitation.</p>
        </div>
      `,
      validation: `
        <div style="max-width: 520px; margin: 0 auto;">
          <h3 style="margin-bottom: 1.25rem;">Create Placement Drive</h3>
          <div class="form-group">
            <label class="form-label">Company Name <span class="required">*</span></label>
            <input type="text" class="form-input is-invalid" value="">
            <div class="form-feedback error">❌ Company name is required.</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Minimum CGPA <span class="required">*</span></label>
              <input type="number" class="form-input is-invalid" value="11.5">
              <div class="form-feedback error">❌ Minimum CGPA must be between 0.0 and 10.0.</div>
            </div>
            <div class="form-group">
              <label class="form-label">Application Deadline <span class="required">*</span></label>
              <input type="date" class="form-input is-invalid" value="2024-01-01">
              <div class="form-feedback error">❌ Deadline must be a future date.</div>
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
            <button class="btn btn-primary" disabled>Publish Placement Drive</button>
          </div>
        </div>
      `,
      error: `
        <div class="callout callout-danger" style="max-width: 520px; margin: 0 auto;">
          <div>
            <strong>Database Constraint Violation (409 Conflict):</strong><br>
            A placement drive for this company and identical role is already active for this academic semester. Please edit the existing drive instead.
          </div>
        </div>
      `,
      success: `
        <div class="callout callout-success" style="max-width: 520px; margin: 0 auto; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎉</div>
          <h4>Placement Drive Created Successfully!</h4>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Drive ID: <code>drv_883</code> is now live in the student directory.</p>
        </div>
      `
    }
  },
  drive_listing: {
    title: 'Screen 4: Drive Listing / Opportunities',
    desc: 'Student-facing catalog of active company opportunities with search, CGPA filters, and real-time eligibility tags.',
    states: {
      input: `
        <div>
          <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem;">
            <input type="text" class="form-input" placeholder="🔍 Search company or role (e.g. SDE, Google)..." style="flex: 2;">
            <select class="form-select" style="flex: 1;">
              <option>All Eligibility</option>
              <option>Only Eligible for Me</option>
            </select>
          </div>
          <div class="grid-2">
            <div class="glass-card">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div>
                  <h4 style="font-size: 1.05rem;">Google</h4>
                  <div style="font-size: 0.82rem; color: var(--text-secondary);">Software Development Engineer I</div>
                </div>
                <span class="badge badge-emerald">Eligible (8.4 >= 8.0)</span>
              </div>
              <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.75rem;">Package: <strong>24.5 LPA</strong> • Deadline: <strong>30 Nov 2026</strong></div>
              <button class="btn btn-primary btn-sm" style="width: 100%;">Apply Now</button>
            </div>
            <div class="glass-card">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div>
                  <h4 style="font-size: 1.05rem;">Microsoft</h4>
                  <div style="font-size: 0.82rem; color: var(--text-secondary);">Cloud Solutions Associate</div>
                </div>
                <span class="badge badge-rose">Ineligible (Min 8.5 CGPA)</span>
              </div>
              <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.75rem;">Package: <strong>28.0 LPA</strong> • Deadline: <strong>05 Dec 2026</strong></div>
              <button class="btn btn-secondary btn-sm" style="width: 100%;" disabled>Criteria Not Met</button>
            </div>
          </div>
        </div>
      `,
      loading: `
        <div class="grid-2">
          <div class="skeleton-box" style="height: 140px;"></div>
          <div class="skeleton-box" style="height: 140px;"></div>
        </div>
      `,
      empty: `
        <div style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 0.75rem;">🔍</div>
          <h3>No Matching Drives Found</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Try clearing your search query or adjusting your minimum CGPA filter.</p>
        </div>
      `,
      validation: `
        <div class="callout callout-warning">
          <div>
            <strong>Filter Parameter Warning:</strong><br>
            Invalid CGPA filter value entered. Reset to default range (0.0 to 10.0).
          </div>
        </div>
      `,
      error: `
        <div class="callout callout-danger">
          <div>
            <strong>Failed to Fetch Opportunities:</strong><br>
            Placement Drive API returned HTTP 503 Service Unavailable. Retrying connection...
          </div>
        </div>
      `,
      success: `
        <div class="callout callout-success">
          <div>
            <strong>4 Opportunities Synchronized with University CDC Ledger</strong>
          </div>
        </div>
      `
    }
  },
  apply_screen: {
    title: 'Screen 5: Apply Screen / Confirmation Modal',
    desc: 'Pre-flight check modal displaying candidate profile, CGPA eligibility status, declaration, and one-click submission.',
    states: {
      input: `
        <div style="max-width: 460px; margin: 0 auto; background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem;">
          <h4 style="margin-bottom: 0.25rem;">Confirm Application: Google SDE I</h4>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">Review your profile before submitting</p>
          <div style="background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-md); padding: 0.75rem; font-size: 0.82rem; margin-bottom: 1rem;">
            <div>Candidate: <strong>Rahul Sharma</strong></div>
            <div>University CGPA: <strong>8.4 / 10.0</strong></div>
            <div>Eligibility Threshold: <strong>8.0 CGPA</strong> (Passed ✔)</div>
          </div>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.25rem;">Note: You may submit only one application per placement drive. Submissions cannot be revoked.</p>
          <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm">Cancel</button>
            <button class="btn btn-primary btn-sm">Confirm & Submit Application</button>
          </div>
        </div>
      `,
      loading: `
        <div style="max-width: 460px; margin: 0 auto;">
          <div class="skeleton-box" style="height: 200px;"></div>
        </div>
      `,
      empty: `
        <div style="text-align: center; padding: 2rem;">
          <p style="color: var(--text-secondary);">No drive selected for application.</p>
        </div>
      `,
      validation: `
        <div class="callout callout-warning" style="max-width: 460px; margin: 0 auto;">
          <div>
            <strong>Profile Verification Incomplete:</strong><br>
            Please upload your updated resume PDF in your profile settings before applying.
          </div>
        </div>
      `,
      error: `
        <div class="callout callout-danger" style="max-width: 460px; margin: 0 auto;">
          <div>
            <strong>Business Rule Rejection: Duplicate Application</strong><br>
            You have already applied for this placement drive on 01 Nov 2026. Duplicate submissions are strictly prevented.
          </div>
        </div>
      `,
      success: `
        <div class="callout callout-success" style="max-width: 460px; margin: 0 auto; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">✅</div>
          <h4>Application Submitted Successfully!</h4>
          <p style="font-size: 0.82rem; margin-top: 0.25rem;">Application Reference: <code>#APP-903-GOOG</code></p>
        </div>
      `
    }
  },
  application_status: {
    title: 'Screen 6: Application Status Tracker',
    desc: 'Live timeline stepper for students to monitor round-by-round outcomes: Applied -> Shortlisted -> Selected / Rejected.',
    states: {
      input: `
        <div style="max-width: 580px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <div>
              <h4>Google • SDE I</h4>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">Applied on 01 Nov 2026</div>
            </div>
            <span class="badge badge-cyan">Status: Shortlisted</span>
          </div>
          <div style="display: flex; justify-content: space-between; position: relative; margin: 2rem 0; text-align: center;">
            <div style="flex: 1;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--emerald-500); margin: 0 auto 0.4rem; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">✔</div>
              <div style="font-size: 0.75rem; font-weight: 700;">Applied</div>
            </div>
            <div style="flex: 1;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--cyan-500); margin: 0 auto 0.4rem; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">⏳</div>
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--cyan-400);">Shortlisted</div>
            </div>
            <div style="flex: 1;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: #334155; margin: 0 auto 0.4rem; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">3</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Technical Interview</div>
            </div>
            <div style="flex: 1;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: #334155; margin: 0 auto 0.4rem; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">4</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Final Outcome</div>
            </div>
          </div>
          <div class="callout callout-info">
            <div>
              <strong>Next Step Scheduled:</strong><br>
              Technical coding assessment link will be sent to <code>rahul.s@spsu.ac.in</code> on 08 Nov 2026.
            </div>
          </div>
        </div>
      `,
      loading: `
        <div style="max-width: 580px; margin: 0 auto;">
          <div class="skeleton-box" style="height: 180px;"></div>
        </div>
      `,
      empty: `
        <div style="text-align: center; padding: 2.5rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📂</div>
          <h4>No Active Applications</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">You have not applied to any placement drive yet.</p>
          <button class="btn btn-primary btn-sm">Explore Drives</button>
        </div>
      `,
      validation: `
        <div class="callout callout-warning" style="max-width: 580px; margin: 0 auto;">
          <div>
            <strong>Status Synchronization in Progress:</strong><br>
            CDC team is updating round results. Refresh page in 5 minutes for confirmed shortlist data.
          </div>
        </div>
      `,
      error: `
        <div style="max-width: 580px; margin: 0 auto;">
          <div class="callout callout-danger">
            <div>
              <strong>Application Status: Rejected</strong><br>
              Thank you for participating. You were not shortlisted for the technical interview round. You remain eligible to apply for other active campus drives.
            </div>
          </div>
        </div>
      `,
      success: `
        <div style="max-width: 580px; margin: 0 auto; text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🏆</div>
          <h3 style="color: var(--emerald-400);">Congratulations! You are Selected!</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.5rem 0 1rem;">Official placement offer letter issued by <strong>Google India</strong>.</p>
          <button class="btn btn-success btn-sm">Download Offer Letter (PDF)</button>
        </div>
      `
    }
  }
};

let currentScreenKey = 'login';
let currentScreenState = 'input';

function initScreenStatesExplorer() {
  const screenBtns = document.querySelectorAll('.screen-btn');
  const statePills = document.querySelectorAll('.state-pill');

  screenBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      SoundFX.click();
      screenBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentScreenKey = btn.dataset.screen;
      renderCurrentScreenState();
    });
  });

  statePills.forEach(pill => {
    pill.addEventListener('click', () => {
      SoundFX.click();
      statePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentScreenState = pill.dataset.state;
      renderCurrentScreenState();
    });
  });

  renderCurrentScreenState();
}

function renderCurrentScreenState() {
  const container = document.getElementById('device-screen-render');
  const titleEl = document.getElementById('screen-active-title');
  const descEl = document.getElementById('screen-active-desc');

  const screenObj = SCREEN_STATES_DATA[currentScreenKey];
  if (!screenObj || !container) return;

  if (titleEl) titleEl.textContent = screenObj.title;
  if (descEl) descEl.textContent = screenObj.desc;

  const content = screenObj.states[currentScreenState] || '<p>State not found</p>';
  container.innerHTML = content;
}

// Live Working CPDMS Prototype Simulator
function initLiveSimulator() {
  renderLiveStudentPortal();
  renderLiveAdminPortal();

  // Persona Switcher
  const btnStudentView = document.getElementById('sim-role-student');
  const btnAdminView = document.getElementById('sim-role-admin');
  const studentPortal = document.getElementById('sim-portal-student');
  const adminPortal = document.getElementById('sim-portal-admin');

  if (btnStudentView && btnAdminView) {
    btnStudentView.addEventListener('click', () => {
      SoundFX.click();
      btnStudentView.classList.add('active');
      btnAdminView.classList.remove('active');
      studentPortal.style.display = 'block';
      adminPortal.style.display = 'none';
      renderLiveStudentPortal();
    });

    btnAdminView.addEventListener('click', () => {
      SoundFX.click();
      btnAdminView.classList.add('active');
      btnStudentView.classList.remove('active');
      studentPortal.style.display = 'none';
      adminPortal.style.display = 'block';
      renderLiveAdminPortal();
    });
  }

  // Active Student Switcher
  const studentSelect = document.getElementById('sim-active-student-select');
  if (studentSelect) {
    studentSelect.addEventListener('change', (e) => {
      SoundFX.click();
      currentStudentId = e.target.value;
      renderLiveStudentPortal();
      showToast(`Switched active student to: ${studentSelect.options[studentSelect.selectedIndex].text}`, 'info');
    });
  }

  // Create Drive Modal & Form Handlers
  const openModalBtn = document.getElementById('btn-open-create-drive');
  const closeModalBtn = document.getElementById('btn-close-modal');
  const modalOverlay = document.getElementById('modal-create-drive');
  const form = document.getElementById('form-create-drive');

  if (openModalBtn && modalOverlay) {
    openModalBtn.addEventListener('click', () => {
      SoundFX.click();
      modalOverlay.classList.add('active');
    });
  }

  if (closeModalBtn && modalOverlay) {
    closeModalBtn.addEventListener('click', () => {
      SoundFX.click();
      modalOverlay.classList.remove('active');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAdminCreateDrive();
    });
  }

  // Reset Demo Data
  const resetBtn = document.getElementById('btn-reset-demo-db');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      SoundFX.click();
      store = DB.reset();
      renderLiveStudentPortal();
      renderLiveAdminPortal();
      showToast('Database reset to default championship demo state.', 'info');
    });
  }
}

function renderLiveStudentPortal() {
  const currentStudent = store.students.find(s => s.id === currentStudentId) || store.students[0];
  const profileCard = document.getElementById('student-live-profile');
  if (profileCard) {
    profileCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <h4 style="font-size: 1.1rem; color: #ffffff;">${currentStudent.name}</h4>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">${currentStudent.branch} • ${currentStudent.email}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted);">Current CGPA:</span>
          <span class="badge badge-indigo" style="font-size: 1rem; padding: 0.35rem 0.85rem;">${currentStudent.cgpa} / 10.0</span>
        </div>
      </div>
    `;
  }

  // Render Drives
  const drivesContainer = document.getElementById('student-drives-list');
  if (!drivesContainer) return;

  drivesContainer.innerHTML = '';
  const now = new Date().toISOString().split('T')[0];

  store.drives.forEach(drive => {
    const company = store.companies.find(c => c.id === drive.companyId) || { name: 'Company' };
    const hasApplied = store.applications.some(a => a.studentId === currentStudent.id && a.driveId === drive.id);
    const isCgpaEligible = currentStudent.cgpa >= drive.minCgpa;
    const isDeadlinePassed = now > drive.deadline;

    let badgeHtml = '';
    let btnHtml = '';

    if (hasApplied) {
      badgeHtml = `<span class="badge badge-cyan">Already Applied</span>`;
      btnHtml = `<button class="btn btn-secondary btn-sm" disabled>Applied ✔</button>`;
    } else if (isDeadlinePassed) {
      badgeHtml = `<span class="badge badge-rose">Deadline Expired</span>`;
      btnHtml = `<button class="btn btn-secondary btn-sm" disabled>Expired</button>`;
    } else if (!isCgpaEligible) {
      badgeHtml = `<span class="badge badge-rose">Ineligible (Min ${drive.minCgpa} CGPA)</span>`;
      btnHtml = `<button class="btn btn-secondary btn-sm" onclick="showEligibilityError('${drive.minCgpa}', '${currentStudent.cgpa}')">Check Criteria</button>`;
    } else {
      badgeHtml = `<span class="badge badge-emerald">Eligible to Apply</span>`;
      btnHtml = `<button class="btn btn-primary btn-sm" onclick="applyToDriveLive('${drive.id}')">Apply Now</button>`;
    }

    const card = document.createElement('div');
    card.className = 'glass-card';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
        <div>
          <h4 style="font-size: 1.1rem; color: #ffffff;">${company.name}</h4>
          <div style="font-size: 0.85rem; color: var(--indigo-400); font-weight: 600;">${drive.role}</div>
        </div>
        ${badgeHtml}
      </div>
      <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.5rem 0 1rem; line-height: 1.5;">${drive.description}</p>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 0.75rem; font-size: 0.8rem;">
        <div>
          <span>Package: <strong style="color: var(--emerald-400);">${drive.packageLpa} LPA</strong></span> • 
          <span>Min CGPA: <strong>${drive.minCgpa}</strong></span> • 
          <span>Deadline: <strong>${drive.deadline}</strong></span>
        </div>
        ${btnHtml}
      </div>
    `;
    drivesContainer.appendChild(card);
  });

  // Render My Applications Tracker
  const appsContainer = document.getElementById('student-my-applications');
  if (appsContainer) {
    const myApps = store.applications.filter(a => a.studentId === currentStudent.id);
    if (myApps.length === 0) {
      appsContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No applications submitted yet. Browse active placement drives above.
        </div>
      `;
    } else {
      appsContainer.innerHTML = '';
      myApps.forEach(app => {
        const drive = store.drives.find(d => d.id === app.driveId);
        const company = drive ? store.companies.find(c => c.id === drive.companyId) : null;
        const compName = company ? company.name : 'Company';
        const role = drive ? drive.role : 'Job Role';

        let statusBadge = 'badge-cyan';
        if (app.status === 'Selected') statusBadge = 'badge-emerald';
        if (app.status === 'Rejected') statusBadge = 'badge-rose';
        if (app.status === 'Shortlisted') statusBadge = 'badge-amber';

        const row = document.createElement('div');
        row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1rem; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); margin-bottom: 0.65rem;';
        row.innerHTML = `
          <div>
            <strong>${compName}</strong> — ${role}
            <div style="font-size: 0.75rem; color: var(--text-muted);">Application ID: <code>${app.id}</code> • Applied: ${app.appliedAt}</div>
          </div>
          <span class="badge ${statusBadge}">${app.status}</span>
        `;
        appsContainer.appendChild(row);
      });
    }
  }
}

function applyToDriveLive(driveId) {
  const currentStudent = store.students.find(s => s.id === currentStudentId);
  const drive = store.drives.find(d => d.id === driveId);
  if (!currentStudent || !drive) return;

  const now = new Date().toISOString().split('T')[0];

  // Business Rule Checks
  if (now > drive.deadline) {
    showToast('Error: Application deadline has passed.', 'error');
    return;
  }
  if (currentStudent.cgpa < drive.minCgpa) {
    showToast(`Eligibility Failed: Your CGPA (${currentStudent.cgpa}) is below required ${drive.minCgpa}.`, 'error');
    return;
  }
  const exists = store.applications.some(a => a.studentId === currentStudent.id && a.driveId === driveId);
  if (exists) {
    showToast('Database Rule: You have already applied for this placement drive.', 'error');
    return;
  }

  // Create Application
  const newApp = {
    id: 'app_' + Math.floor(100 + Math.random() * 900),
    studentId: currentStudent.id,
    driveId: drive.id,
    status: 'Applied',
    appliedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  store.applications.push(newApp);
  DB.save(store);
  renderLiveStudentPortal();
  renderLiveAdminPortal();
  showToast(`Application #${newApp.id} submitted successfully! CDC notified.`, 'success');
}

window.applyToDriveLive = applyToDriveLive;
window.showEligibilityError = function(min, curr) {
  showToast(`Eligibility Block: Minimum required CGPA is ${min}, but your current score is ${curr}.`, 'error');
};

function renderLiveAdminPortal() {
  const countDrives = store.drives.length;
  const countApps = store.applications.length;
  const countShortlisted = store.applications.filter(a => a.status === 'Shortlisted').length;
  const countSelected = store.applications.filter(a => a.status === 'Selected').length;

  const kpiDrives = document.getElementById('kpi-total-drives');
  const kpiApps = document.getElementById('kpi-total-apps');
  const kpiShort = document.getElementById('kpi-total-short');
  const kpiPlaced = document.getElementById('kpi-total-placed');

  if (kpiDrives) kpiDrives.textContent = countDrives;
  if (kpiApps) kpiApps.textContent = countApps;
  if (kpiShort) kpiShort.textContent = countShortlisted;
  if (kpiPlaced) kpiPlaced.textContent = countSelected;

  // Render Applications Table for Status Updating
  const tbody = document.getElementById('admin-apps-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (store.applications.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No applications received yet.</td></tr>';
    return;
  }

  store.applications.forEach(app => {
    const student = store.students.find(s => s.id === app.studentId) || { name: 'Unknown', branch: 'N/A', cgpa: 0 };
    const drive = store.drives.find(d => d.id === app.driveId);
    const company = drive ? store.companies.find(c => c.id === drive.companyId) : null;
    const compName = company ? company.name : 'Unknown';
    const role = drive ? drive.role : 'N/A';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong>${student.name}</strong><br>
        <span style="font-size: 0.75rem; color: var(--text-muted);">${student.branch} • CGPA: ${student.cgpa}</span>
      </td>
      <td>
        <strong>${compName}</strong><br>
        <span style="font-size: 0.75rem; color: var(--text-muted);">${role}</span>
      </td>
      <td><code>${app.appliedAt}</code></td>
      <td>
        <span class="badge ${app.status === 'Selected' ? 'badge-emerald' : app.status === 'Rejected' ? 'badge-rose' : 'badge-cyan'}">${app.status}</span>
      </td>
      <td>
        <select class="form-select" style="padding: 0.3rem 0.5rem; font-size: 0.78rem; width: auto;" onchange="updateApplicationStatusLive('${app.id}', this.value)">
          <option value="Applied" ${app.status === 'Applied' ? 'selected' : ''}>Applied</option>
          <option value="Shortlisted" ${app.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
          <option value="Selected" ${app.status === 'Selected' ? 'selected' : ''}>Selected</option>
          <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.updateApplicationStatusLive = function(appId, newStatus) {
  const app = store.applications.find(a => a.id === appId);
  if (!app) return;
  app.status = newStatus;
  DB.save(store);
  renderLiveAdminPortal();
  renderLiveStudentPortal();
  showToast(`Application #${appId} status updated to: "${newStatus}"`, 'info');
};

function handleAdminCreateDrive() {
  const compName = document.getElementById('input-drive-company').value.trim();
  const role = document.getElementById('input-drive-role').value.trim();
  const packageLpa = parseFloat(document.getElementById('input-drive-package').value);
  const minCgpa = parseFloat(document.getElementById('input-drive-cgpa').value);
  const deadline = document.getElementById('input-drive-deadline').value;
  const desc = document.getElementById('input-drive-desc').value.trim();

  // Field validations
  if (!compName) {
    showToast('Validation Error: Company name is required.', 'error');
    return;
  }
  if (!role) {
    showToast('Validation Error: Job role is required.', 'error');
    return;
  }
  if (isNaN(packageLpa) || packageLpa <= 0) {
    showToast('Validation Error: Package (LPA) must be a positive number.', 'error');
    return;
  }
  if (isNaN(minCgpa) || minCgpa < 0 || minCgpa > 10) {
    showToast('Validation Error: Minimum CGPA must be between 0.0 and 10.0.', 'error');
    return;
  }
  const now = new Date().toISOString().split('T')[0];
  if (!deadline || deadline <= now) {
    showToast('Validation Error: Deadline must be a future date.', 'error');
    return;
  }

  // Find or create company
  let company = store.companies.find(c => c.name.toLowerCase() === compName.toLowerCase());
  if (!company) {
    company = {
      id: 'comp_' + Math.floor(10 + Math.random() * 90),
      name: compName,
      industry: 'Campus Recruitment',
      website: 'https://' + compName.toLowerCase().replace(/\s+/g, '') + '.com'
    };
    store.companies.push(company);
  }

  // Create placement drive
  const newDrive = {
    id: 'drv_' + Math.floor(200 + Math.random() * 800),
    companyId: company.id,
    role: role,
    packageLpa: packageLpa,
    minCgpa: minCgpa,
    deadline: deadline,
    description: desc || 'Exciting career opportunity at ' + company.name
  };

  store.drives.unshift(newDrive);
  DB.save(store);

  // Close modal and reset form
  document.getElementById('modal-create-drive').classList.remove('active');
  document.getElementById('form-create-drive').reset();

  renderLiveAdminPortal();
  renderLiveStudentPortal();
  showToast(`Placement Drive for "${company.name} - ${role}" created successfully!`, 'success');
}

// Input -> Processing -> Output -> Error Matrix Testbed
function initMatrixTester() {
  const testBtn = document.getElementById('btn-run-matrix-test');
  if (!testBtn) return;

  testBtn.addEventListener('click', () => {
    SoundFX.click();
    const action = document.getElementById('matrix-test-action').value;
    const cgpa = parseFloat(document.getElementById('matrix-test-cgpa').value);
    const minCgpa = parseFloat(document.getElementById('matrix-test-mincgpa').value);
    const isDup = document.getElementById('matrix-test-duplicate').checked;
    const isExpired = document.getElementById('matrix-test-expired').checked;
    const outputEl = document.getElementById('matrix-test-result');

    let isSuccess = false;
    let message = '';

    if (action === 'apply') {
      if (isExpired) {
        message = 'HTTP 400 Bad Request: "Application deadline has passed."';
      } else if (cgpa < minCgpa) {
        message = `HTTP 422 Unprocessable Entity: "You do not meet eligibility criteria (Student CGPA ${cgpa} < Drive Cutoff ${minCgpa})."`;
      } else if (isDup) {
        message = 'HTTP 409 Conflict: "You have already applied. Duplicate application prevented by composite unique constraint."';
      } else {
        isSuccess = true;
        message = 'HTTP 201 Created: "Application submitted successfully. Application ID: APP-LIVE-TEST"';
      }
    } else {
      isSuccess = true;
      message = 'Operation executed successfully with HTTP 200 OK.';
    }

    if (outputEl) {
      outputEl.className = isSuccess ? 'callout callout-success' : 'callout callout-danger';
      outputEl.innerHTML = `<strong>${isSuccess ? '✔ SUCCESS' : '✖ BLOCKED BY RULE'}</strong><br>${message}`;
      outputEl.style.display = 'block';
    }

    if (isSuccess) SoundFX.success(); else SoundFX.error();
  });
}

// Interview Accordion Flip Cards
function initInterviewCards() {
  const cards = document.querySelectorAll('.interview-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      SoundFX.click();
      card.classList.toggle('open');
    });
  });
}

// LinkedIn Proof of Work Generator
function initLinkedInGenerator() {
  const nameInput = document.getElementById('li-user-name');
  const collegeInput = document.getElementById('li-user-college');
  const preview = document.getElementById('li-post-preview');
  const copyBtn = document.getElementById('btn-copy-linkedin');

  function updatePost() {
    const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Software Engineering Aspirant';
    const college = collegeInput && collegeInput.value.trim() ? collegeInput.value.trim() : 'SPSU Udaipur';

    const text = `DAY 10 | SPSU UDAIPUR CHAMPIONSHIP 🏆

Today's challenge was different.
Before writing code, I stepped into the role of a Software Engineer and designed a complete industry use case: a Campus Placement Drive Management System (CPDMS).

Engineered by: ${name} (${college})

I worked on:
🔹 HLD – Architected the decoupled microservices, API Gateway, CDN, and async Notification Queue
🔹 LLD – Defined strict REST API contracts and the applyToDrive() business rule validation engine
🔹 ER Diagram – Designed normalized tables with UNIQUE composite constraints on (student_id, drive_id)
🔹 UI/UX – Modeled 6 core screen states (Input, Loading, Empty, Validation, Error, and Success)
🔹 Error Matrix – Mapped every single edge case before touching implementation

One vital learning from today:
A good software solution is not just about the happy path.
A real product must answer:
• What happens when the user enters invalid CGPA or past deadlines?
• What happens when a student double-clicks the apply button?
• How do we scale database writes for 100,000 students without duplicates?

I am learning to build with code—but more importantly, I am learning to think like an engineer before I build.

#SPSUChampionship #Udaipur #SystemDesign #HLD #LLD #ERDiagram #UIUX #SoftwareEngineering #PlacementReadiness #LearningByDoing`;

    if (preview) preview.textContent = text;
  }

  if (nameInput) nameInput.addEventListener('input', updatePost);
  if (collegeInput) collegeInput.addEventListener('input', updatePost);
  updatePost();

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (preview) {
        navigator.clipboard.writeText(preview.textContent).then(() => {
          SoundFX.success();
          showToast('LinkedIn post copied to clipboard! Ready to publish.', 'success');
        }).catch(() => {
          showToast('Please select and copy the text manually.', 'info');
        });
      }
    });
  }
}

// Master Initialization on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  initNavigation();
  initHLDInteractive();
  initERDiagram();
  initLLDStepper();
  initScreenStatesExplorer();
  initLiveSimulator();
  initMatrixTester();
  initInterviewCards();
  initLinkedInGenerator();
});

