import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Loader2,
  BookOpen,
  Target,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  Lightbulb
} from 'lucide-react';

const TestPrep = ({ onBack }) => {
  const [stage, setStage] = useState('config'); // config | loading | test | results | teaching
  const [config, setConfig] = useState({
    length: 20,
    categories: [],
    weakAreas: []
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [teachingContent, setTeachingContent] = useState(null);
  const [teachingCategory, setTeachingCategory] = useState(null);
  const [error, setError] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Start timer when question changes
  useEffect(() => {
    if (stage === 'test') {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, stage]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/flashcards/categories');
      if (response.data.success) {
        setAvailableCategories(response.data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const generateTest = async () => {
    setStage('loading');
    setError(null);
    try {
      const response = await axios.post('/api/test/generate', {
        length: config.length,
        categories: config.categories.length > 0 ? config.categories : null,
        weakAreas: config.weakAreas.length > 0 ? config.weakAreas : null
      });

      if (response.data.success) {
        setQuestions(response.data.questions);
        setAnswers(new Array(response.data.questions.length).fill(null));
        setCurrentQuestion(0);
        setStage('test');
      } else {
        throw new Error(response.data.error || 'Failed to generate test');
      }
    } catch (err) {
      setError(err.message);
      setStage('config');
    }
  };

  const handleAnswer = (answer, confidence) => {
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      answer,
      confidence,
      timeTaken
    };
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitTest = async () => {
    setStage('loading');
    try {
      const response = await axios.post('/api/test/grade', {
        questions,
        answers
      });

      if (response.data.success) {
        setResults(response.data.grade);
        setStage('results');
      } else {
        throw new Error(response.data.error || 'Failed to grade test');
      }
    } catch (err) {
      setError(err.message);
      setStage('test');
    }
  };

  const startWeakAreasTest = () => {
    setConfig(prev => ({
      ...prev,
      weakAreas: results.weak_areas,
      length: Math.min(20, prev.length)
    }));
    setResults(null);
    setQuestions([]);
    setAnswers([]);
    setStage('config');
  };

  const requestTeaching = async (category) => {
    setTeachingCategory(category);
    setStage('loading');
    try {
      // Get concepts from wrong answers in this category
      const wrongConcepts = results.answers
        .filter((a, i) => !a.is_correct && questions[i].category === category)
        .map((a, i) => questions[results.answers.indexOf(a)]?.question)
        .slice(0, 3);

      const response = await axios.post('/api/test/teach', {
        category,
        concepts: wrongConcepts
      });

      if (response.data.success) {
        setTeachingContent(response.data.lesson);
        setStage('teaching');
      } else {
        throw new Error(response.data.error || 'Failed to get lesson');
      }
    } catch (err) {
      setError(err.message);
      setStage('results');
    }
  };

  const restartFresh = () => {
    setConfig({ length: 20, categories: [], weakAreas: [] });
    setResults(null);
    setQuestions([]);
    setAnswers([]);
    setTeachingContent(null);
    setStage('config');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex-none border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={stage === 'teaching' ? () => setStage('results') : onBack}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-400" />
            </button>
            <div>
              <h1 className="font-display font-semibold text-neutral-100">
                Knowledge Test
              </h1>
              <p className="text-xs text-neutral-500 font-mono">
                {stage === 'config' && '// CONFIGURE TEST'}
                {stage === 'loading' && '// LOADING...'}
                {stage === 'test' && `// QUESTION ${currentQuestion + 1}/${questions.length}`}
                {stage === 'results' && '// RESULTS'}
                {stage === 'teaching' && `// LEARNING: ${teachingCategory}`}
              </p>
            </div>
          </div>

          {stage === 'test' && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-neutral-400">
                Answered: <span className="text-neutral-100 font-mono">
                  {answers.filter(a => a !== null).length}/{questions.length}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {stage === 'config' && (
          <ConfigScreen
            config={config}
            setConfig={setConfig}
            categories={availableCategories}
            onStart={generateTest}
            hasWeakAreas={config.weakAreas.length > 0}
          />
        )}

        {stage === 'loading' && (
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-vertex-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-100 mb-2">
                {questions.length > 0 ? 'Grading Your Test...' : 'Generating Questions...'}
              </h2>
              <p className="text-neutral-400 text-sm">
                AI is preparing your personalized content
              </p>
            </div>
          </div>
        )}

        {stage === 'test' && questions.length > 0 && (
          <TestScreen
            question={questions[currentQuestion]}
            questionIndex={currentQuestion}
            totalQuestions={questions.length}
            answer={answers[currentQuestion]}
            onAnswer={handleAnswer}
            onNext={nextQuestion}
            onPrev={prevQuestion}
            onSubmit={submitTest}
            isLast={currentQuestion === questions.length - 1}
            allAnswered={answers.every(a => a !== null)}
          />
        )}

        {stage === 'results' && results && (
          <ResultsScreen
            results={results}
            questions={questions}
            answers={answers}
            onRetakeWeakAreas={startWeakAreasTest}
            onTeach={requestTeaching}
            onRestart={restartFresh}
          />
        )}

        {stage === 'teaching' && teachingContent && (
          <TeachingScreen
            category={teachingCategory}
            content={teachingContent}
            onBack={() => setStage('results')}
            onTest={startWeakAreasTest}
          />
        )}
      </main>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-critical-500/90 text-white px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
          <button onClick={() => setError(null)} className="ml-2 hover:opacity-80">×</button>
        </div>
      )}
    </div>
  );
};

// Config Screen
const ConfigScreen = ({ config, setConfig, categories, onStart, hasWeakAreas }) => {
  const lengths = [
    { value: 20, label: 'Short', desc: '~15 minutes' },
    { value: 40, label: 'Medium', desc: '~30 minutes' },
    { value: 60, label: 'Long', desc: '~45 minutes' }
  ];

  const toggleCategory = (cat) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {hasWeakAreas && (
        <div className="mb-6 p-4 bg-warning-500/10 border border-warning-500/30 rounded-xl">
          <div className="flex items-center gap-2 text-warning-400 mb-2">
            <Target className="w-5 h-5" />
            <span className="font-semibold">Weak Areas Focus Mode</span>
          </div>
          <p className="text-neutral-400 text-sm">
            This test will prioritize questions from: {config.weakAreas.join(', ')}
          </p>
        </div>
      )}

      {/* Test Length */}
      <div className="mb-8">
        <h3 className="text-sm font-mono text-neutral-500 uppercase tracking-wider mb-4">
          Test Length
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {lengths.map(len => (
            <button
              key={len.value}
              onClick={() => setConfig(prev => ({ ...prev, length: len.value }))}
              className={`p-4 rounded-xl border-2 transition-all ${
                config.length === len.value
                  ? 'border-vertex-500 bg-vertex-500/10'
                  : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
              }`}
            >
              <div className="text-2xl font-bold text-neutral-100 mb-1">{len.value}</div>
              <div className="text-sm text-neutral-400">{len.label}</div>
              <div className="text-xs text-neutral-500">{len.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <h3 className="text-sm font-mono text-neutral-500 uppercase tracking-wider mb-4">
          Focus Areas (Optional)
        </h3>
        <p className="text-neutral-400 text-sm mb-4">
          Leave all unselected for a comprehensive test, or select specific categories to focus on.
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                config.categories.includes(cat)
                  ? 'bg-vertex-500 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        className="w-full py-4 bg-vertex-600 hover:bg-vertex-700 text-white rounded-xl
          font-semibold text-lg flex items-center justify-center gap-2 transition-colors"
      >
        Generate Test
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// Test Screen
const TestScreen = ({ 
  question, 
  questionIndex, 
  totalQuestions,
  answer, 
  onAnswer, 
  onNext, 
  onPrev, 
  onSubmit,
  isLast,
  allAnswered
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(answer?.answer || '');
  const [confidence, setConfidence] = useState(answer?.confidence || 3);
  const [freeTextAnswer, setFreeTextAnswer] = useState(answer?.answer || '');

  useEffect(() => {
    setSelectedAnswer(answer?.answer || '');
    setFreeTextAnswer(answer?.answer || '');
    setConfidence(answer?.confidence || 3);
  }, [questionIndex, answer]);

  const handleSaveAndNext = () => {
    const answerValue = question.type === 'multiple_choice' ? selectedAnswer : freeTextAnswer;
    if (answerValue) {
      onAnswer(answerValue, confidence);
    }
    if (isLast) {
      onSubmit();
    } else {
      onNext();
    }
  };

  const currentAnswer = question.type === 'multiple_choice' ? selectedAnswer : freeTextAnswer;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-vertex-500 transition-all duration-300"
            style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 mb-6">
        {/* Question Meta */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            question.difficulty === 'easy' ? 'bg-success-500/20 text-success-400' :
            question.difficulty === 'medium' ? 'bg-warning-500/20 text-warning-400' :
            'bg-critical-500/20 text-critical-400'
          }`}>
            {question.difficulty}
          </span>
          <span className="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-400">
            {question.category}
          </span>
          {question.interview_style && (
            <span className="px-2 py-1 bg-vertex-500/20 rounded text-xs text-vertex-400">
              Interview Style
            </span>
          )}
        </div>

        {/* Question Text */}
        <h2 className="text-xl text-neutral-100 mb-6">
          {question.question}
        </h2>

        {/* Answer Options */}
        {question.type === 'multiple_choice' ? (
          <div className="space-y-3">
            {question.options.map((option, i) => {
              const letter = option.charAt(0);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedAnswer(letter)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedAnswer === letter
                      ? 'border-vertex-500 bg-vertex-500/10'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-neutral-100">{option}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <textarea
            value={freeTextAnswer}
            onChange={(e) => setFreeTextAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full h-40 bg-neutral-800 border border-neutral-700 rounded-lg p-4
              text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-vertex-500
              resize-none"
          />
        )}
      </div>

      {/* Confidence Rating */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-neutral-400">How confident are you?</span>
          <span className="text-sm font-mono text-neutral-100">{confidence}/5</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(level => (
            <button
              key={level}
              onClick={() => setConfidence(level)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                confidence >= level
                  ? 'bg-vertex-500 text-white'
                  : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-neutral-500 mt-2">
          <span>Guessing</span>
          <span>Certain</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onPrev}
          disabled={questionIndex === 0}
          className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={handleSaveAndNext}
          disabled={!currentAnswer}
          className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors
            ${!currentAnswer 
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : isLast 
                ? 'bg-success-600 hover:bg-success-700 text-white'
                : 'bg-vertex-600 hover:bg-vertex-700 text-white'
            }`}
        >
          {isLast ? (
            <>
              Submit Test
              <CheckCircle className="w-5 h-5" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Results Screen
const ResultsScreen = ({ results, questions, answers, onRetakeWeakAreas, onTeach, onRestart }) => {
  const [showDetails, setShowDetails] = useState(false);

  const gradeColors = {
    'A+': 'text-success-400 border-success-500',
    'A': 'text-success-400 border-success-500',
    'A-': 'text-success-400 border-success-500',
    'B+': 'text-vertex-400 border-vertex-500',
    'B': 'text-vertex-400 border-vertex-500',
    'B-': 'text-vertex-400 border-vertex-500',
    'C+': 'text-warning-400 border-warning-500',
    'C': 'text-warning-400 border-warning-500',
    'C-': 'text-warning-400 border-warning-500',
    'D': 'text-critical-400 border-critical-500',
    'F': 'text-critical-400 border-critical-500',
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Grade Card */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 mb-6 text-center">
        <div className={`w-24 h-24 mx-auto rounded-full border-4 flex items-center justify-center mb-4
          ${gradeColors[results.overall_grade] || 'border-neutral-500'}`}>
          <span className={`text-4xl font-display font-bold 
            ${gradeColors[results.overall_grade]?.split(' ')[0] || 'text-neutral-400'}`}>
            {results.overall_grade}
          </span>
        </div>
        <div className="text-4xl font-mono font-bold text-neutral-100 mb-2">
          {results.overall_score}<span className="text-neutral-500 text-2xl">/100</span>
        </div>
        <p className="text-neutral-400">
          {results.total_correct} of {results.total_questions} correct
        </p>
      </div>

      {/* Interview Readiness */}
      {results.interview_readiness && (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-neutral-100 mb-3 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-vertex-400" />
            Interview Readiness
          </h3>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1 h-3 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-vertex-500 transition-all"
                style={{ width: `${results.interview_readiness.score}%` }}
              />
            </div>
            <span className="text-neutral-100 font-mono">{results.interview_readiness.score}%</span>
          </div>
          <p className="text-neutral-400 text-sm">{results.interview_readiness.feedback}</p>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-neutral-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-vertex-400" />
          Category Performance
        </h3>
        <div className="space-y-3">
          {Object.entries(results.category_scores).map(([cat, data]) => (
            <div key={cat}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-neutral-300 text-sm">{cat}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">{data.correct}/{data.total}</span>
                  <span className={`font-mono text-sm ${
                    data.score >= 80 ? 'text-success-400' :
                    data.score >= 60 ? 'text-warning-400' :
                    'text-critical-400'
                  }`}>{data.score}%</span>
                </div>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    data.score >= 80 ? 'bg-success-500' :
                    data.score >= 60 ? 'bg-warning-500' :
                    'bg-critical-500'
                  }`}
                  style={{ width: `${data.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak Areas */}
      {results.weak_areas && results.weak_areas.length > 0 && (
        <div className="bg-critical-500/10 border border-critical-500/30 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-critical-400 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Areas Needing Improvement
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {results.weak_areas.map(area => (
              <button
                key={area}
                onClick={() => onTeach(area)}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm
                  text-neutral-300 flex items-center gap-2 transition-colors"
              >
                <Lightbulb className="w-4 h-4 text-warning-400" />
                {area}
              </button>
            ))}
          </div>
          <p className="text-neutral-400 text-sm">
            Click on a topic above to get a personalized lesson, or take a focused test:
          </p>
          <button
            onClick={onRetakeWeakAreas}
            className="mt-4 w-full py-3 bg-vertex-600 hover:bg-vertex-700 text-white rounded-lg
              font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Target className="w-5 h-5" />
            Focus Test on Weak Areas
          </button>
        </div>
      )}

      {/* Study Recommendations */}
      {results.study_recommendations && results.study_recommendations.length > 0 && (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-neutral-100 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-vertex-400" />
            Study Recommendations
          </h3>
          <ul className="space-y-2">
            {results.study_recommendations.map((rec, i) => (
              <li key={i} className="text-neutral-400 text-sm flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-vertex-400 flex-none mt-0.5" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Question Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg
          mb-4 transition-colors"
      >
        {showDetails ? 'Hide' : 'Show'} Question Details
      </button>

      {/* Question Details */}
      {showDetails && (
        <div className="space-y-4 mb-6">
          {questions.map((q, i) => {
            const answerData = results.answers[i];
            return (
              <div 
                key={i}
                className={`border rounded-xl p-4 ${
                  answerData?.is_correct 
                    ? 'border-success-500/30 bg-success-500/5'
                    : 'border-critical-500/30 bg-critical-500/5'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {answerData?.is_correct ? (
                    <CheckCircle className="w-5 h-5 text-success-500 flex-none" />
                  ) : (
                    <XCircle className="w-5 h-5 text-critical-500 flex-none" />
                  )}
                  <div className="flex-1">
                    <p className="text-neutral-100 text-sm mb-2">{q.question}</p>
                    <div className="text-xs text-neutral-500 mb-2">
                      Your answer: <span className="text-neutral-300">{answers[i]?.answer || 'No answer'}</span>
                    </div>
                    {!answerData?.is_correct && (
                      <div className="text-xs text-success-400 mb-2">
                        Correct: {q.type === 'multiple_choice' ? q.correct_answer : 'See explanation'}
                      </div>
                    )}
                    <p className="text-xs text-neutral-400">{answerData?.feedback}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-neutral-100">
                      {answerData?.score}
                    </div>
                    <div className="text-xs text-neutral-500">points</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Restart Button */}
      <button
        onClick={onRestart}
        className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg
          flex items-center justify-center gap-2 transition-colors"
      >
        <RefreshCw className="w-5 h-5" />
        Start Fresh Test
      </button>
    </div>
  );
};

// Teaching Screen
const TeachingScreen = ({ category, content, onBack, onTest }) => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-6 h-6 text-warning-400" />
          <h2 className="text-xl font-semibold text-neutral-100">Learning: {category}</h2>
        </div>
        <div 
          className="prose prose-invert prose-sm max-w-none text-neutral-300
            prose-headings:text-neutral-100 prose-strong:text-neutral-100
            prose-code:bg-neutral-800 prose-code:px-1 prose-code:rounded"
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg
            transition-colors"
        >
          Back to Results
        </button>
        <button
          onClick={onTest}
          className="flex-1 py-3 bg-vertex-600 hover:bg-vertex-700 text-white rounded-lg
            font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Target className="w-5 h-5" />
          Test This Topic
        </button>
      </div>
    </div>
  );
};

export default TestPrep;