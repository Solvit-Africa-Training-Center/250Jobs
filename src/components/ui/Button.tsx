export default function Button({
  variant = "primary",
  loading,
  leftIcon,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-lg px-5 py-2 font-semibold transition";
  const variants: Record<string, string> = {
    primary: "bg-[#2563EB] text-white hover:bg-blue-700 dark:bg-[#1d4ed8] dark:hover:bg-[#2563eb]",
    secondary: "bg-[#F3F3F5] text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
    outline: "border border-gray-400 text-black hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${base} ${variants[variant]} ${className} ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
      disabled={isDisabled}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
    </button>
  );
}
