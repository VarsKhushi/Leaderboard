let chart;

function updateChart(data) {
    const ctx = document.getElementById('sectionChart');
    const ctx2d = ctx.getContext('2d');
    
    // Count students per section
    const sectionCounts = data.reduce((acc, student) => {
        const section = student.section || 'N/A';
        acc[section] = (acc[section] || 0) + 1;
        return acc;
    }, {});

    // Prepare data for Chart.js
    const sortedSections = Object.keys(sectionCounts).sort();
    const counts = sortedSections.map(section => sectionCounts[section]);

    // Define a fixed color palette
    const colorPalette = [
        '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f',
        '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
    ];

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx2d, {
        type: 'doughnut',
        data: {
            labels: sortedSections,
            datasets: [{
                data: counts,
                backgroundColor: colorPalette.slice(0, sortedSections.length),
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 9
                        },
                        padding: 8
                    }
                },
                title: {
                    display: true,
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                },
                doughnutlabel: {
                    labels: [{
                        text: 'Total',
                        font: {
                            size: '12'
                        }
                    }, {
                        text: function(chart) {
                            return chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        },
                        font: {
                            size: '18',
                            weight: 'bold'
                        }
                    }]
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true,
                onHover: (event, chartElement) => {
                    event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });

    ctx.onclick = function(evt) {
        var activePoints = chart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        if (activePoints.length > 0) {
            var firstPoint = activePoints[0];
            var label = chart.data.labels[firstPoint.index];
            var value = chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
            console.log(label + ": " + value);
            // Call a function to filter the main table by this section
            filterDataBySection(label);
        }
    };

    function filterDataBySection(section) {
        const sectionFilter = document.getElementById('section-filter');
        sectionFilter.value = section;
        sectionFilter.dispatchEvent(new Event('change'));
    }
}