// ===== ROA-TIS Frontend — Stage 3: Live Interactive Dashboard =====
const API_BASE = 'http://127.0.0.1:5000/api';

// ===== STATE (reactive — changes trigger reload) =====
let TERRITORY = 'elysian';
let YEAR = 2025;
let FARM = 'farm-elysian';

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
    try {
        const [dashboard, trajectory, comparison, engines, farm, workings] = await Promise.all([
            fetchJSON(`/dashboard/${TERRITORY}/${YEAR}`),
            fetchJSON(`/trajectory/${TERRITORY}`),
            fetchJSON(`/comparison/${YEAR}`),
            fetchJSON(`/engines/${TERRITORY}/${YEAR}`),
            fetchJSON(`/farm/${FARM}`),
            fetchJSON(`/farm/${FARM}/workings?month=2025-06`),
        ]);

        updateKPIs(dashboard.kpis, engines);
        updateCommandCenter(dashboard.command_center);
        updatePriorities(dashboard.priorities);
        updateEngineCards(engines);
        updateFarmerStats(farm);
        renderTrajectoryChart(trajectory);
        renderComparisonChart(comparison);
        renderRevenueChart();
        renderCapitalChart();
        renderRoadmapChart();
        loadObservationHistory();

        if (statusDot) { statusDot.classList.add('online'); statusDot.classList.remove('offline'); }
        console.log(`ROA-TIS: Data loaded for ${TERRITORY} / ${YEAR}`);
    } catch (err) {
        console.error('ROA-TIS API Error:', err);
        if (statusDot) { statusDot.classList.remove('online'); statusDot.classList.add('offline'); }
        renderRevenueChart();
        renderCapitalChart();
        renderRoadmapChart();
    }
}

// ===== TERRITORY & YEAR SELECTORS =====
document.getElementById('territory-select')?.addEventListener('change', (e) => {
    TERRITORY = e.target.value;
    FARM = `farm-${TERRITORY}`;
    loadAllData();
});

document.getElementById('year-select')?.addEventListener('change', (e) => {
    YEAR = parseInt(e.target.value);
    loadAllData();
});

// ===== KPI UPDATES WITH CONFIDENCE =====
function updateKPIs(kpis, engines) {
    // RTI
    const rtiVal = document.getElementById('kpi-rti-value');
    const rtiTrend = document.getElementById('kpi-rti-trend');
    const rtiConf = document.getElementById('kpi-rti-conf');
    if (rtiVal) {
        rtiVal.textContent = kpis.rti;
        rtiVal.className = 'kpi-value ' + (kpis.rti >= 70 ? 'good' : kpis.rti >= 40 ? 'warning' : 'alert');
    }
    if (rtiTrend) rtiTrend.textContent = engines?.rti?.confidence ? `Confidence: ${engines.rti.confidence}` : '';
    if (rtiConf) rtiConf.innerHTML = engines?.rti?.confidence ? renderConfidenceBadge(engines.rti.confidence) : '';

    // TARS
    const tarsVal = document.getElementById('kpi-tars-value');
    const tarsTrend = document.getElementById('kpi-tars-trend');
    const tarsConf = document.getElementById('kpi-tars-conf');
    if (tarsVal) {
        tarsVal.textContent = kpis.tars;
        tarsVal.className = 'kpi-value ' + (kpis.tars <= 5 ? 'good' : kpis.tars <= 10 ? 'warning' : 'alert');
    }
    if (tarsTrend) tarsTrend.textContent = engines?.tars?.status || '';
    if (tarsConf) tarsConf.innerHTML = engines?.tars?.status ? `<span class="conf-badge conf-${engines.tars.status.toLowerCase()}">${engines.tars.status}</span>` : '';

    // BSEP
    const bsepVal = document.getElementById('kpi-bsep-value');
    const bsepTrend = document.getElementById('kpi-bsep-trend');
    const bsepConf = document.getElementById('kpi-bsep-conf');
    if (bsepVal) {
        bsepVal.textContent = kpis.bsep;
        bsepVal.className = 'kpi-value ' + (kpis.bsep >= 60 ? 'alert' : kpis.bsep >= 30 ? 'warning' : 'good');
    }
    if (bsepTrend) bsepTrend.textContent = engines?.bsep?.escalation || '';
    if (bsepConf) bsepConf.innerHTML = engines?.bsep?.escalation ? `<span class="conf-badge conf-${engines.bsep.escalation.toLowerCase()}">${engines.bsep.escalation}</span>` : '';

    // Budget
    const budgetVal = document.getElementById('kpi-budget-value');
    const budgetTrend = document.getElementById('kpi-budget-trend');
    const budgetConf = document.getElementById('kpi-budget-conf');
    if (budgetVal) {
        budgetVal.textContent = '\u20AC' + kpis.budget_gap + 'M';
        budgetVal.className = 'kpi-value ' + (kpis.budget_gap > 150 ? 'alert' : kpis.budget_gap > 50 ? 'warning' : 'good');
    }
    if (budgetTrend) budgetTrend.textContent = engines?.budget?.scenario || '';
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
    if (!tbody || commands.length === 0) return;
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
    if (!list || priorities.length === 0) return;
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
    if (cards.length < 6) return;

    // RTI
    cards[0].querySelector('.engine-score').textContent = engines.rti.score;
    const rtiParams = cards[0].querySelectorAll('.param-val');
    rtiParams[0].textContent = engines.rti.params.stewardship_capacity + '%';
    rtiParams[1].textContent = engines.rti.params.ecological_literacy + '%';
    rtiParams[2].textContent = engines.rti.params.wildlife_balance + '%';
    rtiParams[3].textContent = engines.rti.params.pollinator_index + '%';
    rtiParams[4].textContent = engines.rti.params.soil_organic_matter + '%';
    rtiParams[5].textContent = engines.rti.params.habitat_connectivity + '%';
    cards[0].querySelector('.engine-confidence').innerHTML = `Confidence: <strong>${engines.rti.confidence}</strong> ${renderConfidenceBadge(engines.rti.confidence)}`;

    // TARS
    cards[1].querySelector('.engine-score').textContent = engines.tars.score;
    const tarsParams = cards[1].querySelectorAll('.param-val');
    tarsParams[0].textContent = engines.tars.params.wildfire_events;
    tarsParams[1].textContent = engines.tars.params.flood_events;
    tarsParams[2].textContent = engines.tars.params.pest_disease;
    tarsParams[3].textContent = engines.tars.params.drought_days;
    tarsParams[4].textContent = engines.tars.params.heatwave_days;
    tarsParams[5].textContent = engines.tars.params.years_since_event;
    cards[1].querySelector('.engine-confidence').innerHTML = `Status: <span class="badge-inline ${engines.tars.status.toLowerCase()}">${engines.tars.status}</span>`;

    // OPCI
    cards[2].querySelector('.engine-score').textContent = engines.opci.score;
    const opciParams = cards[2].querySelectorAll('.param-val');
    opciParams[0].textContent = engines.opci.params.productive_trees_pct + '%';
    opciParams[1].textContent = engines.opci.params.tree_vitality + '%';
    opciParams[2].textContent = engines.opci.params.avg_trunk_perimeter + ' cm';
    opciParams[3].textContent = engines.opci.params.yield_per_tree + ' kg';
    opciParams[4].textContent = engines.opci.params.regenerative_inputs;

    // BSEP
    cards[3].querySelector('.engine-score').textContent = engines.bsep.score;
    const bsepParams = cards[3].querySelectorAll('.param-val');
    bsepParams[0].textContent = engines.bsep.category || '\u2014';
    bsepParams[1].textContent = engines.bsep.escalation || '\u2014';
    bsepParams[2].textContent = engines.bsep.recovery_target_years + ' years';
    bsepParams[3].textContent = engines.bsep.current_recovery_pct + '%';
    bsepParams[4].textContent = engines.bsep.human_capital_risk;

    // CAII
    cards[4].querySelector('.engine-score').textContent = engines.caii.score;
    const caiiParams = cards[4].querySelectorAll('.param-val');
    caiiParams[0].textContent = engines.caii.params.community_governance;
    caiiParams[1].textContent = engines.caii.params.human_capital;
    caiiParams[2].textContent = engines.caii.params.social_collaboration;
    caiiParams[3].textContent = engines.caii.params.territorial_intelligence;

    // Budget
    cards[5].querySelector('.engine-score').textContent = '\u20AC' + engines.budget.gap + 'M';
    const budgetParams = cards[5].querySelectorAll('.param-val');
    budgetParams[0].textContent = '\u20AC' + engines.budget.scientific_need + 'M';
    budgetParams[1].textContent = '\u20AC' + engines.budget.current + 'M';
    budgetParams[2].textContent = engines.budget.discounting_ratio;
    budgetParams[3].textContent = engines.budget.scenario;
    budgetParams[4].textContent = engines.budget.urgency + ' / 5';
}

// ===== FARMER STATS =====
function updateFarmerStats(farmData) {
    const stats = document.querySelectorAll('.stat-row span:last-child');
    if (stats.length < 6 || !farmData.latest_production) return;
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
            // Clear form
            if (document.getElementById('obs-description')) document.getElementById('obs-description').value = '';
            if (document.getElementById('obs-buffer')) document.getElementById('obs-buffer').checked = false;
            if (document.getElementById('obs-paths')) document.getElementById('obs-paths').checked = false;
            if (document.getElementById('obs-ignition')) document.getElementById('obs-ignition').checked = false;

            // Auto-recalculate after observation
            await fetch(`${API_BASE}/recalculate/${TERRITORY}/${YEAR}`, { method: 'POST' });

            // Reload dashboard data
            const [dashboard, engines] = await Promise.all([
                fetchJSON(`/dashboard/${TERRITORY}/${YEAR}`),
                fetchJSON(`/engines/${TERRITORY}/${YEAR}`),
            ]);
            updateKPIs(dashboard.kpis, engines);
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
        if (!recalcRes.ok) throw new Error('Recalculate failed');

        const [dashboard, engines] = await Promise.all([
            fetchJSON(`/dashboard/${TERRITORY}/${YEAR}`),
            fetchJSON(`/engines/${TERRITORY}/${YEAR}`),
        ]);

        updateKPIs(dashboard.kpis, engines);
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
    loadAllData();
});
