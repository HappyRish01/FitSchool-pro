import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Timer, 
  Zap, 
  ClipboardList, 
  ArrowRight,
  CheckCircle,
  Users,
  Target,
  Gauge
} from 'lucide-react'

export default function Instructions() {
  const navigate = useNavigate()
  const { user, markInstructionsSeen } = useAuth()

  const handleContinue = () => {
    markInstructionsSeen()
    navigate(user?.role === 'admin' ? '/admin' : '/teacher')
  }

  const features = [
    {
      title: 'Test Entry',
      icon: ClipboardList,
      color: 'bg-scindia-primary',
      description: 'Standard fitness test data entry mode',
      details: [
        'Enter data for one student at a time',
        'Record all 8 Khelo India fitness parameters',
        'Includes body measurements (height, weight, BMI)',
        'Manual entry for sit-ups, push-ups, flexibility tests',
        'Auto-saves progress after each entry'
      ],
      bestFor: 'Individual assessments & detailed data entry'
    },
    {
      title: 'Stopwatch',
      icon: Timer,
      color: 'bg-orange-500',
      description: 'Multi-lane race timing system',
      details: [
        'Time up to 8 students simultaneously',
        'Single master start for synchronized races',
        'Individual lane stop buttons for each runner',
        'Perfect for 50m dash & 600m run events',
        'Batch save all times at once'
      ],
      bestFor: 'Group running tests & race events'
    },
    {
      title: 'Rapid Fire',
      icon: Zap,
      color: 'bg-purple-500',
      description: 'Quick bulk data entry mode',
      details: [
        'Enter single test data for entire class rapidly',
        'Swipe-through interface for fast entry',
        'One test parameter at a time, all students',
        'Voice input support for hands-free entry',
        'Ideal for station-based testing setups'
      ],
      bestFor: 'High-volume testing & mass assessments'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-scindia-dark to-slate-900">
      {/* Header */}
      <div className="text-center pt-8 pb-4" style={{ margin: '0 10%' }}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white rounded-full p-1.5">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/The_Scindia_School_Logo.svg/1200px-The_Scindia_School_Logo.svg.png"
              alt="Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%231e3a5f"/><text x="50" y="55" font-size="14" fill="white" text-anchor="middle">SS</text></svg>'
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-white">FitSchool Pro</h1>
        </div>
        <p className="text-scindia-secondary text-lg">Welcome, {user?.name}!</p>
        <p className="text-slate-400 text-sm mt-1">Here's a quick guide to get you started</p>
      </div>

      {/* Main Content with 10% margin */}
      <main style={{ margin: '0 10%', paddingBottom: '2rem' }}>
        {/* Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </div>
              </div>

              {/* Details */}
              <ul className="space-y-2 mb-4">
                {feature.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>

              {/* Best For */}
              <div className="mt-auto pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-scindia-secondary" />
                  <span className="text-scindia-secondary text-sm font-medium">Best for:</span>
                </div>
                <p className="text-white text-sm mt-1">{feature.bestFor}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-scindia-secondary" />
            Quick Tips for Efficient Testing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 font-bold">1</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Create Class First</p>
                <p className="text-slate-400 text-xs">Import students via CSV for quick setup</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 font-bold">2</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Use Stopwatch for Races</p>
                <p className="text-slate-400 text-xs">Select 2-8 students per lane for group timing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-400 font-bold">3</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Rapid Fire for Stations</p>
                <p className="text-slate-400 text-xs">Enter one test type for all students quickly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-bold">4</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Export Anytime</p>
                <p className="text-slate-400 text-xs">Download data as CSV for records</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Overview */}
        <div className="bg-gradient-to-r from-scindia-primary/20 to-purple-500/20 rounded-2xl p-6 mb-8 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-scindia-secondary" />
            Recommended Testing Workflow
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4 text-center">
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-white font-medium">Body Measurements</p>
              <p className="text-slate-400 text-xs">Use Test Entry</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 hidden sm:block" />
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-white font-medium">Running Tests</p>
              <p className="text-slate-400 text-xs">Use Stopwatch</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 hidden sm:block" />
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-white font-medium">Other Tests</p>
              <p className="text-slate-400 text-xs">Use Rapid Fire</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 hidden sm:block" />
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-white font-medium">Generate Reports</p>
              <p className="text-slate-400 text-xs">View & Export</p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="inline-flex items-center gap-2 px-8 py-4 bg-scindia-secondary hover:bg-yellow-400 text-gray-900 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
          >
            Continue to Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-slate-500 text-sm mt-3">
            You can access this guide anytime from the Help menu
          </p>
        </div>
      </main>
    </div>
  )
}
