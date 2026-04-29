"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Smartphone,
  Gift,
  Inbox,
  Zap,
  Tv,
  Wifi,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import TransactionReceipt from "./Receipt";

interface Transaction {
  transref: string;
  servicename: string;
  servicedesc: string;
  amount: string;
  status: string | number;
  oldbal: string;
  newbal: string;
  date: string;
}

// Inner component to safely use useSearchParams
const TransactionContent = () => {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [openRef, setOpenRef] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme");
    const dark = savedTheme !== "light";
    setIsDarkMode(dark);

    const loadTransactions = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const response = await fetch(
          "https://fastwave.com.ng/app/api/transactions/index.php",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );
        const result = await response.json();
        if (result.status === "success" && Array.isArray(result.data)) {
          setTransactions(result.data);

          const refFromUrl = searchParams.get("ref");
          if (refFromUrl) {
            setOpenRef(refFromUrl);
          }
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, [searchParams]);

  const isSuccessful = (status: string | number) => {
    const s = String(status).toLowerCase().trim();
    return (
      s === "0" ||
      s === "5" ||
      s === "success" ||
      s === "successful" ||
      s === "completed" ||
      s.includes("succ")
    );
  };

  const mapType = (
    service: string,
    desc: string
  ): "airtime" | "data" | "cable" | "electricity" => {
    const combined = (service + " " + desc).toLowerCase();
    if (
      combined.includes("data") ||
      combined.includes("gb") ||
      combined.includes("mb") ||
      combined.includes("sme") ||
      combined.includes("gifting")
    )
      return "data";
    if (
      combined.includes("tv") ||
      combined.includes("cable") ||
      combined.includes("dstv") ||
      combined.includes("gotv") ||
      combined.includes("showmax") ||
      combined.includes("startimes")
    )
      return "cable";
    if (
      combined.includes("electric") ||
      combined.includes("power") ||
      combined.includes("meter") ||
      combined.includes("ekedc") ||
      combined.includes("ikedc")
    )
      return "electricity";
    return "airtime";
  };

  const parseRecipient = (desc: string, serviceName: string) => {
    const text = desc.trim();
    const emailMatch = text.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    );
    if (emailMatch) return emailMatch[0];
    const phoneMatch = text.match(/(070|080|081|090|091|020)\d{8}/);
    if (phoneMatch) return phoneMatch[0];
    const idMatch = text.match(/(?:to|for|id|account)\s+([a-zA-Z0-9]{5,})/i);
    if (idMatch) return idMatch[1];
    const fallbackNumbers = text.match(/\d{5,}/g);
    if (fallbackNumbers) return fallbackNumbers[fallbackNumbers.length - 1];
    return "N/A";
  };

  const extractDataVolume = (desc: string) => {
    const match = desc.match(/(\d+(?:\.\d+)?\s*(?:GB|MB|TB|KB))/i);
    return match ? match[0].toUpperCase().replace(/\s/g, "") : null;
  };

  const getIcon = (service: string, desc: string) => {
    const type = mapType(service, desc);
    const s = (service + " " + desc).toLowerCase();
    if (type === "data") return <Wifi className="text-blue-500" size={18} />;
    if (type === "cable") return <Tv className="text-orange-500" size={18} />;
    if (type === "electricity")
      return <Zap className="text-yellow-500" size={18} />;
    if (s.includes("bonus") || s.includes("interest") || s.includes("refund"))
      return <Gift className="text-emerald-500" size={18} />;
    return <Smartphone className="text-zinc-400" size={18} />;
  };

  if (loading) {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center ${
          isDarkMode ? "bg-[#0f0a14]" : "bg-slate-50"
        }`}
      >
        <div
          className={`animate-pulse font-black tracking-widest uppercase text-[10px] ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          Loading History...
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
      <header className="px-6 pt-12 pb-8 sticky top-0 z-10 backdrop-blur-md">
        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">
          Activity
        </h1>
        <p
          className={`text-[9px] font-bold uppercase tracking-[0.4em] mt-1 ${
            isDarkMode ? "text-zinc-500" : "text-slate-400"
          }`}
        >
          Transaction History
        </p>
      </header>

      <main className="px-4 pb-32 max-w-2xl mx-auto space-y-3">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
            <Inbox size={48} strokeWidth={1.5} />
            <p className="mt-4 font-bold uppercase tracking-widest text-[10px]">
              No Transactions
            </p>
          </div>
        ) : (
          transactions.map((tx) => {
            const success = isSuccessful(tx.status);
            const transactionType = mapType(tx.servicename, tx.servicedesc);
            const recipient = parseRecipient(tx.servicedesc, tx.servicename);
            const dataVolume = extractDataVolume(tx.servicedesc);
            const mainDisplayAmount =
              transactionType === "data" && dataVolume
                ? dataVolume
                : `₦${Math.abs(parseFloat(tx.amount)).toLocaleString()}`;

            return (
              <Dialog
                key={tx.transref}
                open={openRef === tx.transref}
                onOpenChange={(isOpen) => {
                  if (isOpen) setOpenRef(tx.transref);
                  else setOpenRef(null);
                }}
              >
                <DialogTrigger asChild>
                  <div
                    className={`flex items-center gap-4 p-4 rounded-[1.25rem] cursor-pointer transition-all active:scale-[0.97] border ${
                      isDarkMode
                        ? "bg-[#1c1425] border-white/5"
                        : "bg-white border-slate-200/60 shadow-sm"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isDarkMode ? "bg-black/40" : "bg-slate-50"
                      }`}
                    >
                      {getIcon(tx.servicename, tx.servicedesc)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-bold truncate leading-tight">
                        {tx.servicedesc}
                      </h3>
                      <p
                        className={`text-[10px] font-medium mt-0.5 ${
                          isDarkMode ? "text-zinc-500" : "text-slate-400"
                        }`}
                      >
                        {tx.date}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-black ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {mainDisplayAmount}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span
                          className={`text-[8px] font-black uppercase tracking-tight ${
                            success ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          {success ? "Success" : "Failed"}
                        </span>
                        <ChevronRight size={12} className="opacity-20" />
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent
                  className={`max-w-[92vw] rounded-[2rem] p-0 border-none overflow-hidden ${
                    isDarkMode ? "bg-[#1c1425]" : "bg-white"
                  }`}
                >
                  <DialogTitle className="sr-only">Receipt Details</DialogTitle>
                  <div className="w-full">
                    <TransactionReceipt
                      isDark={isDarkMode}
                      data={{
                        id: tx.transref,
                        amount:
                          transactionType === "data" && dataVolume
                            ? dataVolume
                            : Math.abs(parseFloat(tx.amount)).toString(),
                        cost: Math.abs(parseFloat(tx.amount)).toString(),
                        status: success ? "success" : "failed",
                        type: transactionType,
                        provider: tx.servicename,
                        recipient: recipient,
                        date: tx.date,
                        ref: tx.transref,
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            );
          })
        )}
      </main>
    </div>
  );
};

// Main Page with Suspense Boundary for build compliance
const TransactionPage = () => {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-[#0f0a14]">
          <div className="animate-pulse font-black tracking-widest uppercase text-[10px] text-white">
            Loading...
          </div>
        </div>
      }
    >
      <TransactionContent />
    </Suspense>
  );
};

export default TransactionPage;
