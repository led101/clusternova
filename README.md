# Clusternova: HDBSCAN TypeScript Implementation

**Discover Hidden Patterns in Your Data**

Just drop millions of social media posts and instantly surface trending topics. Feed in your support tickets and instantly have related issues be clustered together.

This TypeScript implementation easily brings clustering to your JavaScript ecosystem, whether you're running in Node.js (or another backend JS runtime) or directly in the browser. Built for real-world applications:

- 📱 **Social Media Intelligence**: Surface trending topics from millions of posts in real-time
- 🎯 **Customer Insights**: Transform raw feedback into actionable patterns
- 🤖 **AI/ML Pipelines**: Cluster high-dimensional embeddings
- 📊 **Real-time Analytics**: Process streaming data to detect emerging patterns
- 🔍 **Anomaly Detection**: Automatically identify outliers and unusual behaviors

This TypeScript implementation of HDBSCAN (Hierarchical Density-Based Spatial Clustering of Applications with Noise) is based on the paper ["Density-Based Clustering Based on Hierarchical Density Estimates"](https://link.springer.com/chapter/10.1007/978-3-642-37456-2_14) by Ricardo J.G.B. Campello, Davoud Moulavi, and Joerg Sander.

This implementation draws inspiration from:

- [The Python HDBSCAN library](https://hdbscan.readthedocs.io/en/latest/how_hdbscan_works.html)
- [JSAT (Java Statistical Analysis Tool)](https://github.com/EdwardRaff/JSAT)

## Why HDBSCAN?

HDBSCAN offers several advantages over traditional clustering algorithms:

- **No need to specify number of clusters**: Unlike k-means, HDBSCAN automatically determines the optimal number of clusters
- **Handles variable density clusters**: Can find clusters of different shapes and densities
- **Noise handling**: Automatically identifies and handles noise points
- **Hierarchical clustering**: Provides insights into the hierarchical structure of your data

## Performance

Built from scratch in TypeScript in a single file with zero dependencies, this TypeScript implementation includes several optimizations, but not all the optimizations used in the HDBSCAN Python library. In my personal testing, it's shown comparable or better performance than the Python implementation.

- ✨ Zero dependencies
- 🚀 Pure TypeScript implementation
- ⚡️ Optimized for JS runtimes
- 🔒 Type-safe API
- 📦 Small bundle size

## Setup

```bash
npm install clusternova
```

## Usage

```typescript
import HDBSCAN, { findCentroid, findCentralElements, cosine } from "clusternova";
// manhattan, euclidean are also available imports

// Define your own data type with required id and vector fields
interface MyDataPoint {
  id: string;
  vector: number[];
  title?: string;        // Optional fields
  timestamp?: Date;      // that you might need
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

## Example Projects

We have included an examples directory with web apps that demonstrate how to use Clusternova in real-world scenarios. One of them, social-media-clustering, is deployed and available for you to try (bring your own API key):

Social Media Clustering Demo: https://astonishing-donut-b3686d.netlify.app

This demo showcases clustering of the text embeddings of media posts (tweets) and summarizing each cluster using GPT3.5.

You can also clone the repo and run it yourself.

## Example Use Cases

HDBSCAN is particularly valuable in:

### Text Analysis

Despite theoretical limitations of clustering in high dimensions, I've found HDBSCAN works exceptionally well with text embeddings using cosine distance, making it particularly useful for NLP applications.

Examples:

- Clustering social media posts to identify trending topics
- Grouping customer support tickets to identify common issues
- Organizing document collections by theme
- Identifying similar product reviews or feedback

### Image Processing

- Grouping similar images in large collections
- Identifying distinct objects in computer vision applications
- Clustering visual features for object recognition

### Scientific Applications

- Gene expression clustering

### Business Intelligence

- Market segmentation
- Anomaly detection in transactions
- Customer behavior pattern identification

## License information

This project is licensed under the MIT License.

Copyright (c) 2025 Kevin Ma

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
