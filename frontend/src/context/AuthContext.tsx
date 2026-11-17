import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, UserRole, AuthContextType } from '../types/auth'

const ROLE_PROFILES: Record<UserRole, Omit<User, 'id'>> = {
  sales: {
    name: 'Amit Kumar',
    email: 'amit.kumar@fincore.in',
    role: 'sales',
    department: 'Sales & Advisory',
    branch: 'Mumbai - BKC',
  },
  manager: {
    name: 'Priya Sen',
    email: 'priya.sen@fincore.in',
    role: 'manager',
    department: 'Sales Management',
    branch: 'Western Regional Office',
  },
  admin: {
    name: 'Vikram Malhotra',
    email: 'vikram.m@fincore.in',
    role: 'admin',
    department: 'Executive Office',
    branch: 'Headquarters',
  },
  operations: {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@fincore.in',
    role: 'operations',
    department: 'Policy Operations',
    branch: 'Central Operations Hub',
  },
  finance: {
    name: 'Rajiv Mehta',
    email: 'rajiv.mehta@fincore.in',
    role: 'finance',
    department: 'Brokerage & Accounting',
    branch: 'Corporate Centre',
  },
  compliance: {
    name: 'Kavita Nair',
    email: 'kavita.nair@fincore.in',
    role: 'compliance',
    department: 'IRDAI Regulatory Compliance',
    branch: 'Legal & Compliance Bureau',
  },
  customer: {
    name: 'Rahul Gupta',
    email: 'rahul.gupta@example.com',
    role: 'customer',
  },
}

const STORAGE_KEY = 'fincore_auth_user'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Fallback
    }
    // Default to a sales employee so employee workspace can be evaluated immediately
    return {
      id: 'emp-001',
      ...ROLE_PROFILES.sales,
    }
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const login = (role: UserRole, email?: string) => {
    setIsLoading(true)
    const profile = ROLE_PROFILES[role]
    const newUser: User = {
      id: role === 'customer' ? 'cust-101' : `emp-${role.slice(0, 3)}-101`,
      ...profile,
      email: email || profile.email,
    }
    setUser(newUser)
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
  }

  const switchRole = (role: UserRole) => {
    const profile = ROLE_PROFILES[role]
    const newUser: User = {
      id: role === 'customer' ? 'cust-101' : `emp-${role.slice(0, 3)}-101`,
      ...profile,
    }
    setUser(newUser)
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
