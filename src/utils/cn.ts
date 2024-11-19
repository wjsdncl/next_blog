import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * clsx와 tailwind-merge를 사용하여 CSS 클래스명을 결합하고 병합하는 유틸리티 함수
 * @param inputs - 병합할 클래스명 또는 클래스명 객체들의 배열
 * @returns Tailwind 충돌이 해결된 병합된 클래스명 문자열
 * @example
 * cn('p-4', 'bg-red-500', { 'text-white': true }) // => 'p-4 bg-red-500 text-white'
 */
const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export default cn;
