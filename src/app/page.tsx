"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: "✓",
      title: "정확한 평가",
      description: "ADHD 3대 핵심 영역을 종합적으로 평가합니다.",
      color: "text-blue-600"
    },
    {
      icon: "⏱",
      title: "빠른 진단",
      description: "10-15분 내에 ADHD 성향을 확인할 수 있습니다.",
      color: "text-emerald-600"
    },
    {
      icon: "📋",
      title: "상세한 분석",
      description: "맞춤형 권장사항과 해석을 제공합니다.",
      color: "text-cyan-600"
    }
  ];

  return (
    <div className="gradient-bg flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-emerald-500/8"></div>
      
      <div className="w-full max-w-3xl space-y-6 relative z-10">
        {/* 메인 카드 */}
        <Card className={`glass-card text-center transition-all duration-1000 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'}`}>
          <CardHeader className="pb-6">
            <CardTitle className="text-4xl md:text-5xl font-bold gradient-text mb-4 leading-tight">
              ADHD 심리테스트
            </CardTitle>
            <CardDescription className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              주의력 결핍 과잉행동 장애(ADHD) 성향을 알아보는 자가진단 테스트입니다. 
              총 <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">18개 문항</span>, 
              <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">10-15분</span> 소요됩니다.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-6">
            {/* 특징 그리드 - 간소화된 버전 */}
            <div className="grid md:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="modern-card p-4 text-center"
                >
                  <div className={`text-2xl mb-2 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className={`text-lg font-semibold ${feature.color} mb-2`}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
            
            {/* 중요한 안내사항 */}
            <div className="modern-card p-6 bg-gradient-to-r from-amber-50/80 to-orange-50/80 border-amber-200/50">
              <div className="text-center">
                <h4 className="font-semibold text-amber-800 mb-3 text-lg">중요한 안내사항</h4>
                <p className="text-base text-amber-700 leading-relaxed">
                  이 테스트는 자가진단 도구로, 의학적 진단을 대체할 수 없습니다. 
                  정확한 진단이 필요하시다면 정신건강 전문의와 상담하시기 바랍니다.
                </p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="pt-4 pb-8">
            <Link href="/quiz" className="w-full">
              <Button className="modern-button w-full text-xl py-8 group" aria-describedby="test-start-description">
                테스트 시작하기
                <svg className="w-6 h-6 ml-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <p id="test-start-description" className="sr-only">
              ADHD 심리테스트를 시작합니다. 총 18개 문항이며 약 10-15분 소요됩니다.
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* 간단한 장식 요소들 */}
      <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}
