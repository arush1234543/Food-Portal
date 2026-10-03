import React, { useContext, useRef, useState } from "react"
import { ThemeContext } from "../context/themeContext"
import { AuthContext } from "../context/authContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const Verify = () => {
    const { Theme, setTheme } = useContext(ThemeContext)
    const { AuthError, setAuthError, Email, setAccessToken, setEmail, setUsername, setIsAuthenticated, setVerified, setUserId } = useContext(AuthContext)
    // setAuthError("")
    const navigate = useNavigate()
    const isDark = Theme === "dark"
    const [otp, setOtp] = useState(Array(6).fill(""))
    const inputRefs = useRef([])

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

    const changeTheme = () => {
        setTheme(isDark ? "light" : "dark")
    }

    const handleChange = (value, index) => {
        if (!/^\d?$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        setAuthError("")

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        if (!pasted) return

        const newOtp = Array(6).fill("")
        pasted.split("").forEach((digit, index) => {
            newOtp[index] = digit
        })

        setOtp(newOtp)
        setAuthError("")
        inputRefs.current[Math.min(pasted.length, 6) - 1]?.focus()
    }

    const verifyHandler = async (e) => {
        e.preventDefault()
        const code = otp.join("")

        if (code.length !== 6) {
            setAuthError("Please enter the complete verification code")
            return
        }

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-email`, {
                email: Email,
                otp: code
            },{
                withCredentials: true   
            })

            setAccessToken(data.accessToken)
            setEmail(data.user.email)
            setUsername(data.user.username)
            setIsAuthenticated(true)
            setVerified(data.user.verified)
            setTheme(data.user.theme)
            setUserId(data.user.UserId)
            setAuthError("")
            navigate("/")
        } catch (error) {
            setAuthError(error.response?.data?.message || "Verification failed")
        }
    }

    const resendHandler = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/resend-otp`, { email })
            setAuthError("")
        } catch (error) {
            setAuthError(error.response?.data?.message || "Failed to resend verification code")
        }
    }

    const inputClass = isDark
        ? "border-dark-border bg-dark-bg-surface text-white placeholder:text-dark-text-subdim focus:border-dark-accent-blue focus:ring-dark-accent-blue/20"
        : "border-light-border bg-light-bg-surface text-light-text-main placeholder:text-light-text-subdim focus:border-light-accent-blue focus:ring-light-accent-blue/20"

    return (
        <main className={`relative min-h-screen w-full !m-0 !p-0 overflow-hidden flex items-center justify-center transition-colors duration-500 ${isDark ? "bg-dark-bg-main" : "bg-light-bg-main"}`}>
            <div className={`absolute -top-32 -left-32 h-80 w-80 rounded-full blur-3xl opacity-20 ${isDark ? "bg-dark-accent-blue" : "bg-light-accent-blue"}`} />
            <div className={`absolute -bottom-32 -right-32 h-80 w-80 rounded-full blur-3xl opacity-20 ${isDark ? "bg-dark-accent-blue" : "bg-light-accent-blue"}`} />

            <button type="button" onClick={changeTheme} className={`absolute top-6 right-6 z-10 h-11 w-11 !m-0 !p-0 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-105 ${isDark ? "border-dark-border bg-dark-bg-card text-dark-text-main hover:bg-dark-bg-surface" : "border-light-border bg-light-bg-card text-light-text-main hover:bg-light-bg-surface"}`}>
                <span className="text-lg">{isDark ? sun : moon}</span>
            </button>

            <section className={`relative z-10 w-[430px] max-w-[calc(100%-32px)] rounded-3xl border !m-0 !p-7 shadow-2xl backdrop-blur-2xl transition-all duration-500 ${isDark ? "border-dark-border/80 bg-dark-bg-card/90" : "border-light-border bg-light-bg-card/90"}`}>
                <div className="!m-0 !mb-7 text-center">
                    <h1 className={`!m-0 font-bondonse text-3xl tracking-wide ${isDark ? "text-dark-text-main" : "text-light-text-main"}`}>
                        Verify Your Email
                    </h1>
                    <p className={`!m-0 !mt-2 font-poppins text-sm ${isDark ? "text-dark-text-subdim" : "text-light-text-subdim"}`}>
                        Enter the 6-digit code sent to your email.
                    </p>
                </div>

                {AuthError && <div className="text-red-500 text-md font-bold font-poppins !-mt-2 !mb-3">{AuthError}</div>}

                <form className="!m-0 !p-0 flex flex-col gap-5" onSubmit={verifyHandler}>
                    <div className="flex justify-center gap-2.5">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                autoComplete={index === 0 ? "one-time-code" : "off"}
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onPaste={handlePaste}
                                className={`!m-0 h-14 w-12 rounded-xl border text-center font-poppins text-xl font-semibold outline-none transition-all duration-200 focus:ring-2 ${inputClass}`}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={otp.join("").length !== 6}
                        className={`h-12 w-full !m-0 rounded-xl font-poppins text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 ${isDark ? "bg-dark-accent-blue hover:bg-dark-accent-blue-hover" : "bg-light-accent-blue hover:bg-light-accent-blue-hover"}`}
                    >
                        Verify Email
                    </button>
                </form>

                <p className={`!m-0 !mt-5 text-center font-poppins text-sm ${isDark ? "text-dark-text-subdim" : "text-light-text-subdim"}`}>
                    Didn't receive the code?
                    <button type="button" onClick={resendHandler} className={`!m-0 !ml-1 font-semibold transition-colors ${isDark ? "text-dark-accent-blue hover:text-dark-accent-blue-hover" : "text-light-accent-blue hover:text-light-accent-blue-hover"}`}>
                        Resend
                    </button>
                </p>

                <button type="button" onClick={() => navigate("/register")} className={`block w-full !m-0 !mt-4 text-center font-poppins text-xs transition-colors ${isDark ? "text-dark-text-subdim hover:text-dark-text-main" : "text-light-text-subdim hover:text-light-text-main"}`}>
                    Back to Register
                </button>
            </section>
        </main>
    )
}

export default Verify
