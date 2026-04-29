"use client";
import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Zap,
  Crown,
  CheckCircle2,
  Loader2,
  ArrowRight,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

export default function AccountUpgradeModal() {
  const [upgradeType, setUpgradeType] = useState("vendor");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sync with localStorage on mount
  useEffect(() => {
    const theme = localStorage.getItem("app_theme");
    setIsDarkMode(theme === "dark");
  }, []);

  const handleRefresh = async () => {
    try {
      const raw = localStorage.getItem("user_session");
      if (!raw) return;
      const session = JSON.parse(raw);
      const phone = session.user_data?.phone || localStorage.getItem("phone");

      if (!phone) return;

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
        const user = result.user_data;
        if (user) {
          localStorage.setItem("balance", user.balance);
          localStorage.setItem(
            "user_session",
            JSON.stringify({
              ...session,
              user_data: { ...session.user_data, ...user },
            })
          );
          // Trigger a window event or local state update if necessary to update UI balance
          window.dispatchEvent(new Event("storage"));
        }
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    setMessage(null);
    const apiKey = localStorage.getItem("userToken");
    const BASE_URL = "https://fastwave.com.ng/app/api/user";

    await Haptics.impact({ style: ImpactStyle.Heavy });

    const endpoint =
      upgradeType === "vendor"
        ? `${BASE_URL}/upgrade-vendor/index.php`
        : `${BASE_URL}/upgrade-agent/index.php`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ upgrade: true }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setMessage({
          type: "success",
          text: data.msg || "Upgrade successful!",
        });
        await Haptics.notification({ type: NotificationType.Success });
        await handleRefresh();
      } else {
        setMessage({ type: "error", text: data.msg || "Upgrade Failed" });
        await Haptics.notification({ type: NotificationType.Error });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Check your internet connection and try again.",
      });
      await Haptics.notification({ type: NotificationType.Error });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 6000);
    }
  };

  const perks: any = {
    vendor: [
      "costs only a #1000 naira",
      "Access to Vendor pricing",
      "Instant cashback on all airtime",
      "Dedicated priority support",
    ],
    agent: [
      "costs only a #1000 naira",
      "Lowest possible pricing (Agent rate)",
      "Maximum referral commission",
      "White-label branding options",
      "API access for developers",
    ],
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={`absolute bottom-6 right-7 p-3 rounded-2xl shadow-lg transition-all active:scale-95 group ${
            isDarkMode
              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-emerald-500/20"
              : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
          }`}
        >
          <ShieldCheck className="h-6 w-6 group-hover:rotate-12 transition-transform" />
        </button>
      </DialogTrigger>

      <DialogContent
        className={`sm:max-w-[400px] border-none rounded-[2.5rem] p-0 overflow-hidden ${
          isDarkMode ? "bg-[#150f1d] text-white" : "bg-white"
        }`}
      >
        {/* Custom Message Toast - Exactly like Buy Data Page */}
        {message && (
          <div className="fixed top-6 left-5 right-5 z-[110] animate-in fade-in slide-in-from-top-4 duration-300">
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

        <div
          className={`p-8 ${
            isDarkMode
              ? "bg-gradient-to-b from-emerald-500/10 to-transparent"
              : "bg-slate-50"
          }`}
        >
          <DialogHeader className="mb-6">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
              <Crown className="text-white h-6 w-6" />
            </div>
            <DialogTitle className="text-3xl font-bold tracking-tight">
              Level Up
            </DialogTitle>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              Choose a plan that fits your business scale.
            </p>
          </DialogHeader>

          <Tabs
            defaultValue="vendor"
            onValueChange={setUpgradeType}
            className="w-full"
          >
            <TabsList
              className={`grid w-full grid-cols-2 p-1 rounded-2xl h-12 mb-8 ${
                isDarkMode ? "bg-gray-800/50" : "bg-slate-200/50"
              }`}
            >
              <TabsTrigger
                value="vendor"
                className="rounded-xl font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              >
                Vendor
              </TabsTrigger>
              <TabsTrigger
                value="agent"
                className="rounded-xl font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              >
                Agent
              </TabsTrigger>
            </TabsList>

            <div
              className={`rounded-[2rem] p-6 mb-8 transition-all duration-300 ${
                isDarkMode
                  ? "bg-white/5 border border-white/10"
                  : "bg-white border border-slate-100 shadow-xl shadow-slate-200/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                {upgradeType === "vendor" ? (
                  <Zap className="text-amber-400 h-5 w-5" />
                ) : (
                  <Crown className="text-emerald-400 h-5 w-5" />
                )}
                <span className="font-bold uppercase tracking-wider text-xs">
                  Benefits
                </span>
              </div>

              <ul className="space-y-3">
                {perks[upgradeType].map((perk: any, i: any) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm font-medium"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <span
                      className={
                        isDarkMode ? "text-gray-300" : "text-slate-600"
                      }
                    >
                      {perk}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Tabs>

          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className={`w-full h-14 rounded-2xl font-bold text-lg transition-all active:scale-95 ${
              isDarkMode
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <span className="flex items-center gap-2">
                Upgrade Now <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
