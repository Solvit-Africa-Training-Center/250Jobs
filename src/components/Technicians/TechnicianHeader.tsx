import { IoLogOutOutline } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { MdSpaceDashboard, MdOutlineSubscriptions } from "react-icons/md";
import { LuBot } from "react-icons/lu";
import { FaRegUser } from "react-icons/fa";
import { FaRegMessage } from "react-icons/fa6";
import ThemeToggle from "../ui/ThemeToggle";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { listRooms, type Room } from "../../api/chat";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

function TechnicianHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadTotal, setUnreadTotal] = useState<number>(0);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const rooms: Room[] = await listRooms();
        const total = rooms.reduce((sum, r: any) => sum + (r?.unread_count || 0), 0);
        setUnreadTotal(total);
      } catch {
        setUnreadTotal(0);
      }
    };
    load();
    const onRead = () => { load(); };
    window.addEventListener('chat:read', onRead);
    return () => window.removeEventListener('chat:read', onRead);
  }, []);

  useEffect(() => {
    // Refresh when navigating back from chat
    const refresh = async () => {
      try {
        const rooms: Room[] = await listRooms();
        const total = rooms.reduce((sum, r: any) => sum + (r?.unread_count || 0), 0);
        setUnreadTotal(total);
      } catch {}
    };
    refresh();
  }, [location.pathname]);
  // No header unread logic; handled in chat list per-conversation

  const navLinks = [
    { name: "Dashboard", href: "/", icon: <MdSpaceDashboard />, useRouter: true },
    { name: "AI Assistant", href: "/Assistant", icon: <LuBot />, useRouter: true },
    { name: "Profile", href: "/techprofile", icon: <FaRegUser />,  useRouter: true},
    { name: "Messages", href: "/message", icon: <FaRegMessage />,  useRouter: true },
    { name: "Subscription", href: "/subscription", icon: <MdOutlineSubscriptions />, useRouter: true },
  ];

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
                  {link.href === "/message" && unreadTotal > 0 && (
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
                <span className="text-xl">{link.icon}</span>
                <span>{link.name}</span>
              </a>
            )
          )}
        </nav>

       
        <div className="flex items-center space-x-2 md:space-x-4 relative">
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

          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border ${isDark ? "border-gray-700 text-gray-200 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
            >
              <FaUserCircle className="text-2xl" />
              <span className="hidden md:inline max-w-[160px] truncate">{user?.username || user?.email || "Account"}</span>
            </button>

            {menuOpen && (
              <div className={`absolute right-0 mt-2 w-56 rounded-lg border shadow-lg z-50 ${isDark ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}`}>
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Signed in as</div>
                  <div className="font-semibold truncate">{user?.username || user?.email || "User"}</div>
                </div>
                <button
                  className="w-full flex items-center gap-2 text-left px-4 py-3 bg-transparent text-black hover:bg-gray-100 transition-colors"
                  onClick={() => { setMenuOpen(false); logout(); navigate('/login'); }}
                >
                  <IoLogOutOutline className="text-xl text-black" />
                  Logout
                </button>
              </div>
            )}
          </div>
          {menuOpen && <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />}
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
                {link.href === "/message" && unreadTotal > 0 && (
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

export default TechnicianHeader;
