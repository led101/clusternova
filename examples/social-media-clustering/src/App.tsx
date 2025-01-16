import "./App.css";
import { useState } from "react";
import HDBSCAN, { findCentralElements, cosine } from "clusternova";
import TweetModal from "./components/TweetModal";
import sampleTweets from "./sampleTweets.json";

// Types
interface Tweet {
  id: string;
  text: string;
  vector?: number[]; // Optional because we'll add this after embedding
}

interface Cluster {
  tweets: Tweet[];
  summary: string;
  centralTweets: Tweet[];
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [tweets, setTweets] = useState<Tweet[]>(sampleTweets);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [outliers, setOutliers] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function getEmbeddings(
    texts: string[],
    apiKey: string
  ): Promise<number[][]> {
    const response = await fetch(`https://api.openai.com/v1/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: texts,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((item: any) => item.embedding);
  }

  async function getSummary(texts: string[], apiKey: string): Promise<string> {
    const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes groups of related tweets. Keep summaries concise and highlight common themes.",
          },
          {
            role: "user",
            content: `Please summarize these related tweets in a brief sentence:\n\n${texts.join(
              "\n"
            )}`,
          },
        ],
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  const handleCluster = async () => {
    try {
      setIsLoading(true);

      // 1. Get embeddings for all tweets
      const embeddings = await getEmbeddings(
        tweets.map((t) => t.text),
        apiKey
      );

      // 2. Create data points for HDBSCAN
      const dataPoints = tweets.map((tweet, i) => ({
        ...tweet,
        vector: embeddings[i],
      }));

      // 3. Run HDBSCAN
      const hdbscan = new HDBSCAN(dataPoints, 2, cosine); // minPoints = 2
      const { clusters: hdbscanClusters, outliers } = hdbscan.run();

      // 4. Process each cluster (find centroids and get summaries)
      const processedClusters = await Promise.all(
        hdbscanClusters.map(async (clusterTweets) => {
          const centralTweets = findCentralElements(clusterTweets, 3, cosine);
          const summary = await getSummary(
            clusterTweets.map((t) => t.text),
            apiKey
          );
          return { tweets: clusterTweets, summary, centralTweets };
        })
      );
      // Sort clusters by size (biggest first)
      setClusters(
        processedClusters.sort((a, b) => b.tweets.length - a.tweets.length)
      );
      setOutliers(outliers);
    } catch (error) {
      console.error("Clustering error:", error);
      alert(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Tweet Clustering Demo</h1>

      {/* API Key Input */}
      <div className="mb-6">
        <input
          type="password"
          placeholder="Enter OpenAI API Key. (Everything is local)"
          className="w-full p-2 border rounded"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>

      {/* Manage Tweets & Cluster Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Edit Tweets ({tweets.length})
        </button>

        <button
          onClick={handleCluster}
          disabled={isLoading || !apiKey || tweets.length < 2}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          {isLoading ? "Clustering..." : "Cluster Tweets"}
        </button>
      </div>

      {/* Display Clusters */}
      <div className="space-y-4 text-left">
        {clusters.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold mt-8 mb-4">Clustering Results</h2>
            {clusters.map((cluster, i) => (
              <div key={i} className="border rounded-lg p-6 bg-white shadow-sm">
                <h3 className="text-xl font-bold mb-2">Cluster {i + 1}</h3>

                {/* Cluster Stats */}
                <div className="mb-4 text-sm text-gray-600">
                  <p>Number of tweets: {cluster.tweets.length}</p>
                </div>

                {/* Cluster Summary */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Summary:</h4>
                  <p className="bg-gray-50 p-3 rounded">{cluster.summary}</p>
                </div>

                {/* Central Tweets */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">
                    Most Representative Tweets:
                  </h4>
                  {cluster.centralTweets.map((tweet) => (
                    <div key={tweet.id} className="bg-blue-50 p-3 rounded mb-2">
                      {tweet.text}
                    </div>
                  ))}
                </div>

                {/* All Tweets (Expandable) */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    View all tweets in this cluster
                  </summary>
                  <div className="mt-2 space-y-2">
                    {cluster.tweets.map((tweet) => (
                      <div
                        key={tweet.id}
                        className="border-l-4 border-gray-200 pl-3 py-2"
                      >
                        {tweet.text}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            ))}
            {outliers.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-2xl font-bold mb-4">Outliers</h2>
                <div className="space-y-2">
                  {outliers.map((tweet) => (
                    <div key={tweet.id} className="p-3 bg-gray-50 rounded">
                      {tweet.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : isLoading ? (
          <div className="text-center text-gray-600 mt-8">
            Processing tweets...
          </div>
        ) : null}
      </div>

      {isModalOpen && (
        <TweetModal
          onClose={() => setIsModalOpen(false)}
          tweets={tweets}
          setTweets={setTweets}
        />
      )}
    </div>
  );
}

export default App;
