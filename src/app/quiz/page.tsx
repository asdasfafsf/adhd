"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { quizQuestions, evaluateQuizDetailed } from "@/data/quiz";

// 산만함 요소 타입 정의
type DistractionType = 'train';

interface DistractionElement {
  id: string;
  type: DistractionType;
  isVisible: boolean;
  position: { x: number; y: number };
}

// 산만함 요소 설정 (토마스만)
const distractionConfig: Record<DistractionType, { emoji?: string; image?: string; label: string; duration: number }> = {
  train: { image: '/tomas.png', label: '토마스!', duration: 6000 }
};

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [distractions, setDistractions] = useState<DistractionElement[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const router = useRouter();
  const announcementRef = useRef<HTMLDivElement>(null);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  const isAnswerSelected = answers[currentQuestion?.id] !== undefined;

  // 접근성 공지를 위한 함수
  const announceToScreenReader = useCallback((message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
    }
  }, []);

  // 토마스 전용 상태 관리
  const [thomasExists, setThomasExists] = useState(false);
  const [thomasDirection, setThomasDirection] = useState<'left-right' | 'right-left' | 'top-bottom' | 'bottom-top' | 'diagonal-1' | 'diagonal-2'>('left-right');

  // 토마스 생성 함수 (랜덤 타이밍)
  const createThomas = useCallback(() => {
    // 이미 토마스가 존재하면 생성하지 않음
    if (thomasExists) return;

    // 2번째 질문부터 랜덤하게 나타남
    if (currentQuestionIndex >= 1 && Math.random() < 0.65) {
      // 다양한 방향 중 랜덤 선택
      const directions: Array<'left-right' | 'right-left' | 'top-bottom' | 'bottom-top' | 'diagonal-1' | 'diagonal-2'> = 
        ['left-right', 'right-left', 'top-bottom', 'bottom-top', 'diagonal-1', 'diagonal-2'];
      const randomDirection = directions[Math.floor(Math.random() * directions.length)];
      setThomasDirection(randomDirection);

      // 방향에 따른 시작 위치 설정
      let startPosition = { x: 0, y: 0 };
      switch (randomDirection) {
        case 'left-right':
          startPosition = { x: -150, y: Math.random() * (window.innerHeight - 200) };
          break;
        case 'right-left':
          startPosition = { x: window.innerWidth + 50, y: Math.random() * (window.innerHeight - 200) };
          break;
        case 'top-bottom':
          startPosition = { x: Math.random() * (window.innerWidth - 200), y: -150 };
          break;
        case 'bottom-top':
          startPosition = { x: Math.random() * (window.innerWidth - 200), y: window.innerHeight + 50 };
          break;
        case 'diagonal-1':
          startPosition = { x: -150, y: -150 };
          break;
        case 'diagonal-2':
          startPosition = { x: window.innerWidth + 50, y: window.innerHeight + 50 };
          break;
      }

      const newThomas: DistractionElement = {
        id: `thomas-${Date.now()}`,
        type: 'train',
        isVisible: false,
        position: startPosition
      };

      setTimeout(() => {
        setThomasExists(true);
        setDistractions(prev => [
          ...prev.filter(d => d.type !== 'train'), // 기존 토마스 제거
          { ...newThomas, isVisible: true }
        ]);

        // 애니메이션 시간 후 자동 제거
        setTimeout(() => {
          setDistractions(prev => prev.filter(d => d.id !== newThomas.id));
          setThomasExists(false);
        }, 6000); // 6초 동안 유지
      }, Math.random() * 2000 + 500); // 0.5-2.5초 후에 나타남
    }
  }, [currentQuestionIndex, thomasExists]);

  // 랜덤 타이밍으로 토마스 생성
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const scheduleNextThomas = () => {
      const randomDelay = Math.random() * 5000 + 3000; // 3-8초
      timeoutId = setTimeout(() => {
        createThomas();
        scheduleNextThomas(); // 다음 토마스 스케줄링
      }, randomDelay);
    };
    
    scheduleNextThomas(); // 첫 번째 토마스 스케줄링

    return () => clearTimeout(timeoutId);
  }, [createThomas]);

  // 질문 변경 시 처리
  useEffect(() => {
    setQuestionStartTime(Date.now());
    announceToScreenReader(`질문 ${currentQuestionIndex + 1}: ${currentQuestion.question}`);
  }, [currentQuestionIndex, announceToScreenReader]);

  // 답변 변경 처리
  const handleAnswerChange = useCallback((value: string) => {
    const score = parseInt(value);
    const questionId = currentQuestion.id;
    const option = currentQuestion.options.find(opt => opt.score === score);
    
    setAnswers((prev) => ({
      ...prev,
      [questionId]: score,
    }));
    
    // 답변 시간 측정 (향후 분석용)
    const timeSpent = Date.now() - questionStartTime;
    console.log(`Question ${questionId} answered in ${timeSpent}ms`);
    
    if (option) {
      announceToScreenReader(`선택됨: ${option.text}`);
    }
  }, [currentQuestion.id, currentQuestion.options, questionStartTime, announceToScreenReader]);

  // 산만함 요소 클릭 처리
  const handleDistractionClick = useCallback((type: DistractionType, id: string) => {
    // 클릭된 요소 제거
    setDistractions(prev => prev.filter(d => d.id !== id));
    setThomasExists(false); // 토마스 상태 초기화
    
    // 효과음 재생 (가능한 경우)
    try {
      // 간단한 주파수로 효과음 생성
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const context = new AudioContextClass();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.setValueAtTime(800, context.currentTime);
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
        
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.3);
      }
    } catch {
      // 오디오 재생 실패는 무시
    }
    
    // 산만함 요소 클릭 시 특별한 결과 파라미터 전달
    const resultParams = new URLSearchParams({
      partA: '24',
      partB: '36',
      category: '심각한 ADHD 증상',
      partACategory: '매우 높음',
      partBCategory: '매우 높음', 
      percentage: '100',
      partAPercentage: '100',
      partBPercentage: '100',
      overall: '테스트 도중 산만함 요소에 주의가 끌려 클릭하는 것은 매우 심각한 ADHD 증상을 나타냅니다.',
      partAInterpretation: '집중이 필요한 상황에서도 주의가 쉽게 분산되어 과제 수행에 큰 어려움이 있습니다.',
      partBInterpretation: '충동적으로 행동하며 자제력을 유지하기 어려운 상태입니다.',
      recommendations: JSON.stringify([
        '⚠️ 즉시 정신건강의학과 전문의 진료를 받으시기 바랍니다',
        '일상생활에서 ADHD 증상으로 인한 어려움이 클 가능성이 높습니다',
        '약물치료와 인지행동치료를 통한 전문적 관리가 필요합니다',
        '가족이나 주변 사람들에게 도움을 요청하시기 바랍니다',
        '운전이나 위험한 활동 시 각별한 주의가 필요합니다'
      ]),
      distraction: type
    });
    
    router.push(`/result?${resultParams.toString()}`);
  }, [router]);

  // 다음 질문으로 이동
  const handleNext = useCallback(() => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // 모든 답변을 배열로 변환 (순서대로)
      const answersArray = quizQuestions.map(q => answers[q.id] ?? 0);
      
      // 개선된 평가함수 사용
      const evaluation = evaluateQuizDetailed(answersArray);
      
      // 결과를 URL 파라미터로 인코딩
      const resultParams = new URLSearchParams({
        total: evaluation.total.toString(),
        partA: evaluation.partA.toString(),
        partB: evaluation.partB.toString(),
        category: evaluation.category,
        partACategory: evaluation.partACategory,
        partBCategory: evaluation.partBCategory,
        percentage: evaluation.percentage.toString(),
        partAPercentage: evaluation.partAPercentage.toString(),
        partBPercentage: evaluation.partBPercentage.toString(),
        riskLevel: evaluation.riskLevel,
        overall: evaluation.interpretation.overall,
        partAInterpretation: evaluation.interpretation.partA,
        partBInterpretation: evaluation.interpretation.partB,
        recommendations: JSON.stringify(evaluation.interpretation.recommendations)
      });
      
      router.push(`/result?${resultParams.toString()}`);
    }
  }, [currentQuestionIndex, answers, router]);

  // 이전 질문으로 이동
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  // 키보드 네비게이션 처리
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isAnswerSelected) {
        handleNext();
      } else if (e.key === 'Escape') {
        handlePrevious();
      } else if (e.key >= '1' && e.key <= '5') {
        const optionIndex = parseInt(e.key) - 1;
        const question = quizQuestions[currentQuestionIndex];
        if (question && optionIndex < question.options.length) {
          handleAnswerChange(question.options[optionIndex].score.toString());
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAnswerSelected, handleNext, handlePrevious, handleAnswerChange, currentQuestionIndex]);

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4 relative overflow-hidden"> 
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-emerald-500/8"></div>
      
      {/* 스크린 리더용 공지 영역 */}
      <div 
        ref={announcementRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
      
      {/* 산만함 요소들 */}
      {distractions.map((distraction) => {
        if (!distraction.isVisible) return null;
        
        const config = distractionConfig[distraction.type];
        let animationClass = '';
        
        // 토마스 애니메이션 클래스
        animationClass = `animate-thomas-${thomasDirection}`;

        return (
          <div
            key={distraction.id}
            className={`fixed z-50 distraction-element ${animationClass} cursor-pointer`}
            style={{
              left: `${distraction.position.x}px`,
              top: `${distraction.position.y}px`,
            }}
            onClick={() => handleDistractionClick(distraction.type, distraction.id)}
            onTouchStart={(e) => {
              e.preventDefault();
              handleDistractionClick(distraction.type, distraction.id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDistractionClick(distraction.type, distraction.id);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`산만함 요소: ${config.label}을 클릭하세요`}
          >
            <div className={`text-4xl md:text-5xl lg:text-6xl hover:scale-110 transition-transform duration-200 ${distraction.type === 'train' ? 'thomas-glow animate-pulse' : ''}`}>
              {config.image ? (
                <Image 
                  src={config.image} 
                  alt={config.label}
                  width={120}
                  height={120}
                  className={`object-contain ${distraction.type === 'train' ? 'animate-bounce-subtle' : ''}`}
                />
              ) : (
                config.emoji
              )}
            </div>
            {/* 토마스는 라벨 없음 */}
            {distraction.type !== 'train' && (
              <div className="distraction-label text-center mt-2 font-bold animate-bounce">
                {config.label}
              </div>
            )}
          </div>
        );
      })}
      
      <Card className="glass-card w-full max-w-2xl relative z-10 animate-fade-in-up">
        <CardHeader className="pb-4">
          {/* 진행률 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">
                질문 {currentQuestionIndex + 1}
              </CardTitle>
              <div className="text-sm text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-full whitespace-nowrap">
                {currentQuestionIndex + 1} / {quizQuestions.length}
              </div>
            </div>
            
            {/* 개선된 진행률 바 */}
            <div className="relative">
              <div className="w-full bg-secondary/50 rounded-full h-3 overflow-hidden">
                <div 
                  className="progress-bar h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`진행률 ${Math.round(progress)}%`}
                ></div>
              </div>
              <div 
                className="absolute -top-1 transition-all duration-700 ease-out" 
                style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-lg border-2 border-blue-500 animate-pulse-glow"></div>
              </div>
            </div>
            
            {/* 힌트 텍스트 - 통일된 높이 */}
            <div className="text-xs text-muted-foreground text-center opacity-75 min-h-[20px] flex items-center justify-center">
              <span className="hidden sm:inline">💡 키보드: 1-5 숫자키로 선택, Enter로 다음, ESC로 이전</span>
              <span className="inline sm:hidden">💡 선택지를 터치하여 답변하세요</span>
            </div>
          </div>
          
          <CardDescription className="text-base md:text-lg lg:text-xl text-foreground leading-relaxed pt-4 sm:pt-6 break-words">
            <span className="sr-only">질문 {currentQuestionIndex + 1}:</span>
            {currentQuestion.question}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="py-4">
          <RadioGroup
            onValueChange={handleAnswerChange}
            value={answers[currentQuestion.id]?.toString() || ""}
            className="space-y-2 sm:space-y-3"
            aria-labelledby={`question-${currentQuestion.id}`}
          >
            {currentQuestion.options.map((option, index) => (
              <div
                key={option.score}
                onClick={() => handleAnswerChange(option.score.toString())}
                className={`option-card flex items-center space-x-3 sm:space-x-4 p-3 sm:p-5 rounded-xl cursor-pointer hover:cursor-pointer border-2 transition-all duration-300
                  ${answers[currentQuestion.id] === option.score 
                    ? 'bg-gradient-to-r from-blue-500/15 to-emerald-500/15 border-blue-500/60 shadow-lg shadow-blue-500/20 scale-[1.02]' 
                    : 'bg-secondary/30 border-border/50 hover:border-blue-300/50 hover:bg-secondary/50'
                  }
                `}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAnswerChange(option.score.toString());
                  }
                }}
                aria-pressed={answers[currentQuestion.id] === option.score}
                aria-describedby={`option-${option.score}-description`}
              >
                <RadioGroupItem 
                  value={option.score.toString()} 
                  id={`option-${option.score}`} 
                  className="sr-only" 
                />
                
                {/* 개선된 라디오 버튼 */}
                <div className={`relative w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex-shrink-0 transition-all duration-300 pointer-events-none
                  ${answers[currentQuestion.id] === option.score 
                    ? 'border-blue-500 bg-blue-500 scale-110' 
                    : 'border-muted-foreground/50 bg-transparent hover:border-blue-400'
                  }
                `}>
                  {answers[currentQuestion.id] === option.score && (
                    <div className="absolute inset-1.5 bg-white rounded-full animate-bounce-in"></div>
                  )}
                </div>
                
                <div className="text-sm sm:text-base flex-1 leading-snug sm:leading-relaxed font-medium pointer-events-none break-words">
                  {option.text}
                  <span id={`option-${option.score}-description`} className="sr-only">
                    {index + 1}번 선택지: {option.text}
                  </span>
                </div>
                
                {/* 선택 표시 */}
                {answers[currentQuestion.id] === option.score && (
                  <div className="flex-shrink-0 pointer-events-none flex items-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-bounce-in" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row pt-8 pb-8 gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="w-full sm:flex-1 px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
            aria-label="이전 질문으로 이동"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3 sm:mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            이전
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isAnswerSelected}
            className="w-full sm:flex-1 px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl rounded-xl font-semibold transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            aria-label={currentQuestionIndex === quizQuestions.length - 1 ? "테스트 완료하고 결과 보기" : "다음 질문으로 이동"}
          >
            {currentQuestionIndex === quizQuestions.length - 1 ? (
              <>
                결과 보기
                <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-3 sm:ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </>
            ) : (
              <>
                다음
                <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-3 sm:ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* 장식적 요소들 */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 right-5 w-16 h-16 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>

      <style jsx>{`
        /* 토마스 다방향 애니메이션 - 좌→우 */
        @keyframes animate-thomas-left-right {
          0% { 
            transform: translateX(-200px) translateY(0) rotate(0deg) scale(1); 
            opacity: 1;
            filter: drop-shadow(0 0 20px #ff6b35);
          }
          20% { 
            transform: translateX(25vw) translateY(-50px) rotate(15deg) scale(1.3); 
            opacity: 1;
            filter: drop-shadow(0 0 30px #ff6b35);
          }
          40% { 
            transform: translateX(50vw) translateY(30px) rotate(-10deg) scale(0.8); 
            opacity: 1;
            filter: drop-shadow(0 0 25px #4ecdc4);
          }
          60% { 
            transform: translateX(75vw) translateY(-40px) rotate(25deg) scale(1.4); 
            opacity: 1;
            filter: drop-shadow(0 0 35px #45b7d1);
          }
          80% { 
            transform: translateX(90vw) translateY(20px) rotate(-15deg) scale(1.1); 
            opacity: 1;
            filter: drop-shadow(0 0 40px #96ceb4);
          }
          100% { 
            transform: translateX(calc(100vw + 200px)) translateY(-10px) rotate(360deg) scale(1.5); 
            opacity: 1;
            filter: drop-shadow(0 0 50px #ffeaa7);
          }
        }

        /* 토마스 다방향 애니메이션 - 우→좌 */
        @keyframes animate-thomas-right-left {
          0% { 
            transform: translateX(calc(100vw + 200px)) translateY(0) rotate(180deg) scale(1); 
            opacity: 1;
            filter: drop-shadow(0 0 20px #e17055);
          }
          25% { 
            transform: translateX(75vw) translateY(60px) rotate(195deg) scale(1.2); 
            opacity: 1;
            filter: drop-shadow(0 0 30px #74b9ff);
          }
          50% { 
            transform: translateX(50vw) translateY(-80px) rotate(160deg) scale(0.9); 
            opacity: 1;
            filter: drop-shadow(0 0 35px #fd79a8);
          }
          75% { 
            transform: translateX(25vw) translateY(40px) rotate(205deg) scale(1.4); 
            opacity: 1;
            filter: drop-shadow(0 0 40px #fdcb6e);
          }
          100% { 
            transform: translateX(-200px) translateY(-20px) rotate(540deg) scale(1.3); 
            opacity: 1;
            filter: drop-shadow(0 0 50px #a29bfe);
          }
        }

        /* 토마스 다방향 애니메이션 - 위→아래 */
        @keyframes animate-thomas-top-bottom {
          0% { 
            transform: translateX(0) translateY(-200px) rotate(90deg) scale(1); 
            opacity: 1;
            filter: drop-shadow(0 0 25px #6c5ce7);
          }
          30% { 
            transform: translateX(60px) translateY(30vh) rotate(75deg) scale(1.3); 
            opacity: 1;
            filter: drop-shadow(0 0 35px #00b894);
          }
          60% { 
            transform: translateX(-40px) translateY(60vh) rotate(105deg) scale(0.8); 
            opacity: 1;
            filter: drop-shadow(0 0 30px #e84393);
          }
          100% { 
            transform: translateX(20px) translateY(calc(100vh + 200px)) rotate(450deg) scale(1.5); 
            opacity: 1;
            filter: drop-shadow(0 0 50px #00cec9);
          }
        }

        /* 토마스 다방향 애니메이션 - 아래→위 */
        @keyframes animate-thomas-bottom-top {
          0% { 
            transform: translateX(0) translateY(calc(100vh + 200px)) rotate(270deg) scale(1); 
            opacity: 1;
            filter: drop-shadow(0 0 25px #fab1a0);
          }
          25% { 
            transform: translateX(-50px) translateY(70vh) rotate(285deg) scale(1.2); 
            opacity: 1;
            filter: drop-shadow(0 0 30px #ff7675);
          }
          50% { 
            transform: translateX(80px) translateY(40vh) rotate(255deg) scale(1.1); 
            opacity: 1;
            filter: drop-shadow(0 0 40px #fd79a8);
          }
          75% { 
            transform: translateX(-30px) translateY(20vh) rotate(295deg) scale(0.9); 
            opacity: 1;
            filter: drop-shadow(0 0 35px #fdcb6e);
          }
          100% { 
            transform: translateX(10px) translateY(-200px) rotate(630deg) scale(1.4); 
            opacity: 1;
            filter: drop-shadow(0 0 50px #e17055);
          }
        }

        /* 토마스 다방향 애니메이션 - 대각선 1 (좌상→우하) */
        @keyframes animate-thomas-diagonal-1 {
          0% { 
            transform: translateX(-200px) translateY(-200px) rotate(45deg) scale(1); 
            opacity: 1;
            filter: drop-shadow(0 0 30px #00b894);
          }
          50% { 
            transform: translateX(50vw) translateY(50vh) rotate(225deg) scale(1.5); 
            opacity: 1;
            filter: drop-shadow(0 0 50px #e84393);
          }
          100% { 
            transform: translateX(calc(100vw + 200px)) translateY(calc(100vh + 200px)) rotate(405deg) scale(1.2); 
            opacity: 1;
            filter: drop-shadow(0 0 60px #0984e3);
          }
        }

        /* 토마스 다방향 애니메이션 - 대각선 2 (우하→좌상) */
        @keyframes animate-thomas-diagonal-2 {
          0% { 
            transform: translateX(calc(100vw + 200px)) translateY(calc(100vh + 200px)) rotate(225deg) scale(1); 
            opacity: 1;
            filter: drop-shadow(0 0 30px #a29bfe);
          }
          50% { 
            transform: translateX(50vw) translateY(50vh) rotate(45deg) scale(1.4); 
            opacity: 1;
            filter: drop-shadow(0 0 45px #fd79a8);
          }
          100% { 
            transform: translateX(-200px) translateY(-200px) rotate(585deg) scale(1.3); 
            opacity: 1;
            filter: drop-shadow(0 0 55px #fdcb6e);
          }
        }
        

        
        /* 토마스 방향별 애니메이션 클래스 */
        .animate-thomas-left-right {
          animation: animate-thomas-left-right 5s ease-in-out forwards;
        }
        
        .animate-thomas-right-left {
          animation: animate-thomas-right-left 5s ease-in-out forwards;
        }
        
        .animate-thomas-top-bottom {
          animation: animate-thomas-top-bottom 4.5s ease-in-out forwards;
        }
        
        .animate-thomas-bottom-top {
          animation: animate-thomas-bottom-top 4.5s ease-in-out forwards;
        }
        
        .animate-thomas-diagonal-1 {
          animation: animate-thomas-diagonal-1 6s ease-in-out forwards;
        }
        
        .animate-thomas-diagonal-2 {
          animation: animate-thomas-diagonal-2 6s ease-in-out forwards;
        }
        
        /* 토마스 특별 효과 */
        .thomas-glow {
          filter: drop-shadow(0 0 20px #ff6b35);
          animation: thomas-color-cycle 2s infinite;
        }
        
        @keyframes thomas-color-cycle {
          0% { filter: drop-shadow(0 0 20px #ff6b35); }
          16% { filter: drop-shadow(0 0 25px #4ecdc4); }
          33% { filter: drop-shadow(0 0 30px #45b7d1); }
          50% { filter: drop-shadow(0 0 25px #96ceb4); }
          66% { filter: drop-shadow(0 0 30px #ffeaa7); }
          83% { filter: drop-shadow(0 0 25px #fd79a8); }
          100% { filter: drop-shadow(0 0 20px #ff6b35); }
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 1.5s ease-in-out infinite;
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }
        

      `}</style>
    </div>
  );
}
