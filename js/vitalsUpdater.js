class VitalsUpdater {
    static updateCurrentVitals(data) {
      const latestReadings = this.getLatestReadings(data);
      this.updateVitalDisplays(latestReadings);
    }
  
    static getLatestReadings(data) {
      const latestReadings = {};
      data.forEach(reading => {
        if (reading.Value) {
          latestReadings[reading.Name] = reading.Value;
        }
      });
      return latestReadings;
    }
  
    static updateVitalDisplays(readings) {
      document.getElementById('currentHR').textContent = `${readings['HR ECG'] || '-'} bpm`;
      document.getElementById('currentSpO2').textContent = `${readings['SpO2 %'] || '-'}%`;
      document.getElementById('currentBP').textContent = `${readings['NIBP Systolic'] || '-'}/${readings['NIBP Diastolic'] || '-'}`;
      document.getElementById('currentAP').textContent = `${readings['APS'] || '-'}/${readings['APD'] || '-'}`;
      document.getElementById('currentTemp').textContent = `${readings['T1'] || '-'}°C`;
      document.getElementById('currentCVPm').textContent = `${readings['CVPm'] || '-'}`;
    }
  }