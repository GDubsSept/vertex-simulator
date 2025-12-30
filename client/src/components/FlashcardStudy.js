import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Filter,
  X,
  BookOpen,
  CheckCircle,
  Layers
} from 'lucide-react';

const FlashcardStudy = ({ onBack }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [studiedCards, setStudiedCards] = useState(new Set());
  const [markedKnown, setMarkedKnown] = useState(new Set());

  useEffect(() => {
    fetchFlashcards();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredCards(flashcards);
    } else {
      setFilteredCards(flashcards.filter(card => card.category === selectedCategory));
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedCategory, flashcards]);

  const fetchFlashcards = async () => {
    try {
      const response = await axios.get('/api/flashcards');
      if (response.data.success) {
        const cards = response.data.data || response.data.flashcards || [];
        setFlashcards(cards);
        setFilteredCards(cards);
        
        // Extract unique categories
        const cats = [...new Set(cards.map(f => f.category))];
        setCategories(cats.sort());
      }
    } catch (err) {
      console.error('Error fetching flashcards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setStudiedCards(prev => new Set([...prev, filteredCards[currentIndex].id]));
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
    setFilteredCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleMarkKnown = () => {
    const cardId = filteredCards[currentIndex].id;
    setMarkedKnown(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleFlip();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, filteredCards]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-vertex-500 mx-auto mb-4 animate-pulse" />
          <p className="text-neutral-400">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  const currentCard = filteredCards[currentIndex];
  const progress = ((currentIndex + 1) / filteredCards.length) * 100;
  const studiedCount = studiedCards.size;
  const knownCount = markedKnown.size;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-neutral-400 hover:text-neutral-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              <div>
                <h1 className="text-lg font-semibold text-neutral-100">Flashcard Study</h1>
                <p className="text-xs text-neutral-500">{filteredCards.length} cards</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  showFilters || selectedCategory !== 'all'
                    ? 'bg-vertex-600 text-white'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              <button
                onClick={handleShuffle}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-800 text-neutral-300 
                  hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-neutral-400">Filter by Category</span>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs text-vertex-400 hover:text-vertex-300"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-vertex-600 text-white'
                      : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                  }`}
                >
                  All ({flashcards.length})
                </button>
                {categories.map(cat => {
                  const count = flashcards.filter(f => f.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-vertex-600 text-white'
                          : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-neutral-800">
        <div 
          className="h-full bg-vertex-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-neutral-100">{currentIndex + 1}/{filteredCards.length}</p>
            <p className="text-xs text-neutral-500">Current Card</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-vertex-400">{studiedCount}</p>
            <p className="text-xs text-neutral-500">Studied</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-400">{knownCount}</p>
            <p className="text-xs text-neutral-500">Marked Known</p>
          </div>
        </div>

        {/* Flashcard */}
        {currentCard && (
          <div className="perspective-1000 mb-8">
            <div
              onClick={handleFlip}
              className={`relative w-full min-h-[300px] sm:min-h-[350px] cursor-pointer transition-transform duration-500 transform-style-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 backface-hidden bg-gradient-to-br from-neutral-800 to-neutral-900 
                  rounded-2xl border border-neutral-700 p-6 sm:p-8 flex flex-col"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-vertex-500/20 text-vertex-400 text-xs font-medium rounded-full">
                    {currentCard.category}
                  </span>
                  {markedKnown.has(currentCard.id) && (
                    <CheckCircle className="w-5 h-5 text-success-400" />
                  )}
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-lg sm:text-xl text-neutral-100 text-center leading-relaxed">
                    {currentCard.front}
                  </p>
                </div>
                
                <div className="text-center mt-4">
                  <p className="text-sm text-neutral-500">Click or press Space to flip</p>
                </div>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 backface-hidden bg-gradient-to-br from-vertex-900/50 to-neutral-900 
                  rounded-2xl border border-vertex-700/50 p-6 sm:p-8 flex flex-col"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-vertex-500/20 text-vertex-400 text-xs font-medium rounded-full">
                    Answer
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkKnown();
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                      markedKnown.has(currentCard.id)
                        ? 'bg-success-500/20 text-success-400'
                        : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
                    }`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    {markedKnown.has(currentCard.id) ? 'Known' : 'Mark Known'}
                  </button>
                </div>
                
                <div className="flex-1 flex items-center justify-center overflow-y-auto">
                  <p className="text-base sm:text-lg text-neutral-200 text-center leading-relaxed whitespace-pre-line">
                    {currentCard.back}
                  </p>
                </div>
                
                <div className="text-center mt-4">
                  <p className="text-sm text-neutral-500">Click or press Space to flip back</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-300 
              hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          
          <button
            onClick={handleFlip}
            className="flex items-center gap-2 px-6 py-2 bg-vertex-600 hover:bg-vertex-700 
              text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Flip
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentIndex === filteredCards.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-300 
              hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Keyboard Hints */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-600">
            Keyboard: ← Previous | Space/Enter Flip | → Next
          </p>
        </div>
      </main>
    </div>
  );
};

export default FlashcardStudy;