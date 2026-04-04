import { useEffect, useState } from "react"
import { ThemeContext } from "./ThemeContext"

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem("theme") || "light"
        } catch {
            return "light"
        }
    })

    useEffect(() => {
        const root = document.documentElement
        if (theme === "dark") {
            root.classList.add("dark")
            root.setAttribute("data-theme", "dark")
        } else {
            root.classList.remove("dark")
            root.setAttribute("data-theme", "light")
        }
        localStorage.setItem("theme", theme)
    }, [theme])

    const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"))

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}