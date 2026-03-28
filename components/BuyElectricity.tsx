"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { useRouter } from "next/navigation";
import { ElectricityProviderModal } from "./ElectricityProvider";

export default function BuyElectricityPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [meterNumber, setMeterNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
    token?: string;
  } | null>(null);

  const [selectedProvider, setSelectedProvider] = useState({
    name: "Ikeja Electric",
    id: "1",
    type: "Prepaid",
  });

  const quickAmounts = ["1000", "2000", "5000", "10000", "20000", "50000"];

  const getHandshake = () => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Lagos",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const parts = formatter.formatToParts(now);
      const y = parts.find((p) => p.type === "year")?.value;
      const m = parts.find((p) => p.type === "month")?.value;
      const d = parts.find((p) => p.type === "day")?.value;

      return `Token ${y}${m}${d}`;
    } catch (e) {
      const d = new Date();
      const dateStr = d.toISOString().split("T")[0].replace(/-/g, "");
      return `Token ${dateStr}`;
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme");
    setIsDarkMode(savedTheme !== "light");

    const raw = localStorage.getItem("user_session");
    if (raw) {
      const session = JSON.parse(raw);
      setBalance(session.user_data?.balance || "0.00");
    }
  }, []);

  const getSessionData = () => {
    const raw = localStorage.getItem("user_session");
    if (!raw) return { phone: "" };
    try {
      const session = JSON.parse(raw);
      return {
        phone: session.user_data?.phone || session.phone || "",
      };
    } catch (e) {
      return { phone: "" };
    }
  };

  const handleVerify = async () => {
    if (!meterNumber || meterNumber.length < 5) {
      setMessage({ type: "error", text: "Please enter a valid meter number" });
      return;
    }

    setIsVerifying(true);
    setMessage(null);
    setVerifiedName("");

    const { phone } = getSessionData();
    const handshake = getHandshake();

    try {
      const response = await fetch(
        "https://fastwave.com.ng/app/api/electricity/verify/index.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Token: handshake,
            Authorization: handshake,
          },
          body: JSON.stringify({
            token: handshake,
            meternumber: meterNumber.trim(),
            provider: selectedProvider.id,
            metertype: selectedProvider.type,
            user_phone: phone,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        setIsVerified(true);
        setVerifiedName(result.name || "Verified Customer");
        await Haptics.notification({ type: NotificationType.Success });
      } else {
        setIsVerified(false);
        setMessage({
          type: "error",
          text: result.msg || "Verification Failed",
        });
        await Haptics.notification({ type: NotificationType.Error });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "Meter verification failed. Try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePurchase = async () => {
    if (isLoading || !isVerified) return;
    if (!amount || parseFloat(amount) < 1000) {
      setMessage({ type: "error", text: "Minimum purchase is ₦1,000" });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    await Haptics.impact({ style: ImpactStyle.Heavy });

    const { phone } = getSessionData();
    const handshake = getHandshake();

    try {
      const response = await fetch(
        "https://fastwave.com.ng/app/api/electricity/index.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Token: handshake,
            Authorization: handshake,
          },
          body: JSON.stringify({
            token: handshake,
            provider: selectedProvider.id,
            amount: amount,
            meternumber: meterNumber,
            metertype: selectedProvider.type,
            user_phone: phone,
            ref: `ELEC_${Date.now()}`,
          }),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        const newBalance = (parseFloat(balance) - parseFloat(amount)).toFixed(
          2
        );
        setBalance(newBalance);

        const raw = localStorage.getItem("user_session");
        if (raw) {
          const session = JSON.parse(raw);
          if (session.user_data) {
            session.user_data.balance = newBalance;
            localStorage.setItem("user_session", JSON.stringify(session));
          }
        }

        setMessage({
          type: "success",
          text: `Purchase Successful!`,
          token: result.token || result.msg || "Token Pending",
        });
        await Haptics.notification({ type: NotificationType.Success });
      } else {
        setMessage({ type: "error", text: result.msg || "Transaction Failed" });
        await Haptics.notification({ type: NotificationType.Error });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "Transaction failed. Please check connection.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onMeterChange = (val: string) => {
    setMeterNumber(val);
    if (isVerified) setIsVerified(false);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 pt-safe pb-10 font-sans ${
        isDarkMode ? "bg-[#0f0a14] text-white" : "bg-slate-50 text-slate-900"
      } ${isLoading ? "pointer-events-none" : ""}`}
    >
      <header className="px-5 flex justify-between items-center py-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className={`rounded-full h-9 w-9 ${
              isDarkMode
                ? "bg-zinc-900 text-white"
                : "bg-white shadow-sm text-slate-600"
            }`}
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-base font-bold tracking-tight">Electricity</h1>
        </div>
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
            } text-[10px] font-bold uppercase tracking-wider`}
          >
            Balance
          </span>
          <span className="font-black text-sm text-emerald-500">
            ₦{parseFloat(balance).toLocaleString()}
          </span>
        </div>
      </header>

      <div className="px-5 mb-4">
        <ElectricityProviderModal
          isDark={isDarkMode}
          selected={selectedProvider}
          onSelect={(p: any) => {
            setSelectedProvider(p);
            setIsVerified(false);
          }}
        />
      </div>

      <div className="px-5 mb-6 text-emerald-500 text-[11px] font-bold uppercase tracking-widest">
        Pay {selectedProvider.name} ({selectedProvider.type}) instantly.
      </div>

      <div className="px-5 mb-6">
        <div
          className={`rounded-[2rem] p-7 transition-all border ${
            isDarkMode
              ? "bg-[#1c1425] border-white/5"
              : "bg-white border-slate-100 shadow-sm"
          }`}
        >
          <label
            className={`text-[10px] font-bold uppercase tracking-widest block mb-4 ${
              isDarkMode ? "text-zinc-500" : "text-slate-400"
            }`}
          >
            Meter Number
          </label>
          <div
            className={`flex items-center gap-3 border-b pb-2 ${
              isDarkMode ? "border-zinc-800" : "border-slate-100"
            }`}
          >
            <Input
              value={meterNumber}
              onChange={(e) => onMeterChange(e.target.value)}
              placeholder="00000000000"
              className="border-none bg-transparent p-0 text-2xl font-black focus-visible:ring-0 placeholder:text-zinc-700"
              type="number"
            />
            {isVerified ? (
              <CheckCircle2 size={22} className="text-emerald-500" />
            ) : (
              <Button
                onClick={handleVerify}
                disabled={isVerifying || !meterNumber}
                size="sm"
                className="rounded-full px-4 h-8 font-bold text-[10px] uppercase tracking-wider bg-emerald-500 text-white hover:bg-emerald-600"
              >
                {isVerifying ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  "Verify"
                )}
              </Button>
            )}
          </div>
          {isVerified && (
            <div className="mt-3 flex items-center gap-2 text-emerald-500 animate-in fade-in slide-in-from-top-1">
              <span className="text-[10px] font-bold uppercase tracking-tight">
                Name:
              </span>
              <span className="text-sm font-black">{verifiedName}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 mb-6 grid grid-cols-3 gap-3">
        {quickAmounts.map((amt) => (
          <Button
            key={amt}
            onClick={() => setAmount(amt)}
            variant="secondary"
            className={`font-bold h-12 rounded-xl border-none transition-all ${
              isDarkMode
                ? "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                : "bg-white text-slate-600 shadow-sm border border-slate-100"
            }`}
          >
            ₦{parseInt(amt).toLocaleString()}
          </Button>
        ))}
      </div>

      <div className="px-5 mb-6">
        <div
          className={`rounded-[2rem] p-7 border transition-all ${
            isDarkMode
              ? "bg-[#1c1425] border-white/5"
              : "bg-white border-slate-100 shadow-sm"
          }`}
        >
          <p
            className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${
              isDarkMode ? "text-zinc-500" : "text-slate-400"
            }`}
          >
            Enter Amount
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-500">₦</span>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="border-none bg-transparent p-0 text-3xl font-black focus-visible:ring-0"
              type="number"
            />
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`mx-5 mb-6 p-6 rounded-[2rem] border animate-in zoom-in duration-300 ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-red-500/10 text-red-500 border-red-500/20"
          }`}
        >
          <p className="font-bold text-sm uppercase tracking-tight">
            {message.text}
          </p>
          {message.token && (
            <div
              className={`mt-3 p-4 rounded-xl border ${
                isDarkMode
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-white border-emerald-100"
              }`}
            >
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">
                Token / PIN
              </p>
              <p className="text-2xl font-black tracking-[0.2em] text-emerald-500 break-all">
                {message.token}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="px-5">
        <Button
          onClick={handlePurchase}
          disabled={isLoading || !isVerified}
          className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-[0.97] transition-all disabled:opacity-30 disabled:bg-zinc-800"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : isVerified ? (
            "Purchase Token"
          ) : (
            "Verify Meter First"
          )}
        </Button>
      </div>
    </div>
  );
}
