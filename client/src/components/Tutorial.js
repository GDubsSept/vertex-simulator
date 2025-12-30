import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Plane,
  Globe,
  Lightbulb,
  Target,
  Layers,
  Keyboard,
  Sparkles,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const Tutorial = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'welcome',
      icon: Target,
      iconColor: 'text-vertex-400',
      iconBg: 'bg-vertex-500/20',
      title: 'Welcome to Vertex Training Platform',
      content: (
        <div className="space-y-4">
          <p className="text-neutral-300">
            This platform is designed to help supply chain professionals master the complex world of pharmaceutical logistics through AI-powered learning.
          </p>
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-neutral-100 mb-2">What You'll Learn:</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success-400 mt-0.5 flex-none" />
                <span>Supply chain fundamentals and best practices</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success-400 mt-0.5 flex-none" />
                <span>AI and machine learning concepts for supply chain</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success-400 mt-0.5 flex-none" />
                <span>Pharmaceutical-specific logistics and regulations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success-400 mt-0.5 flex-none" />
                <span>Vertex products, operations, and business context</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-neutral-500">
            Whether you're preparing for a role at Vertex or expanding your supply chain expertise, this platform adapts to your skill level.
          </p>
        </div>
      )
    },
    {
      id: 'learning-path',
      icon: Layers,
      iconColor: 'text-vertex-400',
      iconBg: 'bg-vertex-500/20',
      title: 'The Learning Path',
      content: (
        <div className="space-y-4">
          <p className="text-neutral-300">
            The platform offers three integrated learning modes, designed to build your skills progressively:
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-lg">
              <BookOpen className="w-5 h-5 text-vertex-400" />
              <span className="text-neutral-100 font-medium">Study</span>
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-600 rotate-90 sm:rotate-0" />
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-lg">
              <GraduationCap className="w-5 h-5 text-vertex-400" />
              <span className="text-neutral-100 font-medium">Test</span>
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-600 rotate-90 sm:rotate-0" />
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-lg">
              <Plane className="w-5 h-5 text-vertex-400" />
              <span className="text-neutral-100 font-medium">Apply</span>
            </div>
          </div>
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <p className="text-sm text-neutral-400">
              <span className="text-vertex-400 font-medium">Recommended approach:</span> Start with flashcards to learn concepts, 
              test your knowledge with adaptive assessments, then challenge yourself with realistic scenario simulations.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'flashcards-overview',
      icon: BookOpen,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/20',
      title: 'Flashcard Study - Overview',
      content: (
        <div className="space-y-4">
          <p className="text-neutral-300">
            The flashcard module contains <span className="text-vertex-400 font-semibold">158 cards</span> covering everything you need to know about modern supply chain management.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              'AI Fundamentals',
              'AI Agents & Architecture',
              'Supply Chain Basics',
              'Pharma Supply Chain',
              'Vertex Products',
              'Regulatory & Compliance',
              'Emerging Technology',
              'Operations & Metrics'
            ].map((category, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-vertex-500" />
                <span className="text-sm text-neutral-300">{category}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-neutral-500">
            Each card has a question on the front and a detailed answer on the back. Cards range from foundational concepts to advanced technical details.
          </p>
        </div>
      )
    },
    {
      id: 'flashcards-features',
      icon: BookOpen,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/20',
      title: 'Flashcard Study - Features',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <FeatureItem
              title="Filter by Category"
              description="Focus on specific topics like AI Agents, Pharma Supply Chain, or Vertex Products"
            />
            <FeatureItem
              title="Shuffle Mode"
              description="Randomize card order to test recall without relying on sequence memory"
            />
            <FeatureItem
              title="Mark as Known"
              description="Track which cards you've mastered to focus on areas needing more practice"
            />
            <FeatureItem
              title="Progress Tracking"
              description="See how many cards you've studied and marked as known in each session"
            />
          </div>
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-neutral-100 mb-2 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-vertex-400" />
              Keyboard Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-neutral-400"><span className="text-neutral-100 font-mono">Space</span> or <span className="text-neutral-100 font-mono">Enter</span></div>
              <div className="text-neutral-300">Flip card</div>
              <div className="text-neutral-400"><span className="text-neutral-100 font-mono">←</span> Arrow</div>
              <div className="text-neutral-300">Previous card</div>
              <div className="text-neutral-400"><span className="text-neutral-100 font-mono">→</span> Arrow</div>
              <div className="text-neutral-300">Next card</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'test-overview',
      icon: GraduationCap,
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/20',
      title: 'Knowledge Test - Overview',
      content: (
        <div className="space-y-4">
          <p className="text-neutral-300">
            The Knowledge Test uses AI to generate unique assessments tailored to your learning needs. Each test draws from the complete flashcard database.
          </p>
          <div className="bg-neutral-800/50 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-neutral-100">Test Format:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Questions</span>
                <p className="text-neutral-100 font-mono">20 per session</p>
              </div>
              <div>
                <span className="text-neutral-500">Question Types</span>
                <p className="text-neutral-100 font-mono">Multiple choice & free text</p>
              </div>
              <div>
                <span className="text-neutral-500">Difficulty Mix</span>
                <p className="text-neutral-100 font-mono">Easy, Medium, Hard</p>
              </div>
              <div>
                <span className="text-neutral-500">Grading</span>
                <p className="text-neutral-100 font-mono">AI-powered analysis</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-neutral-500">
            Questions are dynamically generated from the flashcard content, so each test session is unique.
          </p>
        </div>
      )
    },
    {
      id: 'test-features',
      icon: GraduationCap,
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/20',
      title: 'Knowledge Test - Features',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <FeatureItem
              title="Confidence Ratings"
              description="Rate how confident you are in each answer (1-5 stars) to help identify knowledge gaps"
            />
            <FeatureItem
              title="Detailed Feedback"
              description="Every answer gets thorough explanation, not just 'correct' or 'wrong'"
            />
            <FeatureItem
              title="Category Breakdown"
              description="See your score in each topic area to identify strengths and weaknesses"
            />
            <FeatureItem
              title="Study Recommendations"
              description="AI generates personalized suggestions based on your results"
            />
          </div>
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-neutral-100 mb-2">Scoring System:</h4>
            <p className="text-sm text-neutral-400">
              Questions are weighted by difficulty (Hard = 2x, Medium = 1.5x, Easy = 1x). 
              Free text answers are evaluated for accuracy, completeness, and proper terminology.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'scenario-overview',
      icon: Plane,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/20',
      title: 'Scenario Training - Overview',
      content: (
        <div className="space-y-4">
          <p className="text-neutral-300">
            Step into realistic supply chain crisis simulations where your decisions have consequences. This is where you apply everything you've learned.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-vertex-400 mb-2">Supply Chain Planner</h4>
              <p className="text-xs text-neutral-400">
                Manage Suzetrigine launch logistics. Handle demand spikes, inventory allocation, and distribution challenges.
              </p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-critical-400 mb-2">Quality Engineer</h4>
              <p className="text-xs text-neutral-400">
                Oversee Casgevy cell therapy logistics. Manage cryo emergencies, chain of identity, and patient safety.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-success-500/20 text-success-400 rounded-full text-xs">Beginner: 10-15 min</span>
            <span className="px-3 py-1 bg-warning-500/20 text-warning-400 rounded-full text-xs">Intermediate: 15-20 min</span>
            <span className="px-3 py-1 bg-critical-500/20 text-critical-400 rounded-full text-xs">Expert: 20-30 min</span>
          </div>
        </div>
      )
    },
    {
      id: 'scenario-interface',
      icon: Plane,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/20',
      title: 'Scenario Training - Interface',
      content: (
        <div className="space-y-4">
          <p className="text-neutral-300">
            The scenario interface provides real-time data and context to inform your decisions:
          </p>
          <div className="space-y-3">
            <FeatureItem
              title="Scenario Context Panel"
              description="Left side shows alert details, key metrics, and hints (at lower difficulties)"
            />
            <FeatureItem
              title="Chat Interface"
              description="Center area where you communicate decisions and receive AI feedback"
            />
            <FeatureItem
              title="Live Data Panel"
              description="Right side (or 'Data' button on mobile) shows flights, inventory, demand, and maps"
            />
            <FeatureItem
              title="Cryo Countdown Timer"
              description="For cell therapy scenarios, a live countdown shows time until cell viability risk"
            />
          </div>
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <p className="text-sm text-neutral-400">
              <span className="text-vertex-400 font-medium">Tip:</span> On mobile, tap the pulsing "Live Data" button to see flight tracking, inventory levels, and other critical information.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'realtime-data',
      icon: Globe,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'Real-Time Data Feature',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-vertex-400" />
            <span className="text-sm font-medium text-vertex-400">AI Agent Powered</span>
          </div>
          <p className="text-neutral-300">
            Enable the "Real-Time Data" toggle when starting a scenario to create simulations grounded in actual current conditions.
          </p>
          <div className="bg-neutral-800/50 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-neutral-100">How It Works:</h4>
            <ol className="space-y-2 text-sm text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-vertex-400 font-mono">1.</span>
                <span>AI agent activates and decides what data it needs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-vertex-400 font-mono">2.</span>
                <span>Checks real weather conditions in relevant cities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-vertex-400 font-mono">3.</span>
                <span>Searches recent pharma and supply chain news</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-vertex-400 font-mono">4.</span>
                <span>Incorporates real-world context into your scenario</span>
              </li>
            </ol>
          </div>
          <p className="text-sm text-neutral-500">
            This creates highly relevant training experiences - if there's actually a storm in Chicago today, your scenario might feature that exact situation.
          </p>
        </div>
      )
    },
    {
      id: 'tips',
      icon: Lightbulb,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-500/20',
      title: 'Tips for Success',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <TipItem number="1" title="Start with Flashcards" description="Build foundational knowledge before testing yourself" />
            <TipItem number="2" title="Use Confidence Ratings Honestly" description="This helps identify true knowledge gaps" />
            <TipItem number="3" title="Read Feedback Carefully" description="The AI provides detailed explanations - don't skip them" />
            <TipItem number="4" title="Try Different Scenario Roles" description="Each role teaches different aspects of supply chain" />
            <TipItem number="5" title="Enable Real-Time Data" description="Makes scenarios more engaging and relevant" />
          </div>
          <div className="bg-vertex-500/10 border border-vertex-500/30 rounded-lg p-4 mt-4">
            <p className="text-sm text-vertex-300">
              <span className="font-semibold">Ready to begin?</span> Close this guide and start with the Flashcard Study to build your knowledge foundation.
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'Escape') onClose();
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">
              {currentSlide + 1} of {slides.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-xl ${slide.iconBg} flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${slide.iconColor}`} />
            </div>
            <h2 className="text-xl font-semibold text-neutral-100">{slide.title}</h2>
          </div>
          <div className="text-neutral-300">
            {slide.content}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-900/50">
          {/* Progress Dots */}
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentSlide ? 'bg-vertex-500' : 'bg-neutral-700 hover:bg-neutral-600'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="flex items-center gap-1 px-3 py-2 text-neutral-400 hover:text-neutral-100 
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 bg-vertex-600 hover:bg-vertex-700 
                text-white rounded-lg transition-colors"
            >
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
              {currentSlide < slides.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const FeatureItem = ({ title, description }) => (
  <div className="flex items-start gap-3">
    <CheckCircle className="w-5 h-5 text-vertex-400 mt-0.5 flex-none" />
    <div>
      <h4 className="text-sm font-medium text-neutral-100">{title}</h4>
      <p className="text-xs text-neutral-500">{description}</p>
    </div>
  </div>
);

const TipItem = ({ number, title, description }) => (
  <div className="flex items-start gap-3">
    <div className="w-6 h-6 rounded-full bg-vertex-500/20 text-vertex-400 text-xs font-bold flex items-center justify-center flex-none">
      {number}
    </div>
    <div>
      <h4 className="text-sm font-medium text-neutral-100">{title}</h4>
      <p className="text-xs text-neutral-500">{description}</p>
    </div>
  </div>
);

export default Tutorial;