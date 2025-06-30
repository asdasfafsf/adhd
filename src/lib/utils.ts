import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 결과 URL 압축/해제를 위한 타입과 함수들
interface CompactResult {
  pA: number;        // partA 점수
  pB: number;        // partB 점수  
  d?: string;        // distraction type (있는 경우만)
}

/**
 * 결과 데이터를 압축해서 짧은 Base64 문자열로 변환
 */
export function compressResult(partA: number, partB: number, distraction?: string): string {
  const data: CompactResult = { pA: partA, pB: partB };
  if (distraction) {
    data.d = distraction;
  }
  
  try {
    const jsonString = JSON.stringify(data);
    const base64 = btoa(jsonString);
    return base64;
  } catch (error) {
    console.error('결과 압축 실패:', error);
    return '';
  }
}

/**
 * Base64 문자열을 다시 결과 데이터로 해제
 */
export function decompressResult(compressedData: string): CompactResult | null {
  try {
    const jsonString = atob(compressedData);
    const data = JSON.parse(jsonString) as CompactResult;
    
    // 데이터 유효성 검사
    if (typeof data.pA !== 'number' || typeof data.pB !== 'number') {
      throw new Error('Invalid data structure');
    }
    
    return data;
  } catch (error) {
    console.error('결과 해제 실패:', error);
    return null;
  }
}

/**
 * 압축된 결과 URL 생성
 */
export function createResultUrl(partA: number, partB: number, distraction?: string): string {
  const compressed = compressResult(partA, partB, distraction);
  return `/result?d=${compressed}`;
}

/**
 * URL에서 압축된 데이터 추출
 */
export function extractResultFromUrl(searchParams: URLSearchParams): CompactResult | null {
  const compressed = searchParams.get('d');
  if (!compressed) {
    return null;
  }
  
  return decompressResult(compressed);
}
