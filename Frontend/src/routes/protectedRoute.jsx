import { useContext, useEffect } from 'react'
import { AuthContext } from '../context/authContext.jsx'
import { useNavigate } from 'react-router-dom'

const ProtectedRoute = ({children}) => {
    const { IsAuthenticated } = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        if(!IsAuthenticated) {navigate("/register")}
    }, [])


    return children
}

export default ProtectedRoute