"use client";

import React, { useState, useEffect } from "react";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import {
  Clock,
  ChevronLeft,
  History,
  Info,
  Loader2,
  AlertCircle,
  X,
  Phone,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function KiraniMinutesPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    number: "",
    amount: "", // minutes
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme");
    setIsDarkMode(savedTheme !== "light");
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow numbers for amount and phone
    if (value !== "" && !/^\d+$/.test(value)) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handlePurchase = async () => {
    setError(null);
    await Haptics.impact({ style: ImpactStyle.Heavy });

    // Validation
    if (!formData.number || formData.number.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    if (Number(formData.amount) < 30) {
      setError("Minimum purchase is 30 minutes");
      return;
    }

    setLoading(true);

    try {
      const rawSession = localStorage.getItem("user_session");
      if (!rawSession) throw new Error("Session expired. Please login.");

      const session = JSON.parse(rawSession);
      // Logic: Prioritize the specialized handshake token, fallback to standard
      const token = session.token || session.accesstoken || "";
      const userPhone = session.user_data?.phone || "";

      const response = await fetch(
        "https://fastwave.com.ng/app/api/kirani/index.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Token: token,
          },
          body: JSON.stringify({
            token: token,
            number: formData.number,
            amount: formData.amount,
            phone: userPhone,
            ref: `KRN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          }),
        }
      );

      // --- CRITICAL FIX FOR "Unexpected end of JSON input" ---
      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch (e) {
        // This means PHP crashed and sent a text error instead of JSON
        console.error("Server Error Output:", responseText);
        throw new Error(
          "Server Error: Check if getUserDataByPhone exists in ApiAccess class."
        );
      }
      // -------------------------------------------------------

      if (response.ok && result.status === "success") {
        await Haptics.notification({ type: NotificationType.Success });
        alert(
          `Transaction Successful!\n${formData.amount} minutes credited to ${formData.number}`
        );
        setFormData({ number: "", amount: "" });
      } else {
        throw new Error(result.msg || "Transaction failed");
      }
    } catch (err: any) {
      await Haptics.notification({ type: NotificationType.Error });
      setError(err?.message || "Internal connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 pb-10 pt-safe px-5 ${
        isDarkMode ? "bg-[#0f0a14] text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Header */}
      <header className="flex justify-between items-center py-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className={`rounded-full h-10 w-10 ${
            isDarkMode
              ? "bg-zinc-900 text-white"
              : "bg-white shadow-sm text-slate-600"
          }`}
        >
          <ChevronLeft size={22} />
        </Button>
        <div className="text-center">
          <h1 className="text-base font-bold tracking-tight">Kirani Minutes</h1>
          <p className="text-[9px] text-emerald-500 font-medium uppercase tracking-widest">
            Instant Top-up
          </p>
        </div>
        <button className="text-emerald-500 font-bold text-[10px] uppercase flex items-center gap-1 bg-emerald-500/10 px-3 py-2 rounded-full">
          <History size={14} />
        </button>
      </header>

      <div className="max-w-md mx-auto space-y-6">
        {/* Visual Feature Card */}
        <div
          className={`p-6 rounded-[2rem] relative overflow-hidden border ${
            isDarkMode
              ? "bg-gradient-to-br from-purple-900/20 to-transparent border-white/5"
              : "bg-white border-slate-100 shadow-sm"
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                  isDarkMode ? "text-zinc-500" : "text-slate-400"
                }`}
              >
                Service Provider
              </p>
              <h2 className="text-2xl font-black italic tracking-tighter text-emerald-500">
                KIRANI
              </h2>
            </div>
            <div className="bg-emerald-500/20 p-2 rounded-xl">
              <Clock className="text-emerald-500" size={24} />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span
              className={`text-[10px] font-medium ${
                isDarkMode ? "text-zinc-400" : "text-slate-500"
              }`}
            >
              Secure Encryption Active
            </span>
          </div>
        </div>

        {/* Form */}
        <Card
          className={`border-none rounded-[2.5rem] overflow-hidden shadow-2xl ${
            isDarkMode ? "bg-[#1c1425]" : "bg-white"
          }`}
        >
          <CardContent className="p-7 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-1">
                <div className="flex items-center gap-3 text-red-500">
                  <AlertCircle size={18} />
                  <p className="text-xs font-bold tracking-tight">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500/50"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Minutes Input */}
            <div className="space-y-2">
              <label
                className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${
                  isDarkMode ? "text-zinc-500" : "text-slate-400"
                }`}
              >
                Purchase Amount (Minutes)
              </label>
              <div className="relative">
                <Input
                  name="amount"
                  placeholder="Minimum 30"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className={`h-16 rounded-2xl border-none font-black text-lg px-6 ${
                    isDarkMode
                      ? "bg-zinc-900 text-white placeholder:text-zinc-800"
                      : "bg-slate-50 text-slate-900"
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg">
                  MINS
                </div>
              </div>
            </div>

            {/* Destination Number */}
            <div className="space-y-2">
              <label
                className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${
                  isDarkMode ? "text-zinc-500" : "text-slate-400"
                }`}
              >
                Destination Number
              </label>
              <div className="relative">
                <Input
                  name="number"
                  type="tel"
                  placeholder="080XXXXXXXX"
                  value={formData.number}
                  onChange={handleInputChange}
                  className={`h-16 rounded-2xl border-none font-bold text-base px-6 ${
                    isDarkMode
                      ? "bg-zinc-900 text-white placeholder:text-zinc-800"
                      : "bg-slate-50 text-slate-900"
                  }`}
                />
                <Phone
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700"
                  size={18}
                />
              </div>
            </div>

            {/* Summary Box */}
            <div
              className={`p-4 rounded-2xl space-y-3 ${
                isDarkMode ? "bg-zinc-900/50" : "bg-slate-50"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">
                  Rate per min
                </span>
                <span className="text-[11px] font-black text-emerald-500">
                  ₦1.00
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-white/5 pt-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">
                  Total Payable
                </span>
                <span className="text-lg font-black text-white">
                  ₦{formData.amount || "0"}
                </span>
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handlePurchase}
              disabled={loading || !formData.amount || !formData.number}
              className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Initialize Transfer <ArrowRight size={18} />
                </span>
              )}
            </Button>

            {/* Info */}
            <div className="flex gap-3 px-2">
              <Info className="text-zinc-600 shrink-0" size={16} />
              <p className="text-[10px] leading-relaxed text-zinc-500 font-medium">
                Kirani minutes are processed via our high-priority server.
                Delivery is usually within 60 seconds.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
