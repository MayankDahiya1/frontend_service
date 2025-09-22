import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ value, onChange, error }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        className={`w-full text-gray-600 px-4 py-3 pr-10 text-sm border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-1 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
        value={value}
        onChange={onChange}
      />

      {/* Eye toggle (no button background) */}
      <span
        role="button"
        tabIndex={0}
        onClick={() => setShowPassword(!showPassword)}
        onKeyDown={(e) => e.key === "Enter" && setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-700"
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </span>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
