"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { useRouter } from "next/navigation";

export default function VerifyBvnPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [bvnNumber, setBvnNumber] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const VERIFICATION_COST = 350;

  useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme");
    setIsDarkMode(savedTheme !== "light");
    const raw = localStorage.getItem("user_session");
    if (raw) {
      const session = JSON.parse(raw);
      setBalance(session.user_data?.balance || "0.00");
    }
  }, []);

  const handleVerify = async () => {
    if (isProcessing) return;
    if (bvnNumber.length < 11) {
      setMessage({
        type: "error",
        text: "Enter a valid 11-digit BVN/Phone number",
      });
      return;
    }

    setIsProcessing(true);
    setMessage(null);
    await Haptics.impact({ style: ImpactStyle.Heavy });

    try {
      const raw = localStorage.getItem("user_session");
      if (!raw) throw new Error("No session found");
      const session = JSON.parse(raw);

      // Security handshake token
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

      const response = await fetch(
        "https://fastwave.com.ng/app/api/bvn/index.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${today}`,
          },
          body: JSON.stringify({
            phone: bvnNumber,
            user_phone: session.user_data?.phone || "", // Pass user phone for balance check
            ref: `BVN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.status === "success") {
        const updatedBalance = (
          parseFloat(balance) - VERIFICATION_COST
        ).toFixed(2);
        session.user_data.balance = updatedBalance;
        localStorage.setItem("user_session", JSON.stringify(session));

        setBalance(updatedBalance);
        setMessage({ type: "success", text: "BVN Verification Successful!" });
        await Haptics.notification({ type: NotificationType.Success });
      } else {
        setMessage({
          type: "error",
          text: result.msg || "Verification Failed",
        });
        await Haptics.notification({ type: NotificationType.Error });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Connection error occurred" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`min-h-screen pt-safe pb-10 font-sans transition-colors duration-500 ${
        isDarkMode ? "bg-[#0f0a14] text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <header className="px-5 flex justify-between items-center py-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className={`rounded-full h-10 w-10 ${
            isDarkMode
              ? "bg-zinc-900/50"
              : "bg-white shadow-sm border border-slate-100"
          }`}
        >
          <ChevronLeft size={24} />
        </Button>
        <div
          className={`px-4 py-2 rounded-full flex items-center gap-2 border transition-all ${
            isDarkMode
              ? "bg-[#1c1425] border-white/5 shadow-lg"
              : "bg-white border-slate-100 shadow-sm"
          }`}
        >
          <span
            className={`${
              isDarkMode ? "text-zinc-500" : "text-slate-400"
            } text-[10px] font-black uppercase tracking-widest`}
          >
            Wallet
          </span>
          <span className="font-black text-sm text-emerald-500">
            ₦
            {parseFloat(balance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
      </header>

      <div className="px-5 mb-8">
        <h1 className="text-4xl font-black tracking-tighter">BVN Verify</h1>
        <p
          className={`text-sm font-medium mt-1 ${
            isDarkMode ? "text-zinc-500" : "text-slate-400"
          }`}
        >
          Secure Identity Confirmation
        </p>
      </div>

      <div
        className={`mx-5 mb-8 p-6 rounded-[2.5rem] border transition-all ${
          isDarkMode
            ? "bg-[#1c1425] border-white/5"
            : "bg-white border-slate-100 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
              Service Fee
            </p>
            <p className="text-xl font-black">₦{VERIFICATION_COST}</p>
          </div>
        </div>

        <label
          className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 block ${
            isDarkMode ? "text-zinc-600" : "text-slate-300"
          }`}
        >
          BVN or Linked Phone Number
        </label>
        <div className="relative">
          <Input
            type="tel"
            value={bvnNumber}
            onChange={(e) => setBvnNumber(e.target.value)}
            maxLength={11}
            className="h-14 bg-transparent border-b-2 border-t-0 border-x-0 border-white/5 rounded-none text-2xl font-black focus-visible:ring-0 p-0 placeholder:text-zinc-800"
            placeholder="22200000000"
          />
          <Smartphone className="absolute right-0 top-4 opacity-20" size={20} />
        </div>
      </div>

      {message && (
        <div
          className={`mx-5 mb-6 p-4 rounded-2xl text-[12px] font-black text-center border animate-in slide-in-from-top-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-red-500/10 text-red-500 border-red-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="px-5">
        <Button
          onClick={handleVerify}
          disabled={isProcessing}
          className={`w-full h-16 rounded-[2rem] text-lg font-black transition-all active:scale-95 ${
            isDarkMode
              ? "bg-white text-black hover:bg-zinc-200"
              : "bg-slate-900 text-white hover:bg-black"
          }`}
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Verify Identity Now"
          )}
        </Button>
        <p className="text-center text-[10px] mt-4 opacity-30 font-bold uppercase tracking-widest">
          Powered by NIMC/NIBSS Secure Gateways
        </p>
      </div>
    </div>
  );
}
