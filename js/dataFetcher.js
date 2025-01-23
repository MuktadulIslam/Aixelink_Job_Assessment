class DataFetcher {
    static async fetchData() {
      try {
        const response = await axios.get("http://103.121.12.92:9051/data", {
          headers: { "Content-Type": "application/xml; charset=utf-8" }
        });
        const xmlDoc = new DOMParser().parseFromString(response.data.response, "text/xml");
        const base64Data = xmlDoc.querySelector('data[conceptID="data"]').textContent;
        return JSON.parse(atob(base64Data));
      } catch (error) {
        console.error('Error fetching data:', error);
        return [];
      }
    }
  }