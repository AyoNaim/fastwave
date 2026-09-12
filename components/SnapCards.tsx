"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Copy,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

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

  // Total cards = Virtual Accounts (or 1 Generate Card) + 1 Promotional Card
  const totalDots = (virtualAccounts.length > 0 ? virtualAccounts.length : 1) + 1;

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
        {/* --- CARD 1: DYNAMIC VIRTUAL ACCOUNTS (OR GENERATE ACCOUNT) --- */}
        {virtualAccounts.length > 0 ? (
          virtualAccounts.map((acc, index) => (
            <div
              key={index}
              className="min-w-[90%] sm:min-w-[400px] snap-center"
            >
              <Card
                style={{
                  backgroundImage: "url('/paga_bg.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                className="group relative h-[220px] w-full overflow-hidden transition-all duration-500 shadow-xl border-0"
              >
                {/* Dark overlay to ensure text is fully legible over the background image */}
                <div className="absolute inset-0 bg-black/60 z-0 transition-opacity duration-300" />

                <CardContent className="relative z-10 flex h-full flex-col justify-between p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
                          Instant Funding
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold tracking-tight text-white mt-1">
                        {acc.bankName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/20 px-3 py-1 text-[10px] font-bold text-amber-400 backdrop-blur-sm">
                      <ShieldCheck className="h-3 w-3" /> VIRTUAL
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div
                      onClick={() =>
                        handleCopy(acc.accountNumber, `virt-${index}`)
                      }
                      className="flex items-center justify-between cursor-pointer rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20 active:scale-[0.98]"
                    >
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-zinc-300 uppercase font-bold">
                          Account Number
                        </p>
                        <p className="text-xl font-mono font-bold tracking-wider text-white">
                          {acc.accountNumber}
                        </p>
                      </div>
                      {copied === `virt-${index}` ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <Copy className="h-5 w-5 text-zinc-300" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-300 font-semibold uppercase px-1">
                      Recipient:{" "}
                      <span className="text-white ml-1">
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

        {/* --- CARD 2: PROMOTIONAL CARD --- */}
        <div className="min-w-[90%] sm:min-w-[400px] snap-center">
          <Card
            style={{
              backgroundImage: "url('/palmpay_resized.jpg')",
              backgroundSize: "contain", /* Ensures the image fits entirely within the card */
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat", /* Prevents tiling if the image is smaller */
            }}
            className={cn(
              "group relative h-[220px] w-full overflow-hidden transition-all duration-500 shadow-xl border-0",
              isDarkMode ? "bg-zinc-950" : "bg-white" /* Blends letterboxing with the theme */
            )}
          >
            {/* Keeping it purely visual/promotional as requested */}
          </Card>
        </div>

        {/* Spacer for proper final scrolling */}
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