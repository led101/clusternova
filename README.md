# HDBSCAN

A TypeScript implementation of the HDBSCAN (Hierarchical Density-Based Spatial Clustering of Applications with Noise) clustering algorithm.

## Installation

npm install clusternova

## Usage

import { HDBSCAN } from 'clusternova';
const data = [
{ id: '1', vector: [1, 2, 3] },
{ id: '2', vector: [4, 5, 6] },
// ... more points
];

const hdbscan = new HDBSCAN(data, 5); // minimum points = 5
const { clusters, outliers } = hdbscan.run();