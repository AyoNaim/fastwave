"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, Loader2, IdCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { useRouter } from "next/navigation";

const SLIP_TYPES = [
  {
    id: "regular",
    name: "Regular Slip",
    price: 350,
    desc: "Standard Digital Verification",
  },
  {
    id: "standard",
    name: "Standard ID",
    price: 500,
    desc: "Enhanced Data Retrieval",
  },
  {
    id: "premium",
    name: "Premium Card",
    price: 600,
    desc: "Full Profile Verification",
  },
];

export default function VerifyNinPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [ninNumber, setNinNumber] = useState("");
  const [selectedSlip, setSelectedSlip] = useState(SLIP_TYPES[0]);
  const [balance, setBalance] = useState("0.00");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
    if (ninNumber.length < 11) {
      setMessage({ type: "error", text: "Enter valid 11-digit NIN" });
      return;
    }

    setIsProcessing(true);
    setMessage(null);
    await Haptics.impact({ style: ImpactStyle.Heavy });

    try {
      const raw = localStorage.getItem("user_session");
      if (!raw) throw new Error("No session found");
      const session = JSON.parse(raw);

      // Generate security handshake token (YYYYMMDD)
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

      const response = await fetch(
        "https://fastwave.com.ng/app/api/nin/index.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${today}`,
          },
          body: JSON.stringify({
            phone: ninNumber,
            user_phone: session.user_data?.phone || "", // Required for backend identification
            slip: selectedSlip.id,
            ref: `NIN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.status === "success") {
        const updatedBalance = (
          parseFloat(balance) - selectedSlip.price
        ).toFixed(2);
        session.user_data.balance = updatedBalance;
        localStorage.setItem("user_session", JSON.stringify(session));

        setBalance(updatedBalance);
        setMessage({ type: "success", text: "NIN Verification Successful!" });
        await Haptics.notification({ type: NotificationType.Success });
      } else {
        setMessage({
          type: "error",
          text: result.msg || "Verification Failed",
        });
        await Haptics.notification({ type: NotificationType.Error });
      }
    } catch (err: any) {
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
            Balance
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
        <h1 className="text-4xl font-black tracking-tighter">NIN Lookup</h1>
        <p
          className={`text-sm font-medium mt-1 ${
            isDarkMode ? "text-zinc-500" : "text-slate-400"
          }`}
        >
          National Identity Management
        </p>
      </div>

      <div
        className={`mx-5 mb-8 p-6 rounded-[2.5rem] border transition-all ${
          isDarkMode
            ? "bg-[#1c1425] border-white/5"
            : "bg-white border-slate-100 shadow-sm"
        }`}
      >
        <label
          className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 block ${
            isDarkMode ? "text-zinc-600" : "text-slate-300"
          }`}
        >
          National Identity Number
        </label>
        <Input
          type="tel"
          value={ninNumber}
          onChange={(e) => setNinNumber(e.target.value)}
          maxLength={11}
          className="h-10 bg-transparent border-none text-2xl font-black focus-visible:ring-0 p-0 placeholder:text-zinc-800"
          placeholder="0000 0000 000"
        />
      </div>

      <div className="px-5 space-y-3 mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-4 px-2">
          Select Slip Type
        </h3>
        {SLIP_TYPES.map((slip) => (
          <div
            key={slip.id}
            onClick={() => setSelectedSlip(slip)}
            className={`p-5 rounded-[2rem] border transition-all flex justify-between items-center cursor-pointer ${
              selectedSlip.id === slip.id
                ? isDarkMode
                  ? "bg-white text-black border-white"
                  : "bg-slate-900 text-white border-slate-900"
                : isDarkMode
                ? "bg-[#1c1425] border-white/5"
                : "bg-white border-slate-100"
            }`}
          >
            <div className="flex items-center gap-4">
              {selectedSlip.id === slip.id ? (
                <CheckCircle2 size={20} className="text-emerald-500" />
              ) : (
                <IdCard size={20} className="opacity-20" />
              )}
              <div>
                <p className="font-black text-sm tracking-tight">{slip.name}</p>
                <p className="text-[10px] font-medium opacity-60">
                  {slip.desc}
                </p>
              </div>
            </div>
            <p className="font-black text-lg">₦{slip.price}</p>
          </div>
        ))}
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
          className="w-full h-16 rounded-[2rem] text-lg font-black transition-all active:scale-95 bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20"
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" />
          ) : (
            `Verify & Pay ₦${selectedSlip.price}`
          )}
        </Button>
      </div>
    </div>
  );
}
