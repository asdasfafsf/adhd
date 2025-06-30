"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category, PartCategory } from "@/data/quiz";
import { extractResultFromUrl } from "@/lib/utils";
import { evaluateQuizDetailed } from "@/data/quiz";

// 카테고리별 결과 설정
interface CategoryConfig {
  color: string;
  bgColor: string;
  icon: string;
  textColor: string;
}

const getCategoryConfig = (category: Category | string): CategoryConfig => {
  const configs: Record<string, CategoryConfig> = {
    '매우 낮음': {
      color: "from-emerald-600 to-teal-600",
      bgColor: "from-emerald-500/15 to-teal-500/15",
      icon: "🌟",
      textColor: "text-emerald-700"
    },
    '낮음': {
      color: "from-emerald-500 to-teal-500",
      bgColor: "from-emerald-500/15 to-teal-500/15",
      icon: "✅",
      textColor: "text-emerald-600"
    },
    '경미': {
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-500/15 to-cyan-500/15",
      icon: "ℹ️",
      textColor: "text-blue-600"
    },
    '주의': {
      color: "from-amber-500 to-yellow-500",
      bgColor: "from-amber-500/15 to-yellow-500/15",
      icon: "⚖️",
      textColor: "text-amber-700"
    },
    '높음': {
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-500/15 to-red-500/15",
      icon: "⚠️",
      textColor: "text-orange-700"
    },
    '매우 높음': {
      color: "from-red-500 to-red-600",
      bgColor: "from-red-500/15 to-red-600/15",
      icon: "🚨",
      textColor: "text-red-700"
    },
    '재미있는 성향': {
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-500/15 to-pink-500/15",
      icon: "🎯",
      textColor: "text-purple-600"
    }
  };
  
  return configs[category] || configs['낮음'];
};

const getPartCategoryConfig = (category: PartCategory) => {
  const configs = {
    '낮음': {
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      icon: "✅"
    },
    '경미': {
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      icon: "ℹ️"
    },
    '주의': {
      color: "from-amber-500 to-yellow-500",
      bgColor: "bg-amber-50",
      icon: "⚖️"
    },
    '높음': {
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      icon: "⚠️"
    }
  };
  
  return configs[category];
};

// 산만함 요소 메시지 (기존 유지)
const getDistractionMessage = (type: string) => {
  const messages = {
    train: {
      title: "기차를 발견했군요! 🚂",
      message: "움직이는 것에 쉽게 주의가 분산되는 특성을 보이고 있습니다.",
      fact: "ADHD가 있는 사람들은 종종 움직이는 물체나 소리에 더 민감하게 반응합니다.",
      emoji: "🚂"
    },
    butterfly: {
      title: "나비에 이끌렸나요? 🦋",
      message: "아름다운 것들에 대한 호기심과 관심이 높은 편입니다.",
      fact: "창의적이고 감수성이 풍부한 사람들은 종종 시각적 자극에 더 관심을 보입니다.",
      emoji: "🦋"
    },
    star: {
      title: "반짝이는 별을 클릭했네요! ⭐",
      message: "시각적으로 눈에 띄는 것들에 쉽게 주의가 끌리는 성향입니다.",
      fact: "반짝이는 것이나 밝은 색상은 주의력을 끄는 대표적인 시각적 자극입니다.",
      emoji: "⭐"
    },
    bouncer: {
      title: "통통 튀는 공에 관심을 보였군요! ⚽",
      message: "움직임과 리듬에 민감하게 반응하는 특성을 가지고 있습니다.",
      fact: "규칙적인 움직임은 일부 사람들에게 진정 효과를 주기도 합니다.",
      emoji: "⚽"
    },
    rocket: {
      title: "로켓에 끌렸나요? 🚀",
      message: "빠르고 역동적인 움직임에 매력을 느끼는 성향입니다.",
      fact: "빠른 변화와 자극을 좋아하는 것은 창의성과 연관이 있을 수 있습니다.",
      emoji: "🚀"
    },
    rainbow: {
      title: "무지개를 발견했네요! 🌈",
      message: "다채로운 색상과 아름다운 패턴에 관심이 많습니다.",
      fact: "색상에 민감한 반응을 보이는 것은 예술적 감각과 관련이 있을 수 있습니다.",
      emoji: "🌈"
    }
  };
  
  return messages[type as keyof typeof messages] || messages.train;
};

// 로딩 컴포넌트
function ResultLoading() {
  return (
    <div className="gradient-bg flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-emerald-500/8"></div>
      
      <div className="w-full max-w-4xl space-y-6 relative z-10">
        <Card className="glass-card text-center">
          <CardHeader className="pb-8">
            <div className="mx-auto mb-8 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-full flex items-center justify-center animate-pulse">
              <div className="text-4xl">📊</div>
            </div>
            
            <CardTitle className="text-3xl md:text-4xl font-bold gradient-text mb-6">
              결과 분석 중...
            </CardTitle>
            <CardDescription className="text-lg md:text-xl text-muted-foreground">
              잠시만 기다려주세요
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <div className="relative w-48 h-48 mx-auto">
              <svg className="w-48 h-48 transform -rotate-90 animate-spin" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-muted/20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="180 565"
                  strokeLinecap="round"
                  className="text-blue-500"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" className="text-blue-500" stopColor="currentColor" />
                    <stop offset="100%" className="text-emerald-500" stopColor="currentColor" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 실제 결과 컨텐츠 컴포넌트 (useSearchParams 사용)
function ResultContent() {
  const searchParams = useSearchParams();
  
  // 압축된 데이터에서 결과 추출
  const compactResult = extractResultFromUrl(searchParams);
  
  // 압축된 데이터가 없으면 기존 방식으로 폴백 (호환성)
  let partA: number, partB: number, distractionType: string | undefined;
  let evaluation: {
    partA: number;
    partB: number;
    category: Category;
    partACategory: PartCategory;
    partBCategory: PartCategory;
    percentage: number;
    partAPercentage: number;
    partBPercentage: number;
    interpretation: {
      overall: string;
      partA: string;
      partB: string;
      recommendations: string[];
    };
  };
  
  if (compactResult) {
    // 새로운 압축 방식: 점수만 저장하고 나머지는 재계산
    partA = compactResult.pA;
    partB = compactResult.pB;
    distractionType = compactResult.d;
    
    // 산만함 요소 클릭의 경우 특별 처리
    if (distractionType) {
             // 산만함 요소 클릭 시 최대 점수 평가 결과 생성 (무조건 만점!)
       evaluation = {
         partA: 24,
         partB: 48, // 48점 만점으로 변경!
         category: '매우 높음' as Category,
         partACategory: '높음' as PartCategory,
         partBCategory: '높음' as PartCategory,
         percentage: 100, // 무조건 100%
         partAPercentage: 100, // 무조건 100%
         partBPercentage: 100, // 무조건 100%
         interpretation: {
           overall: '테스트 도중 산만함 요소에 주의가 끌려 클릭하는 것은 매우 심각한 ADHD 증상을 나타냅니다.',
           partA: '집중이 필요한 상황에서도 주의가 쉽게 분산되어 과제 수행에 큰 어려움이 있습니다.',
           partB: '충동적으로 행동하며 자제력을 유지하기 어려운 상태입니다.',
           recommendations: [
             '⚠️ 즉시 정신건강의학과 전문의 진료를 받으시기 바랍니다',
             '일상생활에서 ADHD 증상으로 인한 어려움이 클 가능성이 높습니다',
             '약물치료와 인지행동치료를 통한 전문적 관리가 필요합니다',
             '가족이나 주변 사람들에게 도움을 요청하시기 바랍니다',
             '운전이나 위험한 활동 시 각별한 주의가 필요합니다'
           ]
         }
       };
    } else {
             // 정상 테스트 완료: 점수로 재평가
       // partA(24점 만점)와 partB(36점 만점)를 18문항 기준으로 변환
       const avgPartA = Math.round((partA / 24) * 4);
       const avgPartB = Math.round((partB / 48) * 4);
       const partAAnswers = Array(6).fill(avgPartA);
       const partBAnswers = Array(12).fill(avgPartB);
       const answersArray = [...partAAnswers, ...partBAnswers];
      
      evaluation = evaluateQuizDetailed(answersArray);
    }
  } else {
    // 기존 방식 폴백 (호환성 유지)
    partA = parseInt(searchParams.get("partA") || "0");
    partB = parseInt(searchParams.get("partB") || "0");
    distractionType = searchParams.get("distraction") || undefined;
    
    const category = (searchParams.get("category") || "낮음") as Category;
    const partACategory = (searchParams.get("partACategory") || "낮음") as PartCategory;
    const partBCategory = (searchParams.get("partBCategory") || "낮음") as PartCategory;
    const percentage = parseInt(searchParams.get("percentage") || "0");
    const partAPercentage = parseInt(searchParams.get("partAPercentage") || "0");
    const partBPercentage = parseInt(searchParams.get("partBPercentage") || "0");
    const overall = searchParams.get("overall") || "";
    const partAInterpretation = searchParams.get("partAInterpretation") || "";
    const partBInterpretation = searchParams.get("partBInterpretation") || "";
    const recommendations = JSON.parse(searchParams.get("recommendations") || "[]") as string[];
    
    evaluation = {
      partA, partB,
      category, partACategory, partBCategory,
      percentage, partAPercentage, partBPercentage,
      interpretation: {
        overall, partA: partAInterpretation, partB: partBInterpretation, recommendations
      }
    };
  }
  
  // 평가 결과에서 데이터 추출
  const { category, partACategory, partBCategory, percentage, partAPercentage, partBPercentage } = evaluation;
  const { overall, partA: partAInterpretation, partB: partBInterpretation, recommendations } = evaluation.interpretation;
  
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [animatedPartA, setAnimatedPartA] = useState(0);
  const [animatedPartB, setAnimatedPartB] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const categoryConfig = getCategoryConfig(category);
  const partAConfig = getPartCategoryConfig(partACategory);
  const partBConfig = getPartCategoryConfig(partBCategory);
  const distractionMessage = distractionType ? getDistractionMessage(distractionType) : null;

  // 페이지 로드 애니메이션
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 점수 애니메이션
  useEffect(() => {
    const duration = 2500;
    const steps = 60;
    
    const animateValue = (target: number, setter: (value: number) => void) => {
      const increment = target / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(current);
        }
      }, duration / steps);
      
      return timer;
    };
    
    const timers = [
      animateValue(percentage, setAnimatedPercentage),
      animateValue(partAPercentage, setAnimatedPartA),
      animateValue(partBPercentage, setAnimatedPartB)
    ];
    
    setTimeout(() => setIsAnimating(false), duration);
    
    return () => timers.forEach(clearInterval);
  }, [percentage, partAPercentage, partBPercentage]);

  const shareResult = async () => {
    const text = `ADHD 심리테스트 결과: ${category} (${Math.round(percentage)}%)`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'ADHD 심리테스트 결과',
          text: text,
          url: window.location.href,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text} ${window.location.origin}`);
        const toast = document.createElement('div');
        toast.textContent = '결과가 클립보드에 복사되었습니다!';
        toast.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce-in';
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
      }
    } catch (error) {
      console.log('공유 실패:', error);
    }
  };

  return (
    <div className="gradient-bg flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-emerald-500/8"></div>
      
      <div className={`w-full max-w-4xl space-y-6 relative z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* 메인 결과 카드 */}
        <Card className="glass-card text-center animate-fade-in-up">
          <CardHeader className="pb-8">
            <div className="mx-auto mb-8 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-full flex items-center justify-center animate-float relative">
              <div className="text-4xl" role="img" aria-label="결과 아이콘">
                {categoryConfig.icon}
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/10 to-emerald-400/10 animate-pulse-glow"></div>
            </div>
            
            <CardTitle className="text-3xl md:text-4xl font-bold gradient-text mb-6">
              테스트 완료!
            </CardTitle>
            <CardDescription className="text-lg md:text-xl text-muted-foreground">
              {distractionType ? "특별한 반응을 보이셨네요!" : "당신의 ADHD 성향 분석 결과입니다"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* 전체 결과 차트 */}
            <div className="relative w-48 h-48 mx-auto">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-muted/20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={`${(animatedPercentage / 100) * 2 * Math.PI * 90} ${2 * Math.PI * 90}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" className="text-blue-500" stopColor="currentColor" />
                    <stop offset="100%" className="text-emerald-500" stopColor="currentColor" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${categoryConfig.color} bg-clip-text text-transparent mb-2`}>
                    {Math.round(animatedPercentage)}%
                  </div>
                  <div className="text-lg text-muted-foreground font-medium">
                    {isAnimating ? "계산 중..." : category}
                  </div>
                </div>
              </div>
            </div>

            {/* 전체 결과 설명 */}
            <div className={`modern-card p-8 bg-gradient-to-r ${categoryConfig.bgColor} border-transparent relative overflow-hidden`}>
              <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4 flex items-center justify-center">
                  <span className="text-2xl mr-3" role="img" aria-hidden="true">{categoryConfig.icon}</span>
                  ADHD 성향: {category}
                </h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  {overall}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 영역별 상세 분석 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 주의력 결핍 영역 */}
          <Card className="glass-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold text-foreground flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                주의력 결핍
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 주의력 결핍 점수 */}
              <div className="text-center">
                <div className={`text-3xl font-bold bg-gradient-to-r ${partAConfig.color} bg-clip-text text-transparent`}>
                  {partA}점 / 24점
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {Math.round(animatedPartA)}% - {partACategory}
                </div>
              </div>
              
              {/* 주의력 결핍 진행률 바 */}
              <div className="w-full bg-secondary/50 rounded-full h-3">
                <div 
                  className={`h-3 bg-gradient-to-r ${partAConfig.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${animatedPartA}%` }}
                ></div>
              </div>
              
              <div className={`${partAConfig.bgColor} p-4 rounded-lg border`}>
                <p className="text-sm text-muted-foreground">
                  {partAInterpretation}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 과잉행동/충동성 영역 */}
          <Card className="glass-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold text-foreground flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">B</span>
                </div>
                과잉행동/충동성
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 과잉행동/충동성 점수 */}
              <div className="text-center">
                <div className={`text-3xl font-bold bg-gradient-to-r ${partBConfig.color} bg-clip-text text-transparent`}>
                  {partB}점 / 48점
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {Math.round(animatedPartB)}% - {partBCategory}
                </div>
              </div>
              
              {/* 과잉행동/충동성 진행률 바 */}
              <div className="w-full bg-secondary/50 rounded-full h-3">
                <div 
                  className={`h-3 bg-gradient-to-r ${partBConfig.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${animatedPartB}%` }}
                ></div>
              </div>
              
              <div className={`${partBConfig.bgColor} p-4 rounded-lg border`}>
                <p className="text-sm text-muted-foreground">
                  {partBInterpretation}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 산만함 요소 클릭시 특별 메시지 (기존 유지) */}
        {distractionMessage && (
          <Card className="glass-card animate-bounce-in">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="text-6xl mb-4" role="img" aria-label={`${distractionMessage.emoji} 이모지`}>
                  {distractionMessage.emoji}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-purple-600 mb-4">
                  {distractionMessage.title}
                </h3>
                <p className="text-lg text-foreground mb-6">
                  {distractionMessage.message}
                </p>
                <div className="bg-gradient-to-r from-purple-50/90 to-pink-50/90 p-6 rounded-xl border border-purple-200/50">
                  <p className="text-base text-purple-700">
                    <strong>재미있는 사실:</strong> {distractionMessage.fact}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* 권장사항 카드 */}
        <Card className="glass-card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl font-semibold text-foreground flex items-center">
              <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              맞춤형 권장사항
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-8">
            <div className="grid gap-4">
              {recommendations.map((recommendation, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50/60 to-emerald-50/60 rounded-xl border border-blue-200/30 transition-all duration-300 hover:shadow-md hover:scale-[1.02] animate-slide-in-right"
                  style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-base md:text-lg text-foreground leading-relaxed font-medium">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* 액션 버튼들 */}
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <Link href="/" className="block px-4">
            <Button className="w-full h-16 px-8 text-lg rounded-xl font-semibold transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg group" aria-label="다시 테스트하기">
              <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              다시 테스트하기
            </Button>
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-4 px-4">
            <Button 
              onClick={shareResult}
              variant="outline" 
              className="flex-1 h-12 text-base rounded-xl font-medium transition-all duration-300 hover:shadow-md group" 
              aria-label="결과 공유하기"
            >
              <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              결과 공유
            </Button>
            
            <Link href="/quiz" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full h-12 text-base rounded-xl font-medium transition-all duration-300 hover:shadow-md group" 
                aria-label="다른 사람도 테스트해보기"
              >
                <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                다른 사람도 테스트
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* 장식적 요소들 */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 right-5 w-16 h-16 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}

// 메인 페이지 컴포넌트 (Suspense 경계 제공)
export default function ResultPage() {
  return (
    <Suspense fallback={<ResultLoading />}>
      <ResultContent />
    </Suspense>
  );
}
