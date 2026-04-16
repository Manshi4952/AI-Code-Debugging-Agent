import { useState, useCallback } from "react";
import Header from "./components/Header";
import EditorPanel from "./components/EditorPanel";
import ResultsPanel from "./components/ResultsPanel";
import { analyzeCode, sendChatMessage } from "./utils/api";
import "./styles/App.css";

const DEFAULT_CODE = {
  python: `def find_max_subarray(arr):
  # Returns max sum subarray (Kadane's algorithm)
  max_sum = 0
  current_sum = 0

  for i in range(len(arr)+1):   # BUG: off-by-one
    current_sum += arr[i]
    if current_sum < 0:
      current_sum = 0
    if current_sum > max_sum:
      max_sum = current_sum

  return max_sum  # BUG: fails for all-negative arrays


def binary_search(arr, target):
  left, right = 0, len(arr)   # BUG: should be len(arr)-1
  while left <= right:
    mid = (left + right) // 2
    if arr[mid] == target: return mid
    elif arr[mid] < target: left = mid + 1
    else: right = mid - 1
  return -1`,
  javascript: `function findDuplicate(nums) {
  // Find duplicate number in array
  let seen = {}
  for (let i = 0; i <= nums.length; i++) {  // BUG: off-by-one
    if (seen[nums[i]]) {
      return nums[i]
    }
    seen[nums[i]] = true
  }
  return -1
}

async function fetchUser(id) {
  const res = fetch(\`/api/users/\${id}\`)  // BUG: missing await
  return res.json()
}`,
  java: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i; j < nums.length; j++) {  // BUG: j should start at i+1
                if (nums[i] + nums[j] == target) {
                    return new int[]{i, j};
                }
            }
        }
        return null;  // BUG: should throw or return empty array
    }
}`,
  cpp: `#include <vector>
using namespace std;

int maxElement(vector<int>& arr) {
    int max = arr[0];
    for (int i = 0; i <= arr.size(); i++) {  // BUG: should be <
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}`,
};

export default function App() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_CODE["python"]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("bugs");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm DebugBrain 🧠 Paste your code and click Analyze. I'll detect bugs, remember your patterns, and help you fix them faster over time.",
    },
  ]);
  const [memories, setMemories] = useState([]);
  const [history, setHistory] = useState([]);
  const [userId] = useState("user_" + Math.random().toString(36).slice(2, 8));

  const handleLanguageChange = useCallback(
    (lang) => {
      setLanguage(lang);
      setCode(DEFAULT_CODE[lang] || "");
      setAnalysisResult(null);
    },
    []
  );

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setActiveTab("bugs");
    try {
      const result = await analyzeCode({ code, language, userId });
      setAnalysisResult(result);
      if (result.bugs?.length > 0) {
        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Analysis complete! Found **${result.bugs.length} bug${result.bugs.length !== 1 ? "s" : ""}**. ${
              result.bugs.some((b) => b.is_recurring)
                ? "⚠️ Some of these match your past patterns — check the Bugs tab."
                : "Click any bug card to learn more."
            }`,
          },
        ]);
      }
    } catch (err) {
      setAnalysisResult({ error: err.message });
    } finally {
      setIsAnalyzing(false);
    }
  }, [code, language, userId]);

  const handleChat = useCallback(
    async (message) => {
      const userMsg = { role: "user", content: message };
      setChatHistory((prev) => [...prev, userMsg]);
      try {
        const res = await sendChatMessage({
          message,
          code,
          language,
          userId,
          history: chatHistory.slice(-6),
        });
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: res.reply },
        ]);
      } catch (err) {
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, something went wrong. Please try again." },
        ]);
      }
    },
    [code, language, userId, chatHistory]
  );

  return (
    <div className="app">
      <Header
        bugCount={analysisResult?.bugs?.length ?? 0}
        memoryCount={memories.length}
        isAnalyzing={isAnalyzing}
      />
      <div className="main-layout">
        <EditorPanel
          code={code}
          language={language}
          bugs={analysisResult?.bugs ?? []}
          onCodeChange={setCode}
          onLanguageChange={handleLanguageChange}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />
        <ResultsPanel
          result={analysisResult}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          chatHistory={chatHistory}
          onChat={handleChat}
          userId={userId}
          memories={memories}
          setMemories={setMemories}
          history={history}
          setHistory={setHistory}
        />
      </div>
    </div>
  );
}
