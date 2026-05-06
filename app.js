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
            tokens: format.usageMetadata.totalTokens,
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
  renderKPIs(data);
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
      <td>${d.tokens}</td>
      <td>${Math.round(d.latency)}</td>
    `;

    tbody.appendChild(tr);
  });
}

function renderKPIs(data) {
  const total = data.length;

  const accuracy = data.filter(d => d.correct).length / total;
  const tokens = data.reduce((a, b) => a + b.tokens, 0);
  const latency = data.reduce((a, b) => a + b.latency, 0) / total;

  document.getElementById("accuracy").textContent = (accuracy * 100).toFixed(2) + "%";
  document.getElementById("tokens").textContent = tokens;
  document.getElementById("latency").textContent = Math.round(latency) + " ms";
}