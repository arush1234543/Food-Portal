import { useState, createContext } from "react";

export const ThemeContext = createContext()

export default function ThemeProvider({ children }) {
    
    const [Theme, setTheme] = useState("light")

    return (
        <ThemeContext.Provider value={{ Theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );

}