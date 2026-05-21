/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MealItem } from '../types';
import { getWeekDates, formatDateKey, getKoreanDayOfWeek } from '../utils/dateUtils';

/**
 * 주어진 기준 날짜가 있는 주의 월요일~금요일에 맞춘 씨마스고등학교 급식 데이터를 자동 생성합니다.
 * 월~금 5일분에 대해 중식(lunch)과 석식(dinner) 총 10개의 데이터를 반환합니다.
 */
export function generateMealsForWeek(baseDate: Date): MealItem[] {
  const weekDates = getWeekDates(baseDate); // [Mon, Tue, Wed, Thu, Fri]
  
  // 요일별 실제 식사 세부 정보 템플릿
  const templates = [
    // 월요일
    {
      lunch: {
        title: "허니버터치킨 정식",
        dishes: ["발아현미밥", "순두부찌개", "허니버터치킨", "감자채볶음", "오이무침", "배추김치"],
        totalCalories: 820,
        nutrition: { calories: 820, protein: 28, carbs: 105, fat: 22 },
        allergens: ["대두", "밀", "닭고기"],
        imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=60"
      },
      dinner: {
        title: "스팸마요덮밥",
        dishes: ["스팸마요덮밥", "팽이장국", "매콤떡볶이", "깍두기", "바나나우유"],
        totalCalories: 740,
        nutrition: { calories: 740, protein: 19, carbs: 98, fat: 18 },
        allergens: ["난류", "우유", "대두", "밀", "돼지고기"]
      }
    },
    // 화요일
    {
      lunch: {
        title: "고추장불고기 쌈밥",
        dishes: ["찰보리밥", "우거지된장국", "매콤고추장불고기", "쌈무 & 신선야채", "부추무침", "포기김치"],
        totalCalories: 830,
        nutrition: { calories: 830, protein: 32, carbs: 95, fat: 24 },
        allergens: ["대두", "밀", "돼지고기"],
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60"
      },
      dinner: {
        title: "베이컨 크림파스타",
        dishes: ["베이컨 크림파스타", "부드러운 스프", "마늘바게트", "수제피클", "오렌지주스"],
        totalCalories: 710,
        nutrition: { calories: 710, protein: 20, carbs: 88, fat: 20 },
        allergens: ["난류", "우유", "대두", "밀", "돼지고기"]
      }
    },
    // 수요일
    {
      lunch: {
        title: "치즈돈까스 정식",
        dishes: ["친환경현미밥", "쇠고기미역국", "매콤돈육강정", "숙주미나리무침", "배추김치"],
        totalCalories: 845,
        nutrition: { calories: 845, protein: 32, carbs: 110, fat: 25 },
        allergens: ["대두", "밀", "쇠고기", "돼지고기"],
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCAr4japonfs7a2lq6W5pH_ChBTttKslNCTMJamHjGomOemPhAH1ByMBeTS7OwoGShjndyScyIBz-uGMxxZyRZrZMIyCmfl810WK3e8Iv8qoGjoS9AyYGIGijkzjzwHNwUPCM8eKk-cf9emWrWKdqmS7dk_obe2yB_ePL2hpDmVUFcco6w9X0eHoHsLzueFgS7h_rXdMRqZ6YhMYMWu8pyWBYHXLyIM2I-VDPIvGuDOd1lAd4I3bEsttZ4Jr1JSHIKbw9f61rWa95Q"
      },
      dinner: {
        title: "참치마요덮밥",
        dishes: ["참치마요덮밥", "유부장국", "매콤떡볶이", "단무지무침", "요구르트"],
        totalCalories: 720,
        nutrition: { calories: 720, protein: 18, carbs: 95, fat: 15 },
        allergens: ["난류", "우유", "대두", "밀"]
      }
    },
    // 목요일
    {
      lunch: {
        title: "수제함박 정식",
        dishes: ["혼합잡곡밥", "돈육김치찌개", "수제함박스테이크", "숙주미나리무침", "깍두기", "콘드레싱"],
        totalCalories: 850,
        nutrition: { calories: 850, protein: 35, carbs: 115, fat: 23 },
        allergens: ["돼지고기", "쇠고기", "밀", "대두"],
        imageUrl: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=60"
      },
      dinner: {
        title: "참치마요덮밥 정식",
        dishes: ["참치마요덮밥", "유부장국", "매콤떡볶이", "단무지무침", "배추김치", "요구르트"],
        totalCalories: 720,
        nutrition: { calories: 720, protein: 18, carbs: 95, fat: 15 },
        allergens: ["난류", "우유", "대두", "밀"]
      }
    },
    // 금요일
    {
      lunch: {
        title: "비빔밥과 불고기",
        dishes: ["전주비빔밥", "약고추장", "맑은 콩나물국", "언양식 불고기", "백김치", "아쿠아젤리"],
        totalCalories: 790,
        nutrition: { calories: 790, protein: 26, carbs: 108, fat: 18 },
        allergens: ["대두", "밀", "쇠고기"],
        imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=60"
      },
      dinner: {
        title: "짜장면과 탕수육",
        dishes: ["수제짜장면", "계란파국", "찹쌀탕수육", "단무지", "단감즙"],
        totalCalories: 880,
        nutrition: { calories: 880, protein: 30, carbs: 125, fat: 25 },
        allergens: ["난류", "대두", "밀", "돼지고기"]
      }
    }
  ];

  const meals: MealItem[] = [];
  
  weekDates.forEach((date, index) => {
    const dayOfWeekStr = getKoreanDayOfWeek(date);
    const dateKeyStr = formatDateKey(date);
    const template = templates[index];
    
    // 중식 생성
    meals.push({
      id: `${dateKeyStr}-lunch`,
      schoolName: "씨마스고등학교",
      date: date,
      dateKey: dateKeyStr,
      dayOfWeek: dayOfWeekStr,
      mealType: "lunch",
      title: template.lunch.title,
      dishes: template.lunch.dishes,
      totalCalories: template.lunch.totalCalories,
      nutrition: template.lunch.nutrition,
      allergens: template.lunch.allergens,
      imageUrl: template.lunch.imageUrl
    });
    
    // 석식 생성
    meals.push({
      id: `${dateKeyStr}-dinner`,
      schoolName: "씨마스고등학교",
      date: date,
      dateKey: dateKeyStr,
      dayOfWeek: dayOfWeekStr,
      mealType: "dinner",
      title: template.dinner.title,
      dishes: template.dinner.dishes,
      totalCalories: template.dinner.totalCalories,
      nutrition: template.dinner.nutrition,
      allergens: template.dinner.allergens
    });
  });
  
  return meals;
}
