import { createContext } from "react";

export const AuthContext = createContext()

export default function AuthProvider(){
    const [Username, setUsername] = useState("")
    const [Email, setEmail] = useState("")
}