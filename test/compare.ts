import { HDBSCAN } from "../src/index";

// To run: npx ts-node compare.ts
interface Point {
  id: string;
  vector: number[];
}

type DistanceMetric = "euclidean" | "manhattan" | "cosine"; // add other metrics as needed

async function compareWithScikit(
  points: Point[],
  minPoints: number,
  distanceMetric: DistanceMetric
) {
  // Run your implementation
  const hdbscan = new HDBSCAN(points, minPoints, HDBSCAN[distanceMetric]);
  const tsResults = hdbscan.run();

  // Run scikit-learn implementation
  try {
    const response = await fetch("http://127.0.0.1:5000/cluster", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ points, minPoints, distanceMetric }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const scikitResults = await response.json();

    // Compare results
    console.log("TypeScript Implementation:");
    console.log(
      "Clusters:",
      tsResults.clusters.map((cluster) => cluster.map((p) => p.id))
    );
    console.log(
      "Outliers:",
      tsResults.outliers.map((p) => p.id)
    );

    console.log("\nScikit-learn Implementation:");
    console.log("Clusters:", scikitResults.clusters);
    console.log("Outliers:", scikitResults.outliers);

    // Calculate agreement percentage
    const totalPoints = points.length;
    let agreements = 0;

    // Create maps of point assignments for both implementations
    const tsAssignments = new Map<string, number>();
    tsResults.clusters.forEach((cluster, i) => {
      cluster.forEach((point) => tsAssignments.set(point.id, i));
    });
    tsResults.outliers.forEach((point) => tsAssignments.set(point.id, -1));

    const scikitAssignments = new Map<string, number>();
    scikitResults.clusters.forEach((cluster: any, i: number) => {
      cluster.forEach((id: string) => scikitAssignments.set(id, i));
    });
    scikitResults.outliers.forEach((id: string) =>
      scikitAssignments.set(id, -1)
    );

    // Count points that are clustered similarly
    points.forEach((point) => {
      const tsCluster = tsAssignments.get(point.id);
      const scikitCluster = scikitAssignments.get(point.id);

      // Both marked as outliers or both in same cluster
      if (tsCluster === -1 && scikitCluster === -1) {
        agreements++;
      } else if (tsCluster !== -1 && scikitCluster !== -1) {
        // Check if points that are clustered together in one implementation
        // are also clustered together in the other
        const tsClusterPoints = tsResults.clusters[tsCluster!].map(
          (point) => point.id
        );
        const scikitClusterPoints = scikitResults.clusters[scikitCluster!];

        const inSameCluster = tsClusterPoints.every((id) =>
          scikitClusterPoints.includes(id)
        );

        if (inSameCluster) agreements++;
      }
    });

    const agreementPercentage = (agreements / totalPoints) * 100;
    console.log(`\nAgreement percentage: ${agreementPercentage.toFixed(2)}%`);
  } catch (error) {
    console.error("Error comparing with scikit-learn:", error);
  }
}

// Test cases
const testCases = [
  {
    name: "Simple clusters",
    points: [
      { id: "1", vector: [1, 1] },
      { id: "2", vector: [1.1, 1] },
      { id: "3", vector: [1.2, 1.1] },
      { id: "4", vector: [5, 5] },
      { id: "5", vector: [5.1, 5] },
      { id: "6", vector: [5.2, 5.1] },
      { id: "7", vector: [10, 10] },
    ],
    minPoints: 2,
  },
  {
    name: "High dimensional vectors",
    points: [
      { id: "1", vector: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      { id: "2", vector: [1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1] },
      { id: "3", vector: [1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2] },
      { id: "4", vector: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5] },
      { id: "5", vector: [5.1, 5.1, 5.1, 5.1, 5.1, 5.1, 5.1, 5.1, 5.1, 5.1] },
      { id: "6", vector: [5.2, 5.2, 5.2, 5.2, 5.2, 5.2, 5.2, 5.2, 5.2, 5.2] },
      { id: "7", vector: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10] },
    ],
    minPoints: 2,
  },
  {
    name: "Very high dimensional vectors",
    points: [
      { id: "1", vector: Array(50).fill(1) },
      { id: "2", vector: Array(50).fill(1.1) },
      { id: "3", vector: Array(50).fill(1.2) },
      { id: "4", vector: Array(50).fill(5) },
      { id: "5", vector: Array(50).fill(5.1) },
      { id: "6", vector: Array(50).fill(5.2) },
      { id: "7", vector: Array(50).fill(10) },
    ],
    minPoints: 2,
  },
  {
    name: "Extreme dimensional vectors",
    points: [
      {
        id: "1",
        vector: Array(100)
          .fill(1)
          .map((x, i) => x + i * 0.01),
      },
      {
        id: "2",
        vector: Array(100)
          .fill(1.1)
          .map((x, i) => x + i * 0.01),
      },
      {
        id: "3",
        vector: Array(100)
          .fill(1.2)
          .map((x, i) => x + i * 0.01),
      },
      {
        id: "4",
        vector: Array(100)
          .fill(5)
          .map((x, i) => x + i * 0.01),
      },
      {
        id: "5",
        vector: Array(100)
          .fill(5.1)
          .map((x, i) => x + i * 0.01),
      },
      {
        id: "6",
        vector: Array(100)
          .fill(5.2)
          .map((x, i) => x + i * 0.01),
      },
      {
        id: "7",
        vector: Array(100)
          .fill(10)
          .map((x, i) => x + i * 0.01),
      },
    ],
    minPoints: 2,
  },
  {
    name: "Large random vectors (500 dimensions)",
    points: Array(20)
      .fill(0)
      .map((_, i) => ({
        id: i.toString(),
        vector: Array(500)
          .fill(0)
          .map(() => Math.random() * 10),
      })),
    minPoints: 3,
  },
  {
    name: "High dimensional clusters (1000 dimensions)",
    points: [
      // Cluster 1 - centered around 0
      ...Array(5)
        .fill(0)
        .map((_, i) => ({
          id: `c1_${i}`,
          vector: Array(1000)
            .fill(0)
            .map(() => Math.random() * 0.5), // Small random variations around 0
        })),

      // Cluster 2 - centered around 10
      ...Array(5)
        .fill(0)
        .map((_, i) => ({
          id: `c2_${i}`,
          vector: Array(1000)
            .fill(10)
            .map((x) => x + Math.random() * 0.5), // Small random variations around 10
        })),

      // Cluster 3 - centered around -10
      ...Array(5)
        .fill(0)
        .map((_, i) => ({
          id: `c3_${i}`,
          vector: Array(1000)
            .fill(-10)
            .map((x) => x + Math.random() * 0.5), // Small random variations around -10
        })),

      // Outliers - scattered far from clusters
      {
        id: "outlier_1",
        vector: Array(1000)
          .fill(20)
          .map((x) => x + Math.random()),
      },
    ],
    minPoints: 3,
  },
];

async function runTests() {
  for (const testCase of testCases) {
    console.log(`\nRunning test: ${testCase.name}`);
    await compareWithScikit(testCase.points, testCase.minPoints, "cosine");
  }
}

runTests();
