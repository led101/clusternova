import "./App.css";
import { useState } from "react";
import HDBSCAN, { findCentralElements, cosine } from "clusternova";
import TweetModal from "./components/TweetModal";

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
  const [tweets, setTweets] = useState<Tweet[]>([
    {
      id: "1",
      text: "I absolutely love programming in TypeScript! The type safety is amazing.",
    },
    {
      id: "2",
      text: "Just had the best pizza in Naples. Italian food is unbeatable!",
    },
    {
      id: "3",
      text: "TypeScript's compiler caught another bug before it hit production. So grateful!",
    },
    {
      id: "4",
      text: "Made homemade pasta today with my new pasta maker. The texture was perfect!",
    },
    {
      id: "5",
      text: "React 19 is going to be a game changer. Can't wait for all the new features!",
    },
    {
      id: "6",
      text: "Just tried a new Italian restaurant downtown. Their carbonara is to die for!",
    },
    {
      id: "7",
      text: "Frontend development has come so far. Modern frameworks make everything easier.",
    },
    {
      id: "8",
      text: "Learning TypeScript was the best decision I made for my coding career.",
    },
    {
      id: "9",
      text: "Nothing beats a wood-fired margherita pizza with fresh basil.",
    },
    {
      id: "10",
      text: "React's hooks have completely changed how I think about state management.",
    },
    {
      id: "11",
      text: "Finally, red flag warnings lifted in LA! Our firefighters can better contain these massive fires now. 🙏 #LAFires",
    },
    {
      id: "12",
      text: "88,000 people still evacuated in LA County. Hoping everyone stays safe and can return home soon. #PalisadesFire #EatonFire",
    },
    {
      id: "13",
      text: "The air quality is terrible in LA right now. Wearing my N95 mask whenever I go outside. Take care everyone! 😷",
    },
    {
      id: "14",
      text: "Amazing to see the community coming together to help fire evacuees. Drop off supplies at local centers if you can help! #LAStrong",
    },
    {
      id: "15",
      text: "38,600 acres burned so far in LA County. The scale of these fires is just devastating. 💔 #CaliforniaWildfires",
    },
    {
      id: "16",
      text: "Grateful for our firefighters making progress on containment. Lighter winds are finally giving them a break. #ThankYouFirefighters",
    },
    {
      id: "17",
      text: "If you're returning home after evacuation, remember to check for hazards and follow official guidance. Stay safe! #LAFires",
    },
    {
      id: "18",
      text: "The smoke from these fires is no joke. Health officials say to avoid outdoor activities if possible. #LAAirQuality",
    },
    {
      id: "19",
      text: "Palisades and Eaton fires still burning but containment growing. Progress feels slow but steady. #LosAngelesFires",
    },
    {
      id: "20",
      text: "84,800 people under evacuation warnings on top of those already evacuated. This is unprecedented. #LAFires",
    },
    {
      id: "21",
      text: "Just donated supplies for fire evacuees. The relief centers need water, food, and toiletries if anyone can help! #LACommunity",
    },
    {
      id: "22",
      text: "These fires are affecting air quality all across LA County. Remember to keep windows closed and use air purifiers if you have them.",
    },
    {
      id: "23",
      text: "Seeing the fire maps is sobering. Both Palisades and Eaton fires have caused so much destruction. Stay strong LA! 💪",
    },
    {
      id: "24",
      text: "Important: N95 masks recommended for anyone who must be outside in affected areas. Regular masks won't protect from smoke! #LAFires",
    },
    {
      id: "25",
      text: "The outpouring of support for evacuees has been incredible. This is what community looks like! #LAStrong #CaliforniaWildfires",
    },
    {
      id: "26",
      text: "Red flag warnings finally expired! This should help firefighters get better control of the situation. 🚒",
    },
    {
      id: "27",
      text: "If you're under evacuation warning, please stay prepared and keep important documents ready. Better safe than sorry! #LASafety",
    },
    {
      id: "28",
      text: "The smoke is making everything look apocalyptic in LA today. Stay inside if you can everyone. #LAFires #AirQuality",
    },
    {
      id: "29",
      text: "Firefighters are making progress on containment lines thanks to calmer winds. Every bit of good news counts! #PalisadesFire",
    },
    {
      id: "30",
      text: "Remember to check official sources for evacuation updates and air quality readings. Stay informed and stay safe LA! #LAFires",
    },
    {
      id: "31",
      text: "ChatGPT just helped me debug a tricky coding issue in minutes. AI pair programming is the future! 🤖💻",
    },
    {
      id: "32",
      text: "The latest AI image generation models are mind-blowing. The quality keeps getting better every month! #AIart",
    },
    {
      id: "33",
      text: "Interesting debate about AI safety today. We need to think carefully about alignment as these systems get more powerful.",
    },
    {
      id: "34",
      text: "Using AI to help with medical diagnoses is showing really promising results. Could revolutionize healthcare! #AIinMedicine",
    },
    {
      id: "35",
      text: "Just tried the new GPT-4 API. The reasoning capabilities are significantly improved from GPT-3.5! #AI #MachineLearning",
    },
    {
      id: "36",
      text: "AI is transforming scientific research. The speed of discovery in fields like protein folding is unprecedented. #AIScience",
    },
    {
      id: "37",
      text: "Important to remember that AI models can hallucinate. Always verify critical information from reliable sources! #AILimitations",
    },
    {
      id: "38",
      text: "The democratization of AI tools is amazing. Small businesses can now leverage AI capabilities that were once enterprise-only.",
    },
    {
      id: "39",
      text: "Fascinating paper on large language models' emergent abilities. These systems keep surprising us! #AIResearch",
    },
    {
      id: "40",
      text: "AI ethics should be a priority as we develop more powerful systems. We need robust governance frameworks. #AIEthics",
    },
    {
      id: "41",
      text: "Using AI for climate modeling is helping us better understand and predict climate change patterns. #AI #ClimateAction",
    },
    {
      id: "42",
      text: "The new multimodal AI models are incredible - they can understand text, images, and audio together seamlessly! #AIProgress",
    },
    {
      id: "43",
      text: "AI-powered code completion has become indispensable in my development workflow. Huge productivity boost! #CodingWithAI",
    },
    {
      id: "44",
      text: "Concerned about AI's impact on jobs. We need to focus on reskilling and adaptation strategies. #AIandWork",
    },
    {
      id: "45",
      text: "The combination of AI and robotics is opening up amazing possibilities in manufacturing and automation. #AIRobotics",
    },
    {
      id: "46",
      text: "AI models are getting more efficient - same capabilities with much lower computational costs. Great for sustainability! #GreenAI",
    },
    {
      id: "47",
      text: "Impressive how AI is helping with language translation. Breaking down communication barriers globally! #AITranslation",
    },
    {
      id: "48",
      text: "The pace of AI advancement is incredible. What seemed impossible a year ago is now readily available. #AIPropgress",
    },
    {
      id: "49",
      text: "AI-generated music is getting surprisingly good. Interesting implications for the creative industry! #AICreativity",
    },
    {
      id: "50",
      text: "We need more diversity in AI development teams to ensure these systems work well for everyone. #AIInclusion",
    },
  ]);
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
      setClusters(processedClusters);
      setOutliers(outliers);

      setClusters(processedClusters);
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
