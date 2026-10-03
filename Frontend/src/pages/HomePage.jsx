import React, { useContext, useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { ThemeContext } from '../context/themeContext.jsx'
import Light_bg from '../assets/Light_bg.png'
import Dark_bg from '../assets/Dark_bg.png'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/src/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HomePage = () => {
  const { Theme } = useContext(ThemeContext)

  return (
    <div>
      <Navbar />

      <main>
        <section className="h-screen flex-col bg-cover bg-center flex items-center !pt-8 -z-2" style={{ backgroundImage: `url(${Theme === "dark" ? Dark_bg : Light_bg})` }}>
          <h1 className={`text-6xl font-bondonse ${Theme === "dark" ? "text-dark-text-main" : "text-light-text-main"}`}>Welcome</h1>
          <div className='!mt-30 flex z-3 justify-center gap-8'>
            <div className="relative flex gap-6">
              <div className={`relative z-30 h-[350px] w-[300px] rounded-3xl border !p-6 shadow-2xl backdrop-blur-2xl flex flex-col justify-center !p-10 items-center gap-5 ${Theme === "dark" ? "border-white/20 bg-white/10" : "border-white/60 bg-white/25"}`} onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1.05,
                  duration: 0.5,
                  ease: "power2.out"
                });
              }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                  });
                }}>
                <h1 className={`text-2xl font-bondonse ${Theme === "dark" ? "text-dark-text-dim" : "text-light-text-dim"}`}>Explore</h1>
                <p className={`font-poppins text-center ${Theme === "dark" ? "text-dark-text-subdim" : "text-light-text-subdim"}`}>"Explore a world of incredible flavors and discover authentic cuisines, unique dishes, and culinary traditions from every corner of the globe, all brought together in one place."</p>
              </div>
              <div className={`relative z-30 h-[350px] w-[300px] rounded-3xl border !p-6 shadow-2xl backdrop-blur-2xl flex flex-col justify-center !p-10 items-center gap-5 ${Theme === "dark" ? "border-white/20 bg-white/10" : "border-white/60 bg-white/25"}`} onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1.1,
                  duration: 0.3,
                  ease: "power2.out"
                });
              }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                  });
                }}>
                <h1 className={`text-2xl font-bondonse ${Theme === "dark" ? "text-dark-text-dim" : "text-light-text-dim"}`}>Discover</h1>
                <p className={`font-poppins text-center ${Theme === "dark" ? "text-dark-text-subdim" : "text-light-text-subdim"}`}>"Discover delicious dishes, hidden gems, and exciting flavors from around the world. Find new favorites, uncover unique ingredients, and explore meals that match your taste and curiosity."
                </p>
              </div>
              <div className={`relative z-30 h-[350px] w-[300px] rounded-3xl border !p-6 shadow-2xl backdrop-blur-2xl flex flex-col justify-center !p-10 items-center gap-5 ${Theme === "dark" ? "border-white/20 bg-white/10" : "border-white/60 bg-white/25"}`} onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1.1,
                  duration: 0.3,
                  ease: "power2.out"
                });
              }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                  });
                }}>
                <h1 className={`text-2xl font-bondonse ${Theme === "dark" ? "text-dark-text-dim" : "text-light-text-dim"}`}>Connect</h1>
                <p className={`font-poppins text-center ${Theme === "dark" ? "text-dark-text-subdim" : "text-light-text-subdim"}`}>
                  "Connect with food lovers and share your passion for great food. Discover the stories, traditions, and experiences behind every dish while bringing people together through the flavors they love."
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="h-screen">

        </section>
      </main>
    </div>
  )
}

export default HomePage