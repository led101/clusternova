# HDBSCAN Testing Tools

This repository contains two components for comparing HDBSCAN implementations:
A Python Flask server running the scikit-learn HDBSCAN implementation
A TypeScript comparison script that tests against the Python server

## Setup

### Prerequisites

- Python 3.x (for the server)
- Node.js and TypeScript (for the comparison script)
- Python packages: flask, flask-cors, hdbscan, numpy
- TypeScript packages: ts-node (installed globally for running the comparison script)

### Installation

- Install Python dependencies:
  pip install flask flask-cors hdbscan numpy

- Initialize (when in the parent directory):
  npm install

## Usage

- Start the Python server:
  python test/compare_server.py

- In a separate terminal, run the comparison script:
  npx ts-node test/compare.ts

The comparison script will send test cases to both implementations and compare their results, showing any differences in clustering outcomes. Feel free to add more test cases and try out different distance metrics by updating compare.ts.

Supported Distance Metrics
euclidean (default)
manhattan
cosine
