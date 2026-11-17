export type UserRole =
  | 'customer'
  | 'sales'
  | 'manager'
  | 'admin'
  | 'operations'
  | 'finance'
  | 'compliance'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  branch?: string
  department?: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (role: UserRole, email?: string) => void
  logout: () => void
  switchRole: (role: UserRole) => void
}
