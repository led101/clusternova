# Clusternova - HDBSCAN in Typescript

HDBSCAN clustering in TypeScript. Zero dependencies.

Unlike k-means, HDBSCAN automatically determines the number of clusters and identifies outliers. It handles clusters of varying densities and shapes.

Based on the paper ["Density-Based Clustering Based on Hierarchical Density Estimates"](https://link.springer.com/chapter/10.1007/978-3-642-37456-2_14) by Campello, Moulavi, and Sander. Implementation draws from the [Python HDBSCAN library](https://hdbscan.readthedocs.io/en/latest/how_hdbscan_works.html) and [JSAT](https://github.com/EdwardRaff/JSAT).

## Install

```bash
npm install clusternova
```

## Usage

```typescript
import HDBSCAN, { findCentralElements, cosine, VectorPoint } from "clusternova";
// manhattan, euclidean are also available imports

// Extend VectorPoint with your additional fields
interface MyDataPoint extends VectorPoint {
  title: string;        // Optional fields
  timestamp: Date;      // that you might need
}

const data: MyDataPoint[] = [
  {
    id: "1",
    vector: [1, 2, 3],
    title: "First point",
    timestamp: new Date()
  },
  {
    id: "2",
    vector: [4, 5, 6],
    title: "Second point",
    timestamp: new Date()
  }
  // ... more points
];

const hdbscan = new HDBSCAN(data, 3, cosine); // minimum points = 3, cosine distance metric
const { clusters, outliers } = hdbscan.run();
// Types of returned data:
// clusters: MyDataPoint[][] - Array of clusters, each containing array of your data points
// outliers: MyDataPoint[] - Array of outlier points

// Example output:
{
    clusters: [
    [
        { id: "1", vector: [1, 2, 3], title: "First point", timestamp: "2024-01-01..." },
        { id: "2", vector: [4, 5, 6], title: "Second point", timestamp: "2024-01-01..." }
    ],
    // ... more clusters
    ],
    outliers: [
    { id: "7", vector: [7, 8, 9], title: "Outlier point", timestamp: "2024-01-01..." }
    // ... more outliers
    ]
}

// Find central elements of each cluster - returns array of elements with distance field (distance from the center of the cluster)
clusters.forEach(cluster => {
  const centralElements = findCentralElements(cluster, 3, cosine);
  // Returns: (MyDataPoint & { distance: number })[]
  // Example:
  // [
  //   { id: "1", vector: [1,2,3], title: "First point", distance: 0.2 },
  //   { id: "2", vector: [4,5,6], title: "Second point", distance: 0.3 }
  // ]
});

```

## Demo

- [Tweet clustering demo](https://astonishing-donut-b3686d.netlify.app) - clusters tweet embeddings and summarizes each cluster with GPT-3.5 (bring your own API key, source in `examples/`)
- [Citibike Stories](https://www.citibikestories.com/) - clusters hourly Citibike trips

## Notes

Despite theoretical limitations of clustering in high dimensions, HDBSCAN works well with text embeddings using cosine distance.

## License

MIT
