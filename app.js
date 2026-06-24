// ===== ROA-TIS Frontend — Stage 3: Live Interactive Dashboard =====
const API_BASE = 'http://127.0.0.1:5000/api';
let DEMO_MODE = false; // true when API is unreachable (e.g. GitHub Pages)

// ===== DEMO DATA (used when API is unreachable) =====
const DEMO_USERS = {
    authority: { username: 'authority', display_name: 'Maria K.', role: 'authority', territory_id: null },
    farmer: { username: 'farmer', display_name: 'Nikos P.', role: 'farmer', territory_id: 'elysian' },
    investor: { username: 'investor', display_name: 'Investor View', role: 'investor', territory_id: null },
    admin: { username: 'admin', display_name: 'Admin', role: 'authority', territory_id: null },
};

const DEMO_DASHBOARD = {
    kpis: { rti: 59.19, tars: 6.4, bsep: 81.8, budget_gap: 199.9 },
    prev_kpis: { rti: 55.0, tars: 7.0, bsep: 78.0, budget_gap: 185.0 },
    command_center: [
        { question: 'Where are we?', signal: '59.19 — RTI Composite', status: 'Transitional', action: 'Open Command →' },
        { question: 'What is deteriorating?', signal: 'Control Center bottleneck', status: 'Insufficient Data', action: 'Review Actions →' },
        { question: 'What is improving?', signal: 'Fire buffer & early warning', status: 'PASS', action: 'Open Investment →' },
        { question: 'What should we do next?', signal: 'Review Control Center bottleneck', status: 'Insufficient Data', action: 'Prioritize →' },
        { question: 'What must be escalated now?', signal: 'BSEP Score: 81.8', status: 'Emergency Escalation', action: 'Escalate →' },
    ],
    priorities: [
        { domain: 'Budget', signal: 'Severe discounting — €199.9M gap', score: 100 },
        { domain: 'Command', signal: 'Review Control Center bottleneck', score: 100 },
        { domain: 'Investment', signal: 'Fire buffer and early warning network', score: 80 },
        { domain: 'Scientific Audit', signal: 'Strengthen external validation', score: 80 },
        { domain: 'Control', signal: 'Stabilize lever propagation', score: 60 },
        { domain: 'Futures', signal: 'Compare temporal burden — Forward Heavy', score: 60 },
    ],
};

const DEMO_TRAJECTORY = {
    labels: ['1965', '1975', '1985', '1995', '2005', '2015', '2025'],
    stewardship_capacity: [95, 90, 85, 70, 60, 55, 88],
    ecological_equilibrium: [90, 85, 80, 65, 55, 50, 92],
    wildlife_balance: [88, 82, 75, 60, 50, 45, 82],
    soil_organic_matter: [85, 80, 70, 55, 45, 40, 80],
    population_index: [92, 88, 78, 62, 48, 38, 90],
};

const DEMO_COMPARISON = [
    { territory_id: 'elysian', name: 'Elysian EVOO', rti: 59.19 },
    { territory_id: 'sella', name: 'Sella', rti: 62.5 },
    { territory_id: 'kastritsi', name: 'Kastritsi', rti: 58.3 },
    { territory_id: 'wgreece', name: 'Western Greece', rti: 55.8 },
    { territory_id: 'chalandritsa', name: 'Chalandritsa', rti: 61.2 },
    { territory_id: 'messinia', name: 'Messinia', rti: 64.7 },
    { territory_id: 'crete', name: 'Crete', rti: 67.1 },
    { territory_id: 'andalusia', name: 'Andalusia', rti: 71.4 },
    { territory_id: 'tuscany', name: 'Tuscany', rti: 73.8 },
    { territory_id: 'alentejo', name: 'Alentejo', rti: 60.5 },
];

const DEMO_ENGINES = {
    rti: { score: 59.19, confidence: 'A', stewardship_capacity: 88, ecological_literacy: 92, wildlife_balance: 82, pollinator_index: 90, soil_organic_matter: 3.8, habitat_connectivity: 86 },
    tars: { score: 6.4, wildfire_events: 1, flood_events: 1, pest_events: 1, drought_days: 38, heatwave_days: 22, years_since_event: 0, status: 'MONITOR' },
    opci: { score: 78.6, productive_pct: 68, tree_vitality: 92, avg_trunk_perimeter: 298, yield_per_tree: 4.2, regenerative_inputs: 31, organic_certified: 100 },
    bsep: { score: 81.8, categories: 'CS / RTC / II', escalation_level: 'Emergency', recovery_target_years: 15, current_recovery_pct: 100, human_capital_risk: 'HIGH', succession_plan: 'Unknown' },
    caii: { score: 61.3, community_governance: 49.3, human_capital: 50.1, social_collaboration: 50.4, territorial_intelligence: 43.1, ai_assisted_ti: 40.8, asset_optimization: 61.3, triggered_missions: 7 },
    fsd: { budget_gap: 199900000, budget_ratio: 0.625, budget_scenario: 'Ecological Recovery', budget_urgency: 5, budget_scientific_need: 259900000 },
};

const DEMO_FARM = {
    farm_id: 'farm-elysian', name: 'Elysian EVOO', territory_id: 'elysian',
    area_ha: 7.5, total_trees: 1230, altitude_m: 320,
    production: { total_kg: 6500, oil_liters: 1632, extraction_rate: 23.0, quality_score: 80.9, acidity: 0.18, carbon_stored_tco2: 238 },
};

const DEMO_WORKINGS = [
    { day: 1, task_type: 'irrigation', description: 'Irrigation check' },
    { day: 2, task_type: 'pruning', description: 'Summer pruning' },
    { day: 3, task_type: 'pruning', description: 'Summer pruning' },
    { day: 4, task_type: 'monitoring', description: 'Pest monitoring' },
    { day: 5, task_type: 'soil', description: 'Soil moisture check' },
    { day: 8, task_type: 'irrigation', description: 'Irrigation cycle' },
    { day: 9, task_type: 'monitoring', description: 'Olive fly trap check' },
    { day: 10, task_type: 'soil', description: 'Weed management' },
    { day: 16, task_type: 'fire', description: 'Fire risk patrol' },
    { day: 17, task_type: 'monitoring', description: 'Growth monitoring' },
];

const DEMO_TERRITORIES = [
    { territory_id: 'elysian', name: 'Elysian EVOO', lat: 38.22, lon: 21.73 },
    { territory_id: 'sella', name: 'Sella', lat: 38.18, lon: 21.78 },
    { territory_id: 'kastritsi', name: 'Kastritsi', lat: 38.28, lon: 21.76 },
    { territory_id: 'wgreece', name: 'Western Greece', lat: 38.25, lon: 21.74 },
    { territory_id: 'chalandritsa', name: 'Chalandritsa', lat: 38.15, lon: 21.80 },
    { territory_id: 'messinia', name: 'Messinia', lat: 37.05, lon: 21.93 },
    { territory_id: 'crete', name: 'Crete', lat: 35.24, lon: 24.47 },
    { territory_id: 'andalusia', name: 'Andalusia', lat: 37.38, lon: -5.98 },
    { territory_id: 'tuscany', name: 'Tuscany', lat: 43.77, lon: 11.25 },
    { territory_id: 'alentejo', name: 'Alentejo', lat: 38.57, lon: -7.91 },
];

// Check API availability — sets DEMO_MODE
async function checkAPIAvailability() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
        clearTimeout(timeout);
        DEMO_MODE = !res.ok;
    } catch {
        DEMO_MODE = true;
    }
    if (DEMO_MODE) {
        console.log('ROA-TIS: API unreachable — running in DEMO MODE (static data)');
    }
    return DEMO_MODE;
}

// ===== AUTH & RBAC =====
let currentUser = JSON.parse(localStorage.getItem('roatis_user') || 'null');

const ROLE_TABS = {
    authority: ['dashboard', 'map', 'compare', 'farmer', 'engines', 'investor', 'architecture', 'api'],
    farmer: ['farmer', 'dashboard', 'map', 'engines'],
    investor: ['investor', 'dashboard', 'map', 'compare', 'architecture'],
};

function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
}

function showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = '';

    // Update user badge
    const badge = document.getElementById('user-badge');
    const display = document.getElementById('user-display');
    const roleTag = document.getElementById('user-role-tag');
    if (display) display.textContent = currentUser.display_name || currentUser.username;
    if (roleTag) {
        roleTag.textContent = currentUser.role;
        roleTag.className = `role-tag ${currentUser.role}`;
    }

    // Apply RBAC: show/hide tabs based on role
    const allowedTabs = ROLE_TABS[currentUser.role] || ROLE_TABS.authority;
    document.querySelectorAll('.nav-tab').forEach(tab => {
        const view = tab.dataset.view;
        if (allowedTabs.includes(view)) {
            tab.style.display = '';
        } else {
            tab.style.display = 'none';
        }
    });

    // Set default active tab to first allowed
    const defaultView = allowedTabs[0];
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const defaultTab = document.querySelector(`.nav-tab[data-view="${defaultView}"]`);
    if (defaultTab) defaultTab.classList.add('active');
    const defaultViewEl = document.getElementById(`view-${defaultView}`);
    if (defaultViewEl) defaultViewEl.classList.add('active');

    // If farmer role, lock territory to their assigned one
    if (currentUser.role === 'farmer' && currentUser.territory_id) {
        TERRITORY = currentUser.territory_id;
        FARM = `farm-${TERRITORY}`;
        const terrSel = document.getElementById('territory-select');
        if (terrSel) { terrSel.value = TERRITORY; terrSel.disabled = true; }
    } else {
        const terrSel = document.getElementById('territory-select');
        if (terrSel) terrSel.disabled = false;
    }
}

async function doLogin(username, password) {
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = '';

    // DEMO MODE: bypass API, use static user data
    if (DEMO_MODE) {
        const demoUser = DEMO_USERS[username];
        if (demoUser) {
            currentUser = demoUser;
            localStorage.setItem('roatis_user', JSON.stringify(demoUser));
            showApp();
            loadAllData();
        } else {
            errorEl.textContent = 'Demo mode: use authority, farmer, or investor';
        }
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) {
            errorEl.textContent = data.error || 'Login failed';
            return;
        }
        currentUser = data;
        localStorage.setItem('roatis_user', JSON.stringify(data));
        showApp();
        loadAllData();
    } catch {
        errorEl.textContent = 'Cannot connect to server';
    }
}

function doLogout() {
    currentUser = null;
    localStorage.removeItem('roatis_user');
    showLogin();
}

// Login form handler
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    doLogin(username, password);
});

// Demo account buttons
document.querySelectorAll('.demo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        doLogin(btn.dataset.user, btn.dataset.pass);
    });
});

// Logout button
document.getElementById('btn-logout')?.addEventListener('click', doLogout);

// ===== STATE (reactive — persisted in localStorage) =====
let TERRITORY = localStorage.getItem('roatis_territory') || 'elysian';
let YEAR = parseInt(localStorage.getItem('roatis_year')) || 2025;
let FARM = `farm-${TERRITORY}`;

// Chart instances (for destroy/rebuild on data change)
let trajectoryChart = null;
let comparisonChart = null;

// ===== VIEW SWITCHING =====
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('view-' + tab.dataset.view).classList.add('active');
    });
});

// ===== DATA FETCHING =====
async function fetchJSON(endpoint) {
    // In DEMO MODE, return static demo data based on endpoint pattern
    if (DEMO_MODE) {
        if (endpoint.includes('/dashboard/')) return DEMO_DASHBOARD;
        if (endpoint.includes('/trajectory/')) return DEMO_TRAJECTORY;
        if (endpoint.includes('/comparison/')) return DEMO_COMPARISON;
        if (endpoint.includes('/engines/')) return DEMO_ENGINES;
        if (endpoint.includes('/observations')) return [];
        if (endpoint.includes('/workings')) return DEMO_WORKINGS;
        if (endpoint.includes('/farm/')) return DEMO_FARM;
        if (endpoint.includes('/territories/scores')) return DEMO_COMPARISON;
        if (endpoint.includes('/territories')) return DEMO_TERRITORIES;
        if (endpoint.includes('/audit-log')) return [];
        return {};
    }
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

// ===== MAIN DATA LOADER =====
async function loadAllData() {
    const statusDot = document.getElementById('api-status');
    const loader = document.getElementById('loading-overlay');
    if (loader) loader.classList.remove('hidden');
    try {
        // Core territory data — dashboard may 404 for years without engine scores
        const [dashboard, trajectory, comparison, engines] = await Promise.all([
            fetchJSON(`/dashboard/${TERRITORY}/${YEAR}`).catch(() => null),
            fetchJSON(`/trajectory/${TERRITORY}`).catch(() => ({ labels: [], stewardship_capacity: [], ecological_equilibrium: [], wildlife_balance: [], soil_organic_matter: [], population_index: [] })),
            fetchJSON(`/comparison/${YEAR}`).catch(() => []),
            fetchJSON(`/engines/${TERRITORY}/${YEAR}`).catch(() => null),
        ]);

        // Farm data (may not exist for all territories)
        let farm = null;
        let workings = [];
        try {
            [farm, workings] = await Promise.all([
                fetchJSON(`/farm/${FARM}`),
                fetchJSON(`/farm/${FARM}/workings?month=${YEAR}-06`),
            ]);
        } catch { /* farm not seeded for this territory */ }

        if (dashboard) {
            updateKPIs(dashboard.kpis, engines, dashboard.prev_kpis);
            updateCommandCenter(dashboard.command_center);
            updatePriorities(dashboard.priorities);
        } else {
            updateKPIs({ rti: '—', tars: '—', bsep: '—', budget_gap: '—' }, null, null);
            updateCommandCenter([]);
            updatePriorities([]);
        }
        if (engines) updateEngineCards(engines);
        updateFarmerStats(farm);
        renderTrajectoryChart(trajectory);
        renderComparisonChart(comparison);
        renderRevenueChart(farm);
        renderCapitalChart();
        renderRoadmapChart();
        loadObservationHistory();

        if (statusDot) { statusDot.classList.add('online'); statusDot.classList.remove('offline'); }
        console.log(`ROA-TIS: Data loaded for ${TERRITORY} / ${YEAR}`);
    } catch (err) {
        console.error('ROA-TIS API Error:', err);
        if (statusDot) { statusDot.classList.remove('online'); statusDot.classList.add('offline'); }
        renderRevenueChart(null);
        renderCapitalChart();
        renderRoadmapChart();
    } finally {
        if (loader) loader.classList.add('hidden');
    }
}

// ===== TERRITORY & YEAR SELECTORS =====
document.getElementById('territory-select')?.addEventListener('change', (e) => {
    TERRITORY = e.target.value;
    FARM = `farm-${TERRITORY}`;
    localStorage.setItem('roatis_territory', TERRITORY);
    // Sync engine-select dropdown
    const engineSel = document.querySelector('.engine-select');
    if (engineSel) engineSel.value = TERRITORY;
    loadAllData();
});

document.getElementById('year-select')?.addEventListener('change', (e) => {
    YEAR = parseInt(e.target.value);
    localStorage.setItem('roatis_year', YEAR);
    loadAllData();
});

// ===== KPI UPDATES WITH CONFIDENCE =====
function updateKPIs(kpis, engines, prevKpis) {
    const noData = (v) => v === '—' || v === null || v === undefined;

    function trendArrow(curr, prev, invertBetter) {
        if (curr == null || prev == null) return '';
        const diff = curr - prev;
        if (Math.abs(diff) < 0.1) return '<span class="trend-arrow trend-flat">→</span>';
        const up = diff > 0;
        // For most KPIs up is good; for TARS and budget_gap, down is good
        const isGood = invertBetter ? !up : up;
        const cls = isGood ? 'trend-up' : 'trend-down';
        const arrow = up ? '↑' : '↓';
        return `<span class="trend-arrow ${cls}">${arrow} ${Math.abs(diff).toFixed(1)}</span>`;
    }

    // RTI
    const rtiVal = document.getElementById('kpi-rti-value');
    const rtiTrend = document.getElementById('kpi-rti-trend');
    const rtiConf = document.getElementById('kpi-rti-conf');
    if (rtiVal) {
        rtiVal.textContent = noData(kpis.rti) ? '—' : kpis.rti;
        rtiVal.className = 'kpi-value ' + (noData(kpis.rti) ? '' : kpis.rti >= 70 ? 'good' : kpis.rti >= 40 ? 'warning' : 'alert');
    }
    if (rtiTrend) rtiTrend.innerHTML = trendArrow(kpis.rti, prevKpis?.rti, false) + (engines?.rti?.confidence ? ` Confidence: ${engines.rti.confidence}` : '');
    if (rtiConf) rtiConf.innerHTML = engines?.rti?.confidence ? renderConfidenceBadge(engines.rti.confidence) : '';

    // TARS
    const tarsVal = document.getElementById('kpi-tars-value');
    const tarsTrend = document.getElementById('kpi-tars-trend');
    const tarsConf = document.getElementById('kpi-tars-conf');
    if (tarsVal) {
        tarsVal.textContent = noData(kpis.tars) ? '—' : kpis.tars;
        tarsVal.className = 'kpi-value ' + (noData(kpis.tars) ? '' : kpis.tars <= 5 ? 'good' : kpis.tars <= 10 ? 'warning' : 'alert');
    }
    if (tarsTrend) tarsTrend.innerHTML = trendArrow(kpis.tars, prevKpis?.tars, true) + ' ' + (engines?.tars?.status || '');
    if (tarsConf) tarsConf.innerHTML = engines?.tars?.status ? `<span class="conf-badge conf-${engines.tars.status.toLowerCase()}">${engines.tars.status}</span>` : '';

    // BSEP
    const bsepVal = document.getElementById('kpi-bsep-value');
    const bsepTrend = document.getElementById('kpi-bsep-trend');
    const bsepConf = document.getElementById('kpi-bsep-conf');
    if (bsepVal) {
        bsepVal.textContent = noData(kpis.bsep) ? '—' : kpis.bsep;
        bsepVal.className = 'kpi-value ' + (noData(kpis.bsep) ? '' : kpis.bsep >= 60 ? 'alert' : kpis.bsep >= 30 ? 'warning' : 'good');
    }
    if (bsepTrend) bsepTrend.innerHTML = trendArrow(kpis.bsep, prevKpis?.bsep, true) + ' ' + (engines?.bsep?.escalation || '');
    if (bsepConf) bsepConf.innerHTML = engines?.bsep?.escalation ? `<span class="conf-badge conf-${engines.bsep.escalation.toLowerCase()}">${engines.bsep.escalation}</span>` : '';

    // Budget
    const budgetVal = document.getElementById('kpi-budget-value');
    const budgetTrend = document.getElementById('kpi-budget-trend');
    const budgetConf = document.getElementById('kpi-budget-conf');
    if (budgetVal) {
        budgetVal.textContent = noData(kpis.budget_gap) ? '—' : `€${kpis.budget_gap}M`;
        budgetVal.className = 'kpi-value ' + (noData(kpis.budget_gap) ? '' : kpis.budget_gap > 150 ? 'alert' : kpis.budget_gap > 50 ? 'warning' : 'good');
    }
    if (budgetTrend) budgetTrend.innerHTML = trendArrow(kpis.budget_gap, prevKpis?.budget_gap, true) + ' ' + (engines?.budget?.scenario || '');
    if (budgetConf) budgetConf.innerHTML = engines?.budget?.urgency ? `<span class="conf-badge conf-urgency">Urgency: ${engines.budget.urgency}/5</span>` : '';
}

function renderConfidenceBadge(grade) {
    const colors = { A: '#2ecc71', B: '#f7b731', C: '#ff6b6b' };
    const labels = { A: 'High (field data)', B: 'Medium (partial data)', C: 'Low (estimated)' };
    return `<span class="conf-badge" style="background:${colors[grade] || '#666'}">${grade} \u2014 ${labels[grade] || 'Unknown'}</span>`;
}

// ===== COMMAND CENTER =====
function updateCommandCenter(commands) {
    const tbody = document.querySelector('.command-table tbody');
    if (!tbody) return;
    if (commands.length === 0) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#8899a6">No data for this year</td></tr>'; return; }
    const unique = commands.slice(0, 5);
    tbody.innerHTML = unique.map(cmd => {
        const badgeClass = cmd.status === 'Emergency Escalation' ? 'emergency' :
                          cmd.status === 'PASS' ? 'pass' :
                          cmd.status === 'Transitional' ? 'transitional' : 'insufficient';
        const isAlert = cmd.status === 'Emergency Escalation' ? 'class="row-alert"' : '';
        const target = getActionTarget(cmd.action_label);
        return `<tr ${isAlert}>
            <td>${cmd.question}</td>
            <td><strong>${cmd.live_signal}</strong></td>
            <td><span class="badge ${badgeClass}">${cmd.status}</span></td>
            <td><a href="#" class="action-link" data-target="${target}">${cmd.action_label}</a></td>
        </tr>`;
    }).join('');

    // Attach click handlers to action links
    tbody.querySelectorAll('.action-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.dataset.target;
            switchToView(target);
        });
    });
}

function getActionTarget(label) {
    if (label.includes('Command') || label.includes('Review')) return 'engines';
    if (label.includes('Investment')) return 'investor';
    if (label.includes('Prioritize')) return 'dashboard-priorities';
    if (label.includes('Escalate')) return 'engines';
    return 'engines';
}

function switchToView(target) {
    if (target === 'dashboard-priorities') {
        // Scroll to priority board within dashboard
        document.querySelector('#view-dashboard .priority-list')?.scrollIntoView({ behavior: 'smooth' });
        return;
    }
    // Switch tab
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const tab = document.querySelector(`.nav-tab[data-view="${target}"]`);
    if (tab) tab.classList.add('active');
    const view = document.getElementById(`view-${target}`);
    if (view) view.classList.add('active');
}

// ===== PRIORITIES =====
function updatePriorities(priorities) {
    const list = document.querySelector('#view-dashboard .priority-list');
    if (!list) return;
    if (priorities.length === 0) { list.innerHTML = '<p style="color:#8899a6;text-align:center">No priority data for this year</p>'; return; }
    const unique = priorities.slice(0, 6);
    list.innerHTML = unique.map(p => `
        <div class="priority-item ${p.severity}">
            <span class="priority-rank">${p.rank}</span>
            <div class="priority-content">
                <div class="priority-domain">${p.domain}</div>
                <div class="priority-signal">${p.signal}</div>
            </div>
            <span class="priority-score">${p.score}</span>
        </div>
    `).join('');
}

// ===== ENGINE CARDS =====
function updateEngineCards(engines) {
    const cards = document.querySelectorAll('.engine-card');
    if (cards.length < 6 || !engines) return;

    // RTI
    if (engines.rti) {
        cards[0].querySelector('.engine-score').textContent = engines.rti.score ?? '—';
        const rtiParams = cards[0].querySelectorAll('.param-val');
        if (engines.rti.params) {
            rtiParams[0].textContent = (engines.rti.params.stewardship_capacity ?? '—') + '%';
            rtiParams[1].textContent = (engines.rti.params.ecological_literacy ?? '—') + '%';
            rtiParams[2].textContent = (engines.rti.params.wildlife_balance ?? '—') + '%';
            rtiParams[3].textContent = (engines.rti.params.pollinator_index ?? '—') + '%';
            rtiParams[4].textContent = (engines.rti.params.soil_organic_matter ?? '—') + '%';
            rtiParams[5].textContent = (engines.rti.params.habitat_connectivity ?? '—') + '%';
        }
        cards[0].querySelector('.engine-confidence').innerHTML = engines.rti.confidence ? `Confidence: <strong>${engines.rti.confidence}</strong> ${renderConfidenceBadge(engines.rti.confidence)}` : '';
    }

    // TARS
    if (engines.tars) {
        cards[1].querySelector('.engine-score').textContent = engines.tars.score ?? '—';
        const tarsParams = cards[1].querySelectorAll('.param-val');
        if (engines.tars.params) {
            tarsParams[0].textContent = engines.tars.params.wildfire_events ?? '—';
            tarsParams[1].textContent = engines.tars.params.flood_events ?? '—';
            tarsParams[2].textContent = engines.tars.params.pest_disease ?? '—';
            tarsParams[3].textContent = engines.tars.params.drought_days ?? '—';
            tarsParams[4].textContent = engines.tars.params.heatwave_days ?? '—';
            tarsParams[5].textContent = engines.tars.params.years_since_event ?? '—';
        }
        cards[1].querySelector('.engine-confidence').innerHTML = engines.tars.status ? `Status: <span class="badge-inline ${engines.tars.status.toLowerCase()}">${engines.tars.status}</span>` : '';
    }

    // OPCI
    if (engines.opci) {
        cards[2].querySelector('.engine-score').textContent = engines.opci.score ?? '—';
        const opciParams = cards[2].querySelectorAll('.param-val');
        if (engines.opci.params) {
            opciParams[0].textContent = (engines.opci.params.productive_trees_pct ?? '—') + '%';
            opciParams[1].textContent = (engines.opci.params.tree_vitality ?? '—') + '%';
            opciParams[2].textContent = (engines.opci.params.avg_trunk_perimeter ?? '—') + ' cm';
            opciParams[3].textContent = (engines.opci.params.yield_per_tree ?? '—') + ' kg';
            opciParams[4].textContent = engines.opci.params.regenerative_inputs ?? '—';
        }
    }

    // BSEP
    if (engines.bsep) {
        cards[3].querySelector('.engine-score').textContent = engines.bsep.score ?? '—';
        const bsepParams = cards[3].querySelectorAll('.param-val');
        bsepParams[0].textContent = engines.bsep.category || '—';
        bsepParams[1].textContent = engines.bsep.escalation || '—';
        bsepParams[2].textContent = (engines.bsep.recovery_target_years ?? '—') + ' years';
        bsepParams[3].textContent = (engines.bsep.current_recovery_pct ?? '—') + '%';
        bsepParams[4].textContent = engines.bsep.human_capital_risk || '—';
    }

    // CAII
    if (engines.caii) {
        cards[4].querySelector('.engine-score').textContent = engines.caii.score ?? '—';
        const caiiParams = cards[4].querySelectorAll('.param-val');
        if (engines.caii.params) {
            caiiParams[0].textContent = engines.caii.params.community_governance ?? '—';
            caiiParams[1].textContent = engines.caii.params.human_capital ?? '—';
            caiiParams[2].textContent = engines.caii.params.social_collaboration ?? '—';
            caiiParams[3].textContent = engines.caii.params.territorial_intelligence ?? '—';
        }
    }

    // Budget
    if (engines.budget) {
        cards[5].querySelector('.engine-score').textContent = '€' + (engines.budget.gap ?? '—') + 'M';
        const budgetParams = cards[5].querySelectorAll('.param-val');
        budgetParams[0].textContent = '€' + (engines.budget.scientific_need ?? '—') + 'M';
        budgetParams[1].textContent = '€' + (engines.budget.current ?? '—') + 'M';
        budgetParams[2].textContent = engines.budget.discounting_ratio ?? '—';
        budgetParams[3].textContent = engines.budget.scenario ?? '—';
        budgetParams[4].textContent = (engines.budget.urgency ?? '—') + ' / 5';
    }
}

// ===== FARMER STATS =====
function updateFarmerStats(farmData) {
    const stats = document.querySelectorAll('.stat-row span:last-child');
    if (stats.length < 6 || !farmData || !farmData.latest_production) return;
    const p = farmData.latest_production;
    stats[0].textContent = p.olive_harvest_kg.toLocaleString() + ' kg';
    stats[1].textContent = p.oil_extracted_l.toLocaleString() + ' L';
    stats[2].textContent = p.extraction_rate_pct + '%';
    stats[3].textContent = p.evoo_quality_score + ' / 100';
    stats[4].textContent = p.acidity_pct + '%';
    stats[5].textContent = p.carbon_stored_tco2 + ' tCO\u2082';
}

// ===== CHART RENDERERS =====
function renderTrajectoryChart(data) {
    const ctx = document.getElementById('trajectoryChart');
    if (!ctx) return;
    if (trajectoryChart) trajectoryChart.destroy();
    if (!data || !data.labels || data.labels.length === 0) {
        ctx.parentElement.querySelector('.no-data-msg')?.remove();
        const msg = document.createElement('p');
        msg.className = 'no-data-msg';
        msg.style.cssText = 'color:#8899a6;text-align:center;padding:24px;font-size:14px;';
        msg.textContent = 'No trajectory data available for this territory.';
        ctx.style.display = 'none';
        ctx.parentElement.appendChild(msg);
        return;
    }
    ctx.style.display = '';
    ctx.parentElement.querySelector('.no-data-msg')?.remove();
    trajectoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                { label: 'Stewardship Capacity %', data: data.stewardship_capacity, borderColor: '#4ecdc4', backgroundColor: 'rgba(78,205,196,0.1)', fill: true, tension: 0.3 },
                { label: 'Ecological Equilibrium', data: data.ecological_equilibrium, borderColor: '#2ecc71', backgroundColor: 'rgba(46,204,113,0.05)', fill: true, tension: 0.3 },
                { label: 'Wildlife Balance %', data: data.wildlife_balance, borderColor: '#bb8fce', tension: 0.3 },
                { label: 'Soil Organic Matter (x20)', data: data.soil_organic_matter, borderColor: '#d4a855', tension: 0.3 },
                { label: 'Population (indexed)', data: data.population_index, borderColor: '#ff6b6b', borderDash: [5,5], tension: 0.3 },
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 2.5,
            plugins: { legend: { position: 'bottom', labels: { color: '#8899a6', boxWidth: 12, padding: 16, font: { size: 11 } } } },
            scales: {
                x: { ticks: { color: '#8899a6' }, grid: { color: '#1e2730' } },
                y: { min: 0, max: 100, ticks: { color: '#8899a6' }, grid: { color: '#1e2730' } }
            }
        }
    });
}

function renderComparisonChart(data) {
    const ctx = document.getElementById('roaComparisonChart');
    if (!ctx) return;
    if (comparisonChart) comparisonChart.destroy();
    if (!data || !data.labels || data.labels.length === 0) return;
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                { label: 'RTI (Regenerative Index)', data: data.rti, backgroundColor: 'rgba(78,205,196,0.7)', borderRadius: 4 },
                { label: 'TARS (Risk Score)', data: data.tars, backgroundColor: 'rgba(255,107,107,0.7)', borderRadius: 4 },
                { label: 'OPCI (Productive Capacity)', data: data.opci, backgroundColor: 'rgba(247,183,49,0.7)', borderRadius: 4 },
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 3,
            plugins: { legend: { position: 'bottom', labels: { color: '#8899a6', boxWidth: 12, padding: 16, font: { size: 11 } } } },
            scales: {
                x: { ticks: { color: '#8899a6', font: { size: 11 } }, grid: { display: false } },
                y: { min: 0, max: 100, ticks: { color: '#8899a6' }, grid: { color: '#1e2730' } }
            }
        }
    });
}

function renderRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2026','2028','2030','2032','2034','2036','2038','2040','2041'],
            datasets: [
                { label: 'Conservative', data: [0.2,1.5,5,12,22,35,50,65,72], borderColor: '#8899a6', backgroundColor: 'rgba(136,153,166,0.05)', fill: true, tension: 0.3 },
                { label: 'Moderate', data: [0.3,2.5,10,25,42,60,80,95,105], borderColor: '#4ecdc4', backgroundColor: 'rgba(78,205,196,0.05)', fill: true, tension: 0.3 },
                { label: 'Ambitious', data: [0.5,4,18,40,65,95,120,140,155], borderColor: '#f7b731', backgroundColor: 'rgba(247,183,49,0.05)', fill: true, tension: 0.3 },
                { label: 'Transformational', data: [0.8,6,28,60,100,145,190,235,260], borderColor: '#ff6b6b', backgroundColor: 'rgba(255,107,107,0.05)', fill: true, tension: 0.3 },
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 2.5,
            plugins: { legend: { position: 'bottom', labels: { color: '#8899a6', boxWidth: 12, padding: 16, font: { size: 11 } } } },
            scales: {
                x: { ticks: { color: '#8899a6' }, grid: { color: '#1e2730' } },
                y: { ticks: { color: '#8899a6', callback: v => '\u20AC' + v + 'M' }, grid: { color: '#1e2730' } }
            }
        }
    });
}

function renderCapitalChart() {
    const ctx = document.getElementById('capitalChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Conservative','Moderate','Ambitious','Transformational'],
            datasets: [{ label: 'Capital Requirement (\u20ACM)', data: [3,8,24,70], backgroundColor: ['rgba(136,153,166,0.6)','rgba(78,205,196,0.6)','rgba(247,183,49,0.6)','rgba(255,107,107,0.6)'], borderRadius: 6 }]
        },
        options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 2,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#8899a6' }, grid: { display: false } },
                y: { ticks: { color: '#8899a6', callback: v => '\u20AC' + v + 'M' }, grid: { color: '#1e2730' } }
            }
        }
    });
}

function renderRoadmapChart() {
    const ctx = document.getElementById('roadmapChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Phase 1: Ingestion','Phase 2: Algorithmic Hardening','Phase 3: Closed-Loop Automation','Phase 4: RBAC & APIs','Phase 5: Cross-Border Scaling'],
            datasets: [{ label: 'Duration (months)', data: [6,6,12,6,6], backgroundColor: ['rgba(78,205,196,0.6)','rgba(93,173,226,0.6)','rgba(247,183,49,0.6)','rgba(187,143,206,0.6)','rgba(255,107,107,0.6)'], borderRadius: 6 }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: true, aspectRatio: 3,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#8899a6', callback: v => v + ' mo' }, grid: { color: '#1e2730' }, max: 14 },
                y: { ticks: { color: '#8899a6', font: { size: 12 } }, grid: { display: false } }
            }
        }
    });
}

// ===== OBSERVATION FORM =====
document.getElementById('btn-submit-obs')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const btn = e.target;

    // DEMO MODE: show feedback, don't call API
    if (DEMO_MODE) {
        showFeedback('Demo mode — observation recorded locally (not saved to server).', 'success');
        toast('Demo: Observation recorded', 'success');
        return;
    }

    const obsType = document.getElementById('obs-type')?.value || 'general';
    const obsDate = document.getElementById('obs-date')?.value || new Date().toISOString().slice(0, 10);
    const description = document.getElementById('obs-description')?.value || '';
    const bufferClear = document.getElementById('obs-buffer')?.checked || false;
    const pathsPassable = document.getElementById('obs-paths')?.checked || false;
    const noIgnition = document.getElementById('obs-ignition')?.checked || false;

    if (!description.trim()) {
        showFeedback('Please describe your observation.', 'error');
        return;
    }

    const payload = {
        date: obsDate,
        observation_type: obsType,
        description: description,
        buffer_zone_clear: bufferClear,
        access_paths_passable: pathsPassable,
        no_ignition_risk: noIgnition,
        photo: obsPhotoBase64 || null,
        observer: currentUser?.username || 'unknown',
    };

    btn.disabled = true;
    btn.textContent = 'Submitting...';

    try {
        const res = await fetch(`${API_BASE}/farm/${FARM}/observations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            showFeedback('Observation saved! Recalculating engines...', 'success');
            toast('Observation saved successfully', 'success');
            // Clear form
            if (document.getElementById('obs-description')) document.getElementById('obs-description').value = '';
            if (document.getElementById('obs-buffer')) document.getElementById('obs-buffer').checked = false;
            if (document.getElementById('obs-paths')) document.getElementById('obs-paths').checked = false;
            if (document.getElementById('obs-ignition')) document.getElementById('obs-ignition').checked = false;
            if (document.getElementById('obs-photo')) document.getElementById('obs-photo').value = '';
            if (document.getElementById('obs-photo-preview')) document.getElementById('obs-photo-preview').style.display = 'none';
            obsPhotoBase64 = null;

            // Auto-recalculate after observation
            await fetch(`${API_BASE}/recalculate/${TERRITORY}/${YEAR}`, { method: 'POST' });

            // Reload dashboard data
            const [dashboard, engines] = await Promise.all([
                fetchJSON(`/dashboard/${TERRITORY}/${YEAR}`),
                fetchJSON(`/engines/${TERRITORY}/${YEAR}`),
            ]);
            updateKPIs(dashboard.kpis, engines, dashboard.prev_kpis);
            updateEngineCards(engines);
            loadObservationHistory();

            showFeedback('Engines recalculated with new observation data.', 'success');
            btn.textContent = 'Submit Observation';
        } else {
            showFeedback('Error saving observation.', 'error');
            btn.textContent = 'Submit Observation';
        }
    } catch {
        showFeedback('API unavailable. Is the server running?', 'error');
        btn.textContent = 'Submit Observation';
    }
    btn.disabled = false;
});

function showFeedback(message, type) {
    const fb = document.getElementById('obs-feedback');
    if (!fb) return;
    fb.textContent = message;
    fb.className = 'obs-feedback ' + type;
    setTimeout(() => { fb.textContent = ''; fb.className = 'obs-feedback'; }, 4000);
}

// ===== OBSERVATION HISTORY =====
async function loadObservationHistory() {
    const container = document.getElementById('obs-history');
    if (!container) return;
    try {
        const obs = await fetchJSON(`/farm/${FARM}/observations`);
        if (obs.length === 0) {
            container.innerHTML = '<p class="obs-empty">No observations recorded yet.</p>';
            return;
        }
        container.innerHTML = `
            <h5>Recent Observations</h5>
            <div class="obs-list">
                ${obs.slice(0, 5).map(o => `
                    <div class="obs-entry">
                        <span class="obs-date">${o.date}</span>
                        <span class="obs-type-tag">${o.observation_type || 'general'}</span>
                        <span class="obs-desc">${o.description || '(no description)'}</span>
                    </div>
                `).join('')}
            </div>
        `;
    } catch {
        container.innerHTML = '';
    }
}

// ===== RECOMPUTE BUTTON =====
document.querySelector('.btn-compute')?.addEventListener('click', async (e) => {
    const btn = e.target;
    btn.textContent = '\u21BB Running all engines...';
    btn.style.opacity = '0.7';

    // DEMO MODE: simulate recompute
    if (DEMO_MODE) {
        setTimeout(() => {
            btn.textContent = '✓ Engines recomputed (demo)';
            btn.style.opacity = '1';
            toast('Demo: Engines recomputed', 'success');
            setTimeout(() => { btn.textContent = '\u21BB Recompute All Engines'; btn.style.background = '#4ecdc4'; }, 2000);
        }, 1000);
        return;
    }

    try {
        const recalcRes = await fetch(`${API_BASE}/recalculate/${TERRITORY}/${YEAR}`, { method: 'POST' });
        if (recalcRes.status === 404) {
            btn.textContent = '\u26A0 No trajectory data for this territory';
            btn.style.background = '#f7b731';
            btn.style.opacity = '1';
            setTimeout(() => { btn.textContent = '\u21BB Recompute All Engines'; btn.style.background = '#4ecdc4'; btn.style.opacity = '1'; }, 3000);
            return;
        }
        if (!recalcRes.ok) throw new Error('Recalculate failed');

        const [dashboard, engines] = await Promise.all([
            fetchJSON(`/dashboard/${TERRITORY}/${YEAR}`),
            fetchJSON(`/engines/${TERRITORY}/${YEAR}`),
        ]);

        updateKPIs(dashboard.kpis, engines, dashboard.prev_kpis);
        updateEngineCards(engines);
        btn.textContent = '\u2713 All engines recalculated';
        btn.style.opacity = '1';
        btn.style.background = '#2ecc71';
    } catch {
        btn.textContent = '\u2717 Recalculation error';
        btn.style.background = '#e74c3c';
    }
    setTimeout(() => { btn.textContent = '\u21BB Recompute All Engines'; btn.style.background = '#4ecdc4'; btn.style.opacity = '1'; }, 3000);
});

// ===== SET DEFAULT DATE & LOAD =====
document.addEventListener('DOMContentLoaded', async () => {
    const dateInput = document.getElementById('obs-date');
    if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

    // Check if API is available (sets DEMO_MODE)
    await checkAPIAvailability();

    // Show demo banner if in demo mode
    if (DEMO_MODE) {
        const banner = document.getElementById('alert-banner');
        const bannerText = document.getElementById('alert-banner-text');
        if (banner && bannerText) {
            bannerText.innerHTML = '<strong>DEMO MODE</strong> — Running with static data. Connect to API server for live data.';
            banner.style.display = 'flex';
            banner.style.background = 'linear-gradient(90deg, #2d3436 0%, #636e72 100%)';
        }
    }

    // Check if user is already logged in
    if (currentUser) {
        showApp();
        // Restore saved selections to dropdowns
        const terrSel = document.getElementById('territory-select');
        const yearSel = document.getElementById('year-select');
        const engineSel = document.querySelector('.engine-select');
        if (terrSel) terrSel.value = TERRITORY;
        if (yearSel) yearSel.value = YEAR;
        if (engineSel) engineSel.value = TERRITORY;
        loadAllData();
    } else {
        showLogin();
    }
});

// ===== ALERT BANNER — View Routing =====
document.querySelector('.alert-action')?.addEventListener('click', () => {
    switchToView('engines');
});

// ===== FARMER NAV ITEMS =====
document.querySelectorAll('.farmer-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.farmer-nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const label = item.textContent.trim();
        const expensesPanel = document.getElementById('expenses-panel');
        const farmerMain = document.querySelector('.farmer-main');
        // Show/hide expenses panel, toggle main content visibility
        if (label === 'Expenses') {
            if (expensesPanel) expensesPanel.style.display = 'block';
            // Hide other farmer content
            farmerMain.querySelectorAll(':scope > *:not(#expenses-panel)').forEach(el => el.style.display = 'none');
            // Update expenses with current year
            const yearSpan = document.getElementById('expenses-year');
            if (yearSpan) yearSpan.textContent = YEAR;
        } else {
            if (expensesPanel) expensesPanel.style.display = 'none';
            farmerMain.querySelectorAll(':scope > *:not(#expenses-panel)').forEach(el => el.style.display = '');
            if (label === 'Data Entry') {
                document.querySelector('.today-observation')?.scrollIntoView({ behavior: 'smooth' });
            } else if (label === 'My Grove Health') {
                switchToView('engines');
            } else if (label === 'Alerts') {
                switchToView('dashboard');
                setTimeout(() => document.querySelector('.alert-banner')?.scrollIntoView({ behavior: 'smooth' }), 100);
            } else if (label === 'Daily Workings') {
                document.querySelector('.workings-calendar')?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// ===== ENGINE VIEW TERRITORY SELECT =====
document.querySelector('.engine-select')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val) {
        TERRITORY = val;
        FARM = `farm-${TERRITORY}`;
        localStorage.setItem('roatis_territory', TERRITORY);
        document.getElementById('territory-select').value = TERRITORY;
        loadAllData();
    }
});

// ===== CALENDAR MONTH NAVIGATION =====
let currentCalMonth = 5; // 0-indexed, June = 5
let currentCalYear = 2025;
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

document.querySelectorAll('.cal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.textContent.includes('\u2190') || btn.textContent.includes('May') || btn.textContent.includes('←')) {
            currentCalMonth--;
            if (currentCalMonth < 0) { currentCalMonth = 11; currentCalYear--; }
        } else {
            currentCalMonth++;
            if (currentCalMonth > 11) { currentCalMonth = 0; currentCalYear++; }
        }
        const monthLabel = document.querySelector('.cal-month');
        if (monthLabel) monthLabel.textContent = `${monthNames[currentCalMonth]} ${currentCalYear}`;

        // Update buttons
        const prevMonth = currentCalMonth === 0 ? 11 : currentCalMonth - 1;
        const nextMonth = currentCalMonth === 11 ? 0 : currentCalMonth + 1;
        const btns = document.querySelectorAll('.cal-btn');
        if (btns[0]) btns[0].textContent = `\u2190 ${monthNames[prevMonth]}`;
        if (btns[1]) btns[1].textContent = `${monthNames[nextMonth]} \u2192`;
    });
});

// ===== PDF EXPORT =====
document.getElementById('btn-export-pdf')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-export-pdf');
    btn.textContent = '⏳ Generating report...';
    btn.disabled = true;

    try {
        const [dashboard, engines, trajectory] = await Promise.all([
            fetchJSON(`/dashboard/${TERRITORY}/${YEAR}`).catch(() => null),
            fetchJSON(`/engines/${TERRITORY}/${YEAR}`).catch(() => null),
            fetchJSON(`/trajectory/${TERRITORY}`).catch(() => null),
        ]);

        const territoryName = document.getElementById('territory-select')?.selectedOptions[0]?.text || TERRITORY;
        const kpis = dashboard?.kpis || {};
        const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        const reportHTML = `
<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>ROA-TIS Territory Report — ${territoryName} ${YEAR}</title>
<style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; color: #1a1a1a; line-height: 1.6; }
    h1 { color: #0f1419; border-bottom: 3px solid #4ecdc4; padding-bottom: 8px; }
    h2 { color: #2e3640; margin-top: 24px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .header-meta { text-align: right; color: #666; font-size: 13px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 16px 0; }
    .kpi-box { border: 1px solid #ddd; border-radius: 8px; padding: 16px; text-align: center; }
    .kpi-box .value { font-size: 28px; font-weight: 700; color: #4ecdc4; }
    .kpi-box .label { font-size: 12px; color: #666; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; font-size: 13px; }
    th { background: #f5f5f5; font-weight: 600; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 11px; color: #999; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge-good { background: #d4edda; color: #155724; }
    .badge-warning { background: #fff3cd; color: #856404; }
    .badge-alert { background: #f8d7da; color: #721c24; }
    @media print { body { margin: 20px; } }
</style>
</head><body>
<div class="header">
    <div>
        <h1>◉ ROA-TIS Territory Report</h1>
        <p><strong>${territoryName}</strong> — Year ${YEAR}</p>
    </div>
    <div class="header-meta">
        <p>Generated: ${date}</p>
        <p>System: ROA-TIS v0.2.0</p>
        <p>Confidence: ${engines?.rti?.confidence || 'N/A'}</p>
    </div>
</div>

<h2>Key Performance Indicators</h2>
<div class="kpi-grid">
    <div class="kpi-box"><div class="value">${kpis.rti ?? '—'}</div><div class="label">RTI (Regenerative Index)</div></div>
    <div class="kpi-box"><div class="value">${kpis.tars ?? '—'}</div><div class="label">TARS (Risk Score)</div></div>
    <div class="kpi-box"><div class="value">${kpis.bsep ?? '—'}</div><div class="label">BSEP (Black Swan)</div></div>
    <div class="kpi-box"><div class="value">€${kpis.budget_gap ?? '—'}M</div><div class="label">Budget Gap</div></div>
</div>

${engines ? `
<h2>Engine Breakdown</h2>
<table>
    <tr><th>Engine</th><th>Score</th><th>Status</th></tr>
    <tr><td>RTI — Regenerative Territorial Index</td><td><strong>${engines.rti?.score ?? '—'}</strong> / 100</td><td>${engines.rti?.confidence ? 'Confidence ' + engines.rti.confidence : '—'}</td></tr>
    <tr><td>TARS — Territorial Anomaly Risk</td><td><strong>${engines.tars?.score ?? '—'}</strong> / 100</td><td>${engines.tars?.status ?? '—'}</td></tr>
    <tr><td>OPCI — Productive Capacity</td><td><strong>${engines.opci?.score ?? '—'}</strong></td><td>—</td></tr>
    <tr><td>BSEP — Black Swan Exposure</td><td><strong>${engines.bsep?.score ?? '—'}</strong></td><td><span class="badge ${engines.bsep?.escalation === 'Emergency' ? 'badge-alert' : 'badge-warning'}">${engines.bsep?.escalation ?? '—'}</span></td></tr>
    <tr><td>CAII — Community Asset Intelligence</td><td><strong>${engines.caii?.score ?? '—'}</strong> / 100</td><td>${engines.caii?.triggered_missions ?? '—'} missions</td></tr>
    <tr><td>Budget Intelligence</td><td><strong>€${engines.budget?.gap ?? '—'}M</strong> gap</td><td>Urgency: ${engines.budget?.urgency ?? '—'}/5</td></tr>
</table>
` : '<p><em>No engine data available for this year.</em></p>'}

${trajectory && trajectory.labels?.length > 0 ? `
<h2>60-Year Trajectory</h2>
<table>
    <tr><th>Year</th><th>Stewardship</th><th>Ecology</th><th>Wildlife</th><th>SOM</th><th>Population</th></tr>
    ${trajectory.labels.map((y, i) => `
    <tr>
        <td>${y}</td>
        <td>${trajectory.stewardship_capacity[i]}</td>
        <td>${trajectory.ecological_equilibrium[i]}</td>
        <td>${trajectory.wildlife_balance[i]}</td>
        <td>${trajectory.soil_organic_matter[i]}</td>
        <td>${trajectory.population_index[i]}</td>
    </tr>`).join('')}
</table>
` : ''}

<div class="footer">
    <p>This report was generated by the ROA-TIS Territorial Intelligence System. Data is based on computed engine scores and field observations.</p>
    <p>© ROA-TIS ${new Date().getFullYear()} — Territorial Intelligence as Infrastructure</p>
</div>
</body></html>`;

        // Open in new window for print/save as PDF
        const printWindow = window.open('', '_blank');
        printWindow.document.write(reportHTML);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);

    } catch (err) {
        console.error('PDF export error:', err);
    }

    btn.textContent = '📄 Download Territory Report (PDF)';
    btn.disabled = false;
});

/* ===== TERRITORY MAP (Leaflet) ===== */
let mapInstance = null;

function initMap() {
    if (mapInstance) { mapInstance.remove(); mapInstance = null; }
    const container = document.getElementById('territory-map');
    if (!container) return;

    mapInstance = L.map('territory-map').setView([38.5, 15.0], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(mapInstance);

    const year = document.getElementById('year-select')?.value || 2025;
    fetchJSON(`/territories/scores/${year}`).then(data => {
        if (!data || !Array.isArray(data)) return;
        const bounds = [];
        data.forEach(t => {
            const lat = t.latitude || t.lat;
            const lon = t.longitude || t.lon;
            if (lat == null || lon == null) return;
            const rti = t.rti != null ? t.rti.toFixed(1) : '—';
            const color = t.rti >= 70 ? '#2ecc71' : t.rti >= 40 ? '#f7b731' : '#ff6b6b';
            const tid = t.territory_id || t.id;
            const marker = L.circleMarker([lat, lon], {
                radius: 12, fillColor: color, color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.85
            }).addTo(mapInstance);

            marker.bindPopup(`
                <div class="map-popup-title">${t.name}</div>
                <div class="map-popup-score" style="color:${color}">RTI: ${rti}</div>
                <span class="map-popup-btn" onclick="navigateToTerritory('${tid}')">View Dashboard →</span>
            `);
            bounds.push([lat, lon]);
        });
        if (bounds.length) mapInstance.fitBounds(bounds, { padding: [40, 40] });
    });
}

window.navigateToTerritory = function(tid) {
    const sel = document.getElementById('territory-select');
    if (sel) { sel.value = tid; sel.dispatchEvent(new Event('change')); }
    document.querySelector('[data-view="dashboard"]')?.click();
};

// Reinit map when switching to map tab
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        if (tab.dataset.view === 'map') {
            setTimeout(() => initMap(), 100);
        }
    });
});

/* ===== DARK / LIGHT THEME TOGGLE ===== */
(function initTheme() {
    const saved = localStorage.getItem('roatis_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('btn-theme-toggle');
    if (btn) btn.textContent = saved === 'light' ? '☀️' : '🌙';
})();
document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('roatis_theme', next);
    const btn = document.getElementById('btn-theme-toggle');
    if (btn) btn.textContent = next === 'light' ? '☀️' : '🌙';
});

/* ===== AUDIT LOG ===== */
async function loadAuditLog() {
    const body = document.getElementById('audit-log-body');
    if (!body) return;
    try {
        const logs = await fetchJSON('/audit-log');
        body.innerHTML = logs.slice(0, 20).map(l => `
            <tr>
                <td>${l.timestamp || '—'}</td>
                <td>${l.username || '—'}</td>
                <td>${l.action}</td>
                <td>${l.detail || ''}</td>
            </tr>
        `).join('');
        if (!logs.length) body.innerHTML = '<tr><td colspan="4" style="color:#8899a6">No audit events yet</td></tr>';
    } catch { body.innerHTML = '<tr><td colspan="4" style="color:#8899a6">Audit log unavailable</td></tr>'; }
}
// Load audit log after login if authority
function maybeLoadAudit() {
    if (currentUser?.role === 'authority') loadAuditLog();
    else { const p = document.getElementById('audit-panel'); if (p) p.style.display = 'none'; }
}
// call on data load
const _origLoadAllData = loadAllData;
loadAllData = async function() { await _origLoadAllData(); maybeLoadAudit(); checkAlerts(); };

/* ===== #1 TOAST NOTIFICATIONS ===== */
function toast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => { el.classList.add('fade-out'); setTimeout(() => el.remove(), 300); }, duration);
}

/* ===== #2 TERRITORY COMPARISON ===== */
document.getElementById('btn-compare')?.addEventListener('click', async () => {
    const a = document.getElementById('compare-a').value;
    const b = document.getElementById('compare-b').value;
    const results = document.getElementById('compare-results');
    if (a === b) { toast('Select two different territories', 'warning'); return; }

    try {
        const [da, db] = await Promise.all([
            fetchJSON(`/dashboard/${a}/${YEAR}`),
            fetchJSON(`/dashboard/${b}/${YEAR}`),
        ]);
        const nameA = document.querySelector(`#compare-a option[value="${a}"]`).textContent;
        const nameB = document.querySelector(`#compare-b option[value="${b}"]`).textContent;

        function row(label, va, vb) {
            return `<div class="compare-row"><span class="label">${label}</span><span class="value">${va ?? '—'}</span></div>`;
        }
        function card(name, kpis) {
            return `<div class="compare-card"><h3>${name}</h3>
                <div class="compare-row"><span class="label">RTI Score</span><span class="value">${kpis.rti ?? '—'}</span></div>
                <div class="compare-row"><span class="label">TARS Risk</span><span class="value">${kpis.tars ?? '—'}</span></div>
                <div class="compare-row"><span class="label">BSEP Exposure</span><span class="value">${kpis.bsep ?? '—'}</span></div>
                <div class="compare-row"><span class="label">Budget Gap</span><span class="value">${kpis.budget_gap != null ? '€'+kpis.budget_gap+'M' : '—'}</span></div>
            </div>`;
        }
        results.innerHTML = card(nameA, da.kpis) + card(nameB, db.kpis);
    } catch { results.innerHTML = '<p style="color:#ff6b6b">Error loading comparison data</p>'; }
});

/* ===== #3 CSV EXPORT ===== */
document.getElementById('btn-export-csv')?.addEventListener('click', async () => {
    try {
        const data = await fetchJSON(`/territories/scores/${YEAR}`);
        if (!data || !data.length) { toast('No data to export', 'warning'); return; }
        const headers = ['Territory', 'Latitude', 'Longitude', 'RTI Score'];
        const rows = data.map(t => [t.name, t.latitude, t.longitude, t.rti ?? ''].join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `roatis_scores_${YEAR}.csv`; a.click();
        URL.revokeObjectURL(url);
        toast('CSV downloaded', 'success');
    } catch { toast('Export failed', 'error'); }
});

/* ===== #4 KEYBOARD SHORTCUTS ===== */
document.addEventListener('keydown', (e) => {
    // Only if not in an input field
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
    const tabs = document.querySelectorAll('.nav-tab:not([style*="display: none"])');
    const num = parseInt(e.key);
    if (num >= 1 && num <= tabs.length) {
        tabs[num - 1]?.click();
        return;
    }
    if (e.key === '?' && !e.ctrlKey) {
        toast('Shortcuts: 1-9 = tabs, R = reload, T = theme', 'info', 5000);
    }
    if (e.key === 'r' || e.key === 'R') {
        loadAllData();
        toast('Refreshing data...', 'info', 2000);
    }
    if (e.key === 't' && !e.ctrlKey) {
        document.getElementById('btn-theme-toggle')?.click();
    }
});

/* ===== #5 SESSION TIMEOUT ===== */
let sessionTimer = null;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function resetSessionTimer() {
    if (sessionTimer) clearTimeout(sessionTimer);
    if (!currentUser) return;
    sessionTimer = setTimeout(() => {
        toast('Session expired — logging out', 'warning', 3000);
        setTimeout(() => {
            localStorage.removeItem('roatis_user');
            currentUser = null;
            showLogin();
        }, 1500);
    }, SESSION_TIMEOUT_MS);
}
['click', 'keydown', 'mousemove', 'scroll'].forEach(evt =>
    document.addEventListener(evt, resetSessionTimer, { passive: true })
);
resetSessionTimer();

/* ===== #6 OBSERVATION PHOTOS ===== */
let obsPhotoBase64 = null;
document.getElementById('obs-photo')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('obs-photo-preview');
    if (!file) { obsPhotoBase64 = null; if (preview) preview.style.display = 'none'; return; }
    if (file.size > 2 * 1024 * 1024) { toast('Photo must be under 2MB', 'warning'); e.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
        obsPhotoBase64 = ev.target.result;
        if (preview) { preview.src = obsPhotoBase64; preview.style.display = 'block'; }
    };
    reader.readAsDataURL(file);
});

/* ===== #7 ALERT NOTIFICATIONS ===== */
async function checkAlerts() {
    // Don't override demo mode banner
    if (DEMO_MODE) return;
    try {
        const scores = await fetchJSON(`/territories/scores/${YEAR}`);
        const emergencies = scores.filter(t => t.rti !== null && t.rti < 40);
        const banner = document.getElementById('alert-banner');
        const text = document.getElementById('alert-banner-text');
        if (emergencies.length > 0 && banner && text) {
            const names = emergencies.map(t => t.name).join(', ');
            text.textContent = `CRITICAL: ${emergencies.length} territory(ies) below RTI 40 — ${names}. Immediate attention required.`;
            banner.style.display = 'flex';
        } else if (banner) {
            banner.style.display = 'none';
        }
    } catch { /* silent */ }
}

/* ===== #8 MULTI-LANGUAGE (i18n) ===== */
// ============ FULL i18n SYSTEM ============
// Comprehensive text dictionary — maps ALL English UI text to translations
const TEXT_DICT = {
    el: {
        // Login
        'Territorial Intelligence System': 'Σύστημα Εδαφικής Νοημοσύνης',
        'Username': 'Όνομα χρήστη', 'Password': 'Κωδικός', 'Enter username': 'Εισάγετε όνομα χρήστη',
        'Enter password': 'Εισάγετε κωδικό', 'Sign In': 'Σύνδεση', 'Demo Accounts:': 'Λογαριασμοί Demo:',
        // Nav & Global
        'Authority Dashboard': 'Πίνακας Αρχής', 'Territory Map': 'Χάρτης', 'Farmer Portal': 'Πύλη Αγρότη',
        'Engine View': 'Μηχανές', 'Investor & Commercial': 'Επενδυτές', 'Architecture & Research': 'Αρχιτεκτονική',
        'API Docs': 'API Τεκμ.', 'Compare': 'Σύγκριση', 'Logout': 'Αποσύνδεση',
        'Loading territory data...': 'Φόρτωση δεδομένων εδάφους...',
        // KPI Labels
        'Regenerative Territorial Index': 'Αναγεννητικός Εδαφικός Δείκτης',
        'TARS — Anomaly Risk Score': 'TARS — Βαθμολογία Κινδύνου Ανωμαλίας',
        'Black Swan Exposure': 'Έκθεση σε Μαύρο Κύκνο',
        'Future Sustainability Discounting': 'Μελλοντική Προεξόφληση Βιωσιμότητας',
        // Command Center
        'Executive Command Center': 'Εκτελεστικό Κέντρο Ελέγχου',
        'Executive Question': 'Εκτελεστική Ερώτηση', 'Live Signal': 'Ζωντανό Σήμα',
        'Status': 'Κατάσταση', 'Action': 'Ενέργεια',
        'Where are we?': 'Πού βρισκόμαστε;',
        'What is deteriorating?': 'Τι επιδεινώνεται;',
        'What is improving?': 'Τι βελτιώνεται;',
        'What should we do next?': 'Τι πρέπει να κάνουμε;',
        'What must be escalated now?': 'Τι πρέπει να κλιμακωθεί τώρα;',
        'RTI Composite': 'Σύνθετος RTI',
        'Control Center bottleneck': 'Σημείο συμφόρησης Κέντρου Ελέγχου',
        'Fire buffer & early warning': 'Ζώνη πυρασφάλειας & έγκαιρη προειδοποίηση',
        'Review Control Center bottleneck': 'Ανασκόπηση σημείου συμφόρησης',
        'Open Command →': 'Εντολή →', 'Review Actions →': 'Ενέργειες →',
        'Open Investment →': 'Επένδυση →', 'Prioritize →': 'Ιεράρχηση →', 'Escalate →': 'Κλιμάκωση →',
        'Transitional': 'Μεταβατικό', 'Insufficient Data': 'Ανεπαρκή Δεδομένα',
        'PASS': 'ΕΠΙΤΥΧΙΑ', 'Emergency Escalation': 'Κλιμάκωση Έκτακτης Ανάγκης',
        // Trajectory & Priority
        'Territorial Health — 60-Year Trajectory': 'Εδαφική Υγεία — Τροχιά 60 Ετών',
        'Executive Priority Board': 'Πίνακας Εκτελεστικών Προτεραιοτήτων',
        'Budget': 'Προϋπολογισμός', 'Command': 'Εντολή', 'Investment': 'Επένδυση',
        'Scientific Audit': 'Επιστημονικός Έλεγχος', 'Control': 'Έλεγχος', 'Futures': 'Μέλλον',
        'Severe discounting — €199.9M gap': 'Σοβαρή προεξόφληση — κενό €199.9M',
        'Review Control Center bottleneck': 'Ανασκόπηση συμφόρησης Κέντρου',
        'Fire buffer and early warning network': 'Δίκτυο ζώνης πυρασφάλειας',
        'Strengthen external validation': 'Ενίσχυση εξωτερικής επικύρωσης',
        'Stabilize lever propagation': 'Σταθεροποίηση μόχλευσης',
        'Compare temporal burden — Forward Heavy': 'Σύγκριση χρονικού βάρους',
        // Comparison & Export
        'Multi-ROA Comparison — 2025 Snapshot': 'Σύγκριση ROA — Στιγμιότυπο 2025',
        'Download Territory Report (PDF)': 'Λήψη Αναφοράς Εδάφους (PDF)',
        'Export CSV': 'Εξαγωγή CSV',
        // Audit
        'Audit Log (Last 20 events)': 'Αρχείο Ελέγχου (Τελευταία 20)',
        'Time': 'Χρόνος', 'User': 'Χρήστης', 'Detail': 'Λεπτομέρεια',
        // Map
        'Territorial Intelligence Map — All ROA Territories': 'Χάρτης Εδαφικής Νοημοσύνης — Όλα τα Εδάφη',
        'Click a territory marker to view its RTI score and navigate to its dashboard.': 'Κάντε κλικ σε ένα σημάδι για να δείτε τη βαθμολογία RTI.',
        'RTI ≥ 70 (Healthy)': 'RTI ≥ 70 (Υγιές)', 'RTI 40–69 (Transitional)': 'RTI 40–69 (Μεταβατικό)',
        'RTI < 40 (Critical)': 'RTI < 40 (Κρίσιμο)',
        // Farmer Portal
        'Daily Workings': 'Ημερήσιες Εργασίες', 'Data Entry': 'Εισαγωγή Δεδομένων',
        'Expenses': 'Έξοδα', 'My Grove Health': 'Υγεία Ελαιώνα', 'Alerts': 'Ειδοποιήσεις',
        'Quick Stats': 'Γρήγορα Στατιστικά',
        'Production 2025': 'Παραγωγή 2025', 'Oil Extracted': 'Εξαγόμενο Λάδι',
        'Extraction Rate': 'Ποσοστό Εξαγωγής', 'EVOO Quality': 'Ποιότητα EVOO',
        'Acidity': 'Οξύτητα', 'Carbon Stored': 'Αποθ. Άνθρακας',
        '365-Day Workings Matrix — June 2025': 'Μήτρα Εργασιών 365 Ημερών — Ιούνιος 2025',
        'Mon': 'Δευ', 'Tue': 'Τρι', 'Wed': 'Τετ', 'Thu': 'Πεμ', 'Fri': 'Παρ', 'Sat': 'Σαβ', 'Sun': 'Κυρ',
        'Today — June 16, 2025': 'Σήμερα — 16 Ιουνίου 2025',
        'HIGH PRIORITY': 'ΥΨΗΛΗ ΠΡΟΤΕΡΑΙΟΤΗΤΑ',
        'Fire Risk Patrol': 'Περιπολία Κινδύνου Πυρκαγιάς',
        'Inspect fire buffer zones around grove perimeter. Check for dry vegetation, clear access paths. Record observations below.': 'Επιθεωρήστε τις ζώνες πυρασφάλειας γύρω από τον ελαιώνα. Ελέγξτε για ξηρή βλάστηση. Καταγράψτε παρατηρήσεις παρακάτω.',
        'Current Conditions': 'Τρέχουσες Συνθήκες',
        'Temperature': 'Θερμοκρασία', 'Humidity': 'Υγρασία', 'Wind': 'Άνεμος', 'Fire Risk': 'Κίνδυνος Πυρκαγιάς',
        'Record Observation': 'Καταγραφή Παρατήρησης',
        'Observation Type': 'Τύπος Παρατήρησης', 'Date': 'Ημερομηνία', 'Description': 'Περιγραφή',
        'Describe what you observed today...': 'Περιγράψτε τι παρατηρήσατε σήμερα...',
        'Buffer zone clear': 'Ζώνη ασφαλείας ελεύθερη',
        'Access paths passable': 'Μονοπάτια πρόσβασης βατά',
        'No ignition risk detected': 'Κανένας κίνδυνος ανάφλεξης',
        'Photo (optional)': 'Φωτογραφία (προαιρετικό)',
        'Submit Observation': 'Υποβολή Παρατήρησης',
        'Fire Buffer Patrol': 'Περιπολία Πυρασφάλειας', 'Pest Monitoring': 'Παρακολούθηση Εντόμων',
        'Soil Health Check': 'Έλεγχος Υγείας Εδάφους', 'Irrigation Status': 'Κατάσταση Άρδευσης',
        'Biodiversity Observation': 'Παρατήρηση Βιοποικιλότητας', 'Harvest Activity': 'Δραστηριότητα Συγκομιδής',
        'General Note': 'Γενική Σημείωση',
        // Expenses
        'Annual Expenses': 'Ετήσια Έξοδα', 'Total Annual Expenses': 'Συνολικά Ετήσια Έξοδα',
        'Cost per Hectare': 'Κόστος ανά Εκτάριο', 'Cost per Tree': 'Κόστος ανά Δέντρο',
        'Breakdown by Category': 'Ανάλυση ανά Κατηγορία',
        'Labour (pruning, harvest)': 'Εργασία (κλάδεμα, συγκομιδή)',
        'Irrigation & water': 'Άρδευση & νερό', 'Organic inputs & compost': 'Βιολογικές εισροές & κομπόστ',
        'Equipment maintenance': 'Συντήρηση εξοπλισμού', 'Certification & compliance': 'Πιστοποίηση & συμμόρφωση',
        'Transport & logistics': 'Μεταφορά & logistics', 'Miscellaneous': 'Διάφορα',
        'Source: Production data for the selected territory and year.': 'Πηγή: Δεδομένα παραγωγής για το επιλεγμένο έδαφος.',
        // Engines
        'Intelligence Engine Computation Panel': 'Πίνακας Υπολογισμού Μηχανών Νοημοσύνης',
        '⟳ Recompute All Engines': '⟳ Επανυπολογισμός Μηχανών',
        'RTI — Regenerative Territorial Index': 'RTI — Αναγεννητικός Εδαφικός Δείκτης',
        'TARS — Territorial Anomaly Risk': 'TARS — Εδαφικός Κίνδυνος Ανωμαλίας',
        'REG — Regenerative Capacity': 'REG — Αναγεννητική Ικανότητα',
        'Black Swan Intelligence': 'Νοημοσύνη Μαύρου Κύκνου',
        'CAII — Community Asset Intelligence': 'CAII — Κοινοτική Νοημοσύνη Περιουσιακών',
        'Budget Intelligence — Future Discounting': 'Δημοσιονομική Νοημοσύνη — Μελλοντική Προεξόφληση',
        'ACTIVE': 'ΕΝΕΡΓΟ', 'EMERGENCY': 'ΕΚΤΑΚΤΟ',
        'Stewardship Capacity': 'Ικανότητα Διαχείρισης', 'Ecological Literacy': 'Οικολογική Παιδεία',
        'Wildlife Balance': 'Ισορροπία Πανίδας', 'Pollinator Index': 'Δείκτης Επικονίασης',
        'Soil Organic Matter': 'Οργανική Ύλη Εδάφους', 'Habitat Connectivity': 'Συνδεσιμότητα Ενδιαιτημάτων',
        'Confidence:': 'Εμπιστοσύνη:', 'Measured field data': 'Μετρημένα δεδομένα πεδίου',
        'Wildfire Events': 'Γεγονότα Πυρκαγιάς', 'Flood Events': 'Γεγονότα Πλημμύρας',
        'Pest/Disease': 'Παράσιτα/Ασθένεια', 'Drought Days/yr': 'Ημέρες Ξηρασίας/έτος',
        'Heatwave Days/yr': 'Ημέρες Καύσωνα/έτος', 'Years Since Event': 'Έτη από Συμβάν',
        'Productive Trees %': 'Παραγωγικά Δέντρα %', 'Tree Vitality': 'Ζωτικότητα Δέντρων',
        'Avg Trunk Perimeter': 'Μέση Περ. Κορμού', 'Yield/Tree': 'Παραγωγή/Δέντρο',
        'Regenerative Inputs': 'Αναγεννητικές Εισροές', 'Organic Certified': 'Βιολογική Πιστοποίηση',
        'Category': 'Κατηγορία', 'Escalation Level': 'Επίπεδο Κλιμάκωσης',
        'Recovery Target': 'Στόχος Ανάκαμψης', 'Current Recovery': 'Τρέχουσα Ανάκαμψη',
        'Human Capital Risk': 'Κίνδυνος Ανθρώπινου Κεφαλαίου', 'Succession Status': 'Κατάσταση Διαδοχής',
        'Community Governance': 'Κοινοτική Διακυβέρνηση', 'Human Capital': 'Ανθρώπινο Κεφάλαιο',
        'Social Collaboration': 'Κοινωνική Συνεργασία', 'Territorial Intelligence': 'Εδαφική Νοημοσύνη',
        'AI-Assisted TI': 'TI με AI', 'Asset Optimization': 'Βελτιστοποίηση Περιουσιακών',
        'Triggered Missions:': 'Ενεργοποιημένες Αποστολές:',
        'Scientific 2026 Need': 'Επιστημ. Ανάγκη 2026', 'Current Budget': 'Τρέχων Προϋπ.',
        'Discounting Ratio': 'Δείκτης Προεξόφλησης', 'Scenario': 'Σενάριο',
        'Ecological Recovery': 'Οικολογική Ανάκαμψη', 'Urgency': 'Επείγον',
        'Non-Action Cost': 'Κόστος Αδράνειας', 'Deferred regen.': 'Αναβαλλόμενη αναγέννηση',
        'SEVERE DISCOUNTING': 'ΣΟΒΑΡΗ ΠΡΟΕΞΟΦΛΗΣΗ', 'MONITOR': 'ΠΑΡΑΚΟΛΟΥΘΗΣΗ',
        'DISSEMINATE NOW': 'ΔΙΑΔΟΣΗ ΤΩΡΑ',
        'Formula Transparency — RTI Calculation': 'Διαφάνεια Τύπων — Υπολογισμός RTI',
        // Investor
        'ROA-TIS — Investor & Commercial Intelligence': 'ROA-TIS — Επενδυτική & Εμπορική Νοημοσύνη',
        'Territorial Intelligence as Infrastructure — Executive Business Plan Summary': 'Εδαφική Νοημοσύνη ως Υποδομή — Εκτελεστική Σύνοψη',
        'Seed Round Target': 'Στόχος Seed Round', 'Pre-Money Valuation Cap': 'Pre-Money Αποτίμηση',
        'Moderate Capital Scenario': 'Μέτριο Σενάριο Κεφαλαίου', 'Transformational Scenario': 'Μετασχηματιστικό Σενάριο',
        'SAFE / Early-Stage Instrument': 'SAFE / Μέσο Αρχικού Σταδίου',
        '18-month deployment': 'Ανάπτυξη 18 μηνών',
        'Western Greece + Mediterranean': 'Δυτική Ελλάδα + Μεσόγειος',
        'Multi-country deployment': 'Ανάπτυξη πολλαπλών χωρών',
        'Revenue Trajectories — 2026–2041 (Four Scenarios)': 'Τροχιές Εσόδων — 2026–2041 (Τέσσερα Σενάρια)',
        'Commercial Architecture': 'Εμπορική Αρχιτεκτονική',
        'Layer': 'Στρώμα', 'Offering Type': 'Τύπος Προσφοράς', 'Purpose': 'Σκοπός',
        'Products': 'Προϊόντα', 'Services': 'Υπηρεσίες', 'Platforms': 'Πλατφόρμες',
        'Assessments, diagnostics, reports': 'Αξιολογήσεις, διαγνωστικά, αναφορές',
        'One-off entry points & decisions': 'Εφάπαξ σημεία εισόδου & αποφάσεις',
        'Observatories & intelligence services': 'Παρατηρητήρια & υπηρεσίες νοημοσύνης',
        'Recurring institutional value': 'Επαναλαμβανόμενη θεσμική αξία',
        'Governance & Intelligence Platform, Territorial OS': 'Πλατφόρμα Διακυβέρνησης, Εδαφικό OS',
        'Long-duration contracts & capability': 'Μακροχρόνια συμβόλαια & δυνατότητες',
        'Product Portfolio': 'Χαρτοφυλάκιο Προϊόντων',
        'Five-Layer Pricing Architecture': 'Αρχιτεκτονική Τιμολόγησης 5 Επιπέδων',
        'Customer Purchasing Capacity — Territorial Intelligence': 'Αγοραστική Δυνατότητα Πελατών',
        'Customer Category': 'Κατηγορία Πελάτη', 'Annual Spend Range': 'Ετήσιο Εύρος Δαπανών',
        'Enterprise Customer': 'Εταιρικός Πελάτης',
        'Three Return Classes': 'Τρεις Κατηγορίες Απόδοσης',
        'Capital Architecture by Scenario': 'Αρχιτεκτονική Κεφαλαίου ανά Σενάριο',
        'Market Sizing — TAM / SAM / SOM': 'Μέγεθος Αγοράς — TAM / SAM / SOM',
        'Revenue Streams & Monetization Logic': 'Ροές Εσόδων & Λογική Νομισματοποίησης',
        'Revenue Stream': 'Ροή Εσόδων', 'Buyer': 'Αγοραστής', 'Value Delivered': 'Αξία που Παρέχεται',
        'Capital Approach Funnel — Sequenced Hybrid Stack': 'Κεφαλαιακή Χοάνη — Υβριδική Ακολουθία',
        'Verified Capital Sources Registry — 39 Sources': 'Μητρώο Πηγών Κεφαλαίου — 39 Πηγές',
        'Strategic Corrections Applied': 'Στρατηγικές Διορθώσεις',
        'Original Claim': 'Αρχικός Ισχυρισμός', 'Correction': 'Διόρθωση', 'Discipline': 'Κανόνας',
        'Territory Comparison': 'Σύγκριση Εδαφών',
        // Architecture
        'System Architecture, Patterns & Academic Roadmap': 'Αρχιτεκτονική Συστήματος & Ακαδημαϊκός Χάρτης',
        'Patterns & Papers Memorandum — Cockpit Edition': 'Υπόμνημα Μοτίβων & Δημοσιεύσεων',
        'Three Definitive Architectural Patterns': 'Τρία Αρχιτεκτονικά Μοτίβα',
        'Social-Biophysical Cascade': 'Κοινωνικο-Βιοφυσική Διαδοχή',
        'Temporal Disproportionate Discounting': 'Χρονική Δυσανάλογη Προεξόφληση',
        'Autopoietic Operational Closure': 'Αυτοποιητικό Λειτουργικό Κλείσιμο',
        'Architectural Uniqueness — Functional Dimensional Integration': 'Αρχιτεκτονική Μοναδικότητα',
        'Enterprise Engineering & Deployment Roadmap': 'Οδικός Χάρτης Ανάπτυξης',
        'Foundational Publication Portfolio': 'Χαρτοφυλάκιο Δημοσιεύσεων',
        'Downstream Academic Ecosystem': 'Ακαδημαϊκό Οικοσύστημα',
        '8-Layer Platform Architecture': 'Αρχιτεκτονική 8 Επιπέδων',
        // API
        'ROA-TIS API Documentation': 'API Τεκμηρίωση ROA-TIS',
        'Method': 'Μέθοδος', 'Endpoint': 'Σημείο πρόσβασης', 'Auth': 'Πιστοπ.',
        'Example Request': 'Παράδειγμα Αιτήματος',
        // Compare
        'Compare': 'Σύγκριση',
    },
    es: {
        'Territorial Intelligence System': 'Sistema de Inteligencia Territorial',
        'Username': 'Usuario', 'Password': 'Contraseña', 'Enter username': 'Ingrese usuario',
        'Enter password': 'Ingrese contraseña', 'Sign In': 'Iniciar sesión', 'Demo Accounts:': 'Cuentas Demo:',
        'Authority Dashboard': 'Panel de Autoridad', 'Territory Map': 'Mapa', 'Farmer Portal': 'Portal Agricultor',
        'Engine View': 'Motores', 'Investor & Commercial': 'Inversores', 'Architecture & Research': 'Arquitectura',
        'API Docs': 'Docs API', 'Compare': 'Comparar', 'Logout': 'Cerrar sesión',
        'Loading territory data...': 'Cargando datos territoriales...',
        'Regenerative Territorial Index': 'Índice Territorial Regenerativo',
        'TARS — Anomaly Risk Score': 'TARS — Puntuación de Riesgo',
        'Black Swan Exposure': 'Exposición Cisne Negro',
        'Future Sustainability Discounting': 'Descuento Sostenibilidad Futura',
        'Executive Command Center': 'Centro de Mando Ejecutivo',
        'Executive Question': 'Pregunta Ejecutiva', 'Live Signal': 'Señal en Vivo',
        'Status': 'Estado', 'Action': 'Acción',
        'Where are we?': '¿Dónde estamos?',
        'What is deteriorating?': '¿Qué se deteriora?',
        'What is improving?': '¿Qué mejora?',
        'What should we do next?': '¿Qué debemos hacer?',
        'What must be escalated now?': '¿Qué debe escalarse ahora?',
        'RTI Composite': 'RTI Compuesto',
        'Control Center bottleneck': 'Cuello de botella Centro de Control',
        'Fire buffer & early warning': 'Buffer contra incendios y alerta temprana',
        'Review Control Center bottleneck': 'Revisar cuello de botella',
        'Open Command →': 'Comando →', 'Review Actions →': 'Acciones →',
        'Open Investment →': 'Inversión →', 'Prioritize →': 'Priorizar →', 'Escalate →': 'Escalar →',
        'Transitional': 'Transicional', 'Insufficient Data': 'Datos Insuficientes',
        'PASS': 'APROBADO', 'Emergency Escalation': 'Escalación de Emergencia',
        'Territorial Health — 60-Year Trajectory': 'Salud Territorial — Trayectoria 60 Años',
        'Executive Priority Board': 'Panel de Prioridades Ejecutivas',
        'Budget': 'Presupuesto', 'Command': 'Comando', 'Investment': 'Inversión',
        'Scientific Audit': 'Auditoría Científica', 'Control': 'Control', 'Futures': 'Futuros',
        'Severe discounting — €199.9M gap': 'Descuento severo — brecha €199.9M',
        'Fire buffer and early warning network': 'Red de buffer contra incendios',
        'Strengthen external validation': 'Fortalecer validación externa',
        'Stabilize lever propagation': 'Estabilizar propagación de palancas',
        'Compare temporal burden — Forward Heavy': 'Comparar carga temporal',
        'Multi-ROA Comparison — 2025 Snapshot': 'Comparación ROA — 2025',
        'Download Territory Report (PDF)': 'Informe Territorial (PDF)',
        'Export CSV': 'Exportar CSV',
        'Audit Log (Last 20 events)': 'Registro de Auditoría (Últimos 20)',
        'Time': 'Hora', 'User': 'Usuario', 'Detail': 'Detalle',
        'Territorial Intelligence Map — All ROA Territories': 'Mapa de Inteligencia — Todos los Territorios',
        'Click a territory marker to view its RTI score and navigate to its dashboard.': 'Haga clic en un marcador para ver su puntuación RTI.',
        'RTI ≥ 70 (Healthy)': 'RTI ≥ 70 (Saludable)', 'RTI 40–69 (Transitional)': 'RTI 40–69 (Transicional)',
        'RTI < 40 (Critical)': 'RTI < 40 (Crítico)',
        'Daily Workings': 'Trabajos Diarios', 'Data Entry': 'Entrada de Datos',
        'Expenses': 'Gastos', 'My Grove Health': 'Salud del Olivar', 'Alerts': 'Alertas',
        'Quick Stats': 'Estadísticas Rápidas',
        'Production 2025': 'Producción 2025', 'Oil Extracted': 'Aceite Extraído',
        'Extraction Rate': 'Tasa de Extracción', 'EVOO Quality': 'Calidad AOVE',
        'Acidity': 'Acidez', 'Carbon Stored': 'Carbono Almacenado',
        '365-Day Workings Matrix — June 2025': 'Matriz de Trabajos 365 Días — Junio 2025',
        'Mon': 'Lun', 'Tue': 'Mar', 'Wed': 'Mié', 'Thu': 'Jue', 'Fri': 'Vie', 'Sat': 'Sáb', 'Sun': 'Dom',
        'Today — June 16, 2025': 'Hoy — 16 de Junio, 2025',
        'HIGH PRIORITY': 'ALTA PRIORIDAD',
        'Fire Risk Patrol': 'Patrulla Riesgo de Incendio',
        'Inspect fire buffer zones around grove perimeter. Check for dry vegetation, clear access paths. Record observations below.': 'Inspeccione zonas buffer contra incendios. Verifique vegetación seca. Registre observaciones abajo.',
        'Current Conditions': 'Condiciones Actuales',
        'Temperature': 'Temperatura', 'Humidity': 'Humedad', 'Wind': 'Viento', 'Fire Risk': 'Riesgo de Incendio',
        'Record Observation': 'Registrar Observación',
        'Observation Type': 'Tipo de Observación', 'Date': 'Fecha', 'Description': 'Descripción',
        'Describe what you observed today...': 'Describa lo que observó hoy...',
        'Buffer zone clear': 'Zona buffer despejada',
        'Access paths passable': 'Caminos accesibles',
        'No ignition risk detected': 'Sin riesgo de ignición',
        'Photo (optional)': 'Foto (opcional)',
        'Submit Observation': 'Enviar Observación',
        'Fire Buffer Patrol': 'Patrulla Buffer Incendios', 'Pest Monitoring': 'Monitoreo de Plagas',
        'Soil Health Check': 'Revisión Salud del Suelo', 'Irrigation Status': 'Estado de Riego',
        'Biodiversity Observation': 'Observación Biodiversidad', 'Harvest Activity': 'Actividad de Cosecha',
        'General Note': 'Nota General',
        'Annual Expenses': 'Gastos Anuales', 'Total Annual Expenses': 'Gastos Anuales Totales',
        'Cost per Hectare': 'Costo por Hectárea', 'Cost per Tree': 'Costo por Árbol',
        'Breakdown by Category': 'Desglose por Categoría',
        'Labour (pruning, harvest)': 'Mano de obra (poda, cosecha)',
        'Irrigation & water': 'Riego y agua', 'Organic inputs & compost': 'Insumos orgánicos y compost',
        'Equipment maintenance': 'Mantenimiento de equipo', 'Certification & compliance': 'Certificación y cumplimiento',
        'Transport & logistics': 'Transporte y logística', 'Miscellaneous': 'Varios',
        'Source: Production data for the selected territory and year.': 'Fuente: Datos de producción del territorio seleccionado.',
        'Intelligence Engine Computation Panel': 'Panel de Cálculo de Motores',
        '⟳ Recompute All Engines': '⟳ Recalcular Motores',
        'RTI — Regenerative Territorial Index': 'RTI — Índice Territorial Regenerativo',
        'TARS — Territorial Anomaly Risk': 'TARS — Riesgo de Anomalía Territorial',
        'REG — Regenerative Capacity': 'REG — Capacidad Regenerativa',
        'Black Swan Intelligence': 'Inteligencia Cisne Negro',
        'CAII — Community Asset Intelligence': 'CAII — Inteligencia de Activos Comunitarios',
        'Budget Intelligence — Future Discounting': 'Inteligencia Presupuestaria — Descuento Futuro',
        'ACTIVE': 'ACTIVO', 'EMERGENCY': 'EMERGENCIA',
        'Stewardship Capacity': 'Capacidad de Gestión', 'Ecological Literacy': 'Alfabetización Ecológica',
        'Wildlife Balance': 'Equilibrio de Fauna', 'Pollinator Index': 'Índice de Polinizadores',
        'Soil Organic Matter': 'Materia Orgánica del Suelo', 'Habitat Connectivity': 'Conectividad de Hábitat',
        'Confidence:': 'Confianza:', 'Measured field data': 'Datos de campo medidos',
        'Wildfire Events': 'Incendios Forestales', 'Flood Events': 'Inundaciones',
        'Pest/Disease': 'Plagas/Enfermedades', 'Drought Days/yr': 'Días de Sequía/año',
        'Heatwave Days/yr': 'Días de Ola de Calor/año', 'Years Since Event': 'Años desde Evento',
        'Productive Trees %': 'Árboles Productivos %', 'Tree Vitality': 'Vitalidad de Árboles',
        'Avg Trunk Perimeter': 'Perímetro Medio Tronco', 'Yield/Tree': 'Rendimiento/Árbol',
        'Regenerative Inputs': 'Insumos Regenerativos', 'Organic Certified': 'Certificación Orgánica',
        'Category': 'Categoría', 'Escalation Level': 'Nivel de Escalación',
        'Recovery Target': 'Objetivo de Recuperación', 'Current Recovery': 'Recuperación Actual',
        'Human Capital Risk': 'Riesgo Capital Humano', 'Succession Status': 'Estado de Sucesión',
        'Community Governance': 'Gobernanza Comunitaria', 'Human Capital': 'Capital Humano',
        'Social Collaboration': 'Colaboración Social', 'Territorial Intelligence': 'Inteligencia Territorial',
        'AI-Assisted TI': 'TI Asistida por IA', 'Asset Optimization': 'Optimización de Activos',
        'Triggered Missions:': 'Misiones Activadas:',
        'Scientific 2026 Need': 'Necesidad Científica 2026', 'Current Budget': 'Presupuesto Actual',
        'Discounting Ratio': 'Ratio de Descuento', 'Scenario': 'Escenario',
        'Ecological Recovery': 'Recuperación Ecológica', 'Urgency': 'Urgencia',
        'Non-Action Cost': 'Costo de Inacción', 'Deferred regen.': 'Regeneración diferida',
        'SEVERE DISCOUNTING': 'DESCUENTO SEVERO', 'MONITOR': 'MONITOREAR',
        'DISSEMINATE NOW': 'DIFUNDIR AHORA',
        'Formula Transparency — RTI Calculation': 'Transparencia de Fórmulas — Cálculo RTI',
        'ROA-TIS — Investor & Commercial Intelligence': 'ROA-TIS — Inteligencia Inversora y Comercial',
        'Territorial Intelligence as Infrastructure — Executive Business Plan Summary': 'Inteligencia Territorial como Infraestructura — Resumen Ejecutivo',
        'Seed Round Target': 'Objetivo Ronda Semilla', 'Pre-Money Valuation Cap': 'Valuación Pre-Money',
        'Moderate Capital Scenario': 'Escenario Capital Moderado', 'Transformational Scenario': 'Escenario Transformacional',
        'SAFE / Early-Stage Instrument': 'SAFE / Instrumento Etapa Temprana',
        '18-month deployment': 'Despliegue 18 meses',
        'Western Greece + Mediterranean': 'Grecia Occidental + Mediterráneo',
        'Multi-country deployment': 'Despliegue multipaís',
        'Revenue Trajectories — 2026–2041 (Four Scenarios)': 'Trayectorias de Ingresos — 2026–2041',
        'Commercial Architecture': 'Arquitectura Comercial',
        'Layer': 'Capa', 'Offering Type': 'Tipo de Oferta', 'Purpose': 'Propósito',
        'Products': 'Productos', 'Services': 'Servicios', 'Platforms': 'Plataformas',
        'Assessments, diagnostics, reports': 'Evaluaciones, diagnósticos, informes',
        'One-off entry points & decisions': 'Puntos de entrada únicos',
        'Observatories & intelligence services': 'Observatorios y servicios de inteligencia',
        'Recurring institutional value': 'Valor institucional recurrente',
        'Governance & Intelligence Platform, Territorial OS': 'Plataforma de Gobernanza, OS Territorial',
        'Long-duration contracts & capability': 'Contratos a largo plazo',
        'Product Portfolio': 'Portafolio de Productos',
        'Five-Layer Pricing Architecture': 'Arquitectura de Precios de 5 Capas',
        'Customer Purchasing Capacity — Territorial Intelligence': 'Capacidad de Compra de Clientes',
        'Customer Category': 'Categoría de Cliente', 'Annual Spend Range': 'Rango de Gasto Anual',
        'Enterprise Customer': 'Cliente Empresarial',
        'Three Return Classes': 'Tres Clases de Retorno',
        'Capital Architecture by Scenario': 'Arquitectura de Capital por Escenario',
        'Market Sizing — TAM / SAM / SOM': 'Tamaño de Mercado — TAM / SAM / SOM',
        'Revenue Streams & Monetization Logic': 'Flujos de Ingresos y Monetización',
        'Revenue Stream': 'Flujo de Ingresos', 'Buyer': 'Comprador', 'Value Delivered': 'Valor Entregado',
        'Capital Approach Funnel — Sequenced Hybrid Stack': 'Embudo de Capital — Secuencia Híbrida',
        'Verified Capital Sources Registry — 39 Sources': 'Registro de Fuentes de Capital — 39 Fuentes',
        'Strategic Corrections Applied': 'Correcciones Estratégicas Aplicadas',
        'Original Claim': 'Afirmación Original', 'Correction': 'Corrección', 'Discipline': 'Disciplina',
        'Territory Comparison': 'Comparación Territorial',
        'System Architecture, Patterns & Academic Roadmap': 'Arquitectura, Patrones y Hoja de Ruta Académica',
        'Patterns & Papers Memorandum — Cockpit Edition': 'Memorando de Patrones y Publicaciones',
        'Three Definitive Architectural Patterns': 'Tres Patrones Arquitectónicos Definitivos',
        'Social-Biophysical Cascade': 'Cascada Socio-Biofísica',
        'Temporal Disproportionate Discounting': 'Descuento Temporal Desproporcionado',
        'Autopoietic Operational Closure': 'Cierre Operacional Autopoiético',
        'Architectural Uniqueness — Functional Dimensional Integration': 'Unicidad Arquitectónica',
        'Enterprise Engineering & Deployment Roadmap': 'Hoja de Ruta de Ingeniería',
        'Foundational Publication Portfolio': 'Portafolio de Publicaciones',
        'Downstream Academic Ecosystem': 'Ecosistema Académico',
        '8-Layer Platform Architecture': 'Arquitectura de Plataforma de 8 Capas',
        'ROA-TIS API Documentation': 'Documentación API ROA-TIS',
        'Method': 'Método', 'Endpoint': 'Punto de acceso', 'Auth': 'Autent.',
        'Example Request': 'Ejemplo de Solicitud',
    },
    it: {
        'Territorial Intelligence System': 'Sistema di Intelligenza Territoriale',
        'Username': 'Utente', 'Password': 'Password', 'Enter username': 'Inserisci utente',
        'Enter password': 'Inserisci password', 'Sign In': 'Accedi', 'Demo Accounts:': 'Account Demo:',
        'Authority Dashboard': 'Pannello Autorità', 'Territory Map': 'Mappa', 'Farmer Portal': 'Portale Agricoltore',
        'Engine View': 'Motori', 'Investor & Commercial': 'Investitori', 'Architecture & Research': 'Architettura',
        'API Docs': 'Docs API', 'Compare': 'Confronta', 'Logout': 'Esci',
        'Loading territory data...': 'Caricamento dati territoriali...',
        'Regenerative Territorial Index': 'Indice Territoriale Rigenerativo',
        'TARS — Anomaly Risk Score': 'TARS — Punteggio di Rischio',
        'Black Swan Exposure': 'Esposizione Cigno Nero',
        'Future Sustainability Discounting': 'Sconto Sostenibilità Futura',
        'Executive Command Center': 'Centro Comando Esecutivo',
        'Executive Question': 'Domanda Esecutiva', 'Live Signal': 'Segnale Live',
        'Status': 'Stato', 'Action': 'Azione',
        'Where are we?': 'Dove siamo?',
        'What is deteriorating?': 'Cosa si deteriora?',
        'What is improving?': 'Cosa migliora?',
        'What should we do next?': 'Cosa fare dopo?',
        'What must be escalated now?': 'Cosa va escalato ora?',
        'RTI Composite': 'RTI Composito',
        'Control Center bottleneck': 'Collo di bottiglia Centro Controllo',
        'Fire buffer & early warning': 'Buffer antincendio e allerta precoce',
        'Review Control Center bottleneck': 'Rivedere collo di bottiglia',
        'Open Command →': 'Comando →', 'Review Actions →': 'Azioni →',
        'Open Investment →': 'Investimento →', 'Prioritize →': 'Priorità →', 'Escalate →': 'Escalare →',
        'Transitional': 'Transizionale', 'Insufficient Data': 'Dati Insufficienti',
        'PASS': 'OK', 'Emergency Escalation': 'Escalazione Emergenza',
        'Territorial Health — 60-Year Trajectory': 'Salute Territoriale — Traiettoria 60 Anni',
        'Executive Priority Board': 'Pannello Priorità Esecutive',
        'Budget': 'Bilancio', 'Command': 'Comando', 'Investment': 'Investimento',
        'Scientific Audit': 'Audit Scientifico', 'Control': 'Controllo', 'Futures': 'Futuri',
        'Severe discounting — €199.9M gap': 'Sconto severo — gap €199.9M',
        'Fire buffer and early warning network': 'Rete buffer antincendio',
        'Strengthen external validation': 'Rafforzare validazione esterna',
        'Stabilize lever propagation': 'Stabilizzare propagazione leve',
        'Compare temporal burden — Forward Heavy': 'Confrontare carico temporale',
        'Multi-ROA Comparison — 2025 Snapshot': 'Confronto ROA — 2025',
        'Download Territory Report (PDF)': 'Report Territoriale (PDF)',
        'Export CSV': 'Esporta CSV',
        'Audit Log (Last 20 events)': 'Registro Audit (Ultimi 20)',
        'Time': 'Ora', 'User': 'Utente', 'Detail': 'Dettaglio',
        'Territorial Intelligence Map — All ROA Territories': 'Mappa Intelligenza — Tutti i Territori',
        'Click a territory marker to view its RTI score and navigate to its dashboard.': 'Clicca su un indicatore per vedere il punteggio RTI.',
        'RTI ≥ 70 (Healthy)': 'RTI ≥ 70 (Sano)', 'RTI 40–69 (Transitional)': 'RTI 40–69 (Transizionale)',
        'RTI < 40 (Critical)': 'RTI < 40 (Critico)',
        'Daily Workings': 'Lavori Giornalieri', 'Data Entry': 'Inserimento Dati',
        'Expenses': 'Spese', 'My Grove Health': 'Salute Oliveto', 'Alerts': 'Avvisi',
        'Quick Stats': 'Statistiche Rapide',
        'Production 2025': 'Produzione 2025', 'Oil Extracted': 'Olio Estratto',
        'Extraction Rate': 'Tasso di Estrazione', 'EVOO Quality': 'Qualità EVOO',
        'Acidity': 'Acidità', 'Carbon Stored': 'Carbonio Stoccato',
        '365-Day Workings Matrix — June 2025': 'Matrice Lavori 365 Giorni — Giugno 2025',
        'Mon': 'Lun', 'Tue': 'Mar', 'Wed': 'Mer', 'Thu': 'Gio', 'Fri': 'Ven', 'Sat': 'Sab', 'Sun': 'Dom',
        'Today — June 16, 2025': 'Oggi — 16 Giugno 2025',
        'HIGH PRIORITY': 'ALTA PRIORITÀ',
        'Fire Risk Patrol': 'Pattuglia Rischio Incendio',
        'Inspect fire buffer zones around grove perimeter. Check for dry vegetation, clear access paths. Record observations below.': 'Ispezionare le zone buffer antincendio. Controllare vegetazione secca. Registrare osservazioni sotto.',
        'Current Conditions': 'Condizioni Attuali',
        'Temperature': 'Temperatura', 'Humidity': 'Umidità', 'Wind': 'Vento', 'Fire Risk': 'Rischio Incendio',
        'Record Observation': 'Registra Osservazione',
        'Observation Type': 'Tipo di Osservazione', 'Date': 'Data', 'Description': 'Descrizione',
        'Describe what you observed today...': 'Descrivi cosa hai osservato oggi...',
        'Buffer zone clear': 'Zona cuscinetto libera',
        'Access paths passable': 'Sentieri accessibili',
        'No ignition risk detected': 'Nessun rischio di accensione',
        'Photo (optional)': 'Foto (opzionale)',
        'Submit Observation': 'Invia Osservazione',
        'Fire Buffer Patrol': 'Pattuglia Buffer Incendio', 'Pest Monitoring': 'Monitoraggio Parassiti',
        'Soil Health Check': 'Controllo Salute Suolo', 'Irrigation Status': 'Stato Irrigazione',
        'Biodiversity Observation': 'Osservazione Biodiversità', 'Harvest Activity': 'Attività Raccolta',
        'General Note': 'Nota Generale',
        'Annual Expenses': 'Spese Annuali', 'Total Annual Expenses': 'Spese Annuali Totali',
        'Cost per Hectare': 'Costo per Ettaro', 'Cost per Tree': 'Costo per Albero',
        'Breakdown by Category': 'Ripartizione per Categoria',
        'Labour (pruning, harvest)': 'Lavoro (potatura, raccolta)',
        'Irrigation & water': 'Irrigazione e acqua', 'Organic inputs & compost': 'Input organici e compost',
        'Equipment maintenance': 'Manutenzione attrezzature', 'Certification & compliance': 'Certificazione e conformità',
        'Transport & logistics': 'Trasporto e logistica', 'Miscellaneous': 'Varie',
        'Source: Production data for the selected territory and year.': 'Fonte: Dati di produzione per il territorio selezionato.',
        'Intelligence Engine Computation Panel': 'Pannello Calcolo Motori',
        '⟳ Recompute All Engines': '⟳ Ricalcola Motori',
        'RTI — Regenerative Territorial Index': 'RTI — Indice Territoriale Rigenerativo',
        'TARS — Territorial Anomaly Risk': 'TARS — Rischio Anomalia Territoriale',
        'REG — Regenerative Capacity': 'REG — Capacità Rigenerativa',
        'Black Swan Intelligence': 'Intelligenza Cigno Nero',
        'CAII — Community Asset Intelligence': 'CAII — Intelligenza Beni Comunitari',
        'Budget Intelligence — Future Discounting': 'Intelligenza di Bilancio — Sconto Futuro',
        'ACTIVE': 'ATTIVO', 'EMERGENCY': 'EMERGENZA',
        'Stewardship Capacity': 'Capacità di Gestione', 'Ecological Literacy': 'Alfabetizzazione Ecologica',
        'Wildlife Balance': 'Equilibrio Fauna', 'Pollinator Index': 'Indice Impollinatori',
        'Soil Organic Matter': 'Materia Organica Suolo', 'Habitat Connectivity': 'Connettività Habitat',
        'Confidence:': 'Confidenza:', 'Measured field data': 'Dati misurati sul campo',
        'Wildfire Events': 'Incendi Boschivi', 'Flood Events': 'Alluvioni',
        'Pest/Disease': 'Parassiti/Malattie', 'Drought Days/yr': 'Giorni Siccità/anno',
        'Heatwave Days/yr': 'Giorni Ondata Calore/anno', 'Years Since Event': 'Anni da Evento',
        'Productive Trees %': 'Alberi Produttivi %', 'Tree Vitality': 'Vitalità Alberi',
        'Avg Trunk Perimeter': 'Perimetro Medio Tronco', 'Yield/Tree': 'Resa/Albero',
        'Regenerative Inputs': 'Input Rigenerativi', 'Organic Certified': 'Certificazione Biologica',
        'Category': 'Categoria', 'Escalation Level': 'Livello Escalazione',
        'Recovery Target': 'Obiettivo Recupero', 'Current Recovery': 'Recupero Attuale',
        'Human Capital Risk': 'Rischio Capitale Umano', 'Succession Status': 'Stato Successione',
        'Community Governance': 'Governance Comunitaria', 'Human Capital': 'Capitale Umano',
        'Social Collaboration': 'Collaborazione Sociale', 'Territorial Intelligence': 'Intelligenza Territoriale',
        'AI-Assisted TI': 'TI Assistita da IA', 'Asset Optimization': 'Ottimizzazione Beni',
        'Triggered Missions:': 'Missioni Attivate:',
        'Scientific 2026 Need': 'Fabbisogno Scientifico 2026', 'Current Budget': 'Bilancio Attuale',
        'Discounting Ratio': 'Rapporto Sconto', 'Scenario': 'Scenario',
        'Ecological Recovery': 'Recupero Ecologico', 'Urgency': 'Urgenza',
        'Non-Action Cost': 'Costo di Inazione', 'Deferred regen.': 'Rigenerazione differita',
        'SEVERE DISCOUNTING': 'SCONTO SEVERO', 'MONITOR': 'MONITORARE',
        'DISSEMINATE NOW': 'DIFFONDERE ORA',
        'Formula Transparency — RTI Calculation': 'Trasparenza Formula — Calcolo RTI',
        'ROA-TIS — Investor & Commercial Intelligence': 'ROA-TIS — Intelligenza Investitori e Commerciale',
        'Territorial Intelligence as Infrastructure — Executive Business Plan Summary': 'Intelligenza Territoriale come Infrastruttura — Sommario Esecutivo',
        'Seed Round Target': 'Obiettivo Seed Round', 'Pre-Money Valuation Cap': 'Valutazione Pre-Money',
        'Moderate Capital Scenario': 'Scenario Capitale Moderato', 'Transformational Scenario': 'Scenario Trasformativo',
        'SAFE / Early-Stage Instrument': 'SAFE / Strumento Fase Iniziale',
        '18-month deployment': 'Implementazione 18 mesi',
        'Western Greece + Mediterranean': 'Grecia Occidentale + Mediterraneo',
        'Multi-country deployment': 'Implementazione multi-paese',
        'Revenue Trajectories — 2026–2041 (Four Scenarios)': 'Traiettorie Ricavi — 2026–2041',
        'Commercial Architecture': 'Architettura Commerciale',
        'Layer': 'Livello', 'Offering Type': 'Tipo Offerta', 'Purpose': 'Scopo',
        'Products': 'Prodotti', 'Services': 'Servizi', 'Platforms': 'Piattaforme',
        'Assessments, diagnostics, reports': 'Valutazioni, diagnostiche, report',
        'One-off entry points & decisions': 'Punti di ingresso una tantum',
        'Observatories & intelligence services': 'Osservatori e servizi di intelligence',
        'Recurring institutional value': 'Valore istituzionale ricorrente',
        'Governance & Intelligence Platform, Territorial OS': 'Piattaforma di Governance, OS Territoriale',
        'Long-duration contracts & capability': 'Contratti a lungo termine',
        'Product Portfolio': 'Portafoglio Prodotti',
        'Five-Layer Pricing Architecture': 'Architettura Prezzi a 5 Livelli',
        'Customer Purchasing Capacity — Territorial Intelligence': 'Capacità di Acquisto Clienti',
        'Customer Category': 'Categoria Cliente', 'Annual Spend Range': 'Range Spesa Annuale',
        'Enterprise Customer': 'Cliente Enterprise',
        'Three Return Classes': 'Tre Classi di Rendimento',
        'Capital Architecture by Scenario': 'Architettura Capitale per Scenario',
        'Market Sizing — TAM / SAM / SOM': 'Dimensionamento Mercato — TAM / SAM / SOM',
        'Revenue Streams & Monetization Logic': 'Flussi di Ricavi e Monetizzazione',
        'Revenue Stream': 'Flusso Ricavi', 'Buyer': 'Acquirente', 'Value Delivered': 'Valore Fornito',
        'Capital Approach Funnel — Sequenced Hybrid Stack': 'Imbuto Capitale — Sequenza Ibrida',
        'Verified Capital Sources Registry — 39 Sources': 'Registro Fonti Capitale — 39 Fonti',
        'Strategic Corrections Applied': 'Correzioni Strategiche Applicate',
        'Original Claim': 'Affermazione Originale', 'Correction': 'Correzione', 'Discipline': 'Disciplina',
        'Territory Comparison': 'Confronto Territoriale',
        'System Architecture, Patterns & Academic Roadmap': 'Architettura, Modelli e Roadmap Accademica',
        'Patterns & Papers Memorandum — Cockpit Edition': 'Memorandum Modelli e Pubblicazioni',
        'Three Definitive Architectural Patterns': 'Tre Pattern Architettonici Definitivi',
        'Social-Biophysical Cascade': 'Cascata Socio-Biofisica',
        'Temporal Disproportionate Discounting': 'Sconto Temporale Sproporzionato',
        'Autopoietic Operational Closure': 'Chiusura Operazionale Autopoietica',
        'Architectural Uniqueness — Functional Dimensional Integration': 'Unicità Architettonica',
        'Enterprise Engineering & Deployment Roadmap': 'Roadmap di Ingegneria',
        'Foundational Publication Portfolio': 'Portafoglio Pubblicazioni',
        'Downstream Academic Ecosystem': 'Ecosistema Accademico',
        '8-Layer Platform Architecture': 'Architettura Piattaforma a 8 Livelli',
        'ROA-TIS API Documentation': 'Documentazione API ROA-TIS',
        'Method': 'Metodo', 'Endpoint': 'Endpoint', 'Auth': 'Autent.',
        'Example Request': 'Esempio Richiesta',
    },
    pt: {
        'Territorial Intelligence System': 'Sistema de Inteligência Territorial',
        'Username': 'Utilizador', 'Password': 'Palavra-passe', 'Enter username': 'Introduza utilizador',
        'Enter password': 'Introduza palavra-passe', 'Sign In': 'Entrar', 'Demo Accounts:': 'Contas Demo:',
        'Authority Dashboard': 'Painel Autoridade', 'Territory Map': 'Mapa', 'Farmer Portal': 'Portal Agricultor',
        'Engine View': 'Motores', 'Investor & Commercial': 'Investidores', 'Architecture & Research': 'Arquitetura',
        'API Docs': 'Docs API', 'Compare': 'Comparar', 'Logout': 'Sair',
        'Loading territory data...': 'Carregando dados territoriais...',
        'Regenerative Territorial Index': 'Índice Territorial Regenerativo',
        'TARS — Anomaly Risk Score': 'TARS — Pontuação de Risco',
        'Black Swan Exposure': 'Exposição Cisne Negro',
        'Future Sustainability Discounting': 'Desconto Sustentabilidade Futura',
        'Executive Command Center': 'Centro de Comando Executivo',
        'Executive Question': 'Pergunta Executiva', 'Live Signal': 'Sinal ao Vivo',
        'Status': 'Estado', 'Action': 'Ação',
        'Where are we?': 'Onde estamos?',
        'What is deteriorating?': 'O que está a deteriorar-se?',
        'What is improving?': 'O que está a melhorar?',
        'What should we do next?': 'O que devemos fazer?',
        'What must be escalated now?': 'O que deve ser escalado agora?',
        'RTI Composite': 'RTI Composto',
        'Control Center bottleneck': 'Estrangulamento Centro de Controlo',
        'Fire buffer & early warning': 'Buffer contra incêndios e alerta precoce',
        'Review Control Center bottleneck': 'Rever estrangulamento',
        'Open Command →': 'Comando →', 'Review Actions →': 'Ações →',
        'Open Investment →': 'Investimento →', 'Prioritize →': 'Priorizar →', 'Escalate →': 'Escalar →',
        'Transitional': 'Transicional', 'Insufficient Data': 'Dados Insuficientes',
        'PASS': 'APROVADO', 'Emergency Escalation': 'Escalação de Emergência',
        'Territorial Health — 60-Year Trajectory': 'Saúde Territorial — Trajetória 60 Anos',
        'Executive Priority Board': 'Painel de Prioridades Executivas',
        'Budget': 'Orçamento', 'Command': 'Comando', 'Investment': 'Investimento',
        'Scientific Audit': 'Auditoria Científica', 'Control': 'Controlo', 'Futures': 'Futuros',
        'Severe discounting — €199.9M gap': 'Desconto severo — lacuna €199.9M',
        'Fire buffer and early warning network': 'Rede buffer contra incêndios',
        'Strengthen external validation': 'Fortalecer validação externa',
        'Stabilize lever propagation': 'Estabilizar propagação de alavancas',
        'Compare temporal burden — Forward Heavy': 'Comparar carga temporal',
        'Multi-ROA Comparison — 2025 Snapshot': 'Comparação ROA — 2025',
        'Download Territory Report (PDF)': 'Relatório Territorial (PDF)',
        'Export CSV': 'Exportar CSV',
        'Audit Log (Last 20 events)': 'Registo de Auditoria (Últimos 20)',
        'Time': 'Hora', 'User': 'Utilizador', 'Detail': 'Detalhe',
        'Territorial Intelligence Map — All ROA Territories': 'Mapa de Inteligência — Todos os Territórios',
        'Click a territory marker to view its RTI score and navigate to its dashboard.': 'Clique num marcador para ver a pontuação RTI.',
        'RTI ≥ 70 (Healthy)': 'RTI ≥ 70 (Saudável)', 'RTI 40–69 (Transitional)': 'RTI 40–69 (Transicional)',
        'RTI < 40 (Critical)': 'RTI < 40 (Crítico)',
        'Daily Workings': 'Trabalhos Diários', 'Data Entry': 'Entrada de Dados',
        'Expenses': 'Despesas', 'My Grove Health': 'Saúde do Olival', 'Alerts': 'Alertas',
        'Quick Stats': 'Estatísticas Rápidas',
        'Production 2025': 'Produção 2025', 'Oil Extracted': 'Óleo Extraído',
        'Extraction Rate': 'Taxa de Extração', 'EVOO Quality': 'Qualidade EVOO',
        'Acidity': 'Acidez', 'Carbon Stored': 'Carbono Armazenado',
        '365-Day Workings Matrix — June 2025': 'Matriz de Trabalhos 365 Dias — Junho 2025',
        'Mon': 'Seg', 'Tue': 'Ter', 'Wed': 'Qua', 'Thu': 'Qui', 'Fri': 'Sex', 'Sat': 'Sáb', 'Sun': 'Dom',
        'Today — June 16, 2025': 'Hoje — 16 de Junho, 2025',
        'HIGH PRIORITY': 'ALTA PRIORIDADE',
        'Fire Risk Patrol': 'Patrulha Risco de Incêndio',
        'Inspect fire buffer zones around grove perimeter. Check for dry vegetation, clear access paths. Record observations below.': 'Inspecione zonas buffer contra incêndios. Verifique vegetação seca. Registe observações abaixo.',
        'Current Conditions': 'Condições Atuais',
        'Temperature': 'Temperatura', 'Humidity': 'Humidade', 'Wind': 'Vento', 'Fire Risk': 'Risco de Incêndio',
        'Record Observation': 'Registar Observação',
        'Observation Type': 'Tipo de Observação', 'Date': 'Data', 'Description': 'Descrição',
        'Describe what you observed today...': 'Descreva o que observou hoje...',
        'Buffer zone clear': 'Zona tampão limpa',
        'Access paths passable': 'Caminhos acessíveis',
        'No ignition risk detected': 'Sem risco de ignição',
        'Photo (optional)': 'Foto (opcional)',
        'Submit Observation': 'Enviar Observação',
        'Fire Buffer Patrol': 'Patrulha Buffer Incêndio', 'Pest Monitoring': 'Monitorização de Pragas',
        'Soil Health Check': 'Verificação Saúde do Solo', 'Irrigation Status': 'Estado de Irrigação',
        'Biodiversity Observation': 'Observação Biodiversidade', 'Harvest Activity': 'Atividade de Colheita',
        'General Note': 'Nota Geral',
        'Annual Expenses': 'Despesas Anuais', 'Total Annual Expenses': 'Despesas Anuais Totais',
        'Cost per Hectare': 'Custo por Hectare', 'Cost per Tree': 'Custo por Árvore',
        'Breakdown by Category': 'Discriminação por Categoria',
        'Labour (pruning, harvest)': 'Mão de obra (poda, colheita)',
        'Irrigation & water': 'Irrigação e água', 'Organic inputs & compost': 'Inputs orgânicos e composto',
        'Equipment maintenance': 'Manutenção de equipamento', 'Certification & compliance': 'Certificação e conformidade',
        'Transport & logistics': 'Transporte e logística', 'Miscellaneous': 'Diversos',
        'Source: Production data for the selected territory and year.': 'Fonte: Dados de produção para o território selecionado.',
        'Intelligence Engine Computation Panel': 'Painel de Cálculo de Motores',
        '⟳ Recompute All Engines': '⟳ Recalcular Motores',
        'RTI — Regenerative Territorial Index': 'RTI — Índice Territorial Regenerativo',
        'TARS — Territorial Anomaly Risk': 'TARS — Risco de Anomalia Territorial',
        'REG — Regenerative Capacity': 'REG — Capacidade Regenerativa',
        'Black Swan Intelligence': 'Inteligência Cisne Negro',
        'CAII — Community Asset Intelligence': 'CAII — Inteligência de Ativos Comunitários',
        'Budget Intelligence — Future Discounting': 'Inteligência Orçamental — Desconto Futuro',
        'ACTIVE': 'ATIVO', 'EMERGENCY': 'EMERGÊNCIA',
        'Stewardship Capacity': 'Capacidade de Gestão', 'Ecological Literacy': 'Literacia Ecológica',
        'Wildlife Balance': 'Equilíbrio Fauna', 'Pollinator Index': 'Índice Polinizadores',
        'Soil Organic Matter': 'Matéria Orgânica Solo', 'Habitat Connectivity': 'Conectividade Habitat',
        'Confidence:': 'Confiança:', 'Measured field data': 'Dados de campo medidos',
        'Wildfire Events': 'Incêndios Florestais', 'Flood Events': 'Inundações',
        'Pest/Disease': 'Pragas/Doenças', 'Drought Days/yr': 'Dias Seca/ano',
        'Heatwave Days/yr': 'Dias Onda de Calor/ano', 'Years Since Event': 'Anos desde Evento',
        'Productive Trees %': 'Árvores Produtivas %', 'Tree Vitality': 'Vitalidade Árvores',
        'Avg Trunk Perimeter': 'Perímetro Médio Tronco', 'Yield/Tree': 'Rendimento/Árvore',
        'Regenerative Inputs': 'Inputs Regenerativos', 'Organic Certified': 'Certificação Biológica',
        'Category': 'Categoria', 'Escalation Level': 'Nível de Escalação',
        'Recovery Target': 'Objetivo Recuperação', 'Current Recovery': 'Recuperação Atual',
        'Human Capital Risk': 'Risco Capital Humano', 'Succession Status': 'Estado Sucessão',
        'Community Governance': 'Governança Comunitária', 'Human Capital': 'Capital Humano',
        'Social Collaboration': 'Colaboração Social', 'Territorial Intelligence': 'Inteligência Territorial',
        'AI-Assisted TI': 'TI Assistida por IA', 'Asset Optimization': 'Otimização de Ativos',
        'Triggered Missions:': 'Missões Ativadas:',
        'Scientific 2026 Need': 'Necessidade Científica 2026', 'Current Budget': 'Orçamento Atual',
        'Discounting Ratio': 'Rácio de Desconto', 'Scenario': 'Cenário',
        'Ecological Recovery': 'Recuperação Ecológica', 'Urgency': 'Urgência',
        'Non-Action Cost': 'Custo de Inação', 'Deferred regen.': 'Regeneração diferida',
        'SEVERE DISCOUNTING': 'DESCONTO SEVERO', 'MONITOR': 'MONITORAR',
        'DISSEMINATE NOW': 'DIFUNDIR AGORA',
        'Formula Transparency — RTI Calculation': 'Transparência Fórmulas — Cálculo RTI',
        'ROA-TIS — Investor & Commercial Intelligence': 'ROA-TIS — Inteligência Investidores e Comercial',
        'Territorial Intelligence as Infrastructure — Executive Business Plan Summary': 'Inteligência Territorial como Infraestrutura — Resumo Executivo',
        'Seed Round Target': 'Objetivo Ronda Seed', 'Pre-Money Valuation Cap': 'Avaliação Pre-Money',
        'Moderate Capital Scenario': 'Cenário Capital Moderado', 'Transformational Scenario': 'Cenário Transformacional',
        'SAFE / Early-Stage Instrument': 'SAFE / Instrumento Fase Inicial',
        '18-month deployment': 'Implementação 18 meses',
        'Western Greece + Mediterranean': 'Grécia Ocidental + Mediterrâneo',
        'Multi-country deployment': 'Implementação multi-país',
        'Revenue Trajectories — 2026–2041 (Four Scenarios)': 'Trajetórias Receitas — 2026–2041',
        'Commercial Architecture': 'Arquitetura Comercial',
        'Layer': 'Camada', 'Offering Type': 'Tipo de Oferta', 'Purpose': 'Propósito',
        'Products': 'Produtos', 'Services': 'Serviços', 'Platforms': 'Plataformas',
        'Assessments, diagnostics, reports': 'Avaliações, diagnósticos, relatórios',
        'One-off entry points & decisions': 'Pontos de entrada únicos',
        'Observatories & intelligence services': 'Observatórios e serviços de inteligência',
        'Recurring institutional value': 'Valor institucional recorrente',
        'Governance & Intelligence Platform, Territorial OS': 'Plataforma de Governança, OS Territorial',
        'Long-duration contracts & capability': 'Contratos de longa duração',
        'Product Portfolio': 'Portfólio de Produtos',
        'Five-Layer Pricing Architecture': 'Arquitetura de Preços de 5 Camadas',
        'Customer Purchasing Capacity — Territorial Intelligence': 'Capacidade de Compra de Clientes',
        'Customer Category': 'Categoria de Cliente', 'Annual Spend Range': 'Intervalo de Gasto Anual',
        'Enterprise Customer': 'Cliente Empresarial',
        'Three Return Classes': 'Três Classes de Retorno',
        'Capital Architecture by Scenario': 'Arquitetura de Capital por Cenário',
        'Market Sizing — TAM / SAM / SOM': 'Dimensionamento Mercado — TAM / SAM / SOM',
        'Revenue Streams & Monetization Logic': 'Fluxos de Receitas e Monetização',
        'Revenue Stream': 'Fluxo de Receitas', 'Buyer': 'Comprador', 'Value Delivered': 'Valor Entregue',
        'Capital Approach Funnel — Sequenced Hybrid Stack': 'Funil de Capital — Sequência Híbrida',
        'Verified Capital Sources Registry — 39 Sources': 'Registo Fontes Capital — 39 Fontes',
        'Strategic Corrections Applied': 'Correções Estratégicas Aplicadas',
        'Original Claim': 'Afirmação Original', 'Correction': 'Correção', 'Discipline': 'Disciplina',
        'Territory Comparison': 'Comparação Territorial',
        'System Architecture, Patterns & Academic Roadmap': 'Arquitetura, Padrões e Roteiro Académico',
        'Patterns & Papers Memorandum — Cockpit Edition': 'Memorando de Padrões e Publicações',
        'Three Definitive Architectural Patterns': 'Três Padrões Arquitetónicos Definitivos',
        'Social-Biophysical Cascade': 'Cascata Sócio-Biofísica',
        'Temporal Disproportionate Discounting': 'Desconto Temporal Desproporcional',
        'Autopoietic Operational Closure': 'Fecho Operacional Autopoiético',
        'Architectural Uniqueness — Functional Dimensional Integration': 'Unicidade Arquitetónica',
        'Enterprise Engineering & Deployment Roadmap': 'Roteiro de Engenharia',
        'Foundational Publication Portfolio': 'Portfólio de Publicações',
        'Downstream Academic Ecosystem': 'Ecossistema Académico',
        '8-Layer Platform Architecture': 'Arquitetura Plataforma de 8 Camadas',
        'ROA-TIS API Documentation': 'Documentação API ROA-TIS',
        'Method': 'Método', 'Endpoint': 'Ponto de acesso', 'Auth': 'Autent.',
        'Example Request': 'Exemplo de Pedido',
    },
};

// Store original text for reverting to English
let originalTexts = new Map();
let currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('roatis_lang', lang);

    if (lang === 'en') {
        // Revert to original English text
        originalTexts.forEach((original, el) => {
            if (el.nodeType === 3) el.textContent = original;
            else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = original;
            else el.textContent = original;
        });
        return;
    }

    const dict = TEXT_DICT[lang];
    if (!dict) return;

    // Translate all text nodes in the document
    const walker = document.createTreeWalker(
        document.getElementById('main-app') || document.body,
        NodeFilter.SHOW_TEXT,
        { acceptNode: (node) => {
            const t = node.textContent.trim();
            if (!t || t.length < 2) return NodeFilter.FILTER_REJECT;
            // Skip script/style/code/pre content
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'PRE' || tag === 'CODE') return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        }}
    );

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(node => {
        const original = node.textContent;
        const trimmed = original.trim();
        if (dict[trimmed]) {
            if (!originalTexts.has(node)) originalTexts.set(node, original);
            // Preserve leading/trailing whitespace
            const leading = original.match(/^\s*/)[0];
            const trailing = original.match(/\s*$/)[0];
            node.textContent = leading + dict[trimmed] + trailing;
        }
    });

    // Also translate placeholders
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
        const ph = el.placeholder.trim();
        if (dict[ph]) {
            if (!originalTexts.has(el)) originalTexts.set(el, el.placeholder);
            el.placeholder = dict[ph];
        }
    });

    // Translate select option text
    document.querySelectorAll('#obs-type option').forEach(opt => {
        const t = opt.textContent.trim();
        if (dict[t]) {
            if (!originalTexts.has(opt)) originalTexts.set(opt, opt.textContent);
            opt.textContent = dict[t];
        }
    });

    // Translate nav tabs (use view key mapping)
    const navMap = { dashboard: dict['Authority Dashboard'], map: dict['Territory Map'],
        farmer: dict['Farmer Portal'], engines: dict['Engine View'],
        investor: dict['Investor & Commercial'], architecture: dict['Architecture & Research'],
        api: dict['API Docs'], compare: dict['Compare'] };
    document.querySelectorAll('.nav-tab').forEach(tab => {
        const key = tab.dataset.view;
        if (navMap[key]) {
            if (!originalTexts.has(tab)) originalTexts.set(tab, tab.textContent);
            tab.textContent = navMap[key];
        }
    });

    // Also translate the login screen
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
        const lw = document.createTreeWalker(loginScreen, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => {
                const t = node.textContent.trim();
                if (!t || t.length < 2) return NodeFilter.FILTER_REJECT;
                const parent = node.parentElement;
                if (!parent || parent.tagName === 'SCRIPT') return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        const loginNodes = [];
        while (lw.nextNode()) loginNodes.push(lw.currentNode);
        loginNodes.forEach(node => {
            const original = node.textContent;
            const trimmed = original.trim();
            if (dict[trimmed]) {
                if (!originalTexts.has(node)) originalTexts.set(node, original);
                node.textContent = original.replace(trimmed, dict[trimmed]);
            }
        });
    }
}

// Init language
(function initLang() {
    const saved = localStorage.getItem('roatis_lang') || 'en';
    const sel = document.getElementById('lang-select');
    if (sel) sel.value = saved;
    setLanguage(saved);
})();
document.getElementById('lang-select')?.addEventListener('change', (e) => setLanguage(e.target.value));
