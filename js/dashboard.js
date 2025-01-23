class Dashboard {
    constructor() {
      this.globalData = [];
      this.initialize();
    }
  
    initialize() {
      this.fetchAndUpdateData();
      this.setupRefreshInterval();
      this.setupResizeHandler();
    }
  
    setupRefreshInterval() {
      setInterval(() => this.fetchAndUpdateData(), 10000);
    }
  
    setupResizeHandler() {
      window.addEventListener('resize', _.debounce(() => this.handleResize(), 250));
    }
  
    async fetchAndUpdateData() {
      const data = await DataFetcher.fetchData();
      if (data && data.length > 0) {
        this.globalData = data;
        this.updateDashboard(data);
      }
    }
  
    updateDashboard(data) {
      VitalsUpdater.updateCurrentVitals(data);
      AlertManager.updateAlerts(data);
      TableUpdater.updateReadingsTable(data);
      
      // Update charts
      const NIBPData = data.filter(item => 
        item.Name === "NIBP Systolic" || item.Name === "NIBP Diastolic"
      );
      ChartManager.createTrendsChart(NIBPData, 'NIBPChart', "NIBP Systolic", "NIBP Diastolic");
      
      const APData = data.filter(item => 
        item.Name === "APS" || item.Name === "APD"
      );
      ChartManager.createTrendsChart(APData, 'APChart', "APS", "APD");
      
      const HRData = data.filter(item => item.Name === "HR ECG");
      ChartManager.createTrendsChartSingleValue(HRData, 'HREChart', "HR ECG");
      
      const SpO2Data = data.filter(item => item.Name === "SpO2 %");
      ChartManager.createTrendsChartSingleValue(SpO2Data, 'SpO2Chart', "SpO2 %");
    }
  
    handleResize() {
      if (this.globalData.length > 0) {
        this.updateDashboard(this.globalData);
      }
    }
  }
  
  // Initialize dashboard when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
  });