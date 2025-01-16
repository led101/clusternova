# Clusternova: HDBSCAN TypeScript Implementation

**Discover Hidden Patterns in Your Data**

Just drop millions of social media posts and instantly surface trending topics. Feed in your support tickets and instantly have related issues be clustered together.

This TypeScript implementation easily brings clustering to your JavaScript ecosystem, whether you're running in Node.js (or another backend JS runtime) or directly in the browser. Built for real-world applications:

- 📱 **Social Media Intelligence**: Surface trending topics from millions of posts in real-time
- 🎯 **Customer Insights**: Transform raw feedback into actionable patterns
- 🤖 **AI/ML Pipelines**: Cluster high-dimensional embeddings with remarkable accuracy
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

This TypeScript implementation includes several optimizations, but not all that are used in the Python library. In my limited testing, it's shown comparable or better performance than the Python implementation.

## Setup

npm install clusternova

## Usage

import { HDBSCAN } from 'clusternova';
const data = [
{ id: '1', vector: [1, 2, 3] },
{ id: '2', vector: [4, 5, 6] },
// ... more points
];

const hdbscan = new HDBSCAN(data, 5, HDBSCAN.cosine); // minimum points = 5, cosine distance metric (you could also pass in HDBSCAN.manhattan, HDBSCAN.euclidean, or your own distance metric)
const { clusters, outliers } = hdbscan.run();

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
