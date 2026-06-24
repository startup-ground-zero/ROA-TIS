// ===== ROA-TIS Frontend — Stage 3: Live Interactive Dashboard =====
const API_BASE = 'http://127.0.0.1:5000/api';

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
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('obs-date');
    if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

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
    fetchJSON(`/api/territories/scores/${year}`).then(data => {
        if (!data || !Array.isArray(data)) return;
        const bounds = [];
        data.forEach(t => {
            if (t.latitude == null || t.longitude == null) return;
            const rti = t.rti != null ? t.rti.toFixed(1) : '—';
            const color = t.rti >= 70 ? '#2ecc71' : t.rti >= 40 ? '#f7b731' : '#ff6b6b';
            const marker = L.circleMarker([t.latitude, t.longitude], {
                radius: 12, fillColor: color, color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.85
            }).addTo(mapInstance);

            marker.bindPopup(`
                <div class="map-popup-title">${t.name}</div>
                <div class="map-popup-score" style="color:${color}">RTI: ${rti}</div>
                <span class="map-popup-btn" onclick="navigateToTerritory('${t.id}')">View Dashboard →</span>
            `);
            bounds.push([t.latitude, t.longitude]);
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
const TRANSLATIONS = {
    en: {
        dashboard: 'Authority Dashboard', map: 'Territory Map', farmer: 'Farmer Portal',
        engines: 'Engine View', investor: 'Investor & Commercial', architecture: 'Architecture & Research',
        api: 'API Docs', compare: 'Compare', compare_title: 'Territory Comparison',
        logout: 'Logout', submit_obs: 'Submit Observation', export_pdf: '📄 Download Territory Report (PDF)',
        export_csv: '📊 Export CSV', loading: 'Loading territory data...'
    },
    el: {
        dashboard: 'Πίνακας Αρχής', map: 'Χάρτης', farmer: 'Πύλη Αγρότη',
        engines: 'Μηχανές', investor: 'Επενδυτές', architecture: 'Αρχιτεκτονική',
        api: 'API Τεκμ.', compare: 'Σύγκριση', compare_title: 'Σύγκριση Εδαφών',
        logout: 'Αποσύνδεση', submit_obs: 'Υποβολή', export_pdf: '📄 Αναφορά (PDF)',
        export_csv: '📊 Εξαγωγή CSV', loading: 'Φόρτωση δεδομένων...'
    },
    es: {
        dashboard: 'Panel de Autoridad', map: 'Mapa', farmer: 'Portal Agricultor',
        engines: 'Motores', investor: 'Inversores', architecture: 'Arquitectura',
        api: 'Docs API', compare: 'Comparar', compare_title: 'Comparación Territorial',
        logout: 'Cerrar sesión', submit_obs: 'Enviar', export_pdf: '📄 Informe (PDF)',
        export_csv: '📊 Exportar CSV', loading: 'Cargando datos...'
    },
    it: {
        dashboard: 'Pannello Autorità', map: 'Mappa', farmer: 'Portale Agricoltore',
        engines: 'Motori', investor: 'Investitori', architecture: 'Architettura',
        api: 'Docs API', compare: 'Confronta', compare_title: 'Confronto Territoriale',
        logout: 'Esci', submit_obs: 'Invia', export_pdf: '📄 Report (PDF)',
        export_csv: '📊 Esporta CSV', loading: 'Caricamento dati...'
    },
    pt: {
        dashboard: 'Painel Autoridade', map: 'Mapa', farmer: 'Portal Agricultor',
        engines: 'Motores', investor: 'Investidores', architecture: 'Arquitetura',
        api: 'Docs API', compare: 'Comparar', compare_title: 'Comparação Territorial',
        logout: 'Sair', submit_obs: 'Enviar', export_pdf: '📄 Relatório (PDF)',
        export_csv: '📊 Exportar CSV', loading: 'Carregando dados...'
    },
};

function setLanguage(lang) {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
    localStorage.setItem('roatis_lang', lang);
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        const key = tab.dataset.view;
        if (t[key]) tab.textContent = t[key];
    });
    // Update other translatable elements
    const logout = document.getElementById('btn-logout');
    if (logout) logout.textContent = t.logout;
    const submitObs = document.getElementById('btn-submit-obs');
    if (submitObs) submitObs.textContent = t.submit_obs;
    const pdfBtn = document.getElementById('btn-export-pdf');
    if (pdfBtn) pdfBtn.textContent = t.export_pdf;
    const csvBtn = document.getElementById('btn-export-csv');
    if (csvBtn) csvBtn.textContent = t.export_csv;
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) loadingText.textContent = t.loading;
    const compareTitle = document.querySelector('.compare-title');
    if (compareTitle) compareTitle.textContent = t.compare_title;
}

// Init language
(function initLang() {
    const saved = localStorage.getItem('roatis_lang') || 'en';
    const sel = document.getElementById('lang-select');
    if (sel) sel.value = saved;
    setLanguage(saved);
})();
document.getElementById('lang-select')?.addEventListener('change', (e) => setLanguage(e.target.value));
