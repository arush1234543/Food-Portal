import { createContext, useState, useEffect, useContext } from "react"
import axios from "axios"
import { ThemeContext } from "./themeContext.jsx"

export const AuthContext = createContext()

export default function AuthProvider({ children }) {
    const { setTheme } = useContext(ThemeContext)
    const [Username, setUsername] = useState("")
    const [Email, setEmail] = useState("")
    const [IsAuthenticated, setIsAuthenticated] = useState(false)
    const [AuthChecked, setAuthChecked] = useState(false)
    const [Verified, setVerified] = useState(false)
    const [AccessToken, setAccessToken] = useState("")
    const [AuthError, setAuthError] = useState("")
    const [UserId, setUserId] = useState("")

     useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
                    { withCredentials: true }
                )
                

                if (!data.success || !data.accessToken || !data.user) {
                    return
                }

                setAccessToken(data.accessToken)
                setEmail(data.user.email)
                setUsername(data.user.username)
                setIsAuthenticated(true)
                setVerified(data.user.verified)
                setTheme(data.user.theme)
                setUserId(data.user.UserId)
                setAuthError("")

            } catch (error) {

                setAccessToken("")
                setEmail("")
                setUsername("")
                setUserId("")
                setVerified(false)
                setIsAuthenticated(false)
            } finally {
                setAuthChecked(true)
            }
        }

        fetchData()
    }, [])


    return (
        <AuthContext.Provider value={{ Username, setUsername, Email, setEmail, IsAuthenticated, setIsAuthenticated, AuthChecked, Verified, setVerified, AccessToken, setAccessToken, AuthError, setAuthError, UserId, setUserId }}>
            {children}
        </AuthContext.Provider>
    )
}