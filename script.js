const fileInput = document.getElementById("fileInput");
const summaryContainer = document.getElementById("summaryContainer");
const tableBody = document.querySelector("#resultsTable tbody");
const searchInput = document.getElementById("searchInput");

let rawData = [];

async function processJSON(json) {
  rawData = json;
  selectedFormats = [];

  renderSummary(json);
  renderComparison();
  renderTable(json);
}

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();
  try {
    const json = JSON.parse(text);
    processJSON(json);
    document.getElementById("upload-options").classList.remove("show");
  } catch (err) {
    console.error("Error parsing JSON:", err);
    alert("Error al cargar el archivo JSON");
  }
});

// Dropdown Logic
const dropdown = document.querySelector(".miro-dropdown");
const dropdownBtn = document.getElementById("upload-json-btn");
const dropdownOptions = document.getElementById("upload-options");
const loadLatestBtn = document.getElementById("load-latest-btn");
const loadLocalBtn = document.getElementById("load-local-btn");

dropdownBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.toggle("show");
  dropdownOptions.classList.toggle("show");
});

document.addEventListener("click", () => {
  dropdown.classList.remove("show");
  dropdownOptions.classList.remove("show");
});

loadLocalBtn.addEventListener("click", () => {
  fileInput.click();
});

loadLatestBtn.addEventListener("click", async () => {
  try {
    const response = await fetch("results/latest-gemini-3-flash-preview.json");
    if (!response.ok) throw new Error("No se pudo cargar el archivo");
    
    const json = await response.json();
    processJSON(json);
    dropdown.classList.remove("show");
    dropdownOptions.classList.remove("show");
  } catch (err) {
    console.error("Error loading latest results:", err);
    alert("No se encontraron resultados recientes ('latest-*.json')");
  }
});

document.getElementById("download-json-btn")?.addEventListener("click", () => {
  // ToDO: Descargar la carpeta de results como un .zip
})

document.getElementById("sortBtn")?.addEventListener("click", () => {
  currentSortOrder = currentSortOrder === "desc" ? "asc" : "desc";
  const btn = document.getElementById("sortBtn");
  btn.textContent = currentSortOrder === "desc" 
    ? "Total Tokens ↓" 
    : "Total Tokens ↑";
  renderSummary(rawData);
});

let currentSortOrder = "desc";
let selectedFormats = [];

document.getElementById("clearComparisonBtn")?.addEventListener("click", () => {
  selectedFormats = [];
  renderSummary(rawData);
  renderComparison();
});

searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();

  const filtered = rawData.filter((item) => {
    return (
      item.questionId?.toLowerCase().includes(value) ||
      item.format?.toLowerCase().includes(value) ||
      item.model?.toLowerCase().includes(value)
    );
  });

  renderTable(filtered);
});

function renderSummary(data, sortBy = "total") {
  summaryContainer.innerHTML = "";

  const grouped = {};

  data.forEach((item) => {
    if (!grouped[item.format]) {
      grouped[item.format] = {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,

        inputDetails: {
          noCacheTokens: 0,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
        },

        outputDetails: {
          textTokens: 0,
          reasoningTokens: 0,
        },

        totalCorrect: 0,
        totalQuestions: 0,
      };
    }

    const group = grouped[item.format];

    group.inputTokens += item.inputTokens || 0;
    group.outputTokens += item.outputTokens || 0;
    group.totalTokens += (item.inputTokens || 0) + (item.outputTokens || 0);

    group.inputDetails.noCacheTokens +=
      item.inputTokensDetails?.noCacheTokens || 0;

    group.inputDetails.cacheReadTokens +=
      item.inputTokensDetails?.cacheReadTokens || 0;

    group.inputDetails.cacheWriteTokens +=
      item.inputTokensDetails?.cacheWriteTokens || 0;

    group.outputDetails.textTokens +=
      item.outputTokensDetails?.textTokens || 0;

    group.outputDetails.reasoningTokens +=
      item.outputTokensDetails?.reasoningTokens || 0;

    group.totalQuestions += 1;

    if (item.isCorrect) {
      group.totalCorrect += 1;
    }
  });

  const entries = Object.entries(grouped);

  if (sortBy === "total") {
    entries.sort((a, b) => {
      return currentSortOrder === "desc" 
        ? b[1].totalTokens - a[1].totalTokens 
        : a[1].totalTokens - b[1].totalTokens;
    });
  } else if (sortBy === "input") {
    entries.sort((a, b) => b[1].inputTokens - a[1].inputTokens);
  } else if (sortBy === "output") {
    entries.sort((a, b) => b[1].outputTokens - a[1].outputTokens);
  }

  entries.forEach(([format, stats]) => {
    const accuracy = (
      (stats.totalCorrect / stats.totalQuestions) *
      100
    ).toFixed(2);

    const card = document.createElement("div");
    card.className = `summary-card miro-button miro-shadow ${selectedFormats.includes(format) ? "selected" : ""}`;

    card.addEventListener("click", () => {
      if (selectedFormats.includes(format)) {
        selectedFormats = selectedFormats.filter(f => f !== format);
      } else {
        selectedFormats.push(format);
      }
      renderSummary(data, sortBy);
      renderComparison();
    });

    card.innerHTML = `
      <div class="card-title">${format.toUpperCase()}</div>

      <div class="metrics">
        <div class="metric">
          <div class="metric-label">Total Tokens</div>
          <div class="metric-value total-tokens">${formatNumber(stats.totalTokens)}</div>
        </div>

        <div class="metric">
          <div class="metric-label">Accuracy</div>
          <div class="metric-value">${accuracy}%</div>
        </div>
      </div>

      <div class="details-block">
        <div class="details-group">
          <h3>Input</h3>
          <div class="details-item">
            <span>No Cache</span>
            <strong>${formatNumber(stats.inputDetails.noCacheTokens)}</strong>
          </div>
          <div class="details-item">
            <span>Cache R</span>
            <strong>${formatNumber(stats.inputDetails.cacheReadTokens)}</strong>
          </div>
          <div class="details-item">
            <span>Cache W</span>
            <strong>${formatNumber(stats.inputDetails.cacheWriteTokens)}</strong>
          </div>
        </div>

        <div class="details-group">
          <h3>Output</h3>
          <div class="details-item">
            <span>Text</span>
            <strong>${formatNumber(stats.outputDetails.textTokens)}</strong>
          </div>
          <div class="details-item">
            <span>Reason</span>
            <strong>${formatNumber(stats.outputDetails.reasoningTokens)}</strong>
          </div>
        </div>
      </div>
    `;

    summaryContainer.appendChild(card);
  });
}

function renderComparison() {
  const comparisonSection = document.getElementById("comparisonSection");
  const comparisonContainer = document.getElementById("comparisonContainer");

  if (selectedFormats.length === 0) {
    comparisonSection.style.display = "none";
    return;
  }

  comparisonSection.style.display = "block";
  comparisonContainer.innerHTML = "";

  // Group data for selected formats
  const grouped = {};
  rawData.forEach((item) => {
    if (selectedFormats.includes(item.format)) {
      if (!grouped[item.format]) {
        grouped[item.format] = {
          total: 0,
          input: 0,
          output: 0,
        };
      }
      grouped[item.format].total += (item.inputTokens || 0) + (item.outputTokens || 0);
      grouped[item.format].input += item.inputTokens || 0;
      grouped[item.format].output += item.outputTokens || 0;
    }
  });

  const selectedStats = Object.entries(grouped).map(([name, stats]) => ({
    name,
    ...stats
  }));

  // Find the "best" (lowest total tokens) to use as baseline
  const best = [...selectedStats].sort((a, b) => a.total - b.total)[0];

  selectedStats.forEach((stats) => {
    const card = document.createElement("div");
    card.className = "comparison-card";

    const isBest = stats.name === best.name;
    const totalDiff = stats.total - best.total;
    const inputDiff = stats.input - best.input;
    const outputDiff = stats.output - best.output;

    card.innerHTML = `
      ${isBest ? '<div class="comparison-rank">🏆 Más eficiente</div>' : '<div class="comparison-rank" style="background:#eee">Comparación</div>'}
      <h3>${stats.name.toUpperCase()}</h3>
      
      <div class="comparison-metric">
        <div class="metric-label">Total Tokens</div>
        <div class="metric-value" style="font-size:20px">${formatNumber(stats.total)} 
          ${!isBest ? `<span class="comparison-diff diff-positive">+${formatNumber(totalDiff)}</span>` : '<span class="comparison-diff diff-negative">Base</span>'}
        </div>
      </div>

      <div class="comparison-metric">
        <div class="metric-label">Input Tokens</div>
        <div class="metric-value" style="font-size:16px">${formatNumber(stats.input)} 
          ${!isBest ? `<span class="comparison-diff ${inputDiff >= 0 ? 'diff-positive' : 'diff-negative'}">${inputDiff >= 0 ? '+' : ''}${formatNumber(inputDiff)}</span>` : ''}
        </div>
      </div>

      <div class="comparison-metric">
        <div class="metric-label">Output Tokens</div>
        <div class="metric-value" style="font-size:16px">${formatNumber(stats.output)} 
          ${!isBest ? `<span class="comparison-diff ${outputDiff >= 0 ? 'diff-positive' : 'diff-negative'}">${outputDiff >= 0 ? '+' : ''}${formatNumber(outputDiff)}</span>` : ''}
        </div>
      </div>
    `;

    comparisonContainer.appendChild(card);
  });
}

function renderTable(data) {
  tableBody.innerHTML = "";

  data.forEach((item) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.questionId}</td>
      <td>${item.format}</td>
      <td>${item.model}</td>
      <td class="${item.isCorrect ? "correct" : "incorrect"}">
        ${item.isCorrect ? "✔ Correct" : "✘ Incorrect"}
      </td>
      <td>${formatNumber(item.inputTokens)}</td>
      <td>${formatNumber(item.outputTokens)}</td>
      <td><strong>${formatNumber(item.totalTokens)}</strong></td>
      <td>${formatNumber(item.inputTokensDetails?.noCacheTokens)}</td>
      <td>${formatNumber(item.inputTokensDetails?.cacheReadTokens)}</td>
      <td>${formatNumber(item.inputTokensDetails?.cacheWriteTokens)}</td>
      <td>${formatNumber(item.outputTokensDetails?.textTokens)}</td>
      <td>${formatNumber(item.outputTokensDetails?.reasoningTokens)}</td>
      <td>${Math.round(item.latencyMs)}ms</td>
    `;

    tableBody.appendChild(tr);
  });
}

function formatNumber(value) {
  if (value === undefined || value === null) return "-";

  return Number(value).toLocaleString();
}

// Animaciones con anime.js para interacciones
let isFirstRender = true;

// Hover en botones - sin animación, sin cambio de color

// Selección de cards
summaryContainer.addEventListener('click', (e) => {
  const card = e.target.closest('.summary-card');
  if (!card) return;
  
  const isSelected = selectedFormats.includes(card.querySelector('.card-title').textContent.trim());
  
  anime({
    targets: card,
    scale: isSelected ? [1, 1.04, 1] : 1,
    duration: 60,
    easing: 'steps(2)'
  });
});

// Función para mostrar elementos con CSS transition
function showElements(selector, className, delay = 30) {
  setTimeout(() => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, i) => {
      setTimeout(() => el.classList.add(className), i * 30);
    });
  }, delay);
}

// Wrap render functions para añadir animación - asegurar visible siempre
const originalRenderSummary = renderSummary;
renderSummary = function(data, sortBy) {
  originalRenderSummary(data, sortBy);
  if (isFirstRender) {
    showElements('.summary-card', 'visible', 100);
    isFirstRender = false;
  } else {
    // En re-renders, asegurar que todos tengan visible
    document.querySelectorAll('.summary-card').forEach(card => {
      card.classList.add('visible');
    });
  }
};

const originalRenderComparison = renderComparison;
renderComparison = function() {
  originalRenderComparison();
  if (isFirstRender) {
    showElements('.comparison-card', 'visible', 100);
    isFirstRender = false;
  } else {
    document.querySelectorAll('.comparison-card').forEach(card => {
      card.classList.add('visible');
    });
  }
};

const originalRenderTable = renderTable;
renderTable = function(data) {
  originalRenderTable(data);
  if (isFirstRender) {
    showElements('#resultsTable tbody tr', 'visible', 50);
  } else {
    document.querySelectorAll('#resultsTable tbody tr').forEach(row => {
      row.classList.add('visible');
    });
  }
};