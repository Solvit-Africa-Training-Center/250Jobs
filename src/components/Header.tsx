const navLinks: { label: string; href: string }[] = [
  { label: "Home", href: "#" },
  { label: "Find Jobs", href: "#jobs" },
  { label: "Companies", href: "#companies" },
  { label: "Services", href: "#how" },
];

const HeaderLand = () => {
  return (
    <header className="absolute inset-x-0 top-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <img src="/images/logo.png" alt="Logo" className="h-10 w-auto" />

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-10 text-sm font-medium">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-white hover:text-blue-200 transition"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {/* Login Button */}
          <button className="rounded-full px-4 py-2 text-sm font-medium text-white transition hover:text-gray-200">
            Log in
          </button>

         
          <button className="rounded-full bg-[#007AFF] px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-600 transition">
            Register
          </button>
        </div>

      
        <div className="flex items-center gap-3 md:hidden">
          <button className="rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white">
            Log in
          </button>
          <button className="rounded-full bg-[#007AFF] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition">
            Register
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderLand;
