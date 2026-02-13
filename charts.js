// Charts Module for Dashboard Visualizations

class ChartRenderer {
    constructor() {
        this.charts = {};
    }

    // Render bar chart for patients by village
    renderVillageChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth * 2; // Retina display
        const height = canvas.height = 300 * 2;

        ctx.scale(2, 2);

        const villages = Object.keys(data);
        const counts = Object.values(data);
        const maxCount = Math.max(...counts, 1);

        const barWidth = (width / 2) / villages.length - 20;
        const chartHeight = height / 2 - 60;

        // Clear canvas
        ctx.clearRect(0, 0, width / 2, height / 2);

        // Draw bars
        villages.forEach((village, index) => {
            const barHeight = (counts[index] / maxCount) * chartHeight;
            const x = index * (barWidth + 20) + 30;
            const y = chartHeight - barHeight + 20;

            // Gradient
            const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#2E7D32');

            // Draw bar
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw value
            ctx.fillStyle = '#1A1A1A';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(counts[index], x + barWidth / 2, y - 5);

            // Draw label
            ctx.fillStyle = '#666666';
            ctx.font = '11px sans-serif';
            ctx.save();
            ctx.translate(x + barWidth / 2, chartHeight + 35);
            ctx.rotate(-Math.PI / 6);
            ctx.fillText(village, 0, 0);
            ctx.restore();
        });
    }

    // Render pie chart for risk distribution
    renderRiskChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = 300 * 2;

        ctx.scale(2, 2);

        const centerX = width / 4;
        const centerY = height / 4;
        const radius = Math.min(width / 4, height / 4) - 40;

        const total = data.high + data.medium + data.low;
        if (total === 0) {
            ctx.fillStyle = '#999999';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('कोई डेटा नहीं', centerX, centerY);
            return;
        }

        const colors = {
            high: '#D32F2F',
            medium: '#F57C00',
            low: '#388E3C'
        };

        const labels = {
            high: 'उच्च जोखिम',
            medium: 'मध्यम जोखिम',
            low: 'कम जोखिम'
        };

        // Clear canvas
        ctx.clearRect(0, 0, width / 2, height / 2);

        let currentAngle = -Math.PI / 2;

        // Draw slices
        Object.keys(data).forEach((key) => {
            const sliceAngle = (data[key] / total) * 2 * Math.PI;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();

            ctx.fillStyle = colors[key];
            ctx.fill();

            // Draw label
            if (data[key] > 0) {
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
                const labelY = centerY + Math.sin(labelAngle) * (radius + 30);

                ctx.fillStyle = colors[key];
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(data[key], labelX, labelY);

                ctx.fillStyle = '#666666';
                ctx.font = '11px sans-serif';
                ctx.fillText(labels[key], labelX, labelY + 15);
            }

            currentAngle += sliceAngle;
        });
    }

    // Update charts with new data
    updateCharts(villageData, riskData) {
        this.renderVillageChart('villageChart', villageData);
        this.renderRiskChart('riskChart', riskData);
    }

    // Calculate statistics from patient data
    calculateStats(patients) {
        const villageData = {};
        const riskData = { high: 0, medium: 0, low: 0 };

        patients.forEach(patient => {
            // Count by village
            if (patient.village) {
                villageData[patient.village] = (villageData[patient.village] || 0) + 1;
            }

            // Count by risk
            const risk = this.assessRisk(patient);
            riskData[risk]++;
        });

        return { villageData, riskData };
    }

    // Assess patient risk level
    assessRisk(patient) {
        let riskScore = 0;

        // High BP
        if (patient.bpSystolic > 140 || patient.bpDiastolic > 90) {
            riskScore += 2;
        } else if (patient.bpSystolic > 130 || patient.bpDiastolic > 85) {
            riskScore += 1;
        }

        // High sugar
        if (patient.sugarLevel > 200) {
            riskScore += 2;
        } else if (patient.sugarLevel > 140) {
            riskScore += 1;
        }

        // Pregnancy
        if (patient.pregnancyStatus === 'yes') {
            riskScore += 1;
        }

        if (riskScore >= 3) return 'high';
        if (riskScore >= 1) return 'medium';
        return 'low';
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartRenderer;
}
