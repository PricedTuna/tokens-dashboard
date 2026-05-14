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

function renderSummary(data) {
  summaryContainer.innerHTML = "";

  const grouped = {};

  data.forEach((item) => {
    if (!grouped[item.format]) {
      grouped[item.format] = {
        inputTokens: 0,
        outputTokens: 0,

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

  Object.entries(grouped).forEach(([format, stats]) => {
    const accuracy = (
      (stats.totalCorrect / stats.totalQuestions) *
      100
    ).toFixed(2);

    const card = document.createElement("div");
    card.className = "summary-card";

    card.innerHTML = `
      <h2>${format.toUpperCase()}</h2>

      <div class="metrics">
        <div class="metric">
          <div class="metric-label">Total Input Tokens</div>
          <div class="metric-value">${formatNumber(stats.inputTokens)}</div>
        </div>

        <div class="metric">
          <div class="metric-label">Total Output Tokens</div>
          <div class="metric-value">${formatNumber(stats.outputTokens)}</div>
        </div>

        <div class="metric">
          <div class="metric-label">Accuracy</div>
          <div class="metric-value">${accuracy}%</div>
        </div>
      </div>

      <div class="details-block">

        <div class="details-group">
          <h3>Input Details</h3>

          <div class="details-item">
            <span>No Cache</span>
            <strong>${formatNumber(
              stats.inputDetails.noCacheTokens
            )}</strong>
          </div>

          <div class="details-item">
            <span>Cache Read</span>
            <strong>${formatNumber(
              stats.inputDetails.cacheReadTokens
            )}</strong>
          </div>

          <div class="details-item">
            <span>Cache Write</span>
            <strong>${formatNumber(
              stats.inputDetails.cacheWriteTokens
            )}</strong>
          </div>
        </div>

        <div class="details-group">
          <h3>Output Details</h3>

          <div class="details-item">
            <span>Text Tokens</span>
            <strong>${formatNumber(
              stats.outputDetails.textTokens
            )}</strong>
          </div>

          <div class="details-item">
            <span>Reasoning Tokens</span>
            <strong>${formatNumber(
              stats.outputDetails.reasoningTokens
            )}</strong>
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
        ${item.isCorrect ? "✔" : "✘"}
      </td>

      <td>${formatNumber(item.inputTokens)}</td>
      <td>${formatNumber(item.outputTokens)}</td>
      <td>${formatNumber(item.totalTokens)}</td>

      <td>${formatNumber(
        item.inputTokensDetails?.noCacheTokens
      )}</td>

      <td>${formatNumber(
        item.inputTokensDetails?.cacheReadTokens
      )}</td>

      <td>${formatNumber(
        item.inputTokensDetails?.cacheWriteTokens
      )}</td>

      <td>${formatNumber(
        item.outputTokensDetails?.textTokens
      )}</td>

      <td>${formatNumber(
        item.outputTokensDetails?.reasoningTokens
      )}</td>

      <td>${Math.round(item.latencyMs)} ms</td>
    `;

    tableBody.appendChild(tr);
  });
}

function formatNumber(value) {
  if (value === undefined || value === null) return "-";

  return Number(value).toLocaleString();
}