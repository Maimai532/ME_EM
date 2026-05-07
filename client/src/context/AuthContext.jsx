import { createContext, useMemo, useState } from 'react'

export const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const value = useMemo(() => ({ user, setUser }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
