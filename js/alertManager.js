class AlertManager {
    static updateAlerts(data) {
        const averages = this.calculateAverages(data);
        this.updateAlertDisplay(averages);
    }

    static calculateAverages(data) {
        const averages = {};
        data.forEach(item => {
            if (!isNaN(parseFloat(item.Value)) && item.Value !== "") {
                if (!averages[item.Name]) {
                    averages[item.Name] = {
                        sum: 0,
                        count: 0,
                        minRange: item.MinRange,
                        maxRange: item.MaxRange
                    };
                }
                averages[item.Name].sum += parseFloat(item.Value);
                averages[item.Name].count += 1;
            }
        });

        return Object.entries(averages).map(([name, data]) => ({
            name,
            averageValue: (data.sum / data.count).toFixed(2),
            minRange: data.minRange,
            maxRange: data.maxRange
        }));
    }

    static updateAlertDisplay(averages) {
        const alertsList = document.getElementById('alertsList');
        const alertData = averages.filter(data => !data.name.startsWith('GCS'));

        alertsList.innerHTML = this.generateAlertHTML(alertData);
    }

    static generateAlertHTML(alertData) {
        return alertData.map(data => `
        <div class="alert-item">
          <span class="alert-parameter">${data.name}:</span>
          <span class="alert-value">${data.averageValue}</span>
          <span class="alert-status">
            ${this.getAlertStatus(data)}
          </span>
        </div>
      `).join('');
    }

    static getAlertStatus(data) {
        if (data.averageValue > data.maxRange) return 'HIGH';
        if (data.averageValue < data.minRange) return 'LOW';
        return '';
    }
}