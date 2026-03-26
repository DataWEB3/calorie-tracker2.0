import { useState } from 'react'
import useStore from './store/useStore'
import Dashboard from './components/Dashboard'
import FoodLog from './components/FoodLog'
import WorkoutPlanner from './components/WorkoutPlanner'
import Onboarding from './components/Onboarding'
import Navigation from './components/Navigation'

function App() {
  const { user, activeTab } = useStore()
  
  if (!user) {
    return <Onboarding />
  }
  
  const renderContent = () => {
    switch (activeTab) {
      case 'food':
        return <FoodLog />
      case 'workout':
        return <WorkoutPlanner />
      case 'dashboard':
      default:
        return <Dashboard />
    }
  }
  
  return (
    <div className="min-h-screen pb-20 pt-safe">
      <div className="max-w-md mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        {renderContent()}
      </div>
      <Navigation />
    </div>
  )
}

export default App
