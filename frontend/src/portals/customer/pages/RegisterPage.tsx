import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { Logo } from '../../../components/shared/Logo'
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(true)

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    // Registers customer and logs them in
    login('customer', email)
    navigate('/')
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E8EF] p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo withTagline={true} />
          </div>
          <h1 className="text-xl font-bold text-[#142D4E] font-['Manrope'] mt-4">
            Create Your Customer Account
          </h1>
          <p className="text-xs text-[#687788]">
            Save comparison quotes and track your life insurance proposals securely.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#182536] mb-1">
              Full Legal Name (as per PAN) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Gupta"
              className="w-full h-9 px-3 rounded-lg border border-[#E2E8EF] bg-white text-[#182536] focus:outline-none focus:border-[#142D4E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#182536] mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full h-9 px-3 rounded-lg border border-[#E2E8EF] bg-white text-[#182536] focus:outline-none focus:border-[#142D4E]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#182536] mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                className="w-full h-9 px-3 rounded-lg border border-[#E2E8EF] bg-white text-[#182536] focus:outline-none focus:border-[#142D4E]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#182536] mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul.gupta@example.com"
              className="w-full h-9 px-3 rounded-lg border border-[#E2E8EF] bg-white text-[#182536] focus:outline-none focus:border-[#142D4E]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#182536] mb-1">Create Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full h-9 px-3 rounded-lg border border-[#E2E8EF] bg-white text-[#182536] focus:outline-none focus:border-[#142D4E]"
            />
          </div>

          <div className="flex items-start gap-2 pt-1 text-[11px] text-[#687788]">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-[#142D4E]"
              required
            />
            <label htmlFor="terms" className="leading-normal">
              I agree to the <Link to="/about#terms" className="text-[#142D4E] underline">Terms of Use</Link> and authorize Fincore brokers to contact me regarding life insurance policy comparisons.
            </label>
          </div>

          <button
            type="submit"
            disabled={!agreed}
            className="w-full py-2.5 rounded-lg bg-[#16856D] hover:bg-[#0F6B57] text-white font-semibold transition-colors shadow-xs disabled:opacity-50"
          >
            Create Customer Account
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#687788]">
          <span>Already have an account? </span>
          <Link to="/login" className="text-[#142D4E] font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
