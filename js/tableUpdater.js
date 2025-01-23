class TableUpdater {
    static updateReadingsTable(data) {
      const tableBody = document.getElementById('readingsTableBody');
      const sortedData = [...data]
        .sort((a, b) => new Date(b.PeriodStart) - new Date(a.PeriodStart))
        .filter(reading => reading.Value);
  
      tableBody.innerHTML = sortedData.map(this.createTableRow).join('');
    }
  
    static createTableRow(reading) {
      return `
        <tr class="table-row">
          <td class="table-cell">${reading.ColumnDisplay}</td>
          <td class="table-cell">${reading.Name}</td>
          <td class="table-cell">${reading.Value}</td>
          <td class="table-cell">${TableUpdater.getStatusBadge(reading)}</td>
        </tr>
      `;
    }
  
    static getStatusBadge(reading) {
      if (reading.IsHighLimit) return '<span class="badge badge-high">HIGH</span>';
      if (reading.IsLowLimit) return '<span class="badge badge-low">LOW</span>';
      return '<span class="badge badge-normal">Normal</span>';
    }
  }