// 1D K-Means (no library). Returns clusters sorted by centroid ascending.
function kmeans1D(values, kInput = 3) {
  if (values.length === 0) return [];
  const sorted = [...values].sort((a, b) => a - b);
  const distinctSorted = [...new Set(sorted)];

  let k = kInput;
  if (sorted.length < 3 || distinctSorted.length < 3) k = Math.max(1, distinctSorted.length);

  let centroids =
    k === 3
      ? [sorted[0], sorted[Math.floor((sorted.length - 1) / 2)], sorted[sorted.length - 1]]
      : distinctSorted.slice(0, k);

  let assignment = new Array(values.length).fill(-1);
  for (let iter = 0; iter < 100; iter++) {
    const next = values.map((v) => {
      let best = 0;
      let bestDist = Infinity;
      centroids.forEach((c, i) => {
        const d = Math.abs(v - c);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    });
    const changed = next.some((a, i) => a !== assignment[i]);
    assignment = next;
    if (!changed) break;

    centroids = centroids.map((prev, i) => {
      let sum = 0;
      let count = 0;
      assignment.forEach((a, idx) => {
        if (a === i) {
          sum += values[idx];
          count++;
        }
      });
      return count === 0 ? prev : sum / count; // empty cluster keeps previous centroid
    });
  }

  return centroids
    .map((c, i) => ({ centroid: c, count: assignment.filter((a) => a === i).length }))
    .sort((a, b) => a.centroid - b.centroid)
    .map((c, i) => ({ group: `Tier ${i + 1}`, centroid: Math.round(c.centroid), count: c.count }));
}

module.exports = { kmeans1D };
