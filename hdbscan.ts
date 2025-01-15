class HDBSCAN {
  X: { id: string; embeddings: number[] }[]; // The dataset of points
  allNearestNeighbors: Map<string, Map<string, number>>; // adjacency list map(id_from, Map(id_To, weight)) these are the raw edge distances, not the mutual reachability distance
  mpts: number; // The minimum points to define a core point
  coreDistances: Map<string, number>; // Map: id to core distances
  mrg: Map<string, Map<string, number>>; // Mutual reachability graph
  mstEdges: { from: string; to: string; weight: number }[]; // mutual reachability graph as an adjacency list

  constructor(X: { id: string; embeddings: number[] }[], mpts: number) {
    this.X = X;
    this.allNearestNeighbors = new Map();
    this.mpts = mpts;
    this.coreDistances = new Map();
    this.mrg = new Map();
    this.mstEdges = [];
  }

  run() {
    if (this.X.length === 0) {
      return { clusters: [], outliers: [] };
    }
    try {
      this._computeAllNearestNeighbors();
      this._computeCoreDistances();
      this._constructMRG();
      this._computeMST();
      const { clusters, outliers } = this._extractHDBSCANHierarchy();
      return { clusters, outliers };
    } catch (e) {
      console.error("Error in HDBSCAN:", e);
      // return all the points as outliers
      return { clusters: [], outliers: this.X.map((point) => point.id) };
    }
  }

  static cosineDistance(pointA: number[], pointB: number[]): number {
    if (pointA.length !== pointB.length) {
      throw new Error("unequal dimension in input data");
    }
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < pointA.length; i++) {
      dotProduct += pointA[i] * pointB[i];
      normA += pointA[i] * pointA[i];
      normB += pointB[i] * pointB[i];
    }
    if (normA === 0 || normB === 0) {
      return 1;
    }
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return 1 - similarity;
  }

  private _computeAllNearestNeighbors() {
    this.X.forEach((from, fromIndex) => {
      this.allNearestNeighbors.set(from.id, new Map());
      this.X.forEach((to, toIndex) => {
        if (
          fromIndex !== toIndex // Ensure we are not calculating distance to self
        ) {
          if (this.allNearestNeighbors.get(to.id)?.has(from.id)) {
            // already calculated, just need to set the other direction
            this.allNearestNeighbors
              .get(from.id)!
              .set(to.id, this.allNearestNeighbors.get(to.id)!.get(from.id)!);
          } else {
            // Calculate the distance from the current point to all other points
            const distance = HDBSCAN.cosineDistance(
              from.embeddings,
              to.embeddings
            );
            this.allNearestNeighbors.get(from.id)!.set(to.id, distance);
          }
        }
      });
    });
  }

  private _computeCoreDistances() {
    // Iterate over all points in the dataset
    this.allNearestNeighbors.forEach((edgesAtPoint, id) => {
      const distances = Array.from(edgesAtPoint.values());

      // Sort the array of distances to find the mpts-th smallest distance
      // TODO: potentially optimize with quickselect
      distances.sort((a, b) => a - b);

      if (distances.length < this.mpts) {
        // error check if mpts is greater than the number of points
        throw new Error(
          "mpts is greater than the number of points in the dataset"
        );
      }
      // The core distance is the distance to the mpts-th nearest neighbor
      let coreDistance = distances[this.mpts - 1]; // Adjusted for zero-based array index.
      this.coreDistances.set(id, coreDistance);
    });
  }

  private _constructMRG() {
    // Prepare graph nodes
    this.X.forEach((point) => {
      this.mrg.set(point.id, new Map()); // Each point has a map to others with distances
    });

    // Now compute the mutual reachability distance for each pair of points and populate the graph
    this.allNearestNeighbors.forEach((edgesAtFrom, fromId) => {
      edgesAtFrom.forEach((distanceTo, toId) => {
        const mutualReachabilityDistance = Math.max(
          this.coreDistances.get(fromId)!,
          this.coreDistances.get(toId)!,
          distanceTo
        );

        this.mrg.get(fromId)!.set(toId, mutualReachabilityDistance);
        //don't need to set the other direction since we're iterating over all edges so the other direction will be added
      });
    });
  }

  private _computeMST() {
    // Start from the first point (you could start from any)
    const startId = this.X[0].id;
    const pq = new PriorityQueue<{ from: string; to: string; weight: number }>(
      (a, b) => a.weight < b.weight
    ); // Min-Heap priority queue

    // Initialize the priority queue with all edges from the starting vertex
    const edgesFromStart = this.mrg.get(startId);
    edgesFromStart!.forEach((weight, id) => {
      pq.enqueue({ from: startId, to: id, weight });
    });

    // Set to keep track of vertices included in the MST
    const inMST = new Set();
    inMST.add(startId);

    // Building the MST
    while (!pq.isEmpty()) {
      const result = pq.dequeue();
      if (result === null) {
        throw new Error("Priority queue dequeued null value");
      }
      const { from, to, weight } = result;

      // Check if the 'to' vertex is already included in the MST
      if (!inMST.has(to)) {
        inMST.add(to);

        //add edge to mstEdges
        this.mstEdges.push({ from, to, weight });

        // Add all edges from the 'to' vertex to the priority queue
        const edgesFromTo = this.mrg.get(to);
        edgesFromTo!.forEach((nextWeight, nextId) => {
          if (!inMST.has(nextId)) {
            pq.enqueue({ from: to, to: nextId, weight: nextWeight });
          }
        });
      }
    }

    //sort the mstEdges by weight in ascending order
    this.mstEdges.sort((a, b) => a.weight - b.weight);
  }

  private _extractHDBSCANHierarchy() {
    // Initialize the union-find structure
    const uf = new UnionFind(this.X.map((point) => point.id));

    // Array to store the hierarchy steps, where each element is an object:
    const hierarchy: {
      childrenClusters: number[] | null; // [two children index in the hierarchy (number)]
      elements: string[]; // [ids] (we also get the size of the cluster here),
      lambdaPs: number[];
      lambdaMin: number | null;
      lambdaMax: number;
    }[] = [];

    // map from point ID to its current highest index in hierarchy:
    const pointToHierarchyIndex = new Map();

    // to start, each point is in its own group (this is effectively our version of the MSText step)
    const currentGroups = new Map(); // Map of current groups (both clusters and noise points). key: id of root of the group, value: array of ids in the group
    for (const key of this.X.map((point) => point.id)) {
      currentGroups.set(key, [key]);
    }

    // Merge clusters based on sorted edges
    this.mstEdges.forEach((edge) => {
      const { from, to, weight } = edge;
      const rootFrom = uf.find(from);
      const rootTo = uf.find(to);
      const sizeFrom = currentGroups.get(rootFrom).length;
      const sizeTo = currentGroups.get(rootTo).length;
      const newSize = sizeFrom + sizeTo;

      // merge two noise points to form a new cluster!
      uf.union(from, to);
      //find what the root of the new cluster is
      const newRoot = uf.find(from);
      // console.log("newRoot", newRoot);
      const newElements = currentGroups
        .get(rootFrom)
        .concat(currentGroups.get(rootTo));

      if (newSize >= this.mpts && sizeFrom < this.mpts && sizeTo < this.mpts) {
        // merge two noise points to form a new cluster!

        // push the new cluster to the hierarchy
        hierarchy.push({
          childrenClusters: null, // first level cluster so no children
          elements: newElements,
          lambdaPs: new Array(newElements.length).fill(1 / weight),
          lambdaMin: null, // we don't know yet!
          lambdaMax: 1 / weight,
        });

        // update the root of the new cluster in the pointToHierarchyIndex map
        pointToHierarchyIndex.set(newRoot, hierarchy.length - 1);
      } else if (
        newSize >= this.mpts &&
        sizeFrom >= this.mpts &&
        sizeTo >= this.mpts
      ) {
        // merge two clusters to form a new cluster!

        // push the new cluster to the hierarchy
        hierarchy.push({
          childrenClusters: [
            pointToHierarchyIndex.get(rootFrom),
            pointToHierarchyIndex.get(rootTo),
          ],
          elements: newElements,
          lambdaPs: new Array(newElements.length).fill(1 / weight),
          lambdaMin: null, // we don't know yet!
          lambdaMax: 1 / weight,
        });

        //update the lambdaMin of the two children clusters
        hierarchy[pointToHierarchyIndex.get(rootFrom)].lambdaMin = 1 / weight;
        hierarchy[pointToHierarchyIndex.get(rootTo)].lambdaMin = 1 / weight;

        // update the root of the new cluster in the pointToHierarchyIndex map
        pointToHierarchyIndex.set(newRoot, hierarchy.length - 1);
      } else if (newSize >= this.mpts) {
        // (implicitly) merge a noise group with a cluster so a cluster grows bigger

        // find the existing cluster and modify it:
        const updateCluster = hierarchy[pointToHierarchyIndex.get(newRoot)];
        updateCluster.elements = newElements;
        const mergeSize = sizeFrom < this.mpts ? sizeFrom : sizeTo; // the size of the group that was noise
        for (let i = 0; i < mergeSize; i++) {
          updateCluster.lambdaPs.push(1 / weight);
        }
      } else {
        throw new Error("Unexpected case in HDBSCAN hierarchy construction");
      }
      currentGroups.set(newRoot, newElements);
      currentGroups.delete(newRoot === rootFrom ? rootTo : rootFrom); // merged into newRoot, so the merged in root no longer considered
    });

    // remove last element of hierarchy array bc we don't care about the root
    hierarchy.pop();

    // creating and condensing the hierarchy tree is done! Now we calculate stabilities of every cluster:
    const stabilities = new Array(hierarchy.length).fill(0); // index is the index in the hierarchy array, value is the stability
    for (let i = 0; i < hierarchy.length; i++) {
      for (let j = 0; j < hierarchy[i].lambdaPs.length; j++) {
        stabilities[i] +=
          hierarchy[i].lambdaPs[j] - (hierarchy[i].lambdaMin ?? 0);
      }
    }

    // now we loop through the clusters again reverse topological order and set s_hat s.t.:
    //  s_hat(cluster_i) =
    //    {stabilities(cluster_i) iff cluster_i is leaf node
    //    {max(cluster_i, s_hat(cluster_i_left_child) + s_hat(cluster_i_right_child)) otherwise
    // and we select the cluster where its stability is greater than the sum of the s_hat values of its children

    const isSelected = new Array(hierarchy.length).fill(false); //index is the index in the hierarchy array, boolean value is whether we select it as a cluster
    const s_hat = new Array(hierarchy.length).fill(0); // index is the index in the hierarchy array, value is the s_hat value
    for (let i = 0; i < hierarchy.length; i++) {
      if (hierarchy[i].childrenClusters === null) {
        //cluster_i is leaf node
        s_hat[i] = stabilities[i];
        isSelected[i] = true;
      } else {
        const i_left_child_index = hierarchy[i].childrenClusters![0]; // since we remove the root, this must be defined
        const i_right_child_index = hierarchy[i].childrenClusters![1];
        const i_left_child = s_hat[i_left_child_index];
        const i_right_child = s_hat[i_right_child_index];

        if (stabilities[i] < i_left_child + i_right_child) {
          s_hat[i] = i_left_child + i_right_child;
          isSelected[i] = false;
        } else {
          s_hat[i] = stabilities[i];
          isSelected[i] = true;

          // unselect children here now that we've selected their parents
          isSelected[i_left_child_index] = false;
          isSelected[i_right_child_index] = false;
        }
      }
    }

    const clusters: Array<Array<string>> = []; // Each cluster is an array of string ids (string[][])
    const outliers: Array<string> = []; // List of outlier ids (string[])

    //finally, loop through the hierarchy to find the clusters that we end up selecting!
    for (let i = 0; i < hierarchy.length; i++) {
      if (isSelected[i]) {
        clusters.push(hierarchy[i].elements);
      }
    }

    // find the outliers now
    const allIds = new Set(this.X.map((point) => point.id));
    clusters.forEach((cluster) => {
      cluster.forEach((id) => {
        allIds.delete(id);
      });
    });
    outliers.push(...allIds);

    return { clusters, outliers };
  }
}

class PriorityQueue<T> {
  private _heap: T[];
  private _comparator: (a: T, b: T) => boolean;

  constructor(comparator: (a: T, b: T) => boolean) {
    this._heap = [];
    this._comparator = comparator;
  }

  enqueue(value: T): void {
    this._heap.push(value);
    this._siftUp();
  }

  dequeue(): T | null {
    if (this.isEmpty()) {
      return null;
    }
    const poppedValue = this._heap[0];
    const bottomValue = this._heap.pop();
    if (this._heap.length > 0 && bottomValue !== undefined) {
      this._heap[0] = bottomValue;
      this._siftDown();
    }
    return poppedValue;
  }

  isEmpty(): boolean {
    return this._heap.length === 0;
  }

  private _siftUp(): void {
    let nodeIdx = this._heap.length - 1;
    while (
      nodeIdx > 0 &&
      this._comparator(
        this._heap[nodeIdx],
        this._heap[Math.floor((nodeIdx - 1) / 2)]
      )
    ) {
      this._swap(nodeIdx, Math.floor((nodeIdx - 1) / 2));
      nodeIdx = Math.floor((nodeIdx - 1) / 2);
    }
  }

  private _siftDown(): void {
    let nodeIdx = 0;
    while (
      (2 * nodeIdx + 1 < this._heap.length &&
        this._comparator(this._heap[2 * nodeIdx + 1], this._heap[nodeIdx])) ||
      (2 * nodeIdx + 2 < this._heap.length &&
        this._comparator(this._heap[2 * nodeIdx + 2], this._heap[nodeIdx]))
    ) {
      const smallerChildIdx =
        2 * nodeIdx + 2 < this._heap.length &&
        this._comparator(
          this._heap[2 * nodeIdx + 2],
          this._heap[2 * nodeIdx + 1]
        )
          ? 2 * nodeIdx + 2
          : 2 * nodeIdx + 1;
      this._swap(nodeIdx, smallerChildIdx);
      nodeIdx = smallerChildIdx;
    }
  }

  private _swap(i: number, j: number): void {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
}

//extended union-find data structure
class UnionFind<T> {
  private parent: Map<T, T>;
  private rank: Map<T, number>;

  constructor(elements: T[]) {
    this.parent = new Map();
    this.rank = new Map();

    elements.forEach((e) => {
      this.parent.set(e, e); // Each element is the parent of itself
      this.rank.set(e, 0); // Rank of each element is 0 initially
    });
  }

  find(item: T): T {
    if (this.parent.get(item)! !== item) {
      this.parent.set(item, this.find(this.parent.get(item)!));
    }
    return this.parent.get(item)!;
  }

  union(item1: T, item2: T): void {
    const root1 = this.find(item1);
    const root2 = this.find(item2);

    if (root1 === root2) return;

    const rank1 = this.rank.get(root1)!;
    const rank2 = this.rank.get(root2)!;

    if (rank1 > rank2) {
      this.parent.set(root2, root1);
    } else if (rank1 < rank2) {
      this.parent.set(root1, root2);
    } else {
      this.parent.set(root2, root1);
      this.rank.set(root1, rank1 + 1);
    }
  }
}

export default HDBSCAN;
