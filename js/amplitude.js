class AmplitudeControl extends HTMLElement {
  constructor() {
    super();

    // Attach a shadow DOM
    const shadow = this.attachShadow({ mode: 'open' });

    // Wrapper for consistent layout
    const wrapper = document.createElement('div');
    wrapper.style.display = 'inline-block';
    wrapper.style.width = '10rem'; // Ensures both elements match width

    // Slider container
    const sliderContainer = document.createElement('div');
    sliderContainer.classList.add('slider-container');

    // Container for slider and number input
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container'); // Fixed height container

    // Slider input
    this.slider = document.createElement('input');
    this.slider.type = 'range';
    this.slider.min = this.getAttribute('min') || 1;
    this.slider.max = this.getAttribute('max') || 10;
    this.slider.value = this.getAttribute('value') || 1;
    this.slider.classList.add('styled-slider');

    // Value display inside the slider handle
    this.valueDisplay = document.createElement('span');
    this.valueDisplay.classList.add('value-display');
    this.valueDisplay.textContent = this.slider.value;

    // Numeric input for amplitude (hidden initially)
    this.numberInput = document.createElement('input');
    this.numberInput.type = 'number';
    this.numberInput.min = this.slider.min;
    this.numberInput.max = this.slider.max;
    this.numberInput.value = this.slider.value;
    this.numberInput.classList.add('number-input');
    this.numberInput.style.display = 'none';

    // Sync slider and input values
    this.slider.addEventListener('input', () => {
      this.numberInput.value = this.slider.value;
      this.updateSliderValue();
      this.dispatchEvent(new CustomEvent('amplitude-change', { detail: parseFloat(this.slider.value) }));
    });

    this.numberInput.addEventListener('input', () => {
      this.slider.value = this.numberInput.value;
      this.updateSliderValue();
      this.dispatchEvent(new CustomEvent('amplitude-change', { detail: parseFloat(this.numberInput.value) }));
    });

    // Append elements to shadow DOM
    shadow.appendChild(wrapper);
    wrapper.appendChild(sliderContainer);
    sliderContainer.appendChild(inputContainer); // Use the container
    inputContainer.appendChild(this.slider); // Slider goes into input container
    inputContainer.appendChild(this.valueDisplay); // Value display
    inputContainer.appendChild(this.numberInput); // Number input

    // Add custom styles
    const style = document.createElement('style');
    style.textContent = `
      .slider-container {
        width: 100%;
        margin-top: 10px;
      }
      .input-container {
        position: relative; /* To position slider and input absolutely */
        width: 100%;
        height: 2rem; /* Fixed height to prevent layout shifting */
      }
      .styled-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 10px;
        background: #fff;
        outline: none;
        opacity: 0.7;
        border: 0.5px solid #d3d3d3;
        border-radius: 3px;
        position: absolute;
        top: 0; /* Position the slider at the top of the container */
      }
      .styled-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 40px;
        height: 25px;
        background-color: #f5f5f5;
        cursor: pointer;
        border: 0.5px solid #d3d3d3;
        border-radius: 3px;
        position: relative;
      }
      .styled-slider::-moz-range-thumb {
        width: 40px;
        height: 25px;
        background-color: #f5f5f5;
        cursor: pointer;
        border-radius: 3px;
        position: relative;
      }
      .value-display {
        position: absolute;
        top: -5px; /* Align directly within the slider handle */
        width: 40px;
        height: 25px;
        color: black;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        pointer-events: none;
      }
      .number-input {
        width: 100%;
        padding: 1px;
        font-size: 1rem;
        box-sizing: border-box;
        border: 0.5px solid #d3d3d3;
        border-radius: 3px;
        background-color: #f8f8f8;
        -webkit-appearance: textfield;
        position: absolute;
        top: 0px; /* Position the input just below the slider */
      }

      .number-input::-webkit-inner-spin-button,
      .number-input::-webkit-outer-spin-button {
        -webkit-appearance: inline; /* Forces the arrows to stay visible */
        opacity: 1; /* Ensures full visibility */
      }

      .number-input::-moz-spin-button {
        -moz-appearance: initial; /* Keeps the arrows visible in Firefox */
      }
    `;
    shadow.appendChild(style);

    // Initialize slider display value position
    this.updateSliderValue();
  }

  // Method to update the displayed value and its position
  updateSliderValue() {
    this.valueDisplay.textContent = this.slider.value;

    // Calculate position of value display to align with the slider thumb
    const sliderWidth = this.slider.offsetWidth;
    const max = this.slider.max - this.slider.min;
    const valuePosition = ((this.slider.value - this.slider.min) / max) * (sliderWidth - 40); // 40 is the width of the value display

    const offset = 1;
    this.valueDisplay.style.left = `${valuePosition + offset}px`;
  }

  // Getter and setter for value
  get value() {
    return parseFloat(this.slider.value);
  }

  set value(newValue) {
    this.slider.value = newValue;
    this.updateSliderValue();
  }
}
// Define the custom element
customElements.define('amplitude-control', AmplitudeControl);

document.getElementById('toggleInput').addEventListener('change', (event) => {
  const amplitudeControl = document.querySelector('amplitude-control');
  if (event.target.checked) {
    amplitudeControl.slider.style.display = 'inline-block';
    amplitudeControl.numberInput.style.display = 'none';
    amplitudeControl.valueDisplay.style.color = 'black';

    // Ensure layout recalculates and update the position of valueDisplay
    requestAnimationFrame(() => {
      amplitudeControl.updateSliderValue();
    });
  } else {
    amplitudeControl.slider.style.display = 'none';
    amplitudeControl.numberInput.style.display = 'inline-block';
    amplitudeControl.valueDisplay.style.color = 'white';
  }
});





let amplitude = 1; // Default amplitude

// Event listener for amplitude control
document.querySelector('amplitude-control').addEventListener('amplitude-change', (event) => {
    amplitude = event.detail;
});

// Configurable data limit and update interval
const DATA_LIMIT = Infinity;
const UPDATE_INTERVAL = 1000;

// Get the canvas element and initialize it without a border
const canvas = document.getElementById('realTimeChart');
canvas.style.border = "none"; // Initially no border

// Initialize Chart.js with zoom and pan enabled initially
const ctx = canvas.getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [
            {
                label: 'Noisy Sine Wave',
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                data: [],
                fill: false,
            },
            {
                label: 'Noisy Cosine Wave',
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                data: [],
                fill: false,
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                title: {
                    display: true,
                    text: 'Time'
                },
                grid: {
                    display: true // Initially show the grid for X axis
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Amplitude'
                },
                grid: {
                    display: true // Initially show the grid for Y axis
                }
            }
        },
        plugins: {
            zoom: {
                pan: {
                    enabled: true, // Start with pan disabled
                    mode: 'xy',
                    threshold: 5
                },
                zoom: {
                    wheel: {
                        enabled: false // Start with zoom disabled
                    },
                    pinch: {
                        enabled: true // Start with pinch zoom disabled
                    },
                    mode: 'xy'
                }
            }
        }
    }
});

// Variables to control real-time data generation
let time = 0;
let isCollectingData = true;
let intervalActive = true;

// Function to generate noisy sine and cosine data
function generateNoisyData() {
    const sineValue = amplitude * Math.sin(time) + (Math.random() - 0.5) * 0.2;
    const cosineValue = amplitude * Math.cos(time) + (Math.random() - 0.5) * 0.2;
    time += 0.1;
    return { sineValue, cosineValue };
}

// Function to collect data points only
function collectData() {
    if (!isCollectingData || !intervalActive) return;

    // Generate new data points
    const { sineValue, cosineValue } = generateNoisyData();

    // Add new data points to the chart
    chart.data.datasets[0].data.push({ x: time, y: sineValue });
    chart.data.datasets[1].data.push({ x: time, y: cosineValue });

    // Remove old data points to keep the chart manageable only when actively collecting data
    if (chart.data.datasets[0].data.length > DATA_LIMIT) {
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
    }
}

// Function to update the chart visualization only
function updateChart() {
    chart.update();
}

// Set intervals for collecting data and updating the chart
const dataCollectionInterval = setInterval(collectData, UPDATE_INTERVAL);
const chartUpdateInterval = setInterval(updateChart, UPDATE_INTERVAL);

// Function to enable or disable zoom and pan programmatically
function setZoomPanState(enable) {
    chart.options.plugins.zoom.zoom.wheel.enabled = enable;
    chart.update();
}

// Pause/Resume button functionality
const pauseButton = document.getElementById('pauseButton');
pauseButton.addEventListener('click', () => {
    isCollectingData = !isCollectingData;
    pauseButton.textContent = isCollectingData ? "Pause" : "Resume";
    setZoomPanState(!isCollectingData); // Enable zoom/pan if paused
});

// Button to end data collection, enable zoom/pan, hide axes/grid, and show border
document.getElementById('endButton').addEventListener('click', () => {
    isCollectingData = false;
    intervalActive = false; // Stop collecting data permanently

    // Stop the data collection interval but keep the chart updating
    clearInterval(dataCollectionInterval);

    // Enable zoom and pan after data collection ends
    setZoomPanState(true);

    // Hide the axes and grid lines
    chart.options.scales.x.display = false;
    chart.options.scales.y.display = false;
    chart.options.scales.x.grid.display = false;
    chart.options.scales.y.grid.display = false;

    // Add a border to the canvas
    canvas.style.border = "1px solid #d3d3d3"; // Customize the border as needed
    canvas.style.borderRadius = '3px';

    // Update the chart with new display options
    chart.update();
});

// Optional: Reset Zoom Button
document.getElementById('resetZoomButton').addEventListener('click', () => {
    chart.resetZoom(); // Resets the zoom level to the initial state
});
