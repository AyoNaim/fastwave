"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { useRouter } from "next/navigation";
import { NetworkModal } from "./NetworkModal";
import { detectNetwork } from "@/utils/network-detector";

const networkList = [
  { id: "1", name: "MTN", icon: "/mtn-logo.svg", color: "bg-yellow-400" },
  { id: "3", name: "Airtel", icon: "/airtel-logo.png", color: "bg-red-600" },
  { id: "2", name: "Glo", icon: "/glo-logo.png", color: "bg-green-600" },
  {
    id: "4",
    name: "9mobile",
    icon: "/9mobile-logo.png",
    color: "bg-emerald-900",
  },
];

export default function BuyAirtimePage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [selectedNetwork, setSelectedNetwork] = useState(networkList[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  // Sync data from local storage to state
  const syncDataFromStorage = useCallback(() => {
    const raw = localStorage.getItem("user_session");
    if (raw) {
      const session = JSON.parse(raw);
      setBalance(session.user_data?.balance || "0.00");
    }
  }, []);

  // Refresh logic to fetch new state from server
  const handleRefresh = useCallback(async () => {
    try {
      const raw = localStorage.getItem("user_session");
      if (!raw) return;
      const session = JSON.parse(raw);
      const phone = session.user_data?.phone || localStorage.getItem("phone");

      if (!phone) throw new Error("No phone found for refresh");

      const response = await fetch(
        "https://fastwave.com.ng/app/api/user/app-refresh/index.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (e) {}

        const user = result.user_data;
        if (user) {
          // 1. Update flat keys
          localStorage.setItem("balance", user.balance);
          localStorage.setItem("cashback", user.cashback);
          localStorage.setItem("full_name", user.full_name);
          if (result.token) localStorage.setItem("token", result.token);

          // 2. Update user_session object to maintain synchronization
          const updatedSession = {
            ...session,
            token: result.token || session.token,
            user_data: {
              ...session.user_data,
              ...user,
            },
          };
          localStorage.setItem("user_session", JSON.stringify(updatedSession));
        }
        syncDataFromStorage();
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    }
  }, [syncDataFromStorage]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme");
    setIsDarkMode(savedTheme !== "light");

    // Refresh data on page load
    handleRefresh();
    syncDataFromStorage();
  }, [handleRefresh, syncDataFromStorage]);

  const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhoneNumber(val);

    const detectedName = detectNetwork(val);
    if (detectedName) {
      const newNet = networkList.find(
        (n) => n.name.toLowerCase() === detectedName.toLowerCase()
      );
      if (newNet && newNet.id !== selectedNetwork.id) {
        setSelectedNetwork(newNet);
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    }
  };

  const handlePurchase = async () => {
    if (phoneNumber.length < 10) {
      setMessage({ type: "error", text: "Please enter a valid phone number" });
      return;
    }
    // Changed minimum amount to 100
    if (!amount || Number(amount) < 100) {
      setMessage({ type: "error", text: "Minimum amount is ₦100" });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    await Haptics.impact({ style: ImpactStyle.Heavy });

    try {
      const userToken =
        localStorage.getItem("userToken") || localStorage.getItem("token");
      if (!userToken) {
        throw new Error("Session expired. Please log in again.");
      }

      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

      const payload = {
        phone: phoneNumber,
        amount: amount,
        network: selectedNetwork.id,
        token: userToken,
        airtime_type: "VTU",
        ref: `AIR_${Date.now()}`,
      };

      const response = await fetch(
        "https://fastwave.com.ng/app/api/airtime/index.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${userToken}`,
            "X-Handshake": today,
          },
          body: JSON.stringify(payload),
        }
      );

      const textResponse = await response.text();
      let result;

      try {
        result = JSON.parse(textResponse);
      } catch (e) {
        console.error("Raw Server Error:", textResponse);
        throw new Error(
          "Server returned an invalid response. Check console logs."
        );
      }

      // Handle the complex nested response format provided in the prompt
      const controllerData = result.controller_output || {};
      const statusFromBackend = controllerData.status || result.status;

      let displayMessage =
        result.msg || controllerData.msg || "Transaction failed";

      // If there is an api_response_log (which is a stringified JSON), parse it to get the real error
      if (controllerData.api_response_log) {
        try {
          const innerLog = JSON.parse(controllerData.api_response_log);
          if (innerLog.msg) {
            displayMessage = innerLog.msg;
          }
        } catch (e) {
          // fallback to the previous displayMessage if parsing fails
        }
      }

      if (statusFromBackend === "success") {
        setMessage({
          type: "success",
          text: displayMessage || "Airtime purchase successful!",
        });
        setAmount("");
        await Haptics.notification({ type: NotificationType.Success });
      } else {
        setMessage({
          type: "error",
          text: displayMessage,
        });
        await Haptics.notification({ type: NotificationType.Error });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Could not connect to server.",
      });
      await Haptics.notification({ type: NotificationType.Error });
    } finally {
      // Refresh user state regardless of success or failure
      await handleRefresh();
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-[100vw] transition-colors duration-500 pt-safe pb-10 font-sans ${
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
        <h1 className="text-4xl font-black tracking-tighter">Buy Airtime</h1>
        <p
          className={`text-sm font-medium mt-1 ${
            isDarkMode ? "text-zinc-500" : "text-slate-400"
          }`}
        >
          Instant top-up for yourself or loved ones
        </p>
      </div>

      <div className="px-5 space-y-6">
        <div
          className={`p-4 rounded-[2.5rem] border transition-all flex items-center gap-4 ${
            isDarkMode
              ? "bg-[#1c1425] border-white/5"
              : "bg-white border-slate-100 shadow-sm"
          }`}
        >
          <NetworkModal
            isDark={isDarkMode}
            selected={selectedNetwork}
            onSelect={setSelectedNetwork}
          />
          <div className="flex-1">
            <label
              className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 block ${
                isDarkMode ? "text-zinc-600" : "text-slate-300"
              }`}
            >
              Recipient Number
            </label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className="h-8 bg-transparent border-none text-xl font-black focus-visible:ring-0 p-0 placeholder:text-zinc-800"
              placeholder="0803 000 0000"
            />
          </div>
        </div>

        <div
          className={`p-6 rounded-[2.5rem] border transition-all ${
            isDarkMode
              ? "bg-[#1c1425] border-white/5"
              : "bg-white border-slate-100 shadow-sm"
          }`}
        >
          <label
            className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 block ${
              isDarkMode ? "text-zinc-600" : "text-slate-300"
            }`}
          >
            Enter Amount (₦)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black opacity-30">₦</span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 bg-transparent border-none text-3xl font-black focus-visible:ring-0 p-0 placeholder:text-zinc-800"
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-4 gap-2 mt-6">
            {[100, 200, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={async () => {
                  setAmount(amt.toString());
                  await Haptics.impact({ style: ImpactStyle.Light });
                }}
                className={`h-10 rounded-xl text-[11px] font-black transition-all active:scale-90 ${
                  amount === amt.toString()
                    ? "bg-emerald-500 text-white shadow-lg"
                    : isDarkMode
                    ? "bg-white/5 text-zinc-400"
                    : "bg-slate-50 text-slate-500"
                }`}
              >
                ₦{amt}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div
            className={`p-5 rounded-2xl text-[12px] font-black text-center border animate-in zoom-in-95 ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-red-500/10 text-red-500 border-red-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        <Button
          onClick={handlePurchase}
          disabled={isLoading || !amount || !phoneNumber}
          className={`w-full h-16 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95 flex gap-3 ${
            isDarkMode
              ? "bg-white text-black hover:bg-emerald-400"
              : "bg-slate-900 text-white hover:bg-emerald-500"
          }`}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Wallet size={18} strokeWidth={3} />
              Pay ₦{amount || "0"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
