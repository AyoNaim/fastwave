"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const Login = () => {
  // We keep the state intuitive for the UI
  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const savedSession = localStorage.getItem("user_session");
      const savedToken = localStorage.getItem("userToken");

      if (savedSession && savedToken) {
        router.replace("/dashboard");
      } else {
        setIsChecking(false); // No session found, show the login form
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Generate the Handshake Token (YYYYMMDD) - ONLY for the login request
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

      const response = await fetch(
        "https://fastwave.com.ng/app/api/account/login/index.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${today}`,
          },
          // 2. Map "password" to "accesspass" for the backend
          body: JSON.stringify({
            phone: formData.phone,
            accesspass: formData.password,
          }),
        }
      );

      // 3. Robust Response Handling
      const rawText = await response.text();
      const cleanText = rawText.trim().replace(/^\uFEFF/, "");

      let result;
      try {
        result = JSON.parse(cleanText);
      } catch (jsonErr) {
        console.error("Parsing failed. Raw response was:", rawText);
        setError("Server communication error. Please try again.");
        setLoading(false);
        return;
      }

      if (result.status === "success") {
        if (!result.token || result.token.includes("FIX_DATABASE")) {
          setError(
            "Account Error: Your API Key is missing in the database. Please contact admin."
          );
          setLoading(false);
          return;
        }

        const sessionData = {
          token: result.token,
          user_data: result.user_data || {},
        };

        // Save the real persistent token from the DB
        localStorage.setItem("user_session", JSON.stringify(sessionData));
        localStorage.setItem("userToken", sessionData.token);

        router.push("/dashboard");
      } else {
        setError(result.msg || "Invalid login credentials");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Connection failed. Check your internet.");
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center">
          <img
            src="./fastwave_logo.png"
            alt="logo"
            width={100}
            height={100}
            className="mb-4"
          />
          <p className="text-xs text-gray-400 font-medium">
            Securing session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 font-sans text-black">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Logo */}
        <div className="mb-10">
          {/* <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="25" cy="15" r="5" fill="black" />
            <circle cx="15" cy="25" r="5" fill="black" />
            <circle cx="25" cy="25" r="5" fill="black" />
            <circle cx="35" cy="25" r="5" fill="black" />
            <circle cx="25" cy="35" r="5" fill="black" />
            <circle cx="17" cy="17" r="4" fill="black" />
            <circle cx="33" cy="33" r="4" fill="black" />
            <path
              d="M18 18L22 22M28 22L32 18M18 32L22 28M28 28L32 32"
              stroke="black"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg> */}
          <img
            src={"./fastwave_color.png"}
            alt="logo"
            width={130}
            height={130}
          />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2 text-center w-full">
          Welcome back, User <span className="text-2xl ml-1">😎</span>
        </h1>

        <button
          type="button"
          onClick={() => router.push("/signup")}
          className="text-xs text-black underline decoration-gray-400 underline-offset-4 mb-10 hover:text-gray-600 transition-colors"
        >
          Don't have an account? Sign up
        </button>

        <form className="w-full space-y-5" onSubmit={handleLogin}>
          <div className="space-y-1.5">
            <label className="block text-xs text-gray-500 font-medium ml-1">
              Your phone
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="08012345678"
              className="w-full px-4 py-3.5 border border-gray-200 rounded-md text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-gray-500 font-medium ml-1">
              Your password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="..............."
                className="w-full pl-4 pr-12 py-3.5 border border-gray-200 rounded-md text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors bg-white tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Eye size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 p-3 rounded-md border border-red-100">
              <p className="text-red-600 text-xs font-medium text-center">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-[#bdf522] hover:bg-[#b0eb14] text-black font-semibold py-4 px-4 rounded-md text-sm transition-all relative disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
            {!loading && (
              <ArrowUpRight
                className="absolute right-4 w-5 h-5"
                strokeWidth={2.5}
              />
            )}
          </button>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="w-4 h-4 rounded-sm border border-gray-300 flex items-center justify-center group-hover:border-gray-400 transition-colors">
                <input type="checkbox" className="hidden peer" />
                <svg
                  className="w-3 h-3 text-black hidden peer-checked:block"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M2.5 7.5L5.5 10.5L11.5 3.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              className="text-xs text-gray-600 underline decoration-gray-400 underline-offset-4 hover:text-black transition-colors"
            >
              <Link href={"/forgot"}>Forgot your password?</Link>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
