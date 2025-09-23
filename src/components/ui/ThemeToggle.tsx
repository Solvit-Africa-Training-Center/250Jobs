import { LuSun, LuMoon } from "react-icons/lu";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <LuSun className="text-xl" /> : <LuMoon className="text-xl" />}
    </button>
  );
}

