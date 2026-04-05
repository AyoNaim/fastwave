"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, Loader2, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { NetworkModal } from "./NetworkModal";
import { useRouter } from "next/navigation";

const NETWORK_DATA = [
  {
    id: "1",
    name: "MTN",
    prefixes: [
      "0803",
      "0806",
      "0703",
      "0706",
      "0813",
      "0816",
      "0903",
      "0906",
      "0913",
      "0916",
      "0702",
      "0704",
      "0810",
      "0814",
    ],
    icon: "/mtn-logo.svg",
    color: "bg-yellow-400",
  },
  {
    id: "2",
    name: "GLO",
    prefixes: ["0805", "0807", "0705", "0815", "0811", "0905", "0915"],
    icon: "/glo-logo.svg",
    color: "bg-green-500",
  },
  {
    id: "3",
    name: "AIRTEL",
    prefixes: [
      "0802",
      "0808",
      "0708",
      "0812",
      "0701",
      "0902",
      "0901",
      "0907",
      "0912",
      "0917",
    ],
    icon: "/airtel-logo.svg",
    color: "bg-red-500",
  },
  {
    id: "4",
    name: "9MOBILE",
    prefixes: ["0809", "0817", "0818", "0909", "0908"],
    icon: "/9mobile-logo.svg",
    color: "bg-green-900",
  },
];

export default function BuyDataPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPlans, setIsFetchingPlans] = useState(true);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORK_DATA[0]);
  const [isManualNetwork, setIsManualNetwork] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const syncDataFromStorage = useCallback(() => {
    const raw = localStorage.getItem("user_session");
    if (raw) {
      const session = JSON.parse(raw);
      setBalance(session.user_data?.balance || "0.00");
    }
  }, []);

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
          localStorage.setItem("balance", user.balance);
          localStorage.setItem("cashback", user.cashback);
          localStorage.setItem("full_name", user.full_name);
          if (result.token) localStorage.setItem("token", result.token);

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

    // Initial Page Load: Sync and Refresh
    syncDataFromStorage();
    handleRefresh();
    fetchPlans();
  }, [handleRefresh, syncDataFromStorage]);

  const fetchPlans = async () => {
    try {
      setIsFetchingPlans(true);
      const lagosTime = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Lagos",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      const [d, m, y] = lagosTime.split("/");
      const token = `Token ${y}${m}${d}`;

      const response = await fetch(
        "https://fastwave.com.ng/app/api/data/plans/index.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
        }
      );
      const result = await response.json();
      if (result.status === "success") setAllPlans(result.data);
    } catch (err) {
      console.error("Failed to load plans", err);
    } finally {
      setIsFetchingPlans(false);
    }
  };

  useEffect(() => {
    if (phoneNumber.length >= 4 && !isManualNetwork) {
      const prefix = phoneNumber.substring(0, 4);
      const detected = NETWORK_DATA.find((net) =>
        net.prefixes.includes(prefix)
      );
      if (detected && detected.id !== selectedNetwork.id) {
        setSelectedNetwork(detected);
        Haptics.impact({ style: ImpactStyle.Light });
      }
    }
    if (phoneNumber.length === 0) setIsManualNetwork(false);
  }, [phoneNumber, isManualNetwork, selectedNetwork.id]);

  const handleNetworkSelect = (net: any) => {
    setSelectedNetwork(net);
    setIsManualNetwork(true);
  };

  const handlePurchase = async (e: React.MouseEvent, plan: any) => {
    e.stopPropagation();
    if (phoneNumber.length < 11) {
      setMessage({ type: "error", text: "Enter valid 11-digit phone number" });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    await Haptics.impact({ style: ImpactStyle.Heavy });

    try {
      const lagosTime = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Lagos",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      const [d, m, y] = lagosTime.split("/");
      const authToken = `Token ${y}${m}${d}`;

      const payload = {
        network: String(selectedNetwork.id),
        phone: phoneNumber,
        ref: `DATA_${Date.now()}`,
        amount: String(plan.userprice),
        plan: String(plan.planid),
      };

      const response = await fetch(
        "https://fastwave.com.ng/app/api/data/index.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.status === "success" || result.status === "successful") {
        setMessage({
          type: "success",
          text: result.msg || "Purchased Successfully!",
        });
        await Haptics.notification({ type: NotificationType.Success });
      } else {
        setMessage({ type: "error", text: result.msg || "Transaction Failed" });
        await Haptics.notification({ type: NotificationType.Error });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: "Check your internet connection and try again.",
      });
      await Haptics.notification({ type: NotificationType.Error });
    } finally {
      // Refresh logic after transaction (successful or not)
      await handleRefresh();
      setIsLoading(false);
      setTimeout(() => setMessage(null), 6000);
    }
  };

  const currentPlans = allPlans.filter(
    (plan) => String(plan.datanetwork) === selectedNetwork.id
  );

  return (
    <div
      className={`min-h-screen w-[100vw] overflow-x-hidden pt-safe pb-10 font-sans ${
        isDarkMode ? "bg-[#0f0a14] text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {message && (
        <div className="fixed top-10 left-5 right-5 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : "bg-red-500/10 border-red-500/20 text-red-500"
            } backdrop-blur-xl`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={20} className="shrink-0" />
            ) : (
              <XCircle size={20} className="shrink-0" />
            )}
            <p className="text-xs font-black leading-tight uppercase tracking-tight">
              {message.text}
            </p>
          </div>
        </div>
      )}

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
          className={`px-4 py-2 rounded-full flex items-center gap-2 border ${
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
        <h1 className="text-4xl font-black tracking-tighter">Cheap Data</h1>
        <p
          className={`text-sm font-medium mt-1 ${
            isDarkMode ? "text-zinc-500" : "text-slate-400"
          }`}
        >
          Connectivity for{" "}
          <span className="text-emerald-500 uppercase font-black">
            {selectedNetwork.name}
          </span>
        </p>
      </div>

      <div
        className={`mx-5 mb-8 p-4 rounded-[2rem] border flex items-center gap-4 ${
          isDarkMode
            ? "bg-[#1c1425] border-white/5"
            : "bg-white border-slate-100 shadow-sm"
        }`}
      >
        <NetworkModal
          isDark={isDarkMode}
          selected={selectedNetwork}
          onSelect={handleNetworkSelect}
        />
        <div className="flex-1 min-w-0">
          <label
            className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 block ${
              isDarkMode ? "text-zinc-600" : "text-slate-300"
            }`}
          >
            Receiver Phone
          </label>
          <Input
            type="tel"
            maxLength={11}
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value.replace(/\D/g, ""));
              setIsManualNetwork(false);
            }}
            className="h-8 bg-transparent border-none text-xl font-black focus-visible:ring-0 p-0 placeholder:text-zinc-800"
            placeholder="08030000000"
          />
        </div>
      </div>

      <div className="px-5 space-y-4 pb-10">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-50">
            Available Bundles
          </h3>
          <div className="h-[1px] flex-1 bg-current opacity-5 ml-4" />
        </div>

        {isFetchingPlans ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-emerald-500" />
          </div>
        ) : currentPlans.length > 0 ? (
          currentPlans.map((plan) => (
            <div
              key={plan.pId}
              onClick={(e) => !isLoading && handlePurchase(e, plan)}
              className={`group rounded-[2rem] p-5 flex justify-between items-center gap-3 border transition-all cursor-pointer active:scale-90 w-full ${
                isDarkMode
                  ? "bg-[#1c1425] border-white/5"
                  : "bg-white border-slate-100 shadow-sm"
              }`}
            >
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xl font-black tracking-tighter truncate group-hover:text-emerald-500 transition-colors">
                  {plan.name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-[8px] px-2 py-1 rounded-md font-black uppercase shrink-0 ${
                      isDarkMode
                        ? "bg-zinc-800 text-zinc-400"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {plan.day} Days
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-500 text-[8px] px-2 py-1 rounded-md font-black uppercase shrink-0">
                    {plan.type}
                  </span>
                </div>
              </div>
              <Button
                disabled={isLoading}
                className={`rounded-xl font-black px-4 h-10 shrink-0 min-w-[80px] ${
                  isDarkMode
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  `₦${plan.userprice}`
                )}
              </Button>
            </div>
          ))
        ) : (
          <div className="py-20 text-center opacity-20 font-black uppercase tracking-widest italic">
            No Plans Found
          </div>
        )}
      </div>
    </div>
  );
}
