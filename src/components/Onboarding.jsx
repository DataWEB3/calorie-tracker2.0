import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, User, Activity, Target, Flame, ArrowLeft, ArrowRight } from 'lucide-react'
import useStore from '../store/useStore'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export default function Onboarding() {
  const setUser = useStore((state) => state.setUser)
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    weight: 70,
    height: 175,
    age: 30,
    activityLevel: 'moderate',
    goal: 'maintain',
    macroPreset: 'balanced'
  })
  
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)
  
  const handleSubmit = () => {
    setUser(formData)
  }
  
  const steps = [
    // Step 0: Welcome
    <motion.div key="welcome" {...fadeIn} className="text-center">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center">
        <Flame className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-3xl font-bold mb-2">CalorieTrack Pro</h1>
      <p className="text-dark-400 text-lg mb-8">Ваш персональный тренер питания</p>
      <button onClick={nextStep} className="btn-primary w-full flex items-center justify-center gap-2">
        Начать <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>,
    
    // Step 1: Basic Info
    <motion.div key="basic" {...fadeIn}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Основные данные</h2>
          <p className="text-dark-400 text-sm">Расскажите о себе</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-dark-400 mb-2">Ваше имя</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Как к вам обращаться?"
            className="input-field"
          />
        </div>
        
        <div>
          <label className="block text-sm text-dark-400 mb-2">Пол</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateField('gender', 'male')}
              className={`p-4 rounded-xl border transition-all ${
                formData.gender === 'male' 
                  ? 'border-primary-500 bg-primary-500/10 text-white' 
                  : 'border-dark-700 bg-dark-800/30 text-dark-400'
              }`}
            >
              Мужской
            </button>
            <button
              onClick={() => updateField('gender', 'female')}
              className={`p-4 rounded-xl border transition-all ${
                formData.gender === 'female' 
                  ? 'border-primary-500 bg-primary-500/10 text-white' 
                  : 'border-dark-700 bg-dark-800/30 text-dark-400'
              }`}
            >
              Женский
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-dark-400 mb-2">Вес (кг)</label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => updateField('weight', Number(e.target.value))}
              className="input-field text-center"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-400 mb-2">Рост (см)</label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => updateField('height', Number(e.target.value))}
              className="input-field text-center"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-400 mb-2">Возраст</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => updateField('age', Number(e.target.value))}
              className="input-field text-center"
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <button onClick={prevStep} className="btn-secondary flex-1">Назад</button>
        <button onClick={nextStep} className="btn-primary flex-1">Далее</button>
      </div>
    </motion.div>,
    
    // Step 2: Activity
    <motion.div key="activity" {...fadeIn}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-accent-500/20 rounded-xl flex items-center justify-center">
          <Activity className="w-5 h-5 text-accent-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Уровень активности</h2>
          <p className="text-dark-400 text-sm">Насколько вы активны?</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {[
          { value: 'sedentary', label: 'Сидячий', desc: 'Офисная работа, минимум движения' },
          { value: 'light', label: 'Лёгкий', desc: '1-3 тренировки в неделю' },
          { value: 'moderate', label: 'Умеренный', desc: '3-5 тренировок в неделю' },
          { value: 'active', label: 'Активный', desc: '6-7 тренировок в неделю' },
          { value: 'veryActive', label: 'Очень активный', desc: 'Интенсивные тренировки' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => updateField('activityLevel', option.value)}
            className={`w-full p-4 rounded-xl border text-left transition-all ${
              formData.activityLevel === option.value
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-dark-700 bg-dark-800/30 hover:border-dark-600'
            }`}
          >
            <div className="font-medium">{option.label}</div>
            <div className="text-dark-400 text-sm">{option.desc}</div>
          </button>
        ))}
      </div>
      
      <div className="flex gap-3 mt-6">
        <button onClick={prevStep} className="btn-secondary flex-1">Назад</button>
        <button onClick={nextStep} className="btn-primary flex-1">Далее</button>
      </div>
    </motion.div>,
    
    // Step 3: Goal
    <motion.div key="goal" {...fadeIn}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
          <Target className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Ваша цель</h2>
          <p className="text-dark-400 text-sm">Чего хотите достичь?</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {[
          { value: 'lose', label: 'Похудеть', desc: 'Создать дефицит калорий', color: 'red' },
          { value: 'maintain', label: 'Поддержать вес', desc: 'Сохранить текущий вес', color: 'blue' },
          { value: 'gain', label: 'Набрать массу', desc: 'Создать профицит калорий', color: 'green' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => updateField('goal', option.value)}
            className={`w-full p-4 rounded-xl border text-left transition-all ${
              formData.goal === option.value
                ? `border-${option.color}-500 bg-${option.color}-500/10`
                : 'border-dark-700 bg-dark-800/30 hover:border-dark-600'
            }`}
          >
            <div className="font-medium">{option.label}</div>
            <div className="text-dark-400 text-sm">{option.desc}</div>
          </button>
        ))}
      </div>
      
      <div className="mt-6">
        <label className="block text-sm text-dark-400 mb-2">Пресет БЖУ</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'balanced', label: 'Баланс' },
            { value: 'lowCarb', label: 'Низкие углеводы' },
            { value: 'highCarb', label: 'Высокие углеводы' },
            { value: 'highProtein', label: 'Высокий белок' }
          ].map((preset) => (
            <button
              key={preset.value}
              onClick={() => updateField('macroPreset', preset.value)}
              className={`p-2 rounded-lg text-xs transition-all ${
                formData.macroPreset === preset.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800/30 text-dark-400 border border-dark-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <button onClick={prevStep} className="btn-secondary flex-1">Назад</button>
        <button onClick={handleSubmit} className="btn-primary flex-1">Завершить</button>
      </div>
    </motion.div>
  ]
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-6">
          <AnimatePresence mode="wait">
            {steps[step]}
          </AnimatePresence>
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'w-6 bg-primary-500' : 'bg-dark-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
