let chartInstance;
const pieChartInstances = {}; // To store all pie chart instances by year
// Load XML data dynamically, parse it, and create a grouped bar chart
let lineChartInstance; // Define a global variable for the line chart instance

function loadXMLData() {
  fetch('z03.xml') // Adjust the path if necessary
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.text(); // Convert response to text (XML as a string)
    })
    .then(data => {
      // Parse the XML data
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml");

      // Process the XML data to extract data for the chart
      processData(xmlDoc);
    })
    .catch(error => console.error("Error loading XML file:", error));
}

// Function to process the parsed XML data and prepare it for Chart.js
function processData(xmlDoc) {
  const records = xmlDoc.getElementsByTagName("zaznam");

  // Arrays to store data for each grade across years
  const years = [];
  const gradeA = [];
  const gradeB = [];
  const gradeC = [];
  const gradeD = [];
  const gradeE = [];
  const gradeFX = [];
  const gradeFN = [];

  // Loop through each <zaznam> element and extract data
  Array.from(records).forEach(record => {
    const year = record.getElementsByTagName("rok")[0].textContent;
    const a = parseInt(record.getElementsByTagName("A")[0].textContent);
    const b = parseInt(record.getElementsByTagName("B")[0].textContent);
    const c = parseInt(record.getElementsByTagName("C")[0].textContent);
    const d = parseInt(record.getElementsByTagName("D")[0].textContent);
    const e = parseInt(record.getElementsByTagName("E")[0].textContent);
    const fx = parseInt(record.getElementsByTagName("FX")[0].textContent);
    const fn = parseInt(record.getElementsByTagName("FN")[0].textContent);
    
    const canvasId = `pie-chart-${year}`;
    const container = document.getElementById("piechart-container");
    const canvas = document.createElement("canvas");
    canvas.id = canvasId;
    container.appendChild(canvas);
    
    // Calculate the total count for this specific year
    const total = a + b + c + d + e + fx + fn;
    const gradeCounts = [a, b, c, d, e, fx, fn];
    const grade_percentage = [
      a/total*100,
      b/total*100,
      c/total*100,
      d/total*100,
      e/total*100,
      fx/total*100,
      fn/total*100
    ]
  
    pieChart(canvasId,year,gradeCounts,grade_percentage);
    // Push individual grade counts for each year into their respective arrays
    years.push(year);
    gradeA.push(a);
    gradeB.push(b);
    gradeC.push(c);
    gradeD.push(d);
    gradeE.push(e);
    gradeFX.push(fx);
    gradeFN.push(fn);
  });

  // Create or update the chart based on the initial screen width
  updateChart(years, gradeA, gradeB, gradeC, gradeD, gradeE, gradeFX, gradeFN);

  createLineChart(years, gradeA, gradeB, gradeC, gradeD, gradeE, gradeFX, gradeFN);
}

function pieChart(id, year, gradeCounts, gradePercentage) {
  const canvas = document.getElementById(id);
  
  if (!canvas) {
    console.error(`Canvas with id "${id}" not found.`);
    return;
  }

  // Destroy existing chart instance if it exists
  if (pieChartInstances[id]) {
    pieChartInstances[id].destroy();
  }

  // Set canvas dimensions based on screen size
  
  if(window.innerWidth <= 1024 && window.innerWidth > 768){
    canvas.width = 400;
    canvas.height = 400;
  }
  else if (window.innerWidth <= 768 && window.innerWidth > 545)
  {
    canvas.width = 500;
    canvas.height = 500;
  }
  else if(window.innerWidth <= 545){
    canvas.width = 310;
    canvas.height = 310;
  }
  else{
    canvas.width = 500;
    canvas.height = 500;
  }


  // Create the pie chart and store its instance
  pieChartInstances[id] = new Chart(canvas.getContext('2d'), {
    type: 'pie',
    data: {
      labels: ['A', 'B', 'C', 'D', 'E', 'FX', 'FN'],
      datasets: [{
        data: gradeCounts,
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 205, 86, 0.7)',
          'rgba(201, 203, 207, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ]
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: `Distribúcia známok pre rok ${year}` },
        datalabels: {
          color: '#000',
          formatter: (value, context) => {
            const percentage = gradePercentage[context.dataIndex].toFixed(1);
            return percentage > 0 ? `${percentage}%` : ''; 
          },
          font: { weight: 'bold' }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function updateChart(years, gradeA, gradeB, gradeC, gradeD, gradeE, gradeFX, gradeFN) {
  const isSmallScreen = window.innerWidth < 768;
  const orientation = isSmallScreen ? 'y' : 'x';
  const canvas = document.getElementById('gradesComparisonChart');

  // Destroy existing chart instance if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: years,
      datasets: [
        { label: 'Grade A', data: gradeA, backgroundColor: 'rgba(75, 192, 192, 0.7)' },
        { label: 'Grade B', data: gradeB, backgroundColor: 'rgba(255, 159, 64, 0.7)' },
        { label: 'Grade C', data: gradeC, backgroundColor: 'rgba(153, 102, 255, 0.7)' },
        { label: 'Grade D', data: gradeD, backgroundColor: 'rgba(255, 205, 86, 0.7)' },
        { label: 'Grade E', data: gradeE, backgroundColor: 'rgba(201, 203, 207, 0.7)' },
        { label: 'Grade FX', data: gradeFX, backgroundColor: 'rgba(54, 162, 235, 0.7)' },
        { label: 'Grade FN', data: gradeFN, backgroundColor: 'rgba(255, 99, 132, 0.7)' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Prevents stretching and allows CSS to control height
      indexAxis: orientation,
      scales: {
        x: { title: { display: true, text: orientation === 'x' ? 'Školský rok' : 'Počet študentov' } },
        y: { title: { display: true, text: orientation === 'x' ? 'Počet študentov' : 'Školský rok' } }
      },
      plugins: {
        title: {
          display: true,
          text: 'Porovnanie známok počas rokov'
        }
      }
    }
  });
}

function createLineChart(years, gradeA, gradeB, gradeC, gradeD, gradeE, gradeFX, gradeFN) {
  const canvas = document.getElementById('gradeTrendsChart');
  
  // Destroy existing line chart instance if it exists
  if (lineChartInstance) {
    lineChartInstance.destroy();
  }
  
  lineChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        { label: 'Grade A', data: gradeA, borderColor: 'rgba(75, 192, 192, 0.7)', fill: false },
        { label: 'Grade B', data: gradeB, borderColor: 'rgba(255, 159, 64, 0.7)', fill: false },
        { label: 'Grade C', data: gradeC, borderColor: 'rgba(153, 102, 255, 0.7)', fill: false },
        { label: 'Grade D', data: gradeD, borderColor: 'rgba(255, 205, 86, 0.7)', fill: false },
        { label: 'Grade E', data: gradeE, borderColor: 'rgba(201, 203, 207, 0.7)', fill: false },
        { label: 'Grade FX', data: gradeFX, borderColor: 'rgba(54, 162, 235, 0.7)', fill: false },
        { label: 'Grade FN', data: gradeFN, borderColor: 'rgba(255, 99, 132, 0.7)', fill: false }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Školský rok' } },
        y: { title: { display: true, text: 'Počet študentov' } }
      },
      plugins: {
        title: {
          display: true,
          text: 'Trend známok počas rokov'
        }
      }
    }
  });
}

// Event listener for window resize to update the chart orientation dynamically
window.addEventListener('resize', () => {
  // Call updateChart with the existing data arrays
  for (const [id, chartInstance] of Object.entries(pieChartInstances)) {
    const year = id.split('-').pop(); // Extract the year from the canvas ID
    const chartData = chartInstance.data.datasets[0].data; // Get the data
    const gradePercentage = chartData.map((value, index) => (value / chartData.reduce((a, b) => a + b, 0)) * 100);
    
    // Re-create the pie chart with updated size
    pieChart(id, year, chartData, gradePercentage);
  }
  updateChart(chartInstance.data.labels, 
              chartInstance.data.datasets[0].data, 
              chartInstance.data.datasets[1].data, 
              chartInstance.data.datasets[2].data, 
              chartInstance.data.datasets[3].data, 
              chartInstance.data.datasets[4].data, 
              chartInstance.data.datasets[5].data, 
              chartInstance.data.datasets[6].data);
});

// Load the XML data and initialize the chart on page load
window.addEventListener('DOMContentLoaded', loadXMLData);

