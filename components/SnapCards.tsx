"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Copy,
  Landmark,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner"; // Assuming sonner for toasts based on your logic

interface VirtualAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const API_BASE_URL = "https://fastwave.com.ng/app/api/fund-wallet/index.php";

export default function SnapCards() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Data States
  const [virtualAccounts, setVirtualAccounts] = useState<VirtualAccount[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Fetch Data Logic
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    try {
      const response = await fetch(API_BASE_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (result.status === "success" && Array.isArray(result.accounts)) {
        setVirtualAccounts(result.accounts);
      } else {
        setVirtualAccounts([]);
      }
    } catch (error) {
      console.error("Failed to load accounts:", error);
    }
  }, []);

  // 2. Generate Account Logic
  const handleGenerateAccount = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return;
    setIsGenerating(true);

    try {
      const response = await fetch(
        `https://fastwave.com.ng/app/debug.php?token=${encodeURIComponent(
          token
        )}`,
        { method: "POST" }
      );
      const result = await response.json();
      if (result.status === "success") {
        toast.success("Account created successfully!");
        await fetchData();
      } else {
        toast.error(result.msg || "Generation failed");
        if (result.msg?.toLowerCase().includes("exist")) fetchData();
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme");
    setIsDarkMode(savedTheme !== "light");
    fetchData();
  }, [fetchData]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / (clientWidth * 0.85));
      setActiveIndex(index);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Total cards = 1 (Manual) + (virtualAccounts OR 1 for the 'Generate' card)
  const totalDots =
    1 + (virtualAccounts.length > 0 ? virtualAccounts.length : 1);

  return (
    <div
      className={cn(
        "w-full py-10 font-sans transition-colors duration-500",
        isDarkMode ? "bg-transparent" : "bg-zinc-50/50"
      )}
    >
      <div className="px-3 mb-4 flex items-center justify-between">
        <h2
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.2em]",
            isDarkMode ? "text-zinc-500" : "text-zinc-400"
          )}
        >
          Funding Accounts
        </h2>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full gap-4 overflow-x-auto pb-8 snap-x snap-mandatory px-6 no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* --- CARD 1: MANUAL FUNDING (STATIC) --- */}
        <div className="min-w-[90%] sm:min-w-[400px] snap-center">
          <Card
            className={cn(
              "group relative h-[220px] w-full overflow-hidden transition-all duration-500 shadow-xl",
              isDarkMode
                ? "border-zinc-800 bg-zinc-950 text-white"
                : "border-zinc-200 bg-white text-zinc-900"
            )}
          >
            <div
              className={cn(
                "absolute -right-10 -top-10 h-40 w-40 rounded-full blur-[80px]",
                isDarkMode ? "bg-blue-600/10" : "bg-blue-500/10"
              )}
            />
            <CardContent className="relative flex h-full flex-col justify-between p-2">
              <div className="flex justify-between items-start">
                <div className="">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-zinc-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                      Manual Funding
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    PalmPay Bank
                  </h3>
                </div>
                <div
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px] border",
                    isDarkMode
                      ? "bg-zinc-900 border-zinc-800 text-zinc-400"
                      : "bg-zinc-100 border-zinc-200 text-zinc-500"
                  )}
                >
                  Standard
                </div>
              </div>
              <div className="space-y-4">
                <div
                  onClick={() => handleCopy("8035917659", "manual")}
                  className={cn(
                    "flex items-center justify-between cursor-pointer rounded-xl border p-4 transition-all",
                    isDarkMode
                      ? "bg-zinc-900/50 border-zinc-800/50"
                      : "bg-zinc-50 border-zinc-100"
                  )}
                >
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">
                      Account Number
                    </p>
                    <p
                      className={cn(
                        "text-lg font-mono font-bold tracking-wider",
                        isDarkMode ? "text-zinc-200" : "text-zinc-800"
                      )}
                    >
                      8035917659
                    </p>
                  </div>
                  {copied === "manual" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Copy className="h-5 w-5 text-zinc-400" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 uppercase font-semibold">
                  Name:{" "}
                  <span
                    className={isDarkMode ? "text-zinc-300" : "text-zinc-700"}
                  >
                    ThankGod Osolo
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- DYNAMIC VIRTUAL ACCOUNTS --- */}
        {virtualAccounts.length > 0 ? (
          virtualAccounts.map((acc, index) => (
            <div
              key={index}
              className="min-w-[90%] sm:min-w-[400px] snap-center"
            >
              <Card
                className={cn(
                  "group relative h-[220px] w-full overflow-hidden transition-all duration-500 shadow-xl",
                  isDarkMode
                    ? "border-zinc-800 bg-zinc-950 text-white shadow-[0_0_30px_-15px_rgba(168,85,247,0.15)]"
                    : "border-zinc-200 bg-white text-zinc-900"
                )}
              >
                <div
                  className={cn(
                    "absolute -right-10 -top-10 h-40 w-40 rounded-full blur-[80px]",
                    isDarkMode ? "bg-purple-600/10" : "bg-amber-400/10"
                  )}
                />
                <CardContent className="relative flex h-full flex-col justify-between p-2">
                  <div className="flex justify-between items-start">
                    <div className="">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-[0.2em]",
                            isDarkMode ? "text-amber-500/80" : "text-amber-600"
                          )}
                        >
                          Instant Funding
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold tracking-tight">
                        {acc.bankName}
                      </h3>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold",
                        isDarkMode
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                          : "bg-amber-50 border-amber-200 text-amber-600"
                      )}
                    >
                      <ShieldCheck className="h-3 w-3" /> VIRTUAL
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div
                      onClick={() =>
                        handleCopy(acc.accountNumber, `virt-${index}`)
                      }
                      className={cn(
                        "flex items-center justify-between cursor-pointer rounded-xl border p-4 transition-all",
                        isDarkMode
                          ? "bg-zinc-900/50 border-zinc-800/50"
                          : "bg-zinc-50 border-zinc-100"
                      )}
                    >
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold">
                          Account Number
                        </p>
                        <p
                          className={cn(
                            "text-lg font-mono font-bold tracking-wider",
                            isDarkMode ? "text-amber-100/90" : "text-zinc-800"
                          )}
                        >
                          {acc.accountNumber}
                        </p>
                      </div>
                      {copied === `virt-${index}` ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Copy className="h-5 w-5 text-zinc-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 font-semibold uppercase">
                      Recipient:{" "}
                      <span
                        className={
                          isDarkMode ? "text-zinc-300" : "text-zinc-700"
                        }
                      >
                        {acc.accountName}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        ) : (
          /* --- EMPTY STATE / GENERATE CARD --- */
          <div className="min-w-[85%] sm:min-w-[400px] snap-center">
            <Card
              className={cn(
                "group relative h-[220px] w-full border-dashed transition-all duration-500",
                isDarkMode
                  ? "border-zinc-800 bg-zinc-950/50"
                  : "border-zinc-300 bg-white"
              )}
            >
              <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
                <div
                  className={cn(
                    "mb-4 flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                    isDarkMode
                      ? "bg-zinc-900 text-zinc-500"
                      : "bg-zinc-100 text-zinc-400"
                  )}
                >
                  {isGenerating ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Sparkles className="h-6 w-6" />
                  )}
                </div>
                <h3
                  className={cn(
                    "mb-1 font-semibold",
                    isDarkMode ? "text-zinc-200" : "text-zinc-800"
                  )}
                >
                  No Virtual Account
                </h3>
                <p className="mb-6 text-xs text-zinc-500">
                  Generate a dedicated account for instant automated funding.
                </p>
                <button
                  disabled={isGenerating}
                  onClick={handleGenerateAccount}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-6 py-2 text-xs font-bold transition-all active:scale-95 disabled:opacity-50",
                    isDarkMode
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "bg-zinc-900 text-white hover:bg-black"
                  )}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {isGenerating ? "GENERATING..." : "GENERATE ACCOUNT"}
                </button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="min-w-[1px] pr-6" />
      </div>

      {/* --- DYNAMIC INDICATORS --- */}
      <div className="flex justify-center items-center gap-3">
        {Array.from({ length: totalDots }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1 rounded-full transition-all duration-500 ease-in-out",
              activeIndex === index
                ? isDarkMode
                  ? "bg-white w-8"
                  : "bg-zinc-900 w-8"
                : isDarkMode
                ? "bg-zinc-800 w-4"
                : "bg-zinc-300 w-4"
            )}
          />
        ))}
      </div>
    </div>
  );
}
