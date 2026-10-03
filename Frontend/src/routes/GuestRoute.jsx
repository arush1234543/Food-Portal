import { Navigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../context/authContext"

export default function GuestRoute({ children }) {
    const { IsAuthenticated, AuthChecked } = useContext(AuthContext)

    if (!AuthChecked) return null

    return IsAuthenticated ? <Navigate to="/" replace /> : children
}