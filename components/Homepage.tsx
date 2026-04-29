"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PullToRefresh from "pulltorefreshjs";
import {
  MoreHorizontal,
  MessageSquare,
  Home,
  LifeBuoy,
  Tag,
  User,
  Clock,
  Sun,
  Moon,
  X,
  ArrowRightLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import AccountUpgradeModal from "./UpgradeAccount";
import SnapCards from "./SnapCards";

// --- SERVICE ITEM COMPONENT ---
const ServiceItem = ({
  label,
  icon,
  color,
  isDark,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  isDark: boolean;
}) => {
  const handlePress = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {}
  };

  return (
    <div
      onClick={handlePress}
      className="flex flex-col items-center gap-2 active:scale-95 transition-transform cursor-pointer"
    >
      <div
        className={`${color} w-16 h-16 rounded-full flex items-center justify-center shadow-inner text-2xl`}
      >
        {icon}
      </div>
      <span
        className={`text-[11px] font-medium text-center leading-tight ${
          isDark ? "text-gray-300" : "text-slate-600"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

// --- MAIN DASHBOARD ---
export default function FintechDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);

  const adminPhone = "2347033578281";

  // Initialize with empty strings to prevent hydration mismatch
  const [userData, setUserData] = useState({
    displayName: "User",
    balance: "0.00",
    cashback: "0.00",
    phone: "",
  });

  const [activeModal, setActiveModal] = useState<
    null | "selection" | "action" | "success"
  >(null);
  const [isProcessingTransfer, setIsProcessingTransfer] = useState(false);

  /**
   * UPDATED: Sync logic to match your flat localStorage structure
   */
  const syncDataFromStorage = useCallback(() => {
    if (typeof window === "undefined") return;

    // Check for your flat structure first, then fallback to session if needed
    const id = localStorage.getItem("id") || localStorage.getItem("token");
    const fullName = localStorage.getItem("full_name");
    const balance = localStorage.getItem("balance");
    const cashback = localStorage.getItem("cashback");
    const phone = localStorage.getItem("phone");

    if (id) {
      setUserData({
        displayName: fullName?.split(" ")[0] || "User",
        phone: phone || "",
        balance: parseFloat(balance || "0").toLocaleString(undefined, {
          minimumFractionDigits: 2,
        }),
        cashback: parseFloat(cashback || "0").toLocaleString(undefined, {
          minimumFractionDigits: 2,
        }),
      });
    } else {
      // Fallback: Check if it's wrapped in user_session (old logic)
      const rawSession = localStorage.getItem("user_session");
      if (rawSession) {
        try {
          const session = JSON.parse(rawSession);
          const user = session.user_data || session; // handles nested or flat JSON
          setUserData({
            displayName: user?.full_name?.split(" ")[0] || "User",
            phone: user?.phone || "",
            balance: parseFloat(user?.balance || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            }),
            cashback: parseFloat(user?.cashback || 0).toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
              }
            ),
          });
        } catch (e) {
          console.error("Failed to parse session", e);
        }
      }
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

  // Setup PullToRefreshJS
  useEffect(() => {
    // Initialize PTR
    const ptr = PullToRefresh.init({
      mainElement: "body",
      onRefresh() {
        return handleRefresh();
      },
      distThreshold: 60,
      distMax: 90,
      shouldPullToRefresh: () => window.scrollY === 0,
    });

    // Cleanup
    return () => {
      ptr.destroy();
    };
  }, [handleRefresh]);

  const handleTransferCashback = async () => {
    setIsProcessingTransfer(true);
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {}
    try {
      const raw = localStorage.getItem("user_session");
      if (!raw) return;
      const session = JSON.parse(raw);
      const phone = session.user_data?.phone;

      if (!phone) return;

      const response = await fetch(
        "https://fastwave.com.ng/app/api/user/cashback-transfer/index.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        setActiveModal("success");
        handleRefresh();
      } else {
        alert(result.msg || "Transfer failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingTransfer(false);
    }
  };

  // --- ADDED: AUTO-REFRESH ON ARRIVAL ---
  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  useEffect(() => {
    syncDataFromStorage();

    // Theme setup
    const savedTheme = localStorage.getItem("app_theme");
    setIsDarkMode(savedTheme !== "light");

    // Timer for greeting
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Cross-tab sync
    const handleStorageChange = (e: StorageEvent) => {
      if (
        ["balance", "cashback", "full_name", "user_session"].includes(e.key!)
      ) {
        syncDataFromStorage();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [syncDataFromStorage]);

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("app_theme", newMode ? "dark" : "light");
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {}
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div
      className={`min-h-screen w-[100vw] transition-colors duration-500 pb-32 pt-safe px-6 ${
        isDarkMode ? "bg-[#0f0a14] text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Modals */}
      {activeModal && (
        <>
          <div
            onClick={() => setActiveModal(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
          />
          <div
            className={`fixed bottom-0 left-0 right-0 z-[101] p-6 rounded-t-[2.5rem] shadow-2xl transition-transform duration-300 transform translate-y-0 ${
              isDarkMode ? "bg-[#1c1425] text-white" : "bg-white text-slate-900"
            }`}
          >
            <div className="w-12 h-1.5 bg-gray-600/30 rounded-full mx-auto mb-6" />

            {activeModal === "selection" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Cashback Wallet</h3>
                  <X
                    onClick={() => setActiveModal(null)}
                    className="opacity-50 cursor-pointer"
                  />
                </div>
                <div
                  className={`p-5 rounded-2xl border ${
                    isDarkMode
                      ? "border-white/5 bg-white/5"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-500 mb-1">
                    Total Available
                  </p>
                  <p className="text-4xl font-bold">₦{userData.cashback}</p>
                </div>
                <button
                  onClick={() => setActiveModal("action")}
                  className="w-full py-7 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft className="h-5 w-5" /> Transfer to Main
                  Balance
                </button>
              </div>
            )}

            {activeModal === "action" && (
              <div className="space-y-6 text-center">
                <h3 className="text-xl font-bold">Confirm Transfer</h3>
                <p className="text-sm opacity-70">
                  Are you sure you want to move{" "}
                  <span className="text-emerald-500 font-bold">
                    ₦{userData.cashback}
                  </span>{" "}
                  to your main wallet?
                </p>
                <div className="flex items-center justify-center gap-6 py-4">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-2 text-2xl">
                      💰
                    </div>
                    <p className="text-[10px] font-bold opacity-50 uppercase">
                      Cashback
                    </p>
                  </div>
                  <ArrowRightLeft className="text-emerald-500 h-6 w-6" />
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-2 text-2xl">
                      🏦
                    </div>
                    <p className="text-[10px] font-bold opacity-50 uppercase">
                      Main Wallet
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setActiveModal("selection")}
                    className="flex-1 py-6 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    disabled={isProcessingTransfer}
                    onClick={handleTransferCashback}
                    className="flex-[2] py-6 rounded-xl bg-emerald-500 text-white font-bold"
                  >
                    {isProcessingTransfer ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      "Confirm & Transfer"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {activeModal === "success" && (
              <div className="space-y-6 text-center py-4">
                <div className="flex justify-center">
                  <CheckCircle2 className="w-20 h-20 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold">Transfer Successful!</h3>
                <p className="opacity-70 px-6">
                  Your cashback has been successfully moved to your main wallet
                  balance.
                </p>
                <Button
                  onClick={() => setActiveModal(null)}
                  className="w-full py-6 rounded-2xl bg-slate-800 text-white font-bold"
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Header */}
      <header className="flex justify-between items-center py-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-emerald-500">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback className="bg-emerald-500 text-white font-bold">
              {userData.displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${
              isDarkMode ? "bg-emerald-500/20" : "bg-slate-200"
            }`}
          >
            <div
              className={`absolute w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 transform ${
                isDarkMode
                  ? "translate-x-7 bg-emerald-500"
                  : "translate-x-0 bg-white shadow-sm"
              }`}
            >
              {isDarkMode ? (
                <Moon size={12} className="text-white" />
              ) : (
                <Sun size={12} className="text-amber-500" />
              )}
            </div>
          </button>
        </div>
        <div
          className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
            isDarkMode
              ? "bg-gray-800/50 text-emerald-400"
              : "bg-white shadow-sm text-emerald-600"
          }`}
        >
          <Link href={"/transactions"}>
            <Clock className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <div className="space-y-1 mb-8">
        <p
          className={`text-sm flex items-center gap-2 ${
            isDarkMode ? "text-gray-400" : "text-slate-500"
          }`}
        >
          {isDarkMode ? "🌙" : "☀️"}{" "}
          {currentTime.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()},<br />
          <span className="text-emerald-500">{userData.displayName}!</span>
        </h1>
      </div>

      <Card
        className={`relative border-none rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl transition-all duration-500 ${
          isDarkMode ? "bg-[#1c1425]" : "bg-white border border-slate-200"
        }`}
      >
        <CardContent className="p-7">
          <div className="flex justify-between items-center mb-6">
            <div
              className={`flex items-center gap-2 text-xs font-bold tracking-widest uppercase ${
                isDarkMode ? "text-gray-400" : "text-slate-400"
              }`}
            >
              <span className="text-orange-300 text-lg">✦</span> Main Wallet
            </div>
            <div className="flex gap-2">
              <Link href="/fund">
                <Button
                  size="sm"
                  className={`rounded-full px-5 font-bold active:scale-90 transition-transform ${
                    isDarkMode
                      ? "bg-white text-black hover:bg-gray-200"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  Add Money
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveModal("selection")}
                className={`rounded-full h-9 w-9 ${
                  isDarkMode
                    ? "bg-gray-800/50 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <h2
              className={`text-5xl tracking-tighter font-bold ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              <span className="text-2xl mr-1 text-emerald-500 font-medium">
                ₦
              </span>
              {userData.balance}
            </h2>
            <div
              onClick={() => setActiveModal("selection")}
              className="text-xs flex items-center gap-2 mt-2 cursor-pointer active:opacity-60 transition-all"
            >
              <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
                ₦{userData.cashback}
              </span>
              <span
                className={`font-medium ${
                  isDarkMode ? "text-gray-500" : "text-slate-400"
                }`}
              >
                Available Cashback
              </span>
            </div>
          </div>

          {/* The Account Upgrade Modal Trigger */}
          <AccountUpgradeModal />
        </CardContent>
      </Card>

      {/* account number snap cards  */}

      <SnapCards />

      <div
        className={`rounded-[2.5rem] p-8 grid grid-cols-3 gap-y-10 gap-x-4 relative border transition-all duration-500 shadow-xl ${
          isDarkMode
            ? "bg-[#1c1425]/40 border-white/5"
            : "bg-white border-slate-100"
        }`}
      >
        <Link href={"./data"}>
          <ServiceItem
            isDark={isDarkMode}
            label="Cheap Data"
            color="bg-[#d1c4f9]"
            icon="📡"
          />
        </Link>
        <Link href={"./airtime"}>
          <ServiceItem
            isDark={isDarkMode}
            label="Airtime"
            color="bg-[#b4f0d5]"
            icon="📞"
          />
        </Link>
        <Link href={"./cable"}>
          <ServiceItem
            isDark={isDarkMode}
            label="Cable TV"
            color="bg-[#f9c4eb]"
            icon="📺"
          />
        </Link>
        <div
          onClick={async () => {
            try {
              await Haptics.impact({ style: ImpactStyle.Medium });
            } catch (e) {}
            window.open(
              `https://wa.me/${adminPhone}?text=hey there, i want to exchange my airtime for cash`,
              "_blank"
            );
          }}
        >
          <ServiceItem
            isDark={isDarkMode}
            label="Airtime 2 cash"
            color="bg-[#fce5b4]"
            icon="💳"
          />
        </div>
        <Link href={"./electricity"}>
          <ServiceItem
            isDark={isDarkMode}
            label="Electricity"
            color="bg-[#b4e6f0]"
            icon="⭐"
          />
        </Link>
        <Link href={"./exam"}>
          <ServiceItem
            isDark={isDarkMode}
            label="Exam"
            color="bg-[#b4c7f0]"
            icon={<span className="text-sm font-black italic">Exam</span>}
          />
        </Link>
        <div
          className="col-span-3 flex flex-col items-center mt-6 gap-4"
          onClick={async () => {
            try {
              await Haptics.impact({ style: ImpactStyle.Medium });
            } catch (e) {}
            window.open(
              `https://wa.me/${adminPhone}?text=${encodeURIComponent(
                "Hello, I am using the Fastwave App. I would like to suggest a new service: "
              )}`,
              "_blank"
            );
          }}
        >
          <p
            className={`text-[11px] uppercase tracking-widest font-bold ${
              isDarkMode ? "text-gray-500" : "text-slate-400"
            }`}
          >
            Need more services?
          </p>
          <Button
            variant="outline"
            className={`rounded-full bg-transparent px-8 active:scale-95 transition-all ${
              isDarkMode
                ? "border-gray-700 text-gray-300 hover:bg-white/5"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            Suggest a Product
          </Button>
        </div>
        <div
          className="absolute right-4 -bottom-6 bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-90 transition-transform cursor-pointer z-10"
          onClick={async () => {
            try {
              await Haptics.impact({ style: ImpactStyle.Medium });
            } catch (e) {}
            const userName = userData.displayName || "User";
            window.open(
              `https://wa.me/${adminPhone}?text=${encodeURIComponent(
                `Hello Admin, I am ${userName}. I need assistance with the Fastwave App.`
              )}`,
              "_blank"
            );
          }}
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={`fixed bottom-0 left-0 right-0 border-t px-8 py-4 flex justify-between items-end pb-8 backdrop-blur-xl transition-all duration-500 z-50 ${
          isDarkMode
            ? "bg-black/80 border-white/5"
            : "bg-white/90 border-slate-100"
        }`}
      >
        <NavItem active label="Home" icon={<Home />} isDark={isDarkMode} />
        <Link href="/support">
          <NavItem label="Support" icon={<LifeBuoy />} isDark={isDarkMode} />
        </Link>
        <Link href={"/pricing"}>
          <NavItem label="Pricing" icon={<Tag />} isDark={isDarkMode} />
        </Link>
        <Link href={"/profile"}>
          <NavItem label="Me" icon={<User />} isDark={isDarkMode} />
        </Link>
      </nav>
    </div>
  );
}

const NavItem = ({ label, icon, active = false, isDark }: any) => (
  <div
    className={`flex flex-col items-center gap-1.5 transition-colors ${
      active ? "text-emerald-400" : isDark ? "text-gray-600" : "text-slate-400"
    }`}
  >
    <div className={`${active ? "bg-emerald-400/10 p-2 rounded-xl" : "p-2"}`}>
      {React.cloneElement(icon, { size: 22 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-tight">
      {label}
    </span>
  </div>
);
