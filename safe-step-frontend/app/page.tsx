'use client';

import { useEffect, useState } from 'react';
import { simulationApi } from '@/lib/api';
import { Step, Option, Feedback, FinalResult } from '@/types/simulation';

export default function HomePage() {
  const [step, setStep] = useState<Step | null>(null);
  const [uuid, setUuid] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);

  // Initialize game
  useEffect(() => {
    const initGame = async () => {
      try {
        const data = await simulationApi.start();
        setUuid(data.session_uuid);
        setStep(data.step);
      } catch (err) {
        console.error('Failed to start simulation:', err);
      }
    };
    initGame();
  }, []);

  // Timer logic
  useEffect(() => {
    if (!step || !step.time_limit || feedback) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(step.time_limit);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, feedback]);

  const handleTimeOut = async () => {
    if (loading || isFinished) return;

    setLoading(true);
    try {
      // any option id for making backend call
      const anyOptionId = step?.options[0]?.id || 1;
      const response = await simulationApi.sendAnswer(uuid, anyOptionId);

      setFeedback({
        message: "Время вышло! В экстренных ситуациях промедление опасно.",
        isCorrect: false
      });

      setTimeout(() => {
        setFinalResult({
          score: response.total_score,
          score_percentage: response.score_percentage,
          isVictory: false
        });
        setIsFinished(true);
        setLoading(false);
      }, 3000);

    } catch (err) {
      console.error('Error handling timeout:', err);
      setLoading(false);
    } 
  };

  const handleOptionClick = async (optionId: number) => {
    if (loading || !uuid || feedback || isFinished) return;

    setLoading(true);
    try {
      const response = await simulationApi.sendAnswer(uuid, optionId);
      
      setFeedback({
        message: response.feedback,
        isCorrect: response.is_correct
      });

      setTimeout(() => {
        if (response.is_finished) {
          setFinalResult({
            score: response.total_score,
            score_percentage: response.score_percentage,
            isVictory: response.is_victory,
          });
          setIsFinished(true);
        } else {
          setStep(response.next_step);
          setFeedback(null);
        }
        setLoading(false);
      }, 2500);

    } catch (err) {
      console.error('Error sending answer:', err);
      setLoading(false);
    }
  };

  if (!step && !isFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-yellow-500 animate-pulse font-mono">Initializing System...</div>
      </div>
    );
  }

  // Final Screen
  if (isFinished) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl p-10 border border-slate-700 shadow-2xl text-center animate-in zoom-in duration-500">
          <div className="text-7xl mb-6">
            {finalResult?.isVictory ? '🏆' : '💀'}
          </div>
          
          <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
            {finalResult?.isVictory ? 'Вы выжили!' : 'Миссия провалена'}
          </h1>
          
          <p className="text-slate-400 mb-8 leading-relaxed">
            {finalResult?.isVictory 
              ? 'Ваши знания и быстрая реакция помогли спастись. Продолжайте в том же духе!' 
              : 'В реальности это была бы фатальная ошибка. Попробуйте пройти симуляцию еще раз.'}
          </p>

          <div className="bg-slate-900/50 rounded-2xl p-6 mb-8 border border-slate-700">
            <span className="text-5xl font-mono font-bold text-yellow-500">{finalResult?.score_percentage}%</span>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
          >
            ИГРАТЬ СНОВА
          </button>
        </div>
      </main>
    );
  }

  if (!step) return null;

  // Game Screen
  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Game card */}
        <div className="bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700">
          
          {/* Stress bar */}
          {timeLeft !== null && (
            <div className="h-1.5 w-full bg-slate-700">
              <div 
                className={`h-full transition-all duration-1000 ease-linear ${
                  timeLeft < 4 ? 'bg-red-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${(timeLeft / (step.time_limit || 1)) * 100}%` }}
              ></div>
            </div>
          )}

          <div className="p-8">
            {/* Status bar */}
            <div className="flex justify-between items-center mb-10">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                Phase: {step.slug}
              </span>
              {timeLeft !== null && (
                <span className={`text-sm font-mono ${timeLeft < 4 ? 'text-red-500 animate-ping' : 'text-slate-300'}`}>
                  {timeLeft}s
                </span>
              )}
            </div>

            {/* Content */}
            <div className="mb-10">
              <h1 className="text-2xl font-bold text-white leading-tight">
                {step.description}
              </h1>
            </div>

            {/* Answer and feedback section */}
            {feedback ? (
              <div className={`p-6 rounded-2xl border-l-4 transition-all animate-in fade-in zoom-in duration-300 ${
                feedback.isCorrect 
                  ? 'bg-green-900/20 border-green-500 text-green-100' 
                  : 'bg-red-900/20 border-red-500 text-red-100'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{feedback.isCorrect ? '✓' : '✕'}</span>
                  <h3 className="font-bold uppercase tracking-wide">
                    {feedback.isCorrect ? 'Правильно' : 'Ошибка'}
                  </h3>
                </div>
                <p className="text-sm opacity-90 leading-relaxed">{feedback.message}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {step.options.map((option: Option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option.id)}
                    disabled={loading}
                    className="group relative w-full text-left p-5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:border-yellow-500/50 transition-all duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-slate-200 group-hover:text-white transition-colors">
                        {option.text}
                      </span>
                      <span className="text-slate-600 group-hover:text-yellow-500 transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}