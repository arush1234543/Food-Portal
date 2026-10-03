import React, { useContext, useRef } from 'react'
import { ThemeContext } from '../context/themeContext'
import { AuthContext } from '../context/authContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const { setEmail, setIsAuthenticated, setUsername, setVerified, setAccessToken, setAuthError, AuthError, setUserId } = useContext(AuthContext)
    const { Theme, setTheme } = useContext(ThemeContext)
    const navigate = useNavigate()
    const isDark = Theme === "dark"

    const emailRef = useRef()
    const passwordRef = useRef()

    const loginHandler = async (e) => {
        e.preventDefault()

        const email = emailRef.current.value.trim()
        const password = passwordRef.current.value

        if (!email || !password) {
            setAuthError("Email or password is missing")
            return
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
                email,
                password
            }, { withCredentials: true })


            setAccessToken(response.data.accessToken);
            setEmail(response.data.user.email);
            setUsername(response.data.user.username);
            setIsAuthenticated(true);
            setVerified(response.data.user.verified);
            setTheme(response.data.user.theme);
            setUserId(response.data.user.UserId)
            setAuthError("")
            navigate("/")


        } catch (err) {
            setAuthError(err.response?.data?.message || err.message)
        }
    }

    const changeTheme = () => {
        setTheme(isDark ? "light" : "dark")
    }

    const baseInputClasses = [
        "!m-0 h-12 !px-4 w-full rounded-xl border",
        "font-poppins text-sm outline-none transition-all duration-200",
        "focus:ring-2",
        "[&:-webkit-autofill]:[transition:background-color_9999s_ease-out_0s]",
    ].join(" ");

    const themeInputClasses = isDark
        ? [
            "border-dark-border bg-dark-bg-surface text-dark-text-main",
            "placeholder:text-dark-text-subdim",
            "focus:border-dark-accent-blue focus:ring-dark-accent-blue/20",
            "[&:-webkit-autofill]:![-webkit-text-fill-color:var(--color-dark-text-main)]",
            "[&:-webkit-autofill]:![box-shadow:inset_0_0_0_1000px_var(--color-dark-bg-surface)]",
        ].join(" ")
        : [
            "border-light-border bg-light-bg-surface text-light-text-main",
            "placeholder:text-light-text-subdim",
            "focus:border-light-accent-blue focus:ring-light-accent-blue/20",
            "[&:-webkit-autofill]:![-webkit-text-fill-color:var(--color-light-text-main)]",
            "[&:-webkit-autofill]:![box-shadow:inset_0_0_0_1000px_var(--color-light-bg-surface)]",
        ].join(" ");

    const inputClass = `${baseInputClasses} ${themeInputClasses}`;

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

    return (
        <main className={`relative min-h-screen w-full !m-0 !p-0 overflow-hidden flex items-center justify-center transition-colors duration-500 ${isDark ? "bg-dark-bg-main" : "bg-light-bg-main"}`}>
            <div className={`absolute -top-32 -left-32 h-80 w-80 rounded-full blur-3xl opacity-20 ${isDark ? "bg-dark-accent-blue" : "bg-light-accent-blue"}`} />
            <div className={`absolute -bottom-32 -right-32 h-80 w-80 rounded-full blur-3xl opacity-20 ${isDark ? "bg-dark-accent-blue" : "bg-light-accent-blue"}`} />

            <button type="button" onClick={changeTheme} className={`absolute top-6 right-6 z-10 h-11 w-11 !m-0 !p-0 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-105 ${isDark ? "border-dark-border bg-dark-bg-card text-dark-text-main hover:bg-dark-bg-surface" : "border-light-border bg-light-bg-card text-light-text-main hover:bg-light-bg-surface"}`}>
                <span className="text-lg">{isDark ? sun : moon}</span>
            </button>

            <section className={`relative z-10 w-[380px] max-w-[calc(100%-32px)] rounded-3xl border !m-0 !p-7 shadow-2xl backdrop-blur-2xl transition-all duration-500 ${isDark ? "border-dark-border/80 bg-dark-bg-card/90" : "border-light-border bg-light-bg-card/90"}`}>
                <div className="!m-0 !mb-7 text-center">
                    <h1 className={`!m-0 font-bondonse text-3xl tracking-wide ${isDark ? "text-dark-text-main" : "text-light-text-main"}`}>
                        Welcome Back
                    </h1>
                    <p className={`!m-0 !mt-2 font-poppins text-sm ${isDark ? "text-dark-text-subdim" : "text-light-text-subdim"}`}>
                        Login to continue exploring Food Portal.
                    </p>
                </div>

                {AuthError && <div className="text-red-500 text-md font-bold font-poppins !-mt-2 !mb-3">{AuthError}</div>}

                <form className="!m-0 !p-0 flex flex-col gap-4" onSubmit={loginHandler}>
                    <div className="!m-0 !p-0">
                        <label className={`block !m-0 !mb-2 font-poppins text-xs font-medium ${isDark ? "text-dark-text-dim" : "text-light-text-dim"}`}>
                            Email
                        </label>
                        <input type="email" placeholder="Enter your email" ref={emailRef} autoComplete="email" className={inputClass} />
                    </div>

                    <div className="!m-0 !p-0">
                        <label className={`block !m-0 !mb-2 font-poppins text-xs font-medium ${isDark ? "text-dark-text-dim" : "text-light-text-dim"}`}>
                            Password
                        </label>
                        <input type="password" placeholder="Enter your password" ref={passwordRef} autoComplete="current-password" className={inputClass} />
                    </div>

                    <button type="submit" className={`h-12 w-full !m-0 !mt-2 rounded-xl font-poppins text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 ${isDark ? "bg-dark-accent-blue hover:bg-dark-accent-blue-hover" : "bg-light-accent-blue hover:bg-light-accent-blue-hover"}`}>
                        Login
                    </button>
                </form>

                <div className="flex items-center gap-3 !m-0 !my-5">
                    <div className={`h-px flex-1 ${isDark ? "bg-dark-border" : "bg-light-border"}`} />
                    <span className={`font-poppins text-xs ${isDark ? "text-dark-text-subdim" : "text-light-text-subdim"}`}>or</span>
                    <div className={`h-px flex-1 ${isDark ? "bg-dark-border" : "bg-light-border"}`} />
                </div>

                <p className={`!m-0 text-center font-poppins text-sm ${isDark ? "text-dark-text-subdim" : "text-light-text-subdim"}`}>
                    Don't have an account?
                    <button type="button" onClick={() => navigate("/register")} className={`!m-0 !ml-1 font-semibold transition-colors ${isDark ? "text-dark-accent-blue hover:text-dark-accent-blue-hover" : "text-light-accent-blue hover:text-light-accent-blue-hover"}`}>
                        Register
                    </button>
                </p>
            </section>
        </main>
    )
}

export default Login
