import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateDailyNeeds, calculateBalance } from '../lib/calculations';

// Утилиты
const getTodayDate = () => new Date().toISOString().split('T')[0];
const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toISOString().split('T')[0];
};

// Достижения
const achievementsList = [
  { id: 'first_food', name: 'Первая запись', desc: 'Добавьте первый продукт', icon: 'UtensilsCrossed' },
  { id: 'first_workout', name: 'Начало положено', desc: 'Завершите первую тренировку', icon: 'Dumbbell' },
  { id: 'streak_3', name: 'Тройка', desc: '3 дня подряд', icon: 'Flame' },
  { id: 'streak_7', name: 'Неделя', desc: '7 дней подряд', icon: 'Trophy' },
  { id: 'streak_30', name: 'Месяц', desc: '30 дней подряд', icon: 'Crown' },
  { id: 'calories_goal', name: 'В цель', desc: 'Уложитесь в калории', icon: 'Target' },
  { id: 'water_2l', name: 'Водохлёб', desc: 'Выпейте 2л воды за день', icon: 'Droplets' },
  { id: 'workout_10', name: 'Спортсмен', desc: '10 тренировок', icon: 'Medal' },
];

const useStore = create(
  persist(
    (set, get) => ({
      // User data
      user: null,
      
      // Food log
      foodLog: [],
      todayEntries: [],
      
      // Workout plans
      workoutPlans: [],
      todayWorkouts: [],
      
      // Water tracking
      waterLog: [],
      waterGoal: 2000, // мл
      
      // Weight tracking
      weightLog: [],
      
      // Sleep tracking
      sleepLog: [],
      
      // Stats
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      achievements: [],
      totalWorkouts: 0,
      
      // Active tab
      activeTab: 'dashboard',
      
      // ===== USER =====
      setUser: (userData) => {
        const needs = calculateDailyNeeds(userData);
        set({ 
          user: { ...userData, ...needs },
          activeTab: 'dashboard'
        });
      },
      
      // ===== FOOD =====
      addFoodEntry: (entry) => {
        const newEntry = {
          ...entry,
          id: Date.now(),
          timestamp: new Date().toISOString()
        };
        
        set((state) => ({
          foodLog: [newEntry, ...state.foodLog],
          todayEntries: [newEntry, ...state.todayEntries]
        }));
        
        // Проверка достижений
        get().checkAchievements();
      },
      
      removeFoodEntry: (id) => {
        set((state) => ({
          foodLog: state.foodLog.filter(e => e.id !== id),
          todayEntries: state.todayEntries.filter(e => e.id !== id)
        }));
      },
      
      clearTodayEntries: () => set({ todayEntries: [] }),
      
      // ===== WATER =====
      addWater: (amount) => {
        const entry = {
          id: Date.now(),
          amount,
          timestamp: new Date().toISOString(),
          date: getTodayDate()
        };
        
        set((state) => ({
          waterLog: [...state.waterLog, entry]
        }));
        
        get().checkAchievements();
      },
      
      getTodayWater: () => {
        const today = getTodayDate();
        return get().waterLog
          .filter(w => w.date === today)
          .reduce((sum, w) => sum + w.amount, 0);
      },
      
      setWaterGoal: (goal) => set({ waterGoal: goal }),
      
      // ===== WEIGHT =====
      addWeight: (weight) => {
        const entry = {
          id: Date.now(),
          weight,
          date: getTodayDate(),
          timestamp: new Date().toISOString()
        };
        
        set((state) => ({
          weightLog: [...state.weightLog, entry].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
          )
        }));
      },
      
      getWeightHistory: (days = 30) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return get().weightLog.filter(w => new Date(w.date) >= cutoff);
      },
      
      // ===== SLEEP =====
      addSleep: (hours, quality) => {
        const entry = {
          id: Date.now(),
          hours,
          quality,
          date: getTodayDate(),
          timestamp: new Date().toISOString()
        };
        
        set((state) => ({
          sleepLog: [...state.sleepLog, entry]
        }));
      },
      
      getTodaySleep: () => {
        const today = getTodayDate();
        return get().sleepLog.find(s => s.date === today);
      },
      
      // ===== WORKOUTS =====
      addWorkoutPlan: (plan) => {
        const today = getTodayDate();
        const state = get();
        
        const todayWorkoutsList = state.todayWorkouts.filter(w => w.date === today);
        
        if (todayWorkoutsList.length >= 3) {
          return { success: false, message: 'Max 3 workouts per day' };
        }
        
        const newPlan = {
          ...plan,
          id: Date.now(),
          date: today,
          completed: false,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          workoutPlans: [newPlan, ...state.workoutPlans],
          todayWorkouts: [newPlan, ...state.todayWorkouts],
          totalWorkouts: state.totalWorkouts + 1
        }));
        
        get().checkAchievements();
        return { success: true };
      },
      
      completeWorkout: (id) => {
        set((state) => ({
          todayWorkouts: state.todayWorkouts.map(w => 
            w.id === id ? { ...w, completed: true, completedAt: new Date().toISOString() } : w
          ),
          workoutPlans: state.workoutPlans.map(w => 
            w.id === id ? { ...w, completed: true } : w
          )
        }));
        
        get().checkAchievements();
      },
      
      removeWorkout: (id) => {
        set((state) => ({
          todayWorkouts: state.todayWorkouts.filter(w => w.id !== id),
          workoutPlans: state.workoutPlans.filter(w => w.id !== id)
        }));
      },
      
      getTodayWorkouts: () => {
        const today = getTodayDate();
        return get().todayWorkouts.filter(w => w.date === today);
      },
      
      getTodayWorkoutCount: () => get().getTodayWorkouts().length,
      
      getAvailableTime: () => {
        const today = getTodayDate();
        const todayWorkouts = get().todayWorkouts.filter(w => w.date === today);
        const usedTime = todayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        return Math.max(0, 60 - usedTime);
      },
      
      // ===== STATS =====
      updateStreak: () => {
        const today = getTodayDate();
        const { lastActiveDate, currentStreak, longestStreak } = get();
        
        if (lastActiveDate === today) return;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        let newStreak = currentStreak;
        if (lastActiveDate === yesterdayStr) {
          newStreak = currentStreak + 1;
        } else if (lastActiveDate !== today) {
          newStreak = 1;
        }
        
        set({
          currentStreak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
          lastActiveDate: today
        });
        
        get().checkAchievements();
      },
      
      checkAchievements: () => {
        const state = get();
        const newAchievements = [...state.achievements];
        const today = getTodayDate();
        
        // Проверка достижений
        if (state.foodLog.length >= 1 && !newAchievements.includes('first_food')) {
          newAchievements.push('first_food');
        }
        
        if (state.totalWorkouts >= 1 && !newAchievements.includes('first_workout')) {
          newAchievements.push('first_workout');
        }
        
        if (state.currentStreak >= 3 && !newAchievements.includes('streak_3')) {
          newAchievements.push('streak_3');
        }
        
        if (state.currentStreak >= 7 && !newAchievements.includes('streak_7')) {
          newAchievements.push('streak_7');
        }
        
        if (state.currentStreak >= 30 && !newAchievements.includes('streak_30')) {
          newAchievements.push('streak_30');
        }
        
        if (state.totalWorkouts >= 10 && !newAchievements.includes('workout_10')) {
          newAchievements.push('workout_10');
        }
        
        const todayWater = state.waterLog
          .filter(w => w.date === today)
          .reduce((sum, w) => sum + w.amount, 0);
        if (todayWater >= 2000 && !newAchievements.includes('water_2l')) {
          newAchievements.push('water_2l');
        }
        
        if (newAchievements.length !== state.achievements.length) {
          set({ achievements: newAchievements });
        }
      },
      
      // ===== STATS =====
      getTodayStats: () => {
        const state = get();
        const { user, todayEntries } = state;
        
        if (!user) return null;
        
        const consumed = todayEntries.reduce((sum, entry) => sum + entry.calories, 0);
        const protein = todayEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0);
        const fat = todayEntries.reduce((sum, entry) => sum + (entry.fat || 0), 0);
        const carbs = todayEntries.reduce((sum, entry) => sum + (entry.carbs || 0), 0);
        
        const balance = calculateBalance(consumed, user.targetCalories);
        
        const todayWater = state.waterLog
          .filter(w => w.date === getTodayDate())
          .reduce((sum, w) => sum + w.amount, 0);
        
        return {
          consumed,
          target: user.targetCalories,
          remaining: balance.remaining,
          percentage: balance.percentage,
          protein: { current: protein, target: user.macros.protein },
          fat: { current: fat, target: user.macros.fat },
          carbs: { current: carbs, target: user.macros.carbs },
          entries: todayEntries,
          water: { current: todayWater, target: state.waterGoal },
          streak: state.currentStreak,
          achievements: state.achievements,
          workouts: state.todayWorkouts
        };
      },
      
      getWeeklyStats: () => {
        const state = get();
        const weekStart = getWeekStart();
        
        const weekFood = state.foodLog.filter(f => f.date >= weekStart);
        const weekWorkouts = state.workoutPlans.filter(w => w.date >= weekStart && w.completed);
        
        const dailyCalories = {};
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          dailyCalories[dateStr] = weekFood
            .filter(f => f.date === dateStr)
            .reduce((sum, f) => sum + f.calories, 0);
        }
        
        return {
          totalCalories: weekFood.reduce((s, f) => s + f.calories, 0),
          avgCalories: Math.round(weekFood.reduce((s, f) => s + f.calories, 0) / 7),
          totalWorkouts: weekWorkouts.length,
          daysActive: Object.keys(dailyCalories).filter(d => dailyCalories[d] > 0).length
        };
      },
      
      // ===== NAVIGATION =====
      setActiveTab: (tab) => {
        set({ activeTab: tab });
        get().updateStreak();
      },
      
      // ===== RESET =====
      resetData: () => set({
        user: null,
        foodLog: [],
        todayEntries: [],
        workoutPlans: [],
        todayWorkouts: [],
        waterLog: [],
        weightLog: [],
        sleepLog: [],
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        achievements: [],
        totalWorkouts: 0,
        activeTab: 'dashboard'
      })
    }),
    {
      name: 'calorie-tracker-storage',
      partialize: (state) => ({
        user: state.user,
        foodLog: state.foodLog,
        workoutPlans: state.workoutPlans,
        todayWorkouts: state.todayWorkouts,
        waterLog: state.waterLog,
        weightLog: state.weightLog,
        sleepLog: state.sleepLog,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastActiveDate: state.lastActiveDate,
        achievements: state.achievements,
        totalWorkouts: state.totalWorkouts,
        waterGoal: state.waterGoal
      })
    }
  )
);

export default useStore;
export { achievementsList };