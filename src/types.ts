/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NutritionInfo {
  calories: number; // kcal
  protein: number; // g
  carbs: number; // g
  fat: number; // g
}

export interface MealItem {
  id: string;
  schoolName: string; // 반드시 "씨마스고등학교"
  date: Date; // 실제 날짜 객체
  dateKey: string; // YYYYMMDD형식 (NEIS API용)
  dayOfWeek: string; // "월", "화", "수", "목", "금" ...
  mealType: "lunch" | "dinner"; // "중식" | "석식"
  title: string; // 대표 메뉴명 (예: "치즈돈까스 정식", "수제함박스테이크")
  dishes: string[]; // 식단 구성 메뉴 목록
  totalCalories: number; // 총 칼로리
  nutrition: NutritionInfo; // 영양 성분 상세 정보
  allergens: string[]; // 알레르기 성분 (예: ["대두", "밀", "쇠고기"])
  imageUrl?: string; // 히어로용 이미지 (치즈돈까스 등)
}

export interface SelectedNutrientGoal {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
