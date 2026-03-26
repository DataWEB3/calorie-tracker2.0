import { motion } from 'framer-motion'
import { Home, Utensils, Dumbbell, Settings, RotateCcw } from 'lucide-react'
import useStore from '../store/useStore'

const tabs = [
  { id: 'dashboard', label: 'Главная', icon: Home },
  { id: 'food', label: 'Питание', icon: Utensils },
  { id: 'workout', label: 'Тренировки', icon: Dumbbell },
]

export default function Navigation() {
  const { activeTab, setActiveTab, resetData } = useStore()
  
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-dark-900/90 backdrop-blur-xl border-t border-dark-700/50 pb-safe"
    >
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-4">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center gap-1 p-2 transition-colors ${
                isActive ? 'text-primary-400' : 'text-dark-500'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-2 w-10 h-1 bg-primary-500 rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="w-6 h-6" />
              <span className="text-xs">{tab.label}</span>
            </button>
          )
        })}
        
        <button
          onClick={resetData}
          className="flex flex-col items-center gap-1 p-2 text-dark-500 hover:text-red-400 transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
          <span className="text-xs">Сброс</span>
        </button>
      </div>
    </motion.div>
  )
}