import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Utensils, Users, MessageSquare, Vote } from 'lucide-react'
import NameEntryForm from '@/components/dinner/NameEntryForm'
import { getVisitorName } from '@/lib/visitor'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const navigate = useNavigate()

  // Check if user already has a name, redirect to chat
  useEffect(() => {
    const name = getVisitorName()
    if (name) {
      navigate({ to: '/chat' })
    }
  }, [navigate])

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Group Chat',
      description: 'Chat with friends in real-time',
    },
    {
      icon: <Utensils className="w-6 h-6" />,
      title: 'AI Assistant',
      description: 'Get restaurant recommendations with @ai',
    },
    {
      icon: <Vote className="w-6 h-6" />,
      title: 'Live Voting',
      description: 'Vote on shortlisted restaurants together',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Multiplayer',
      description: 'Everything syncs instantly for everyone',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <Utensils className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Dinner{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text">
              Plans
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-lg mx-auto">
            Can't decide where to eat? Chat with friends, get AI
            recommendations, and vote on your favorites!
          </p>
        </div>

        <NameEntryForm />

        {/* Features */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-4 rounded-xl bg-gray-800/30 border border-gray-800"
            >
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mx-auto mb-3 text-amber-500">
                {feature.icon}
              </div>
              <h3 className="text-white font-medium text-sm mb-1">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-xs">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>
          Built with{' '}
          <span className="text-amber-500">TanStack Start</span>,{' '}
          <span className="text-amber-500">TanStack AI</span>, and{' '}
          <span className="text-amber-500">Convex</span>
        </p>
      </footer>
    </div>
  )
}
