/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, FormEvent, SVGProps } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Utensils,
  Bell,
  Calendar,
  Flame,
  User,
  Settings,
  ChevronRight,
  Plus,
  Compass,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Heart,
  Undo2,
  BookmarkCheck,
  Award,
  CircleAlert
} from "lucide-react";

import { MealItem, NutritionInfo } from "./types";
import {
  getTodayKST,
  formatKoreanDate,
  formatDateKey,
  getWeekDates,
  getWeekOfMonth,
  getDefaultSelectedDate,
  getKoreanDayOfWeek
} from "./utils/dateUtils";
import { generateMealsForWeek } from "./data/mockData";

// 메뉴 아이템별 영양소 세부 매핑 헬퍼 함수
interface DishNutrition {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  highlightBadge?: string;
}

function getDishesNutrition(mealTitle: string, dishes: string[]): DishNutrition[] {
  const mapping: Record<string, Partial<DishNutrition>> = {
    // 치즈돈까스 정식 구성물
    "친환경현미밥": { calories: 300, carbs: 65, protein: 6, fat: 1, highlightBadge: "탄수화물 65g" },
    "쇠고기미역국": { calories: 125, carbs: 8, protein: 9, fat: 6, highlightBadge: "소고기 함유" },
    "매콤돈육강정": { calories: 250, carbs: 22, protein: 12, fat: 12, highlightBadge: "돼지고기 국산" },
    "숙주미나리무침": { calories: 100, carbs: 10, protein: 3, fat: 2, highlightBadge: "비타민C" },
    "배추김치": { calories: 70, carbs: 5, protein: 2, fat: 4, highlightBadge: "유산균 가득" },
    
    // 수제함박 정식 구성
    "혼합잡곡밥": { calories: 310, carbs: 68, protein: 7, fat: 1, highlightBadge: "식이섬유 4g" },
    "돈육김치찌개": { calories: 230, carbs: 12, protein: 14, fat: 12, highlightBadge: "엄선 돈육" },
    "수제함박스테이크": { calories: 190, carbs: 15, protein: 11, fat: 8, highlightBadge: "직화 구이" },
    "깍두기": { calories: 50, carbs: 6, protein: 1, fat: 1, highlightBadge: "아삭 상큼" },
    "콘드레싱": { calories: 70, carbs: 14, protein: 2, fat: 1, highlightBadge: "스위트콘" },
    
    // 석식 참치마요덮밥 구성
    "참치마요덮밥": { calories: 450, carbs: 62, protein: 12, fat: 10, highlightBadge: "고단백 참치" },
    "유부장국": { calories: 90, carbs: 10, protein: 3, fat: 3, highlightBadge: "가쓰오 소스" },
    "매콤떡볶이": { calories: 110, carbs: 20, protein: 2, fat: 1, highlightBadge: "중독성 양념" },
    "단무지무침": { calories: 30, carbs: 3, protein: 1, fat: 0, highlightBadge: "깔끔 반찬" },
    "요구르트": { calories: 40, carbs: 0, protein: 0, fat: 1, highlightBadge: "위 건강 유산균" },
    
    // 월요일 중식 (허니버터치킨)
    "발아현미밥": { calories: 290, carbs: 63, protein: 6, fat: 1, highlightBadge: "복합당류" },
    "순두부찌개": { calories: 180, carbs: 10, protein: 12, fat: 10, highlightBadge: "몽글 순두부" },
    "허니버터치킨": { calories: 260, carbs: 20, protein: 8, fat: 9, highlightBadge: "특제 버터밀크" },
    "감자채볶음": { calories: 90, carbs: 12, protein: 2, fat: 2, highlightBadge: "든든 녹말" },
    
    // 화요일 중식 (고추장불고기)
    "찰보리밥": { calories: 280, carbs: 60, protein: 6, fat: 1, highlightBadge: "식이섬유" },
    "우거지된장국": { calories: 130, carbs: 12, protein: 8, fat: 4, highlightBadge: "구수한 된장" },
    "매콤고추장불고기": { calories: 310, carbs: 15, protein: 16, fat: 15, highlightBadge: "직화 풍미" },
    "쌈무 & 신선야채": { calories: 40, carbs: 4, protein: 1, fat: 0, highlightBadge: "싱싱 채소" },
    "부추무침": { calories: 70, carbs: 4, protein: 1, fat: 4, highlightBadge: "새콤 겉절이" },
    "포기김치": { calories: 50, carbs: 4, protein: 1, fat: 3, highlightBadge: "아삭 배추" },
    
    // 금요일 중식 (비빔밥)
    "전주비빔밥": { calories: 380, carbs: 68, protein: 10, fat: 8, highlightBadge: "오색 채소 비빔" },
    "약고추장": { calories: 80, carbs: 10, protein: 2, fat: 2, highlightBadge: "특제 볶음 소스" },
    "맑은 콩나물국": { calories: 50, carbs: 4, protein: 2, fat: 1, highlightBadge: "개운한 국물" },
    "언양식 불고기": { calories: 235, carbs: 15, protein: 11, fat: 6, highlightBadge: "수제 떡갈비" },
    "백김치": { calories: 45, carbs: 5, protein: 1, fat: 1, highlightBadge: "시원 퓨어" },
    "아쿠아젤리": { calories: 60, carbs: 14, protein: 0, fat: 0, highlightBadge: "청량 디저트" }
  };
  
  return dishes.map(name => {
    const item = mapping[name] || {};
    return {
      name,
      calories: item.calories || 120,
      carbs: item.carbs || 12,
      protein: item.protein || 5,
      fat: item.fat || 3,
      highlightBadge: item.highlightBadge
    };
  });
}

export default function App() {
  // 1. 오늘 날짜 및 주간 급식 일체형 자동 계산
  const todayKST = useMemo(() => getTodayKST(), []);
  const currentMeals = useMemo(() => generateMealsForWeek(todayKST), [todayKST]);
  
  // 상태 변수 관리
  const [selectedTab, setSelectedTab] = useState<"home" | "schedule" | "calculate" | "profile">("home");
  const [selectedDate, setSelectedDate] = useState<Date>(() => getDefaultSelectedDate(todayKST));
  const [activeCalcMealType, setActiveCalcMealType] = useState<"lunch" | "dinner">("lunch");
  
  // 프로필 관련 사용자 상태
  const [studentAllergens, setStudentAllergens] = useState<string[]>(["우유", "땅콩"]);
  const [allergyWarnOn, setAllergyWarnOn] = useState<boolean>(true);
  const [dailyNotifyOn, setDailyNotifyOn] = useState<boolean>(true);
  const [newAllergen, setNewAllergen] = useState<string>("");
  const [isAddingAllergen, setIsAddingAllergen] = useState<boolean>(false);
  
  // 보존 상태 피드백 (계산 저장 등)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // 주말 여부 검출
  const isWeekend = useMemo(() => {
    const currentDay = todayKST.getDay();
    return currentDay === 0 || currentDay === 6;
  }, [todayKST]);

  // 홈 화면용 타깃 날짜 결정 (주말인 경우 방식 B에 의거하여 "다음 월요일" 식단 연동)
  const homeTargetDate = useMemo(() => {
    return isWeekend ? getDefaultSelectedDate(todayKST) : todayKST;
  }, [isWeekend, todayKST]);

  // 홈 화면용 급식 추출
  const homeMeals = useMemo(() => {
    const targetKey = formatDateKey(homeTargetDate);
    const dayMeals = currentMeals.filter(m => m.dateKey === targetKey);
    const lunch = dayMeals.find(m => m.mealType === "lunch");
    const dinner = dayMeals.find(m => m.mealType === "dinner");
    return { lunch, dinner };
  }, [homeTargetDate, currentMeals]);

  // 4. 영양계산 전용 상태 (선택된 오늘 날짜/다음 급식일 기준으로 자동 구성)
  const calcTargetDate = useMemo(() => {
    // 오늘이 평일이면 오늘, 주말이면 다음 월요일
    return isWeekend ? getDefaultSelectedDate(todayKST) : todayKST;
  }, [isWeekend, todayKST]);

  const calcTargetMeal = useMemo(() => {
    const key = formatDateKey(calcTargetDate);
    return currentMeals.find(m => m.dateKey === key && m.mealType === activeCalcMealType);
  }, [calcTargetDate, activeCalcMealType, currentMeals]);

  // 영양계산용 체크박스 상태
  const [selectedDishesList, setSelectedDishesList] = useState<string[]>([]);

  // 타깃 급식이 변경될 때마다 기본적으로 해당 급식의 모든 요소를 활성화 상태로 체크해 줍니다.
  useEffect(() => {
    if (calcTargetMeal) {
      setSelectedDishesList(calcTargetMeal.dishes);
    }
  }, [calcTargetMeal]);

  // 체크된 음식들을 기반으로 실시간 영양성분 최종 합산
  const realTimeNutrition = useMemo(() => {
    if (!calcTargetMeal) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    const detailNutritionList = getDishesNutrition(calcTargetMeal.title, calcTargetMeal.dishes);
    const checkedDetails = detailNutritionList.filter(d => selectedDishesList.includes(d.name));
    
    return checkedDetails.reduce(
      (acc, curr) => {
        acc.calories += curr.calories;
        acc.protein += curr.protein;
        acc.carbs += curr.carbs;
        acc.fat += curr.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [selectedDishesList, calcTargetMeal]);

  // 주차 제목 계산기 (예: "5월 3주차")
  const currentWeekText = useMemo(() => {
    const { month, week } = getWeekOfMonth(selectedDate);
    return `${month}월 ${week}주차`;
  }, [selectedDate]);

  // 식단표 주간 날짜 세트 (월~금)
  const weekDates = useMemo(() => getWeekDates(todayKST), [todayKST]);

  // 식단표 화면에서 선택된 특정 날짜의 중식/석식 데이터
  const selectedDayMeals = useMemo(() => {
    const key = formatDateKey(selectedDate);
    const dayMeals = currentMeals.filter(m => m.dateKey === key);
    const lunch = dayMeals.find(m => m.mealType === "lunch");
    const dinner = dayMeals.find(m => m.mealType === "dinner");
    return { lunch, dinner };
  }, [selectedDate, currentMeals]);

  // 알레르기 유발 알림 매칭 체크 헬퍼
  const checkAllergyWarning = (allergens: string[] = []) => {
    if (!allergyWarnOn) return false;
    return allergens.some(al => studentAllergens.includes(al));
  };

  const getMatchedAllergens = (allergens: string[] = []) => {
    return allergens.filter(al => studentAllergens.includes(al));
  };

  // 주간 식단표로 가기 버튼 바인딩
  const handleGoToSchedule = () => {
    setSelectedTab("schedule");
    setSelectedDate(getDefaultSelectedDate(todayKST));
  };

  // 프로필 알레르기 추가
  const handleAddAllergen = (e: FormEvent) => {
    e.preventDefault();
    if (newAllergen.trim() && !studentAllergens.includes(newAllergen.trim())) {
      setStudentAllergens([...studentAllergens, newAllergen.trim()]);
      setNewAllergen("");
      setIsAddingAllergen(false);
    }
  };

  // 영양계산 저장 피드백
  const handleSaveCalculation = () => {
    setSaveSuccessMessage("식단 영양 계산 결과가 저장되었습니다!");
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background pb-28 text-on-surface">
      {/* 8. 공통 AppHeader */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-surface px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container/60 text-primary">
            <Utensils className="h-5 w-5" />
          </div>
          <h1 className="font-gmarket text-lg font-bold text-primary">씨마스고등학교 급식</h1>
        </div>
        <div className="flex items-center gap-3">
          {allergyWarnOn && studentAllergens.length > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-8 items-center gap-1 rounded-full bg-error-container px-3 text-xs font-semibold text-error"
            >
              <CircleAlert className="h-3.5 w-3.5 animate-pulse" />
              <span>알레르기 활성</span>
            </motion.div>
          )}
          <button
            onClick={() => setSelectedTab("profile")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container active:scale-95 transition-transform"
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="mx-auto max-w-md px-6 pt-24">
        <AnimatePresence mode="wait">
          {selectedTab === "home" && (
            <motion.div
              key="home-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* 오늘의 추천 급식 히어로 카드 */}
              {homeMeals.lunch && (
                <section className="relative overflow-hidden rounded-2xl bg-surface-container-lowest soft-card-shadow border border-outline-variant/20">
                  <div className="relative h-[240px] w-full overflow-hidden">
                    <img
                      src={homeMeals.lunch.imageUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?w=600"}
                      alt={homeMeals.lunch.title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>
                    
                    {/* 배지 탑 */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-on-primary">
                        오늘의 추천 급식
                      </span>
                      {isWeekend && (
                        <span className="rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white flex items-center gap-1">
                          <BookmarkCheck className="h-3 w-3" /> 다음 급식일
                        </span>
                      )}
                    </div>

                    <button className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 active:scale-90 transition-transform">
                      <Heart className="h-4 w-4 fill-white" />
                    </button>

                    {/* 음식 내용 */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-xs font-medium text-white/80">
                        {formatKoreanDate(homeTargetDate)}
                      </p>
                      <h2 className="font-gmarket text-2xl font-bold mt-1 tracking-tight">
                        {homeMeals.lunch.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-secondary-container">
                          {homeMeals.lunch.totalCalories} kcal
                        </span>
                        {checkAllergyWarning(homeMeals.lunch.allergens) && (
                          <span className="inline-flex items-center gap-1 rounded bg-error px-1.5 py-0.5 text-[10px] font-bold text-white">
                            알레르기 주의 ({getMatchedAllergens(homeMeals.lunch.allergens).join(", ")})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* 오늘의 급식 요약 타이틀 */}
              <section className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-base font-bold text-primary font-gmarket">
                  <Utensils className="h-4 w-4" />
                  <span>오늘의 급식 요약</span>
                </h3>
                <span className="text-xs text-on-surface-variant font-medium">
                  {formatDateKey(homeTargetDate).replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3")}
                </span>
              </section>

              {/* 주말 특별 안내 문구 (방식 B 기준: 월요일 식단을 보여주며 주말 안내 팁 가미) */}
              {isWeekend && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-secondary p-4 bg-secondary-container/10 border-dashed text-stone-750 space-y-1.5"
                >
                  <p className="text-sm font-semibold text-primary flex items-center gap-1.5">
                    <InfoIcon className="h-4 w-4" /> 오늘은 주말이라 급식 정보가 없습니다.
                  </p>
                  <p className="text-xs leading-relaxed text-on-surface-variant">
                    가장 가까운 평일이자 다음 급식일인 <span className="font-bold text-primary">{formatKoreanDate(homeTargetDate)}</span> 식단을 자동으로 보여드리고 있습니다.
                  </p>
                </motion.div>
              )}

              {/* Bento Style 식단 요약 요일 카드 */}
              <div className="grid grid-cols-1 gap-4">
                {/* 중식 카드 */}
                {homeMeals.lunch ? (
                  <div className="rounded-2xl border border-outline-variant/30 bg-white p-5 soft-card-shadow active:scale-[0.99] transition-transform">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-gmarket text-lg font-bold text-primary">중식</span>
                        <p className="text-xs text-outline font-semibold mt-0.5">
                          {homeMeals.lunch.totalCalories} kcal
                        </p>
                      </div>
                      <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">
                        식단 완료
                      </span>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {homeMeals.lunch.dishes.map((dish, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-on-surface font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/40"></span>
                          <span>{dish}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {homeMeals.lunch.allergens.map((al, idx) => {
                        const isAllergic = allergyWarnOn && studentAllergens.includes(al);
                        return (
                          <span
                            key={idx}
                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                              isAllergic
                                ? "bg-error/15 text-error border border-error/20 font-bold"
                                : "bg-outline-variant/35 text-on-surface-variant"
                            }`}
                          >
                            {al}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-center py-6 text-xs text-on-surface-variant">중식 정보가 없습니다.</p>
                )}

                {/* 석식 카드 */}
                {homeMeals.dinner ? (
                  <div className="rounded-2xl border border-outline-variant/30 bg-white p-5 soft-card-shadow active:scale-[0.99] transition-transform">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-gmarket text-lg font-bold text-tertiary">석식</span>
                        <p className="text-xs text-outline font-semibold mt-0.5">
                          {homeMeals.dinner.totalCalories} kcal
                        </p>
                      </div>
                      <span className="rounded-full bg-tertiary-container/10 px-3 py-1 text-xs font-bold text-tertiary">
                        조리 대기
                      </span>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {homeMeals.dinner.dishes.map((dish, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-on-surface font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-tertiary/40"></span>
                          <span>{dish}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {homeMeals.dinner.allergens.map((al, idx) => {
                        const isAllergic = allergyWarnOn && studentAllergens.includes(al);
                        return (
                          <span
                            key={idx}
                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                              isAllergic
                                ? "bg-error/15 text-error border border-error/20 font-bold"
                                : "bg-outline-variant/35 text-on-surface-variant"
                            }`}
                          >
                            {al}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-center py-6 text-xs text-on-surface-variant">석식 정보가 없습니다.</p>
                )}
              </div>

              {/* 식단표 전체 이동 */}
              <button
                onClick={handleGoToSchedule}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-gmarket text-sm font-bold text-on-primary shadow-md hover:bg-primary/95 active:scale-95 transition-all"
              >
                <Calendar className="h-4 w-4" />
                <span>전체 식단표 보기</span>
              </button>
            </motion.div>
          )}

          {selectedTab === "schedule" && (
            <motion.div
              key="schedule-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* 주간 식단 라벨 및 주차 제목 */}
              <section className="space-y-1">
                <span className="text-xs font-bold tracking-wider text-primary">주간 식단</span>
                <h2 className="font-gmarket text-3xl font-bold text-primary">
                  {currentWeekText}
                </h2>
              </section>

              {/* 날짜 선택 Bento 스크롤 바 */}
              <nav className="overflow-x-auto custom-scroll-hide">
                <div className="flex gap-3 pb-2">
                  {weekDates.map((dateItem, idx) => {
                    const dayName = getKoreanDayOfWeek(dateItem);
                    const dayNum = dateItem.getDate();
                    const isSelected = formatDateKey(dateItem) === formatDateKey(selectedDate);
                    const isActualToday = formatDateKey(dateItem) === formatDateKey(todayKST);

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(dateItem)}
                        className={`flex h-20 w-[64px] flex-shrink-0 flex-col items-center justify-center rounded-2xl transition-all duration-200 ${
                          isSelected
                            ? "bg-primary text-on-primary scale-105 shadow-md font-bold"
                            : "bg-white text-on-surface hover:bg-secondary-container/30 border border-outline-variant/20 soft-card-shadow"
                        }`}
                      >
                        <span className={`text-[11px] uppercase font-semibold opacity-75`}>
                          {dayName}
                        </span>
                        <span className="font-gmarket text-lg font-bold mt-1">
                          {dayNum}
                        </span>
                        {isActualToday && (
                          <div
                            className={`h-1.5 w-1.5 rounded-full mt-1 ${
                              isSelected ? "bg-white" : "bg-primary"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* 특정 요일 식단 카드 섹션 */}
              <div className="space-y-5">
                {/* 중식 */}
                {selectedDayMeals.lunch ? (
                  <article className="rounded-2xl bg-white p-5 border border-outline-variant/30 soft-card-shadow relative overflow-hidden active:scale-[0.99] transition-transform">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5 text-primary">
                          <Compass className="h-4.5 w-4.5 animate-spin-slow" />
                          <h3 className="font-gmarket text-base font-bold">오늘의 중식</h3>
                        </div>
                        <p className="text-xs font-medium text-on-surface-variant mt-1.5">
                          급식 시간: 12:30 ~ 13:30
                        </p>
                      </div>
                      <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">
                        {selectedDayMeals.lunch.totalCalories} kcal
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-outline-variant/20 pt-4">
                      {selectedDayMeals.lunch.dishes.map((dish, dIdx) => (
                        <div key={dIdx} className="flex items-center gap-2 text-sm text-on-surface font-semibold">
                          <span className="h-1.5 w-1.5 bg-secondary rounded-full"></span>
                          <span>{dish}</span>
                        </div>
                      ))}
                    </div>

                    {/* 알레르기 유발 확인 경고 */}
                    {checkAllergyWarning(selectedDayMeals.lunch.allergens) && (
                      <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-error-container/45 p-2.5 text-xs font-bold text-error">
                        <AlertTriangle className="h-4 w-4" />
                        <span>알레르기 성분 필터 검출: {getMatchedAllergens(selectedDayMeals.lunch.allergens).join(", ")}</span>
                      </div>
                    )}

                    {/* 프로필 알레르기 목록 미경고 시 전체 배지 */}
                    <div className="mt-4 flex flex-wrap gap-1">
                      {selectedDayMeals.lunch.allergens.map((al, aIdx) => (
                        <span
                          key={aIdx}
                          className={`rounded px-2.5 py-0.5 text-xs font-semibold ${
                            allergyWarnOn && studentAllergens.includes(al)
                              ? "bg-error text-white font-bold"
                              : "bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          #{al}
                        </span>
                      ))}
                    </div>

                    {/* 단백질 달성도 */}
                    <div className="mt-5 pt-4 border-t border-outline-variant/30">
                      <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                        <span className="text-on-surface-variant">지정 영양 성분 달성도</span>
                        <span className="text-primary">{selectedDayMeals.lunch.nutrition.protein}g / 단백질 85%</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[85%] rounded-full transition-all duration-1000 ease-out" />
                      </div>
                    </div>
                  </article>
                ) : (
                  <p className="text-center py-8 text-sm text-on-surface-variant font-medium">선택된 날의 중식 정보가 없습니다.</p>
                )}

                {/* 석식 */}
                {selectedDayMeals.dinner ? (
                  <article className="rounded-2xl bg-white p-5 border border-outline-variant/30 soft-card-shadow relative overflow-hidden active:scale-[0.99] transition-transform">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5 text-on-surface-variant">
                          <Compass className="h-4.5 w-4.5" />
                          <h3 className="font-gmarket text-base font-bold">오늘의 석식</h3>
                        </div>
                        <p className="text-xs font-medium text-on-surface-variant mt-1.5">
                          급식 시간: 18:00 ~ 19:00
                        </p>
                      </div>
                      <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold text-on-surface-variant">
                        {selectedDayMeals.dinner.totalCalories} kcal
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-outline-variant/20 pt-4">
                      {selectedDayMeals.dinner.dishes.map((dish, dIdx) => (
                        <div key={dIdx} className="flex items-center gap-2 text-sm text-on-surface font-semibold">
                          <span className="h-1.5 w-1.5 bg-outline rounded-full"></span>
                          <span>{dish}</span>
                        </div>
                      ))}
                    </div>

                    {/* 알레르기 유발 확인 경고 */}
                    {checkAllergyWarning(selectedDayMeals.dinner.allergens) && (
                      <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-error-container/45 p-2.5 text-xs font-bold text-error">
                        <AlertTriangle className="h-4 w-4" />
                        <span>알레르기 성분 필터 검출: {getMatchedAllergens(selectedDayMeals.dinner.allergens).join(", ")}</span>
                      </div>
                    )}

                    {/* 프로필 알레르기 목록 미경고 시 전체 배지 */}
                    <div className="mt-4 flex flex-wrap gap-1">
                      {selectedDayMeals.dinner.allergens.map((al, aIdx) => (
                        <span
                          key={aIdx}
                          className={`rounded px-2.5 py-0.5 text-xs font-semibold ${
                            allergyWarnOn && studentAllergens.includes(al)
                              ? "bg-error text-white font-bold"
                              : "bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          #{al}
                        </span>
                      ))}
                    </div>

                    {/* 단백질 달성도 */}
                    <div className="mt-5 pt-4 border-t border-outline-variant/30">
                      <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                        <span className="text-on-surface-variant">지정 영양 성분 달성도</span>
                        <span className="text-stone-500">{selectedDayMeals.dinner.nutrition.protein}g / 단백질 60%</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-outline w-[60%] rounded-full" />
                      </div>
                    </div>
                  </article>
                ) : (
                  <p className="text-center py-8 text-sm text-on-surface-variant font-medium">선택된 날의 석식 정보가 없습니다.</p>
                )}
              </div>
            </motion.div>
          )}

          {selectedTab === "calculate" && (
            <motion.div
              key="calc-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* 영양소 계산 헤더 */}
              <section className="bg-white p-5 rounded-2xl border border-outline-variant/30 soft-card-shadow space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-on-surface-variant">오늘의 선택 영양 실시간 합산</span>
                    <h2 className="font-gmarket text-3xl font-bold text-primary mt-1">
                      {realTimeNutrition.calories} <span className="text-lg font-medium">kcal</span>
                    </h2>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-primary shadow-sm">
                    <Calculator className="h-5 w-5" />
                  </div>
                </div>

                {/* 프로그레스 실시간 매핑 */}
                <div className="space-y-3 pt-2">
                  {/* 단백질 */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-on-surface">단백질 {realTimeNutrition.protein}g</span>
                      <span className="text-on-surface-variant">권장의 {Math.round((realTimeNutrition.protein / 50) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (realTimeNutrition.protein / 50) * 100)}%` }}
                        className="h-full bg-primary rounded-full"
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>

                  {/* 탄수화물 */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-on-surface">탄수화물 {realTimeNutrition.carbs}g</span>
                      <span className="text-on-surface-variant">권장의 {Math.round((realTimeNutrition.carbs / 140) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (realTimeNutrition.carbs / 140) * 100)}%` }}
                        className="h-full bg-secondary rounded-full"
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>

                  {/* 지방 */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-on-surface">지방 {realTimeNutrition.fat}g</span>
                      <span className="text-on-surface-variant">권장의 {Math.round((realTimeNutrition.fat / 60) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (realTimeNutrition.fat / 60) * 100)}%` }}
                        className="h-full bg-tertiary-container rounded-full"
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* 필터 칩: 중식 / 석식 선택 */}
              <section className="flex gap-2">
                <button
                  onClick={() => setActiveCalcMealType("lunch")}
                  className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                    activeCalcMealType === "lunch"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-secondary-container/30"
                  }`}
                >
                  중식 데이터
                </button>
                <button
                  onClick={() => setActiveCalcMealType("dinner")}
                  className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                    activeCalcMealType === "dinner"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-secondary-container/30"
                  }`}
                >
                  석식 데이터
                </button>
              </section>

              {/* 개별 메뉴 리스트: 영양성분 쪼개어 실시간 선택/해제 연동 */}
              <section className="space-y-3">
                {calcTargetMeal ? (
                  getDishesNutrition(calcTargetMeal.title, calcTargetMeal.dishes).map((dish, idx) => {
                    const isChecked = selectedDishesList.includes(dish.name);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedDishesList(selectedDishesList.filter(d => d !== dish.name));
                          } else {
                            setSelectedDishesList([...selectedDishesList, dish.name]);
                          }
                        }}
                        className={`group relative overflow-hidden rounded-2xl bg-white p-4 soft-card-shadow border-2 cursor-pointer transition-all active:scale-[0.98] ${
                          isChecked ? "border-primary" : "border-outline-variant/30 opacity-75"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 font-bold mb-1">
                              <span className="font-gmarket text-[15px]">{dish.name}</span>
                              {isChecked && (
                                <CheckCircle className="h-4 w-4 text-primary fill-transparent" />
                              )}
                            </div>
                            <div className="flex gap-1.5 text-xs text-on-surface-variant">
                              <span className="rounded bg-surface-container px-1.5 py-0.5 font-medium">{dish.calories} kcal</span>
                              {dish.highlightBadge && (
                                <span className="rounded bg-secondary-container/55 px-1.5 py-0.5 text-on-secondary-container font-semibold">
                                  {dish.highlightBadge}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isChecked ? "bg-primary/10 text-primary" : "text-outline"}`}>
                            <Utensils className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-8 text-sm text-on-surface-variant">식단 데이터를 가져오는 데 실패했습니다.</p>
                )}
              </section>

              {/* 계산 결과 저장 */}
              <div className="pt-2">
                <button
                  onClick={handleSaveCalculation}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-gmarket text-sm font-bold text-on-primary shadow-md hover:bg-primary/95 active:scale-95 transition-all"
                >
                  <BookmarkCheck className="h-4 w-4" />
                  <span>계산 결과 저장하기</span>
                </button>
              </div>

              {/* 저장 알림 토스트 */}
              <AnimatePresence>
                {saveSuccessMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-24 left-6 right-6 z-50 rounded-xl bg-slate-900 border border-slate-800 p-4 text-center text-xs font-bold text-white shadow-xl"
                  >
                    {saveSuccessMessage}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {selectedTab === "profile" && (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* 프로필 요약 카드 */}
              <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-primary-container rounded-2xl p-6 text-on-primary shadow-lg">
                <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnVzssWmM5dL8fVhfbPnMVfVokPBajPYxj9yw5WaPAkNHQX8pcKG0YY3OQimM59XaJuVT8e8mILnGdy8QQNsG-AB58pwgrkArpgoUIlyPlNw2mi3dU-2LIXeACFM_z6tqGDqHOFbvnDDjEt5dOzJyt-jSp3D90iSyqCn6E4lmNN4aaQkMfgHvZfntEj2Qr1_0ryjNcKzeWWS13jiCTL-T7sdXim-T7rMWrt4G_Gj_aYSizdOEsJUTVsYl3z2RvbVs4FjaPmAQ63n8"
                        alt="김학생 아바타"
                        className="w-20 h-20 rounded-full border-4 border-white/20 object-cover"
                      />
                      <div className="absolute bottom-0 right-0 bg-primary h-6 w-6 rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="font-gmarket text-xl font-bold">김학생</h2>
                      <p className="text-sm opacity-90 font-medium">2학년 3반 15번</p>
                    </div>
                  </div>
                  <button className="h-9 w-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors active:scale-90">
                    <Settings className="h-4.5 w-4.5" />
                  </button>
                </div>
              </section>

              {/* 알레르기 경고 알림 제어 패널 */}
              <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 soft-card-shadow space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-error">
                    <AlertTriangle className="h-4.5 w-4.5" />
                    <h3 className="font-gmarket text-[15px] font-bold text-primary">알레르기 경고 알림</h3>
                  </div>
                  
                  {/* 토글 스위치 */}
                  <button
                    onClick={() => setAllergyWarnOn(!allergyWarnOn)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      allergyWarnOn ? "bg-primary" : "bg-outline-variant/60"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        allergyWarnOn ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 등록된 알레르기 태그 목록 */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {studentAllergens.map((alg, index) => (
                    <span
                      key={index}
                      className="group inline-flex items-center gap-1.5 rounded-full bg-error-container/60 px-3 py-1 text-xs font-semibold text-error text-[11.5px]"
                    >
                      {alg}
                      <button
                        onClick={() => setStudentAllergens(studentAllergens.filter(item => item !== alg))}
                        className="opacity-70 hover:opacity-100 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  
                  {!isAddingAllergen ? (
                    <button
                      onClick={() => setIsAddingAllergen(true)}
                      className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant hover:bg-surface-variant"
                    >
                      <Plus className="h-3 w-3" /> 추가
                    </button>
                  ) : (
                    <form onSubmit={handleAddAllergen} className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={newAllergen}
                        onChange={(e) => setNewAllergen(e.target.value)}
                        placeholder="알레르기 입력"
                        autoFocus
                        className="rounded-full border border-primary px-3 py-0.5 text-xs focus:outline-none"
                      />
                      <button type="submit" className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white">
                        등록
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingAllergen(false);
                          setNewAllergen("");
                        }}
                        className="text-xs text-on-surface-variant font-bold px-1"
                      >
                        취소
                      </button>
                    </form>
                  )}
                </div>
              </section>

              {/* 일일 식단 알림 */}
              <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 soft-card-shadow flex justify-between items-center">
                <div>
                  <h3 className="font-gmarket text-[15px] font-bold text-primary">일일 식단 알림</h3>
                  <p className="text-xs text-on-surface-variant mt-1.5 font-medium">매일 아침 8시 푸시 알림 수신</p>
                </div>
                <button
                  onClick={() => setDailyNotifyOn(!dailyNotifyOn)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    dailyNotifyOn ? "bg-primary" : "bg-outline-variant/60"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      dailyNotifyOn ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </section>

              {/* 일반 지원 및 고객센터 리스트 */}
              <section className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden soft-card-shadow">
                <button className="w-full flex items-center justify-between p-5 hover:bg-surface-container-low text-left transition-colors active:scale-[0.99]">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary-container/50 text-secondary flex items-center justify-center">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-sm font-semibold text-on-surface">고객센터 / 문의하기</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-outline" />
                </button>
                <div className="h-[1px] bg-outline-variant/20 mx-5"></div>

                <button className="w-full flex items-center justify-between p-5 hover:bg-surface-container-low text-left transition-colors active:scale-[0.99]">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary-container/50 text-secondary flex items-center justify-center">
                      <Settings className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-sm font-semibold text-on-surface">이용약관 및 정책</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-outline" />
                </button>
                <div className="h-[1px] bg-outline-variant/20 mx-5"></div>

                <button className="w-full flex items-center justify-between p-5 hover:bg-error-container/10 text-left text-error transition-colors active:scale-[0.99]">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold pl-11">로그아웃</span>
                  </div>
                </button>
              </section>

              {/* 푸터 */}
              <footer className="py-6 text-center space-y-1 opacity-60">
                <p className="text-xs font-semibold text-on-surface">© 2026 씨마스고등학교 급식</p>
                <p className="text-[11px] font-medium text-on-surface-variant">건강하고 맛있는 학교 식단을 지원합니다.</p>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 8. 하단 내비게이션 바 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around bg-surface shadow-[0_-4px_16px_rgba(79,111,0,0.06)] rounded-t-2xl px-2">
        {/* 홈 */}
        <button
          onClick={() => setSelectedTab("home")}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all duration-300 ${
            selectedTab === "home"
              ? "bg-primary-container text-on-primary-container font-bold scale-100"
              : "text-on-surface-variant hover:bg-secondary-container/20"
          }`}
        >
          <Utensils className="h-5 w-5" />
          <span className="text-xs font-semibold mt-1">홈</span>
        </button>

        {/* 식단표 */}
        <button
          onClick={() => setSelectedTab("schedule")}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all duration-300 ${
            selectedTab === "schedule"
              ? "bg-primary-container text-on-primary-container font-bold scale-100"
              : "text-on-surface-variant hover:bg-secondary-container/20"
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs font-semibold mt-1">식단표</span>
        </button>

        {/* 영양계산 */}
        <button
          onClick={() => setSelectedTab("calculate")}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all duration-300 ${
            selectedTab === "calculate"
              ? "bg-primary-container text-on-primary-container font-bold scale-100"
              : "text-on-surface-variant hover:bg-secondary-container/20"
          }`}
        >
          <Calculator className="h-5 w-5" />
          <span className="text-xs font-semibold mt-1">영양계산</span>
        </button>

        {/* 프로필 */}
        <button
          onClick={() => setSelectedTab("profile")}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all duration-300 ${
            selectedTab === "profile"
              ? "bg-primary-container text-on-primary-container font-bold scale-100"
              : "text-on-surface-variant hover:bg-secondary-container/20"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs font-semibold mt-1">프로필</span>
        </button>
      </nav>
    </div>
  );
}

// 아이콘 헬퍼들
function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={props.className}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 111.063.854l-.512 1.95a.75.75 0 00.906.945l.042-.017m0 0a.75.75 0 011.28.53v-.008a.75.75 0 01-.715.752h-.424a.75.75 0 01-.715-.752v-.008a.75.75 0 01.32-.615zm-.124-3.95a1.005 1.005 0 112.01 0 1.005 1.005 0 01-2.01 0z"
      />
      <circle cx="12" cy="12" r="9"/>
    </svg>
  );
}

