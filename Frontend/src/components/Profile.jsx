import React, { useContext, useState, useRef } from 'react'
import { AuthContext } from '../context/authContext'
import { ThemeContext } from '../context/themeContext'
import gsap from 'gsap'


const Profile = () => {
    const { Username, IsAuthenticated } = useContext(AuthContext)
    const { Theme } = useContext(ThemeContext)
    const [Color] = useState(["blue", "green", "brown"])
    const [random] = useState(() => Math.floor(Math.random() * Color.length))

    const loginButtonRef = useRef()

    const loginAnimationHandlerEnter = () => {
        gsap.to(loginButtonRef.current, {
            y: -5,
            duration: 0.7,
            ease: "power2.out"
        })
    }
    const loginAnimationHandlerLeave = () => {
        gsap.to(loginButtonRef.current, {
            y: 0,
            duration: 0.5
        })
    }

    return (
        <div>
            {IsAuthenticated ? (
                <span className={`h-[50px] w-[50px] rounded-full text-3xl flex items-center justify-center font-poppins font-bold bg-orange-500 ${Theme==="dark"?"text-dark-bg-surface":"text-light-bg-surface"}`}>
                    {Username ? Username[0].toUpperCase() : ""}
                </span>
            ) : (
                <button className={`h-[40px] w-[100px] font-bold text-[18px] font-poppins ${Theme === "light" ? "bg-light-accent-blue hover:bg-light-accent-blue-hover text-dark-text-main" : "text-light-text-main bg-dark-accent-blue hover:bg-dark-accent-blue-hover"} rounded-md`} ref={loginButtonRef} onMouseEnter={loginAnimationHandlerEnter} onMouseLeave={loginAnimationHandlerLeave} >Login</button>
            )}
        </div>
    )
}

export default Profile