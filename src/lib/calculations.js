/**
 * Модуль расчёта нормы калорий и БЖУ
 * Формула Миффлина-Сан Жеора (Mifflin-St Jeor Equation)
 */

/**
 * Рассчитывает базовый уровень метаболизма (BMR)
 * @param {Object} params - Параметры пользователя
 * @param {number} params.weight - Вес в кг
 * @param {number} params.height - Рост в см
 * @param {number} params.age - Возраст в годах
 * @param {string} params.gender - Пол: 'male' | 'female'
 * @returns {number} BMR в ккал
 */
export function calculateBMR({ weight, height, age, gender }) {
  if (gender === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  }
  return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
}

/**
 * Рассчитывает дневную норму калорий с учётом активности
 * @param {Object} params - Параметры расчёта
 * @param {number} params.bmr - Базовая скорость метаболизма
 * @param {string} params.activityLevel - Уровень активности
 * @returns {number} Суточная норма калорий
 */
export function calculateTDEE({ bmr, activityLevel }) {
  const activityMultipliers = {
    sedentary: 1.2,      // Минимальная активность (офисная работа)
    light: 1.375,        // Лёгкая активность (1-3 дня в неделю)
    moderate: 1.55,      // Умеренная активность (3-5 дней в неделю)
    active: 1.725,       // Высокая активность (6-7 дней в неделю)
    veryActive: 1.9      // Очень высокая (интенсивные тренировки)
  };
  
  const multiplier = activityMultipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Рассчитывает рекомендуемое потребление БЖУ
 * @param {Object} params - Параметры расчёта
 * @param {number} params.calories - Дневная норма калорий
 * @param {string} params.goal - Цель: 'lose' | 'maintain' | 'gain'
 * @param {string} params.preset - Пресет соотношения БЖУ
 * @returns {Object} Объект с белками, жирами и углеводами в граммах
 */
export function calculateMacros({ calories, goal, preset = 'balanced' }) {
  const presets = {
    balanced: { protein: 0.3, fat: 0.3, carbs: 0.4 },
    lowCarb: { protein: 0.4, fat: 0.35, carbs: 0.25 },
    highCarb: { protein: 0.25, fat: 0.25, carbs: 0.5 },
    highProtein: { protein: 0.45, fat: 0.25, carbs: 0.3 }
  };
  
  const ratios = presets[preset] || presets.balanced;
  
  let calorieAdjustment = 0;
  switch (goal) {
    case 'lose':
      calorieAdjustment = -500;
      break;
    case 'gain':
      calorieAdjustment = 300;
      break;
    default:
      calorieAdjustment = 0;
  }
  
  const adjustedCalories = Math.max(calories + calorieAdjustment, 1200);
  
  return {
    protein: Math.round((adjustedCalories * ratios.protein) / 4),
    fat: Math.round((adjustedCalories * ratios.fat) / 9),
    carbs: Math.round((adjustedCalories * ratios.carbs) / 4),
    calories: adjustedCalories
  };
}

/**
 * Комплексная функция расчёта нормы калорий и БЖУ
 * @param {Object} userData - Данные пользователя
 * @returns {Object} Полный расчёт с BMR, TDEE и макросами
 */
export function calculateDailyNeeds(userData) {
  const { weight, height, age, gender, activityLevel, goal, macroPreset } = userData;
  
  const bmr = calculateBMR({ weight, height, age, gender });
  const tdee = calculateTDEE({ bmr, activityLevel });
  const macros = calculateMacros({ 
    calories: tdee, 
    goal: goal || 'maintain', 
    preset: macroPreset || 'balanced' 
  });
  
  return {
    bmr,
    tdee,
    targetCalories: macros.calories,
    macros
  };
}

/**
 * Рассчитывает дефицит или профицит калорий
 * @param {number} consumed - Потреблено калорий
 * @param {number} target - Целевое значение
 * @returns {Object} Информация о балансе
 */
export function calculateBalance(consumed, target) {
  const remaining = target - consumed;
  const percentage = Math.round((consumed / target) * 100);
  const status = remaining >= 0 ? 'under' : 'over';
  
  return {
    consumed,
    target,
    remaining: Math.abs(remaining),
    percentage: Math.min(percentage, 100),
    status,
    isOnTrack: Math.abs(remaining) <= 200
  };
}

/**
 * Алгоритм подбора 3-5 упражнений для тренировки
 * @param {Object} params - Параметры подбора
 * @param {string} params.goal - Цель: 'strength' | 'cardio' | 'flexibility' | 'mixed'
 * @param {number} params.duration - Длительность тренировки в минутах
 * @param {string} params.difficulty - Сложность: 'beginner' | 'intermediate' | 'advanced'
 * @returns {Array} Массив упражнений
 */
export function selectWorkoutExercises({ goal, duration, difficulty }) {
  const exercises = {
    strength: [
      { name: 'Приседания', muscleGroups: ['quads', 'glutes'], calories: 7, difficulty: 'beginner' },
      { name: 'Жим лёжа', muscleGroups: ['chest', 'triceps'], calories: 6, difficulty: 'beginner' },
      { name: 'Становая тяга', muscleGroups: ['back', 'glutes'], calories: 8, difficulty: 'intermediate' },
      { name: 'Подтягивания', muscleGroups: ['back', 'biceps'], calories: 5, difficulty: 'intermediate' },
      { name: 'Отжимания', muscleGroups: ['chest', 'triceps'], calories: 4, difficulty: 'beginner' },
      { name: 'Планка', muscleGroups: ['core'], calories: 3, difficulty: 'beginner' },
      { name: 'Тяга штанги в наклоне', muscleGroups: ['back', 'biceps'], calories: 6, difficulty: 'intermediate' },
      { name: 'Выпады', muscleGroups: ['quads', 'glutes'], calories: 5, difficulty: 'beginner' },
      { name: 'Жим гантелей', muscleGroups: ['shoulders', 'triceps'], calories: 5, difficulty: 'beginner' },
      { name: 'Подъёмы на пресс', muscleGroups: ['core'], calories: 3, difficulty: 'beginner' }
    ],
    cardio: [
      { name: 'Бег на месте', muscleGroups: ['legs', 'core'], calories: 10, difficulty: 'beginner' },
      { name: 'Прыжки через скакалку', muscleGroups: ['legs', 'shoulders'], calories: 12, difficulty: 'intermediate' },
      { name: 'Берпи', muscleGroups: ['full'], calories: 8, difficulty: 'intermediate' },
      { name: 'Альпинист', muscleGroups: ['core', 'legs'], calories: 7, difficulty: 'intermediate' },
      { name: 'Прыжки с приседанием', muscleGroups: ['legs', 'glutes'], calories: 8, difficulty: 'beginner' },
      { name: 'Высокие колени', muscleGroups: ['legs', 'core'], calories: 6, difficulty: 'beginner' },
      { name: 'Боксирование', muscleGroups: ['arms', 'core'], calories: 9, difficulty: 'intermediate' },
      { name: 'Велосипед лёжа', muscleGroups: ['legs'], calories: 7, difficulty: 'beginner' }
    ],
    flexibility: [
      { name: 'Растяжка плеч', muscleGroups: ['shoulders'], calories: 2, difficulty: 'beginner' },
      { name: 'Наклоны к ногам', muscleGroups: ['hamstrings', 'back'], calories: 2, difficulty: 'beginner' },
      { name: 'Кошка-корова', muscleGroups: ['spine', 'core'], calories: 2, difficulty: 'beginner' },
      { name: 'Бабочка', muscleGroups: ['hips'], calories: 2, difficulty: 'beginner' },
      { name: 'Скручивания лёжа', muscleGroups: ['core', 'spine'], calories: 2, difficulty: 'beginner' },
      { name: 'Поза ребёнка', muscleGroups: ['back', 'hips'], calories: 1, difficulty: 'beginner' },
      { name: 'Глубокие приседания', muscleGroups: ['hips', 'legs'], calories: 3, difficulty: 'intermediate' }
    ]
  };
  
  const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
  
  let pool = [];
  if (goal === 'mixed') {
    pool = [...exercises.strength, ...exercises.cardio];
  } else {
    pool = exercises[goal] || exercises.strength;
  }
  
  const filteredByDifficulty = pool.filter(ex => 
    difficultyOrder[ex.difficulty] <= difficultyOrder[difficulty]
  );
  
  const sorted = filteredByDifficulty.sort((a, b) => b.calories - a.calories);
  
  const exerciseCount = duration <= 15 ? 3 : duration <= 30 ? 4 : 5;
  const selected = [];
  const usedMuscles = new Set();
  
  for (const exercise of sorted) {
    if (selected.length >= exerciseCount) break;
    
    const hasNewMuscle = exercise.muscleGroups.some(m => !usedMuscles.has(m));
    if (selected.length < 2 || hasNewMuscle) {
      selected.push(exercise);
      exercise.muscleGroups.forEach(m => usedMuscles.add(m));
    }
  }
  
  const totalCalories = selected.reduce((sum, ex) => sum + ex.calories, 0);
  const estimatedDuration = Math.round(duration * 0.8);
  
  return {
    exercises: selected,
    totalCalories,
    estimatedDuration,
    muscleCoverage: Array.from(usedMuscles)
  };
}

export default {
  calculateBMR,
  calculateTDEE,
  calculateMacros,
  calculateDailyNeeds,
  calculateBalance,
  selectWorkoutExercises
};
