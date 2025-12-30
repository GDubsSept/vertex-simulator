import React, { useState, useEffect } from 'react';
import { Loader2, Brain, Sparkles } from 'lucide-react';

const LoadingMessages = ({ type, useRealTimeData = false }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  const messagesByType = {
    scenario: useRealTimeData ? [
      { text: "Activating AI agent...", icon: "🤖" },
      { text: "Checking current weather conditions...", icon: "🌤️" },
      { text: "Searching recent pharma news...", icon: "📰" },
      { text: "Incorporating real-world data...", icon: "🔗" },
      { text: "Building realistic scenario...", icon: "🏗️" },
      { text: "Finalizing your briefing...", icon: "📋" }
    ] : [
      { text: "Initializing scenario engine...", icon: "⚡" },
      { text: "Selecting crisis type...", icon: "🎯" },
      { text: "Building realistic situation...", icon: "🏗️" },
      { text: "Generating operational data...", icon: "📊" },
      { text: "Preparing your briefing...", icon: "📋" }
    ],
    test: [
      { text: "Analyzing knowledge base...", icon: "📚" },
      { text: "Selecting questions...", icon: "🎯" },
      { text: "Balancing topic coverage...", icon: "⚖️" },
      { text: "Calibrating difficulty...", icon: "📈" },
      { text: "Preparing your test...", icon: "✏️" }
    ],
    grading: [
      { text: "Evaluating your responses...", icon: "🔍" },
      { text: "Calculating category scores...", icon: "📊" },
      { text: "Identifying areas for improvement...", icon: "💡" },
      { text: "Generating personalized feedback...", icon: "📝" }
    ],
    thinking: [
      { text: "Analyzing your decision...", icon: "🧠" },
      { text: "Considering implications...", icon: "💭" },
      { text: "Formulating response...", icon: "✍️" }
    ]
  };

  const messages = messagesByType[type] || messagesByType.scenario;

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [messages.length]);

  const currentMessage = messages[messageIndex];

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Animated Icon */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-vertex-500/20 flex items-center justify-center">
          <Brain className="w-8 h-8 text-vertex-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-vertex-600 flex items-center justify-center animate-pulse">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-vertex-500/30 border-t-vertex-500 animate-spin" 
          style={{ animationDuration: '2s' }} 
        />
      </div>

      {/* Message with fade transition */}
      <div className="h-8 flex items-center justify-center">
        <p 
          key={messageIndex}
          className="text-neutral-300 text-lg animate-fade-in flex items-center gap-2"
        >
          <span>{currentMessage.icon}</span>
          <span>{currentMessage.text}</span>
        </p>
      </div>

      {/* Subtitle */}
      <p className="text-neutral-500 text-sm mt-2">
        {type === 'scenario' && useRealTimeData && (
          <span className="flex items-center gap-1 justify-center">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Real-time data enabled
          </span>
        )}
        {type === 'scenario' && !useRealTimeData && 'This may take a few moments'}
        {type === 'test' && 'Generating unique questions'}
        {type === 'grading' && 'AI is reviewing your answers'}
        {type === 'thinking' && 'Processing your input'}
      </p>
    </div>
  );
};

export default LoadingMessages;