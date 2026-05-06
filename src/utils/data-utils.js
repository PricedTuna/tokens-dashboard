/**
 * Flattens the complex evaluation JSON into a structured array for easy dashboard consumption.
 * @param {Object} data - The raw JSON from example.json
 * @returns {Array} List of evaluation rows
 */
export function flattenData(data) {
  if (!data || !data.questions) return [];

  const rows = [];

  for (const qKey in data.questions) {
    const q = data.questions[qKey];
    const questionInfo = q.question;

    for (const datasetKey in q.datasets) {
      const dataset = q.datasets[datasetKey];

      for (const modelKey in dataset.models) {
        const model = dataset.models[modelKey];
        const notations = model.objectNotations;

        const row = {
          questionId: qKey,
          prompt: questionInfo.prompt,
          expected: questionInfo.expected,
          dataset: datasetKey,
          model: modelKey,
          formats: {
            tron: processFormat(notations.tron),
            toon: processFormat(notations.toon),
            jton: processFormat(notations.jton),
          }
        };

        rows.push(row);
      }
    }
  }

  return rows;
}

function processFormat(formatData) {
  if (!formatData) return null;

  const usage = formatData.usageMetadata || {};
  return {
    isCorrect: formatData.answer?.isCorrect || false,
    actual: formatData.answer?.actual || "",
    latencyMs: formatData.latencyMs || 0,
    tokens: {
      input: usage.inputTokens || 0,
      output: usage.outputTokens || 0,
      reasoning: usage.reasoningTokens || usage.outputTokenDetails?.reasoningTokens || 0,
      total: usage.totalTokens || 0,
    }
  };
}

/**
 * Calculates global totals for a set of flattened rows.
 */
export function calculateTotals(rows) {
  const totals = {
    all: { tokens: 0, count: 0, correct: 0, latency: 0 },
    tron: { tokens: 0, input: 0, output: 0, reasoning: 0, correct: 0 },
    toon: { tokens: 0, input: 0, output: 0, reasoning: 0, correct: 0 },
    jton: { tokens: 0, input: 0, output: 0, reasoning: 0, correct: 0 },
  };

  rows.forEach(row => {
    ['tron', 'toon', 'jton'].forEach(f => {
      const format = row.formats[f];
      if (format) {
        totals[f].tokens += format.tokens.total;
        totals[f].input += format.tokens.input;
        totals[f].output += format.tokens.output;
        totals[f].reasoning += format.tokens.reasoning;
        if (format.isCorrect) totals[f].correct++;
        
        totals.all.tokens += format.tokens.total;
        totals.all.count++;
        if (format.isCorrect) totals.all.correct++;
        totals.all.latency += format.latencyMs;
      }
    });
  });

  totals.all.accuracy = totals.all.count > 0 ? (totals.all.correct / totals.all.count) * 100 : 0;
  totals.all.avgLatency = totals.all.count > 0 ? totals.all.latency / totals.all.count : 0;

  // Calculate deltas (Efficiency vs others)
  const formats = ['tron', 'toon', 'jton'];
  formats.forEach(f => {
    totals[f].deltas = {};
    formats.forEach(other => {
      if (f !== other) {
        // Difference in total tokens (negative means current format is more efficient)
        totals[f].deltas[other] = totals[f].tokens - totals[other].tokens;
        // Percentage difference
        totals[f].deltas[`${other}_pct`] = totals[other].tokens > 0 
          ? ((totals[f].tokens - totals[other].tokens) / totals[other].tokens) * 100 
          : 0;
      }
    });
  });

  // Identify Winner (Lowest token consumption)
  const sorted = formats
    .filter(f => totals[f].tokens > 0)
    .sort((a, b) => totals[a].tokens - totals[b].tokens);
  
  totals.winner = sorted[0] || null;

  return totals;
}
