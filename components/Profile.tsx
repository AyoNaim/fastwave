"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Mail,
  LogOut,
  ShieldCheck,
  AtSign,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  // NUCLEAR FIX: Initialize state directly from localStorage if possible to prevent flash
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    full_name: "Loading...",
    username: "...",
    phone: "...",
    balance: "...",
    joined: "...",
  });

  useEffect(() => {
    // 1. Theme Sync - Immediate check
    const savedTheme = localStorage.getItem("app_theme");
    const dark = savedTheme !== "light";
    setIsDarkMode(dark);

    // 2. Data Fetch from Local Storage
    const raw = localStorage.getItem("user_session");
    if (raw) {
      const session = JSON.parse(raw);
      const data = session.user_data;
      setUserData({
        full_name: data.full_name || "N/A",
        username:
          data.full_name?.toLowerCase().replace(/\s+/g, "_") || "user_unknown",
        phone: data.phone || "No phone linked",
        balance: data.balance || "0.00",
        joined: data.created_at || "Member",
      });
    }
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    await Haptics.impact({ style: ImpactStyle.Heavy });
    localStorage.removeItem("user_session");
    localStorage.clear();
    await Haptics.notification({ type: NotificationType.Success });
    router.push("/");
  };

  const ProfileItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string;
  }) => (
    <div
      className={`p-5 rounded-[1.5rem] border transition-all flex items-center gap-4 ${
        isDarkMode
          ? "bg-[#1c1425] border-white/5 text-white"
          : "bg-white border-slate-200/60 shadow-sm text-slate-900"
      }`}
    >
      <div
        className={`h-11 w-11 rounded-xl flex items-center justify-center ${
          isDarkMode ? "bg-white/5 text-zinc-400" : "bg-slate-50 text-slate-400"
        }`}
      >
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5`}
        >
          {label}
        </p>
        <p className="text-sm font-black tracking-tight truncate">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center ${
          isDarkMode ? "bg-[#0f0a14]" : "bg-slate-50"
        }`}
      >
        <div
          className={`animate-pulse font-black text-[10px] tracking-[0.3em] ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          VERIFYING IDENTITY...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full font-sans transition-colors duration-300 ${
        isDarkMode ? "bg-[#0f0a14] text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Header */}
      <header className="px-5 flex justify-between items-center py-8">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className={`rounded-full h-10 w-10 ${
            isDarkMode
              ? "bg-white/5 hover:bg-white/10"
              : "bg-white shadow-sm border border-slate-200"
          }`}
        >
          <ChevronLeft size={22} />
        </Button>
        <h2
          className={`text-[10px] font-black uppercase tracking-[0.4em] ${
            isDarkMode ? "text-zinc-500" : "text-slate-400"
          }`}
        >
          Identity Vault
        </h2>
        <div className="w-10" />
      </header>

      {/* Hero Section */}
      <div className="px-5 mb-10 text-center">
        <div className="relative inline-block mb-6">
          <div
            className={`h-24 w-24 rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-2xl ${
              isDarkMode
                ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white"
                : "bg-slate-900 text-white"
            }`}
          >
            {userData.full_name.charAt(0)}
          </div>
          {/* NUCLEAR FIX: Border color tied to background state */}
          <div
            className={`absolute -bottom-1 -right-1 h-7 w-7 rounded-full border-4 flex items-center justify-center ${
              isDarkMode
                ? "bg-emerald-500 border-[#0f0a14]"
                : "bg-emerald-500 border-slate-50"
            }`}
          >
            <ShieldCheck size={12} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-black tracking-tighter italic">
          {userData.full_name}
        </h1>
        <p
          className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${
            isDarkMode ? "text-zinc-600" : "text-slate-400"
          }`}
        >
          @{userData.username}
        </p>
      </div>

      {/* Information Grid */}
      <main className="px-5 space-y-3 max-w-md mx-auto">
        <ProfileItem
          icon={AtSign}
          label="Username"
          value={`@${userData.username}`}
        />
        <ProfileItem icon={Mail} label="Contact" value={userData.phone} />
        <ProfileItem
          icon={Wallet}
          label="Balance"
          value={`₦${parseFloat(userData.balance).toLocaleString()}`}
        />

        {/* Danger Zone Section */}
        <div
          className={`mt-8 p-6 rounded-[2rem] border transition-all ${
            isDarkMode
              ? "bg-red-500/5 border-red-500/10"
              : "bg-red-50/30 border-red-100"
          }`}
        >
          <h4 className="text-[9px] font-black uppercase tracking-widest text-red-500/60 mb-4">
            Security & Access
          </h4>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full h-14 rounded-2xl flex items-center justify-between px-6 hover:bg-red-500/10 text-red-600 transition-all font-black"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} />
              <span className="text-sm">Secure Sign Out</span>
            </div>
            <ChevronLeft size={16} className="rotate-180 opacity-30" />
          </Button>
        </div>

        <p
          className={`text-center text-[8px] font-bold uppercase tracking-[0.3em] py-8 ${
            isDarkMode ? "text-zinc-800" : "text-slate-300"
          }`}
        >
          Internal ID: {Math.random().toString(36).substring(7).toUpperCase()}
        </p>
      </main>
    </div>
  );
}
