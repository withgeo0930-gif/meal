/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 한국 시간대(KST, Asia/Seoul) 기준의 오늘 Date 객체를 반환합니다.
 */
export function getTodayKST(): Date {
  const dateStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" });
  return new Date(dateStr);
}

/**
 * 주어진 날짜의 요일을 한국어 단문("일", "월", "화", "수", "목", "금", "토")으로 반환합니다.
 */
export function getKoreanDayOfWeek(date: Date): string {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return days[date.getDay()];
}

/**
 * 날짜를 “5월 15일 금요일” 형식으로 변환합니다.
 */
export function formatKoreanDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = getKoreanDayOfWeek(date);
  return `${month}월 ${day}일 ${dayOfWeek}요일`;
}

/**
 * 날짜를 “YYYYMMDD” 형식으로 변환합니다.
 */
export function formatDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

/**
 * 해당 날짜가 포함된 주의 월요일부터 금요일까지 5개의 Date 객체 배열을 반환합니다.
 * 월요일 시작 기준으로 요일을 보정합니다.
 */
export function getWeekDates(date: Date): Date[] {
  const currentDay = date.getDay(); // 0: 일, 1: 월, ..., 6: 토
  // 월요일과의 차이 계산 (일요일 0 이면 전주 월요일로 가도록 -6 처리)
  const dayDiff = currentDay === 0 ? -6 : 1 - currentDay;
  
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayDiff);
  
  const weekDates: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const nextDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    weekDates.push(nextDate);
  }
  return weekDates;
}

/**
 * 해당 날짜가 어떤 달의 몇 째 주차인지 계산합니다.
 * 예: 5월 3주차 -> { month: 5, week: 3 }
 */
export function getWeekOfMonth(date: Date): { month: number; week: number } {
  const tempDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const year = tempDate.getFullYear();
  const month = tempDate.getMonth() + 1;
  const currentDate = tempDate.getDate();
  
  // 이번 달 1일 요일
  const firstDay = new Date(year, tempDate.getMonth(), 1);
  const firstDayOfWeek = firstDay.getDay(); // 0: 일, 1: 월, ..., 6: 토
  
  // 월요일 기준의 요일 값 (월: 1, 화: 2, ..., 일: 7)
  const adjustedFirstDayOfWeek = firstDayOfWeek === 0 ? 7 : firstDayOfWeek;
  
  // 주차 계산 공식
  const week = Math.ceil((currentDate + adjustedFirstDayOfWeek - 1) / 7);
  
  return { month, week };
}

/**
 * 기획 정의 (방식 B)에 따라 기본 선택 날짜를 구합니다.
 * 오늘이 월~금 평일이면 오늘을, 토요일 또는 일요일이면 다음 주 월요일의 Date를 반환합니다.
 */
export function getDefaultSelectedDate(today: Date): Date {
  const day = today.getDay();
  if (day >= 1 && day <= 5) {
    return new Date(today);
  }
  
  const result = new Date(today);
  if (day === 6) { // 토요일 -> +2일 (월요일)
    result.setDate(today.getDate() + 2);
  } else if (day === 0) { // 일요일 -> +1일 (월요일)
    result.setDate(today.getDate() + 1);
  }
  return result;
}
