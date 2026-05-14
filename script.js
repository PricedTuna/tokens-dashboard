const fileInput = document.getElementById("fileInput");
const summaryContainer = document.getElementById("summaryContainer");
const tableBody = document.querySelector("#resultsTable tbody");
const searchInput = document.getElementById("searchInput");

let rawData = [];

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();
  const json = JSON.parse(text);

  rawData = json;

  renderSummary(json);
  renderTable(json);
});

document.getElementById("sortBtn")?.addEventListener("click", () => {
  currentSortOrder = currentSortOrder === "desc" ? "asc" : "desc";
  const btn = document.getElementById("sortBtn");
  btn.textContent = currentSortOrder === "desc" 
    ? "Total Tokens ↓" 
    : "Total Tokens ↑";
  renderSummary(rawData);
});

let currentSortOrder = "desc";

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
    card.className = "summary-card";

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