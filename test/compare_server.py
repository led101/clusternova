from flask import Flask, request, jsonify
from hdbscan import HDBSCAN
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route('/cluster', methods=['POST'])

def cluster():
    data = request.json
    points = np.array([point['vector'] for point in data['points']])
    min_points = data['minPoints']

    distance_metric = data.get('distanceMetric', 'euclidean')  # Default to 'euclidean' if not provided

    
    clusterer = HDBSCAN(min_cluster_size=min_points, min_samples=min_points, metric=distance_metric)
    cluster_labels = clusterer.fit_predict(points)
    
    # Convert labels to same format as your TS implementation
    clusters = {}
    outliers = []
    
    for idx, (label, point) in enumerate(zip(cluster_labels, data['points'])):
        if label == -1:
            outliers.append(point['id'])
        else:
            if label not in clusters:
                clusters[label] = []
            clusters[label].append(point['id'])
    
    return jsonify({
        'clusters': [cluster for cluster in clusters.values()],
        'outliers': outliers
    })

if __name__ == '__main__':
    app.run(port=5000)