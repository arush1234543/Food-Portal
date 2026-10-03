import { useContext } from "react"
import { ThemeContext } from "../context/themeContext.jsx"
import Dark from "../assets/Dark.png"
import Light from "../assets/Light.png"
import Profile from "./Profile"
import axios from "axios"
import { AuthContext } from "../context/authContext.jsx"


const Navbar = () => {
    const { Theme, setTheme } = useContext(ThemeContext)
    const { IsAuthenticated, Email } = useContext(AuthContext)

    const sun = (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" />
            <path d="M12 2C11.6227 2.33333 11.0945 3.2 12 4M12 20C12.3773 20.3333 12.9055 21.2 12 22M19.5 4.50271C18.9685 4.46982 17.9253 4.72293 18.0042 5.99847M5.49576 17.5C5.52865 18.0315 5.27555 19.0747 4 18.9958M5.00271 4.5C4.96979 5.03202 5.22315 6.0763 6.5 5.99729M18 17.5026C18.5315 17.4715 19.5747 17.7108 19.4958 18.9168M22 12C21.6667 11.6227 20.8 11.0945 20 12M4 11.5C3.66667 11.8773 2.8 12.4055 2 11.5" />
        </svg>
    )

    const moon = (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 14.0784C20.3003 14.7189 18.9301 15.0821 17.4751 15.0821C12.7491 15.0821 8.91792 11.2509 8.91792 6.52485C8.91792 5.06986 9.28105 3.69968 9.92163 2.5C5.66765 3.49698 2.5 7.31513 2.5 11.8731C2.5 17.1899 6.8101 21.5 12.1269 21.5C16.6849 21.5 20.503 18.3324 21.5 14.0784Z" />
        </svg>
    )

    const changeTheme = async() => {
        const newTheme = Theme === "light" ? "dark" : "light"
        setTheme(newTheme)
        if(IsAuthenticated){

            const responce = await axios.post(`${import.meta.env.VITE_API_URL}/functions/change-theme`,{
                email: Email,
                newTheme
            })
        }
        return
    }

    return (
        <nav className={`sticky top-0 z-20 w-full h-[15vh] flex items-center justify-between ${Theme === "dark" ? "bg-dark-bg-surface" : "bg-light-bg-surface"}`}>
            <div className="h-full">
                <img className="h-full" src={Theme === "dark" ? Dark : Light} alt="" />
            </div>

            <div className={`${Theme === "light" ? "text-black" : "text-white"} font-bondonse text-5xl hidden sm:block`}>
                Food Portal
            </div>

            <div className="w-[180px] flex justify-center items-center gap-5">
                <span onClick={changeTheme} className="cursor-pointer">
                    {Theme === "light" ? moon : sun}
                </span>
                <Profile />
            </div>
        </nav>
    )
}

export default Navbar
