// ===== VIEW SWITCHING =====
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Update tabs
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        // Update views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('view-' + tab.dataset.view).classList.add('active');
    });
});

// ===== CHARTS =====
document.addEventListener('DOMContentLoaded', () => {

    // --- 60-Year Trajectory Chart ---
    const ctxTraj = document.getElementById('trajectoryChart');
    if (ctxTraj) {
        new Chart(ctxTraj, {
            type: 'line',
            data: {
                labels: ['1965', '1975', '1985', '1995', '2005', '2015', '2025'],
                datasets: [
                    {
                        label: 'Stewardship Capacity %',
                        data: [78, 72, 65, 58, 60, 70, 88],
                        borderColor: '#4ecdc4',
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Ecological Equilibrium',
                        data: [74.3, 70.7, 63.6, 57.1, 60.6, 72.1, 85.2],
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.05)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Wildlife Balance %',
                        data: [68, 64, 56, 50, 55, 66, 82],
                        borderColor: '#bb8fce',
                        tension: 0.3
                    },
                    {
                        label: 'Soil Organic Matter (×20)',
                        data: [64, 60, 54, 48, 46, 56, 76],
                        borderColor: '#d4a855',
                        tension: 0.3
                    },
                    {
                        label: 'Population (indexed)',
                        data: [100, 87.5, 75, 62.5, 62.5, 50, 50],
                        borderColor: '#ff6b6b',
                        borderDash: [5, 5],
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2.5,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#8899a6', boxWidth: 12, padding: 16, font: { size: 11 } }
                    }
                },
                scales: {
                    x: { ticks: { color: '#8899a6' }, grid: { color: '#1e2730' } },
                    y: {
                        min: 0, max: 100,
                        ticks: { color: '#8899a6' },
                        grid: { color: '#1e2730' }
                    }
                }
            }
        });
    }

    // --- ROA Comparison Chart ---
    const ctxComp = document.getElementById('roaComparisonChart');
    if (ctxComp) {
        new Chart(ctxComp, {
            type: 'bar',
            data: {
                labels: ['Elysian EVOO', 'Sella', 'Kastritsi', 'W. Greece', 'Chalandritsa', 'Messinia', 'Crete', 'Andalusia', 'Tuscany', 'Alentejo'],
                datasets: [
                    {
                        label: 'RTI (Regenerative Index)',
                        data: [85.2, 52.1, 52.1, 69, 60, 60, 60, 54, 66, 56],
                        backgroundColor: 'rgba(78, 205, 196, 0.7)',
                        borderRadius: 4
                    },
                    {
                        label: 'TARS (Risk Score)',
                        data: [6.4, 6.4, 6.4, 10, 5, 5, 9, 12, 8, 11],
                        backgroundColor: 'rgba(255, 107, 107, 0.7)',
                        borderRadius: 4
                    },
                    {
                        label: 'OPCI (Productive Capacity)',
                        data: [78.6, 56.9, 56.9, 62, 68.4, 76.2, 70, 85.3, 79, 88.1],
                        backgroundColor: 'rgba(247, 183, 49, 0.7)',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 3,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#8899a6', boxWidth: 12, padding: 16, font: { size: 11 } }
                    }
                },
                scales: {
                    x: { ticks: { color: '#8899a6', font: { size: 11 } }, grid: { display: false } },
                    y: {
                        min: 0, max: 100,
                        ticks: { color: '#8899a6' },
                        grid: { color: '#1e2730' }
                    }
                }
            }
        });
    }
});

// ===== MOCK INTERACTIONS =====
document.querySelector('.btn-submit')?.addEventListener('click', (e) => {
    e.preventDefault();
    const btn = e.target;
    btn.textContent = '✓ Observation Submitted';
    btn.style.background = '#2ecc71';
    setTimeout(() => {
        btn.textContent = 'Submit Observation';
        btn.style.background = '#4ecdc4';
    }, 2000);
});

document.querySelector('.btn-compute')?.addEventListener('click', (e) => {
    const btn = e.target;
    btn.textContent = '⟳ Computing...';
    btn.style.opacity = '0.7';
    setTimeout(() => {
        btn.textContent = '✓ All engines updated';
        btn.style.opacity = '1';
        btn.style.background = '#2ecc71';
        setTimeout(() => {
            btn.textContent = '⟳ Recompute All Engines';
            btn.style.background = '#4ecdc4';
        }, 2000);
    }, 1200);
});
