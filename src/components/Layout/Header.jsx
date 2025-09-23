import { IoLogOutOutline } from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../ui/ThemeToggle";
import { useState } from "react";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";

function Header({ navLinks, unreadTotal = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={`shadow-md border-b fixed top-0 left-0 right-0 z-40 p-2 w-full ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

    
        <div className="flex items-center">
          <img src="/images/logo.png" alt="logo" className="w-35 h-auto" />
        </div>

        
        {/* Desktop nav */}
        <nav className={`hidden md:flex space-x-4 lg:space-x-8 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
          {navLinks.map((link) =>
            link.useRouter ? (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  location.pathname === link.href
                    ? isDark
                      ? "bg-blue-900 text-white"
                      : "bg-blue-100 text-black"
                    : isDark
                      ? "hover:bg-blue-900 hover:text-blue-300"
                      : "hover:bg-blue-100 hover:text-blue-600"
                }`}
              >
                <span className="relative text-xl">
                  {link.icon}
                  {unreadTotal > 0 && String(link.href).toLowerCase().includes('message') && (
                    <span className="absolute -top-1 -right-1 text-[10px] leading-none text-white bg-red-500 rounded-full px-1.5 py-0.5">
                      {unreadTotal}
                    </span>
                  )}
                </span>
                <span>{link.name}</span>
              </Link>
            ) : (
              <a
                key={link.name}
                href={link.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isDark ? "hover:bg-blue-900 hover:text-white" : "hover:bg-blue-100 hover:text-black"
                }`}
              >
                <span className="relative text-xl">
                  {link.icon}
                  {unreadTotal > 0 && String(link.href).toLowerCase().includes('message') && (
                    <span className="absolute -top-1 -right-1 text-[10px] leading-none text-white bg-red-500 rounded-full px-1.5 py-0.5">
                      {unreadTotal}
                    </span>
                  )}
                </span>
                <span>{link.name}</span>
              </a>
            )
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile menu button */}
          <button
            type="button"
            className={`md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border ${isDark ? "border-gray-700 text-gray-200 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <RxCross2 className="text-2xl" /> : <RxHamburgerMenu className="text-2xl" />}
          </button>

          <ThemeToggle />
          <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center px-5 py-2 bg-[#2984df] text-white font-semibold rounded-full hover:bg-blue-700 transition-colors">
            <IoLogOutOutline className="mr-2 text-xl" />
            Logout
          </button>
        </div>
      </div>
      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className={`md:hidden border-t ${isDark ? "border-gray-800 bg-gray-900 text-gray-100" : "border-gray-200 bg-white text-gray-900"}`}>
          <nav className="px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === link.href
                    ? isDark
                      ? "bg-blue-900 text-white"
                      : "bg-blue-100 text-black"
                    : isDark
                      ? "hover:bg-blue-900 hover:text-blue-300"
                      : "hover:bg-blue-100 hover:text-blue-600"
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span className="flex-1">{link.name}</span>
                {unreadTotal > 0 && String(link.href).toLowerCase().includes('message') && (
                  <span className="ml-auto text-xs text-white bg-red-500 rounded-full px-1.5 py-0.5">{unreadTotal}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
