import { useState, useRef, useEffect } from "react";

interface Tweet {
  id: string;
  text: string;
  vector?: number[];
}

interface TweetModalProps {
  onClose: () => void;
  tweets: Tweet[];
  setTweets: (tweets: Tweet[]) => void;
}

interface EditState {
  [key: string]: {
    isEditing: boolean;
    draftText: string;
  };
}

export default function TweetModal({
  onClose,
  tweets,
  setTweets,
}: TweetModalProps) {
  const [newTweetText, setNewTweetText] = useState("");
  const [editStates, setEditStates] = useState<EditState>({});
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleAddTweet = () => {
    if (!newTweetText.trim()) return;

    const newTweet: Tweet = {
      id: Date.now().toString(),
      text: newTweetText.trim(),
    };

    setTweets([...tweets, newTweet]);
    setNewTweetText("");
  };

  const handleRemoveTweet = (id: string) => {
    setTweets(tweets.filter((tweet) => tweet.id !== id));
  };

  const startEditing = (tweet: Tweet) => {
    setEditStates({
      ...editStates,
      [tweet.id]: { isEditing: true, draftText: tweet.text },
    });
  };

  const cancelEditing = (id: string) => {
    const newEditStates = { ...editStates };
    delete newEditStates[id];
    setEditStates(newEditStates);
  };

  const saveTweet = (id: string) => {
    const editState = editStates[id];
    if (!editState) return;

    setTweets(
      tweets.map((tweet) =>
        tweet.id === id ? { ...tweet, text: editState.draftText } : tweet
      )
    );
    cancelEditing(id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Manage Tweets</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Add new tweet */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTweetText}
            onChange={(e) => setNewTweetText(e.target.value)}
            placeholder="Enter new tweet text"
            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleAddTweet()}
          />
          <button
            onClick={handleAddTweet}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Add Tweet
          </button>
        </div>

        {/* List of existing tweets */}
        <div className="space-y-4">
          {tweets.map((tweet) => {
            const editState = editStates[tweet.id];
            const isEditing = editState?.isEditing;

            return (
              <div
                key={tweet.id}
                className="border rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                {isEditing ? (
                  <textarea
                    value={editState.draftText}
                    onChange={(e) =>
                      setEditStates({
                        ...editStates,
                        [tweet.id]: { ...editState, draftText: e.target.value },
                      })
                    }
                    className="w-full p-2 mb-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    rows={2}
                  />
                ) : (
                  <p className="mb-3 text-gray-700">{tweet.text}</p>
                )}

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => saveTweet(tweet.id)}
                        className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => cancelEditing(tweet.id)}
                        className="text-sm px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEditing(tweet)}
                      className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveTweet(tweet.id)}
                    className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-gray-500 text-sm border-t pt-4">
          Total tweets: {tweets.length}
        </div>
      </div>
    </div>
  );
}
