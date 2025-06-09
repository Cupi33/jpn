//for INFORMASI KELAHIRAN BAYI DI MALAYSIA

// --- Chart.js setup and extensions (kept as is for professional styling) ---
const Chart = require("chart.js");

// Extension for rounded bar charts (This part remains the same)
Chart.elements.Rectangle.prototype.draw = function () {
  var ctx = this._chart.ctx;
  var vm = this._view;
  var left, right, top, bottom, signX, signY, borderSkipped, radius;
  var borderWidth = vm.borderWidth;
  var cornerRadius = 6;

  if (!vm.horizontal) {
    left = vm.x - vm.width / 2; right = vm.x + vm.width / 2; top = vm.y; bottom = vm.base;
    signX = 1; signY = bottom > top ? 1 : -1; borderSkipped = vm.borderSkipped || "bottom";
  } else {
    left = vm.base; right = vm.x; top = vm.y - vm.height / 2; bottom = vm.y + vm.height / 2;
    signX = right > left ? 1 : -1; signY = 1; borderSkipped = vm.borderSkipped || "left";
  }

  if (borderWidth) {
    var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
    borderWidth = borderWidth > barSize ? barSize : borderWidth;
    var halfStroke = borderWidth / 2;
    var borderLeft = left + (borderSkipped !== "left" ? halfStroke * signX : 0);
    var borderRight = right + (borderSkipped !== "right" ? -halfStroke * signX : 0);
    var borderTop = top + (borderSkipped !== "top" ? halfStroke * signY : 0);
    var borderBottom = bottom + (borderSkipped !== "bottom" ? -halfStroke * signY : 0);
    if (borderLeft !== borderRight) { top = borderTop; bottom = borderBottom; }
    if (borderTop !== borderBottom) { left = borderLeft; right = borderRight; }
  }

  ctx.beginPath();
  ctx.fillStyle = vm.backgroundColor; ctx.strokeStyle = vm.borderColor; ctx.lineWidth = borderWidth;
  var corners = [[left, bottom], [left, top], [right, top], [right, bottom]];
  var borders = ["bottom", "left", "top", "right"];
  var startCorner = borders.indexOf(borderSkipped, 0);
  if (startCorner === -1) { startCorner = 0; }
  function cornerAt(index) { return corners[(startCorner + index) % 4]; }
  var corner = cornerAt(0);
  ctx.moveTo(corner[0], corner[1]);
  for (var i = 1; i < 4; i++) {
    corner = cornerAt(i);
    let nextCornerId = i + 1;
    if (nextCornerId === 4) { nextCornerId = 0; }
    let width = corners[2][0] - corners[1][0];
    let height = corners[0][1] - corners[1][1];
    let x = corners[1][0];
    let y = corners[1][1];
    var radius = cornerRadius;
    if (radius > height / 2) { radius = height / 2; }
    if (radius > width / 2) { radius = width / 2; }
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }
  ctx.fill();
  if (borderWidth) { ctx.stroke(); }
};


// --- Color and Font Definitions ---
const colors = {
  gray: { 300: "#dee2e6", 600: "#8898aa", 700: "#525f7f", 900: "#212529" },
  theme: {
    primary: "#5e72e4", info: "#11cdef", success: "#2dce89",
    danger: "#f5365c", warning: "#fb6340"
  },
  white: "#FFFFFF", transparent: "transparent",
};
const fonts = { base: "Open Sans" };


// --- Global Chart Options Function ---
function chartOptions() {
  return {
    defaults: {
      global: {
        responsive: true, maintainAspectRatio: false,
        defaultColor: colors.gray[600], defaultFontColor: colors.gray[600],
        defaultFontFamily: fonts.base, defaultFontSize: 13,
        layout: { padding: 0 },
        plugins: {
            legend: { display: false, position: "bottom", labels: { usePointStyle: true, padding: 16 } },
        },
        elements: {
          point: { radius: 0, backgroundColor: colors.theme.primary },
          line: { tension: 0.4, borderWidth: 4, borderColor: colors.theme.primary, backgroundColor: colors.transparent, borderCapStyle: "rounded" },
          rectangle: { backgroundColor: colors.theme.warning },
          arc: { backgroundColor: colors.theme.primary, borderColor: colors.white, borderWidth: 4 }
        },
      },
    },
  };
}


// --- Utility to parse options (ROBUST VERSION) ---
// *** THIS IS THE ONLY PART THAT HAS CHANGED ***
function parseOptions(parent, options) {
  for (const key in options) {
    if (Object.prototype.hasOwnProperty.call(options, key)) {
      const value = options[key];
      // If the value is an object (and not null), recurse.
      // But first, ensure the parent has a corresponding object to merge into.
      if (typeof value === 'object' && value !== null) {
        if (!parent[key]) {
          parent[key] = {}; // Create the object if it doesn't exist
        }
        parseOptions(parent[key], value);
      } else {
        // Otherwise, it's a primitive value, so just assign it.
        parent[key] = value;
      }
    }
  }
}


// --- EXPORTED CHART CONFIGURATIONS (Updated for Chart.js v3/v4) ---

// 1. Annual Overview Line Chart
const annualOverviewChart = {
  options: {
    scales: {
      y: { // Changed from yAxes
        grid: { color: colors.gray[300], zeroLineColor: colors.gray[300] },
        ticks: {
          callback: function (value) {
            if (value >= 1000) return (value / 1000) + 'k';
            return value;
          },
        },
      },
    },
    plugins: { // Moved tooltips and legend inside plugins
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (item) {
            let label = item.dataset.label || "";
            if (label) { label += ": "; }
            label += item.formattedValue.toLocaleString();
            return label;
          },
        },
      },
    },
  },
};

// 2. Gender Distribution Pie Chart
const genderDistributionChart = {
    options: {
        plugins: { // Moved tooltips and legend inside plugins
            tooltip: {
                callbacks: {
                    label: function(item) {
                        const total = item.chart.getDatasetMeta(0).total;
                        const currentValue = item.raw;
                        const percentage = Math.round((currentValue / total) * 100);
                        return `${item.label}: ${currentValue.toLocaleString()} (${percentage}%)`;
                    }
                }
            },
            legend: {
                display: true,
                position: 'bottom',
            }
        }
    }
};

// 3. Age Group Bar Chart
const ageGroupChart = {
  options: {
    scales: {
      y: { // Changed from yAxes
        ticks: {
          callback: function (value) {
            if (value >= 1000000) return (value / 1000000) + 'M';
            if (value >= 1000) return (value / 1000) + 'K';
            return value;
          },
        },
      },
    },
    plugins: { // Moved tooltip inside plugins
      tooltip: {
        callbacks: {
          label: function (item) {
            let label = item.dataset.label || "";
            if (label) { label += ": "; }
            label += item.raw.toLocaleString();
            return label;
          },
        },
      },
    },
  },
};

// 4. Marital Status Doughnut Chart
const maritalStatusChart = {
    options: {
        cutout: '70%', // Changed from cutoutPercentage
        plugins: { // Moved tooltips and legend inside plugins
            tooltip: {
                callbacks: {
                    label: function(item) {
                        const total = item.chart.getDatasetMeta(0).total;
                        const currentValue = item.raw;
                        const percentage = Math.round((currentValue / total) * 100);
                        return `${item.label}: ${percentage}%`;
                    }
                }
            },
            legend: {
                display: true,
                position: 'bottom',
            }
        }
    }
};

module.exports = {
  chartOptions, // Global defaults
  parseOptions, // Utility
  annualOverviewChart,
  genderDistributionChart,
  ageGroupChart,
  maritalStatusChart,
};