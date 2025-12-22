import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  Send,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Plane,
  Package,
  Thermometer,
  MapPin,
  Activity,
  FileText,
  LogOut
} from 'lucide-react';
import DataPanel from './DataPanel';

const SimulationInterface = ({ role, difficulty, onComplete, onExit }) => {
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [showGradeButton, setShowGradeButton] = useState(false);
  const messagesEndRef = useRef(null);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate scenario on mount
  useEffect(() => {
    generateScenario();
  }, []);

  const generateScenario = async () => {
    setLoading(true);
    setError(null);
    try {
      const roleLabel = role === 'supply-chain-planner' 
        ? 'Supply Chain Planner (Suzetrigine Launch)'
        : 'Quality Engineer (Cell & Gene Therapy)';

      const response = await axios.post('/api/scenario/generate', {
        role: roleLabel,
        difficulty: difficulty.toUpperCase()
      });

      if (response.data.success) {
        setScenario(response.data.scenario);
        
        // Add initial briefing message
        const initialMessage = {
          type: 'system',
          content: response.data.scenario.briefing || response.data.scenario.raw_response,
          timestamp: new Date(),
          severity: response.data.scenario.alert_severity || 'HIGH'
        };
        setMessages([initialMessage]);
        
        // Initialize conversation history for API
        setConversationHistory([
          { 
            role: 'assistant', 
            content: `SCENARIO: ${response.data.scenario.alert_title || 'Supply Chain Alert'}\n\n${response.data.scenario.briefing || response.data.scenario.raw_response}` 
          }
        ]);
        
        setTimerActive(true);
      } else {
        throw new Error(response.data.error || 'Failed to generate scenario');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || sending) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setSending(true);

    // Add user message to UI
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    try {
      const response = await axios.post('/api/scenario/respond', {
        conversationHistory: [...conversationHistory, { role: 'user', content: userMessage }],
        userResponse: userMessage,
        scenario: scenario
      });

      if (response.data.success) {
        // Update conversation history
        setConversationHistory(response.data.conversationHistory);

        // Add AI response to UI
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: response.data.response,
          timestamp: new Date()
        }]);

        setTurnCount(prev => prev + 1);

        // Show grade button after 3+ turns
        if (turnCount >= 2) {
          setShowGradeButton(true);
        }
      } else {
        throw new Error(response.data.error || 'Failed to process response');
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        type: 'error',
        content: `Error: ${err.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleRequestGrade = async () => {
    setSending(true);
    setTimerActive(false);

    try {
      const response = await axios.post('/api/scenario/grade', {
        conversationHistory,
        scenario
      });

      if (response.data.success) {
        onComplete(response.data.grade);
      } else {
        throw new Error(response.data.error || 'Failed to get grade');
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        type: 'error',
        content: `Grading error: ${err.message}`,
        timestamp: new Date()
      }]);
      setSending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-vertex-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-100 mb-2">
            Generating Scenario...
          </h2>
          <p className="text-neutral-400 text-sm">
            The AI is preparing your training simulation
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-critical-500/10 border border-critical-500 rounded-xl p-8 max-w-md text-center">
          <XCircle className="w-12 h-12 text-critical-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-100 mb-2">
            Simulation Error
          </h2>
          <p className="text-neutral-400 mb-6">{error}</p>
          <button
            onClick={generateScenario}
            className="px-6 py-2 bg-vertex-600 hover:bg-vertex-700 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-none border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                scenario?.alert_severity === 'CRITICAL' ? 'bg-critical-500 alert-pulse' :
                scenario?.alert_severity === 'HIGH' ? 'bg-warning-500 alert-pulse' :
                'bg-vertex-500'
              }`} />
              <span className="font-mono text-sm text-neutral-400">
                {scenario?.alert_severity || 'ACTIVE'} ALERT
              </span>
            </div>
            <span className="text-neutral-600">|</span>
            <h1 className="font-semibold text-neutral-100 truncate max-w-md">
              {scenario?.alert_title || 'Supply Chain Scenario'}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Timer */}
            <div className="flex items-center gap-2 text-neutral-400">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm">{formatTime(timer)}</span>
            </div>
            
            {/* Turn Counter */}
            <div className="text-neutral-400 text-sm">
              Turn <span className="text-neutral-100 font-mono">{turnCount + 1}</span>
            </div>

            {/* Exit Button */}
            <button
              onClick={onExit}
              className="flex items-center gap-2 px-3 py-1.5 text-neutral-400 hover:text-neutral-100 
                hover:bg-neutral-800 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Three Panel Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Scenario Context */}
        <aside className="w-full lg:w-96 flex-none border-b lg:border-b-0 lg:border-r border-neutral-800 bg-neutral-900/30 overflow-y-auto max-h-64 lg:max-h-none">
          <div className="p-4">
            <h2 className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-4">
              Scenario Context
            </h2>

            {/* Alert Card */}
            <div className={`rounded-lg border p-4 mb-4 ${
              scenario?.alert_severity === 'CRITICAL' 
                ? 'bg-critical-500/10 border-critical-500/50' 
                : 'bg-warning-500/10 border-warning-500/50'
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 flex-none ${
                  scenario?.alert_severity === 'CRITICAL' ? 'text-critical-500' : 'text-warning-500'
                }`} />
                <div>
                  <h3 className="font-semibold text-neutral-100 text-sm mb-1">
                    {scenario?.alert_title || 'Active Alert'}
                  </h3>
                  <p className="text-neutral-400 text-xs">
                    Severity: {scenario?.alert_severity || 'HIGH'}
                  </p>
                </div>
              </div>
            </div>

            {/* Initial Data */}
            {scenario?.initial_data && (
              <div className="space-y-3">
                {scenario.initial_data.flight_id && (
                  <DataCard 
                    icon={Plane} 
                    label="Flight ID" 
                    value={scenario.initial_data.flight_id} 
                  />
                )}
                {scenario.initial_data.location && (
                  <DataCard 
                    icon={MapPin} 
                    label="Location" 
                    value={scenario.initial_data.location} 
                  />
                )}
                {scenario.initial_data.time_pressure && (
                  <DataCard 
                    icon={Clock} 
                    label="Time Constraint" 
                    value={scenario.initial_data.time_pressure}
                    warning 
                  />
                )}
              </div>
            )}

            {/* Hints (for Beginner) */}
            {difficulty === 'beginner' && scenario?.hints && scenario.hints.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-3">
                  Hints
                </h3>
                <div className="space-y-2">
                  {scenario.hints.map((hint, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                      <ChevronRight className="w-4 h-4 flex-none text-vertex-500 mt-0.5" />
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center Panel - Chat/Action */}
        <main className="flex-1 flex flex-col min-w-0 bg-neutral-950 order-first lg:order-none">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {sending && (
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI is analyzing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-none border-t border-neutral-800 p-4 bg-neutral-900/50">
            <div className="max-w-3xl mx-auto">
              {showGradeButton && (
                <div className="mb-3 flex justify-center">
                  <button
                    onClick={handleRequestGrade}
                    disabled={sending}
                    className="px-4 py-2 bg-success-600 hover:bg-success-700 text-white rounded-lg
                      text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Request Final Grade
                  </button>
                </div>
              )}
              
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Describe your action or decision..."
                  disabled={sending}
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3
                    text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-vertex-500
                    disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || sending}
                  className="px-4 py-3 bg-vertex-600 hover:bg-vertex-700 text-white rounded-lg
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-neutral-500 mt-2 text-center">
                Press Enter to send • Type your mitigation strategy or ask clarifying questions
              </p>
            </div>
          </div>
        </main>

        {/* Right Panel - Live Data */}
        <aside className="hidden lg:block w-96 flex-none border-l border-neutral-800 bg-neutral-900/30 overflow-y-auto">
          <DataPanel role={role} scenario={scenario} />
        </aside>
      </div>
    </div>
  );
};

// Helper Components
const DataCard = ({ icon: Icon, label, value, warning = false }) => (
  <div className={`rounded-lg p-3 ${warning ? 'bg-warning-500/10' : 'bg-neutral-800/50'}`}>
    <div className="flex items-center gap-2 mb-1">
      <Icon className={`w-4 h-4 ${warning ? 'text-warning-500' : 'text-neutral-400'}`} />
      <span className="text-xs text-neutral-500 uppercase">{label}</span>
    </div>
    <p className={`text-sm font-mono ${warning ? 'text-warning-400' : 'text-neutral-100'}`}>
      {value}
    </p>
  </div>
);

const MessageBubble = ({ message }) => {
  const isUser = message.type === 'user';
  const isError = message.type === 'error';
  const isSystem = message.type === 'system';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
        isUser 
          ? 'bg-vertex-600 text-white' 
          : isError 
            ? 'bg-critical-500/10 border border-critical-500/50 text-critical-400'
            : isSystem
              ? 'bg-neutral-800 border border-neutral-700 text-neutral-100'
              : 'bg-neutral-800 text-neutral-100'
      }`}>
        {isSystem && (
          <div className="flex items-center gap-2 text-xs text-warning-500 mb-2">
            <AlertTriangle className="w-3 h-3" />
            INCOMING ALERT
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-2 ${isUser ? 'text-vertex-200' : 'text-neutral-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default SimulationInterface;
