const opts = [
  { text: '전혀 그렇지 않다', score: 0 },
  { text: '거의 그렇지 않다', score: 1 },
  { text: '가끔 그렇다',     score: 2 },
  { text: '자주 그렇다',     score: 3 },
  { text: '매우 자주 그렇다', score: 4 },
];

export const quizQuestions = [
  { id: 1,  question: '일을 거의 다 끝내놓고도 마지막 마무리를 못해서 곤란한 적이 있다', options: opts },
  { id: 2,  question: '계획이 필요한 일을 체계적으로 진행하기 어렵다', options: opts },
  { id: 3,  question: '약속이나 해야 할 일을 깜빡해서 중요한 일을 놓친 적이 있다', options: opts },
  { id: 4,  question: '복잡하거나 귀찮은 일을 자꾸 미루거나 피하려고 한다', options: opts },
  { id: 5,  question: '오래 앉아 있어야 할 때 손발을 만지작거리거나 꼼지락거린다', options: opts },
  { id: 6,  question: '가만히 있지 못하고 필요 이상으로 많이 움직인다', options: opts },
  { id: 7,  question: '지루하고 복잡한 일을 할 때 실수를 자주 한다', options: opts },
  { id: 8,  question: '지루하고 반복적인 작업에 집중하기 어렵다', options: opts },
  { id: 9,  question: '대화 중에 상대방 말을 듣다가 딴생각에 빠지는 경우가 있다', options: opts },
  { id: 10, question: '집이나 직장에서 필요한 물건을 어디에 뒀는지 자주 까먹는다', options: opts },
  { id: 11, question: '주변 소음이나 움직임에 쉽게 주의가 분산된다', options: opts },
  { id: 12, question: '회의나 강의처럼 계속 앉아 있어야 할 때 자꾸 일어나거나 자리를 뜬다', options: opts },
  { id: 13, question: '가만히 있기 어렵고 안절부절못하거나 조급해한다', options: opts },
  { id: 14, question: '혼자 쉬고 있을 때도 머릿속이 복잡해서 편하게 쉬기 어렵다', options: opts },
  { id: 15, question: '사회적 상황에서 내가 말을 너무 많이 한다고 느낀다', options: opts },
  { id: 16, question: '대화할 때 상대방 말이 끝나기 전에 끼어들어 말한다', options: opts },
  { id: 17, question: '줄을 서서 기다리거나 순서를 기다릴 때 참기 어렵다', options: opts },
  { id: 18, question: '다른 사람이 일하거나 집중할 때 방해가 되는 행동을 한다', options: opts },
];

// ADHD 평가 기준 상수
export const ADHD_EVALUATION_CRITERIA = {
  // 각 영역별 임계값 (의학적 기준 기반)
  PART_A_THRESHOLDS: {
    HIGH: 14,      // 주의력 결핍 - 높음
    MODERATE: 10,  // 주의력 결핍 - 주의
    LOW: 6,        // 주의력 결핍 - 낮음
  },
  PART_B_THRESHOLDS: {
    HIGH: 18,      // 과잉행동/충동성 - 높음
    MODERATE: 12,  // 과잉행동/충동성 - 주의
    LOW: 8,        // 과잉행동/충동성 - 낮음
  },
  TOTAL_THRESHOLDS: {
    VERY_HIGH: 48, // 매우 높음
    HIGH: 36,      // 높음
    MODERATE: 24,  // 주의
    LOW: 12,       // 낮음
  }
} as const;

// 개선된 카테고리 타입
export type Category = '매우 낮음' | '낮음' | '경미' | '주의' | '높음' | '매우 높음';
export type PartCategory = '낮음' | '경미' | '주의' | '높음';

export interface DetailedEvalResult {
  total: number;
  partA: number;
  partB: number;
  category: Category;
  partACategory: PartCategory;
  partBCategory: PartCategory;
  percentage: number;
  partAPercentage: number;
  partBPercentage: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  interpretation: {
    overall: string;
    partA: string;
    partB: string;
    recommendations: string[];
  };
}

// 영역별 카테고리 평가 함수
const evaluatePartCategory = (score: number, isPartA: boolean): PartCategory => {
  const thresholds = isPartA ? ADHD_EVALUATION_CRITERIA.PART_A_THRESHOLDS : ADHD_EVALUATION_CRITERIA.PART_B_THRESHOLDS;
  
  if (score >= thresholds.HIGH) return '높음';
  if (score >= thresholds.MODERATE) return '주의';
  if (score >= thresholds.LOW) return '경미';
  return '낮음';
};

// 전체 카테고리 평가 함수
const evaluateOverallCategory = (total: number, partA: number, partB: number): Category => {
  const { TOTAL_THRESHOLDS, PART_A_THRESHOLDS, PART_B_THRESHOLDS } = ADHD_EVALUATION_CRITERIA;
  
  // 매우 높음: 총점이 매우 높거나 두 영역 모두 높음
  if (total >= TOTAL_THRESHOLDS.VERY_HIGH || 
      (partA >= PART_A_THRESHOLDS.HIGH && partB >= PART_B_THRESHOLDS.HIGH)) {
    return '매우 높음';
  }
  
  // 높음: 총점이 높거나 한 영역이라도 높음
  if (total >= TOTAL_THRESHOLDS.HIGH || 
      partA >= PART_A_THRESHOLDS.HIGH || 
      partB >= PART_B_THRESHOLDS.HIGH) {
    return '높음';
  }
  
  // 주의: 총점이 주의 수준이거나 한 영역이라도 주의 수준
  if (total >= TOTAL_THRESHOLDS.MODERATE || 
      partA >= PART_A_THRESHOLDS.MODERATE || 
      partB >= PART_B_THRESHOLDS.MODERATE) {
    return '주의';
  }
  
  // 경미: 총점이 경미 수준이거나 한 영역이라도 경미 수준
  if (total >= TOTAL_THRESHOLDS.LOW || 
      partA >= PART_A_THRESHOLDS.LOW || 
      partB >= PART_B_THRESHOLDS.LOW) {
    return '경미';
  }
  
  // 매우 낮음: 모든 점수가 매우 낮음
  if (total < 6) return '매우 낮음';
  
  return '낮음';
};

// 위험도 평가 함수
const evaluateRiskLevel = (category: Category): 'low' | 'moderate' | 'high' | 'very_high' => {
  switch (category) {
    case '매우 높음': return 'very_high';
    case '높음': return 'high';
    case '주의': return 'moderate';
    default: return 'low';
  }
};

// 해석 및 권장사항 생성 함수
const generateInterpretation = (result: Omit<DetailedEvalResult, 'interpretation'>): DetailedEvalResult['interpretation'] => {
  const { category, partACategory, partBCategory, riskLevel } = result;
  
  // 전체 해석
  const overallInterpretations = {
    '매우 낮음': 'ADHD 성향이 거의 나타나지 않습니다. 일반적으로 주의집중력과 충동조절 능력이 매우 양호한 상태입니다.',
    '낮음': 'ADHD 성향이 낮게 나타났습니다. 전반적으로 주의집중력과 행동조절 능력이 양호한 편입니다.',
    '경미': 'ADHD 성향이 경미하게 나타났습니다. 일상생활에는 큰 지장이 없지만 스트레스 상황에서 증상이 나타날 수 있습니다.',
    '주의': 'ADHD 성향이 주의 수준으로 나타났습니다. 일상생활에서 때때로 어려움을 경험할 수 있어 관리가 필요합니다.',
    '높음': 'ADHD 성향이 높게 나타났습니다. 일상생활과 업무/학업에서 상당한 어려움을 경험할 가능성이 높습니다.',
    '매우 높음': 'ADHD 성향이 매우 높게 나타났습니다. 전문가의 정확한 진단과 적절한 관리가 반드시 필요합니다.'
  };
  
  // 주의력 결핍 영역 해석
  const partAInterpretations = {
    '낮음': '주의집중력이 양호한 편입니다.',
    '경미': '때때로 집중하기 어려운 상황이 있을 수 있습니다.',
    '주의': '주의집중에 어려움이 자주 나타납니다.',
    '높음': '심각한 주의집중 문제를 보이고 있습니다.'
  };
  
  // 과잉행동/충동성 영역 해석
  const partBInterpretations = {
    '낮음': '행동조절과 충동조절이 양호한 편입니다.',
    '경미': '때때로 충동적이거나 가만히 있기 어려울 수 있습니다.',
    '주의': '과잉행동이나 충동성이 자주 나타납니다.',
    '높음': '심각한 과잉행동 및 충동조절 문제를 보이고 있습니다.'
  };
  
  // 위험도별 권장사항
  const recommendationsByRisk = {
    low: [
      '현재의 건강한 생활 패턴을 계속 유지하세요',
      '규칙적인 운동과 충분한 수면으로 뇌 건강을 관리하세요',
      '스트레스 관리 기법을 익혀 정신 건강을 유지하세요',
      '자기 관리 능력을 더욱 발전시켜 나가세요'
    ],
    moderate: [
      '생활 패턴을 규칙적으로 만들어 증상 관리에 도움을 받으세요',
      '집중력 향상을 위한 명상이나 마음챙김 연습을 시작해보세요',
      '할 일 목록을 작성하고 우선순위를 정해 체계적으로 관리하세요',
      '필요시 상담 전문가의 도움을 받는 것을 고려해보세요'
    ],
    high: [
      '정신건강 전문의나 임상심리사와 상담받기를 권장합니다',
      '체계적인 시간 관리와 환경 조성이 필요합니다',
      '스트레스 관리와 이완 기법을 적극적으로 학습하세요',
      '가족이나 주변 사람들의 이해와 지지를 구하세요'
    ],
    very_high: [
      '즉시 정신건강 전문의의 정확한 진단을 받으시기 바랍니다',
      '전문적인 치료 계획과 지속적인 관리가 필요합니다',
      '일상생활 전반에 걸친 체계적인 지원이 필요합니다',
      '치료와 병행하여 생활습관 개선에도 힘써주세요'
    ]
  };
  
  return {
    overall: overallInterpretations[category],
    partA: partAInterpretations[partACategory],
    partB: partBInterpretations[partBCategory],
    recommendations: recommendationsByRisk[riskLevel]
  };
};

// 개선된 평가 함수
export const evaluateQuizDetailed = (answers: readonly number[]): DetailedEvalResult => {
  if (answers.length !== quizQuestions.length) {
    throw new Error('모든 질문에 답변해주세요.');
  }
  
  const total = answers.reduce((a, b) => a + b, 0);
  const partA = answers.slice(0, 6).reduce((a, b) => a + b, 0); // 주의력 결핍 (1-6번)
  const partB = total - partA; // 과잉행동/충동성 (7-18번)
  
  // 각 영역별 카테고리 평가
  const partACategory = evaluatePartCategory(partA, true);
  const partBCategory = evaluatePartCategory(partB, false);
  
  // 전체 카테고리 평가
  const category = evaluateOverallCategory(total, partA, partB);
  
  // 백분율 계산 (최대 점수 대비)
  const maxTotal = quizQuestions.length * 4; // 72점
  const maxPartA = 6 * 4; // 24점
  const maxPartB = 12 * 4; // 48점
  
  const percentage = Math.round((total / maxTotal) * 100);
  const partAPercentage = Math.round((partA / maxPartA) * 100);
  const partBPercentage = Math.round((partB / maxPartB) * 100);
  
  // 위험도 평가
  const riskLevel = evaluateRiskLevel(category);
  
  // 기본 결과 객체 생성
  const baseResult = {
    total,
    partA,
    partB,
    category,
    partACategory,
    partBCategory,
    percentage,
    partAPercentage,
    partBPercentage,
    riskLevel
  };
  
  // 해석 및 권장사항 생성
  const interpretation = generateInterpretation(baseResult);
  
  return {
    ...baseResult,
    interpretation
  };
};

// 이전 버전과의 호환성을 위한 단순 평가 함수
export type EvalResult = { total: number; partA: number; partB: number; category: Category };

export const evaluateQuiz = (answers: readonly number[]): EvalResult => {
  const detailed = evaluateQuizDetailed(answers);
  return {
    total: detailed.total,
    partA: detailed.partA,
    partB: detailed.partB,
    category: detailed.category
  };
};

export default quizQuestions;