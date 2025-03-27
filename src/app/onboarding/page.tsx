'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [userType, setUserType] = useState('artist')
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [customPurpose, setCustomPurpose] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) {
        router.replace('/signin')
      } else {
        setUserId(user.id)
      }
    }

    fetchUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    const purpose =
      selectedPurpose === 'Other' ? customPurpose.trim() : selectedPurpose

    const { error } = await supabase
      .from('user_profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
        purpose,
        is_onboarded: true,
      })
      .eq('user_id', userId)

    if (error) {
      alert('Failed to save: ' + error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Welcome to WAH LAO</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">First Name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full border px-4 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Last Name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full border px-4 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">User Type</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full border px-4 py-2 rounded-md"
            >
              <option value="artist">Artist</option>
              <option value="gallery_owner">Gallery Owner</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Main purpose for using WAH LAO
            </label>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              {['Streamline client comms', 'Get content ideas', 'Other'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedPurpose(option)}
                  className={`flex-1 border px-4 py-2 rounded-md ${
                    selectedPurpose === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {selectedPurpose === 'Other' && (
              <input
                type="text"
                placeholder="Please specify..."
                value={customPurpose}
                onChange={(e) => setCustomPurpose(e.target.value)}
                required
                className="w-full border px-4 py-2 rounded-md"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Complete Onboarding
          </button>
        </form>
      </div>
    </main>
  )
}
