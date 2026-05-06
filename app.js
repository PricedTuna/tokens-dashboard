let rawData = null;
let flatData = [];

document.getElementById("fileInput").addEventListener("change", handleFile);

function handleFile(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    rawData = JSON.parse(reader.result);
    flatData = flattenData(rawData);
    populateFilters(flatData);
    render(flatData);
  };

  reader.readAsText(file);
}

function flattenData(data) {
  const rows = [];

  for (const qKey in data.questions) {
    const q = data.questions[qKey];

    for (const datasetKey in q.datasets) {
      const dataset = q.datasets[datasetKey];

      for (const modelKey in dataset.models) {
        const model = dataset.models[modelKey];

        for (const formatKey in model.objectNotations) {
          const format = model.objectNotations[formatKey];

          rows.push({
            question: qKey,
            model: modelKey,
            format: formatKey,
            correct: format.answer.isCorrect,
            totalTokens: format.usageMetadata.totalTokens,
            inputTokens: format.usageMetadata.inputTokens || 0,
            outputTokens: format.usageMetadata.outputTokens || 0,
            reasoningTokens: format.usageMetadata.outputTokenDetails?.reasoningTokens || format.usageMetadata.reasoningTokens || 0,
            latency: format.latencyMs
          });
        }
      }
    }
  }

  return rows;
}

function populateFilters(data) {
  const qSet = new Set();
  const mSet = new Set();
  const fSet = new Set();

  data.forEach(d => {
    qSet.add(d.question);
    mSet.add(d.model);
    fSet.add(d.format);
  });

  fillSelect("questionFilter", qSet);
  fillSelect("modelFilter", mSet);
  fillSelect("formatFilter", fSet);
}

function fillSelect(id, values) {
  const select = document.getElementById(id);
  values.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });

  select.addEventListener("change", applyFilters);
}

function applyFilters() {
  const q = document.getElementById("questionFilter").value;
  const m = document.getElementById("modelFilter").value;
  const f = document.getElementById("formatFilter").value;

  let filtered = flatData.filter(d =>
    (!q || d.question === q) &&
    (!m || d.model === m) &&
    (!f || d.format === f)
  );

  render(filtered);
}

function render(data) {
  renderTable(data);
  renderKPIs(data, flatData);
}

function renderTable(data) {
  const tbody = document.querySelector("#table tbody");
  tbody.innerHTML = "";

  data.forEach(d => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${d.question}</td>
      <td>${d.model}</td>
      <td>${d.format}</td>
      <td>${d.correct ? "✔" : "✖"}</td>
      <td>${d.totalTokens}</td>
      <td>${Math.round(d.latency)}</td>
    `;

    tbody.appendChild(tr);
  });
}

function renderKPIs(data, totalData) {
  const total = data.length;

  const accuracy = data.filter(d => d.correct).length / total;
  const tokens = data.reduce((a, b) => a + b.totalTokens, 0);
  const latency = data.reduce((a, b) => a + b.latency, 0) / total;

const models = [...new Set(totalData.map(d => d.model))];
  const tbody = document.querySelector("#tokenTable tbody");
  tbody.innerHTML = "";

  let grandTotal = 0;
  let totals = { tron: 0, toon: 0, jton: 0 };
  let inputTotals = { tron: 0, toon: 0, jton: 0 };
  let outputTotals = { tron: 0, toon: 0, jton: 0 };
  let reasoningTotals = { tron: 0, toon: 0, jton: 0 };

  models.forEach(model => {
    const modelData = totalData.filter(d => d.model === model);
    const getTokens = (arr) => ({
      input: arr.reduce((a, b) => a + b.inputTokens, 0),
      output: arr.reduce((a, b) => a + b.outputTokens, 0),
      reasoning: arr.reduce((a, b) => a + b.reasoningTokens, 0),
      total: arr.reduce((a, b) => a + b.totalTokens, 0)
    });

    const tronTokens = getTokens(modelData.filter(d => d.format === "tron"));
    const toonTokens = getTokens(modelData.filter(d => d.format === "toon"));
    const jtonTokens = getTokens(modelData.filter(d => d.format === "jton"));

    const modelTotal = tronTokens.total + toonTokens.total + jtonTokens.total;
    grandTotal += modelTotal;

    inputTotals.tron += tronTokens.input;
    inputTotals.toon += toonTokens.input;
    inputTotals.jton += jtonTokens.input;
    outputTotals.tron += tronTokens.output;
    outputTotals.toon += toonTokens.output;
    outputTotals.jton += jtonTokens.output;
    reasoningTotals.tron += tronTokens.reasoning;
    reasoningTotals.toon += toonTokens.reasoning;
    reasoningTotals.jton += jtonTokens.reasoning;
    totals.tron += tronTokens.total;
    totals.toon += toonTokens.total;
    totals.jton += jtonTokens.total;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${model}</strong></td>
      <td>${tronTokens.input || "-"}</td><td>${tronTokens.output || "-"}</td><td>${tronTokens.reasoning || "-"}</td><td><strong>${tronTokens.total || "-"}</strong></td>
      <td>${toonTokens.input || "-"}</td><td>${toonTokens.output || "-"}</td><td>${toonTokens.reasoning || "-"}</td><td><strong>${toonTokens.total || "-"}</strong></td>
      <td>${jtonTokens.input || "-"}</td><td>${jtonTokens.output || "-"}</td><td>${jtonTokens.reasoning || "-"}</td><td><strong>${jtonTokens.total || "-"}</strong></td>
      <td><strong>${modelTotal}</strong></td>
    `;
    tbody.appendChild(tr);
  });

  const totalRow = document.createElement("tr");
  totalRow.innerHTML = `
    <td><strong>Total</strong></td>
    <td><strong>${inputTotals.tron}</strong></td><td><strong>${outputTotals.tron}</strong></td><td><strong>${reasoningTotals.tron}</strong></td><td><strong>${totals.tron}</strong></td>
    <td><strong>${inputTotals.toon}</strong></td><td><strong>${outputTotals.toon}</strong></td><td><strong>${reasoningTotals.toon}</strong></td><td><strong>${totals.toon}</strong></td>
    <td><strong>${inputTotals.jton}</strong></td><td><strong>${outputTotals.jton}</strong></td><td><strong>${reasoningTotals.jton}</strong></td><td><strong>${totals.jton}</strong></td>
    <td><strong>${grandTotal}</strong></td>
  `;
  tbody.insertBefore(totalRow, tbody.firstChild);

  document.getElementById("accuracy").textContent = (accuracy * 100).toFixed(2) + "%";
  document.getElementById("tokens").textContent = tokens;
  document.getElementById("latency").textContent = Math.round(latency) + " ms";
}