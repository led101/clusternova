import { useState } from "react";

interface Tweet {
  id: string;
  text: string;
  vector?: number[];
}

interface TweetModalProps {
  isOpen: boolean;
  onClose: () => void;
  tweets: Tweet[];
  setTweets: (tweets: Tweet[]) => void;
}

export default function TweetModal({
  isOpen,
  onClose,
  tweets,
  setTweets,
}: TweetModalProps) {
  const [newTweetText, setNewTweetText] = useState("");

  if (!isOpen) return null;

  const handleAddTweet = () => {
    if (!newTweetText.trim()) return;

    const newTweet: Tweet = {
      id: Date.now().toString(), // Simple ID generation
      text: newTweetText.trim(),
    };

    setTweets([...tweets, newTweet]);
    setNewTweetText("");
  };

  const handleRemoveTweet = (id: string) => {
    setTweets(tweets.filter((tweet) => tweet.id !== id));
  };

  const handleEditTweet = (id: string, newText: string) => {
    setTweets(
      tweets.map((tweet) =>
        tweet.id === id ? { ...tweet, text: newText } : tweet
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Manage Tweets</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Add new tweet */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newTweetText}
            onChange={(e) => setNewTweetText(e.target.value)}
            placeholder="Enter new tweet text"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleAddTweet}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Tweet
          </button>
        </div>

        {/* List of existing tweets */}
        <div className="space-y-3">
          {tweets.map((tweet) => (
            <div key={tweet.id} className="border rounded p-3">
              <textarea
                value={tweet.text}
                onChange={(e) => handleEditTweet(tweet.id, e.target.value)}
                className="w-full p-2 mb-2 border rounded"
                rows={2}
              />
              <button
                onClick={() => handleRemoveTweet(tweet.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 text-gray-500 text-sm">
          Total tweets: {tweets.length}
        </div>
      </div>
    </div>
  );
}
