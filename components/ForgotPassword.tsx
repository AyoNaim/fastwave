"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordEmail() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", ""]); // 5-digit OTP
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic - stabilized dependencies
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showModal && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showModal, timer]);

  // ACTION 1: Request OTP from PHP Backend
  const handleNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Prevent page reload if called from a form

    if (!email.includes("@")) return alert("Please enter a valid email");
    setLoading(true);

    try {
      const response = await fetch(
        "https://fastwave.com.ng/app/api/user/forgot-password/index.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "request",
            email: email,
          }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setShowModal(true);
        setTimer(60);
      } else {
        alert(data.msg || "Failed to send code");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ACTION 2: Verify OTP and Redirect
  const handleVerify = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 5) return;

    setVerifying(true);

    try {
      const response = await fetch(
        "https://fastwave.com.ng/app/api/user/forgot-password/index.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "verify",
            email: email,
            otp: fullOtp,
          }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        router.push("/dashboard");
      } else {
        alert(data.msg || "Invalid or expired code");
        setOtp(["", "", "", "", ""]);
        otpInputs.current[0]?.focus();
      }
    } catch (error) {
      alert("Verification failed. Please check your connection.");
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value)) && value !== "") return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 4) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
    // Allow pressing Enter to verify
    if (e.key === "Enter" && otp.every((d) => d !== "")) {
      handleVerify();
    }
  };

  const resendCode = () => {
    setOtp(["", "", "", "", ""]);
    handleNext();
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-white text-black p-6 flex flex-col font-sans relative">
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center mb-10 pt-2">
        <button
          onClick={() => router.back()}
          className="p-1 -ml-1 active:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-7 h-7 text-black" />
        </button>
        <button className="text-[#00A859] font-semibold text-lg active:opacity-70 transition-opacity">
          <Link href="/signup">Sign Up</Link>
        </button>
      </div>

      {/* Header Section */}
      <div className="space-y-4 mb-10">
        <h1 className="text-[34px] font-bold tracking-tight text-gray-900 leading-tight">
          Password Forgotten
        </h1>
        <p className="text-gray-500 text-[16px] leading-relaxed pr-6">
          Please enter your email address associated with your account
        </p>
      </div>

      {/* Form Section */}
      <div className="relative mb-6">
        <span className="absolute -top-2.5 left-4 bg-white px-1.5 text-[13px] font-medium text-[#00A859] z-10">
          Email Address
        </span>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="e.g. name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleNext()}
          className="w-full h-[60px] bg-gray-50 border-[#00A859] border-[1.5px] focus-visible:ring-0 focus-visible:border-[#00A859] text-black rounded-xl pl-4 text-base placeholder:text-gray-300 transition-all"
        />
      </div>

      <p className="text-gray-400 text-[14px] leading-snug mb-10">
        Please double-check the email address as a reset code will be sent to
        the address provided.
      </p>

      <div className="mt-auto pb-6">
        <Button
          onClick={() => handleNext()}
          disabled={loading || !email}
          className="w-full h-14 bg-[#00A859] hover:bg-[#008c4a] text-white text-[17px] font-bold rounded-xl transition-all active:scale-[0.98]"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Next"}
        </Button>
      </div>

      {/* --- OTP MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[380px] rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-6 top-6 text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-black mb-2 text-center text-gray-900">
                Verify Email
              </h2>
              <p className="text-gray-500 text-sm text-center mb-8">
                Enter the 5-digit code sent to <br />
                <span className="font-bold text-gray-900">{email}</span>
              </p>

              {/* OTP Input Group */}
              <div className="flex justify-between gap-2 mb-8 w-full">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="w-12 h-14 text-center text-2xl font-black bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#00A859] focus:bg-white focus:ring-4 focus:ring-[#00A859]/5 outline-none transition-all"
                  />
                ))}
              </div>

              {/* Countdown / Resend */}
              <div className="text-center mb-2">
                {timer > 0 ? (
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                    Resend code in{" "}
                    <span className="text-[#00A859] font-black">{timer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={resendCode}
                    className="text-[#00A859] font-black text-xs uppercase tracking-wider underline underline-offset-4 hover:text-[#008c4a]"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <Button
                onClick={handleVerify}
                disabled={otp.some((d) => !d) || verifying}
                className="w-full h-14 bg-gray-900 text-white mt-6 rounded-2xl font-bold hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-gray-900/10"
              >
                {verifying ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Verify & Proceed"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
