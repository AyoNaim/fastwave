"use client";
import React, { useState } from "react";
import {
  X,
  Smartphone,
  Wifi,
  Tv,
  Zap,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";

interface ReceiptProps {
  data: {
    id: string;
    amount: string;
    status: "success" | "pending" | "failed";
    type: "airtime" | "data" | "cable" | "electricity";
    recipient: string;
    date: string;
    ref: string;
    provider?: string;
    cashback?: string;
  };
  isDark?: boolean;
}

export default function TransactionReceipt({
  data,
  isDark = true,
}: ReceiptProps) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  /**
   * Standardized Status UI Logic
   */
  const getStatusConfig = () => {
    switch (data.status) {
      case "success":
        return {
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
          icon: <CheckCircle2 size={18} />,
          label: "Successful",
        };
      case "pending":
        return {
          color: "text-amber-500",
          bg: "bg-amber-500/10",
          icon: <Clock size={18} />,
          label: "Processing",
        };
      default:
        return {
          color: "text-rose-500",
          bg: "bg-rose-500/10",
          icon: <AlertCircle size={18} />,
          label: "Failed",
        };
    }
  };

  const status = getStatusConfig();

  /**
   * Service Icon Logic
   */
  const getServiceIcon = () => {
    const iconSize = 28;
    switch (data.type) {
      case "data":
        return <Wifi size={iconSize} />;
      case "cable":
        return <Tv size={iconSize} />;
      case "electricity":
        return <Zap size={iconSize} />;
      default:
        return <Smartphone size={iconSize} />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setShowToast(true);

    // Reset states after delay
    setTimeout(() => {
      setCopied(false);
      setShowToast(false);
    }, 2000);
  };

  return (
    <div className="relative group p-4 sm:p-0">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-emerald-500 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2">
            <Check size={14} strokeWidth={3} />
            <span className="text-xs font-black uppercase tracking-widest">
              Reference Copied
            </span>
          </div>
        </div>
      )}

      {/* Close Button positioned above the receipt */}
      <div className="absolute -top-12 right-4 sm:right-0">
        <DialogClose asChild>
          <Button
            size="icon"
            className={`rounded-full h-10 w-10 border shadow-xl transition-transform active:scale-90 ${
              isDark
                ? "bg-[#1c1425] border-white/10 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <X size={20} />
          </Button>
        </DialogClose>
      </div>

      {/* Main Receipt Card */}
      <div
        className={`p-6 rounded-[2.5rem] transition-all border shadow-2xl ${
          isDark
            ? "bg-[#0f0a14] text-white border-white/5"
            : "bg-white text-slate-900 border-slate-100"
        }`}
      >
        {/* Header Section: Icon, Provider, Amount */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className={`w-20 h-20 ${status.bg} rounded-full flex items-center justify-center ${status.color} mb-4 shadow-inner`}
          >
            {getServiceIcon()}
          </div>

          <h2
            className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
              isDark ? "text-zinc-500" : "text-slate-400"
            }`}
          >
            {data.provider || "Transaction Receipt"}
          </h2>

          <div className="text-4xl font-black tracking-tighter mb-3">
            ₦{parseFloat(data.amount).toLocaleString()}
          </div>

          <div
            className={`flex items-center gap-1.5 ${status.bg} ${status.color} px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider`}
          >
            {status.icon}
            {status.label}
          </div>
        </div>

        {/* Details Table */}
        <div
          className={`rounded-3xl p-6 border ${
            isDark
              ? "bg-[#1c1425] border-white/5"
              : "bg-slate-50 border-slate-100"
          }`}
        >
          <div className="space-y-4">
            <DetailRow
              label="Recipient"
              value={data.recipient}
              isDark={isDark}
            />
            <DetailRow
              label="Service Type"
              value={data.type.charAt(0).toUpperCase() + data.type.slice(1)}
              isDark={isDark}
            />
            <DetailRow label="Date & Time" value={data.date} isDark={isDark} />

            <Separator className={isDark ? "bg-white/5" : "bg-slate-200"} />

            {/* Transaction Reference Section */}
            <div className="flex justify-between items-start pt-2">
              <div className="flex flex-col">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    isDark ? "text-zinc-500" : "text-slate-400"
                  }`}
                >
                  Transaction Ref
                </span>
                <span className="text-[12px] font-mono opacity-80 break-all max-w-[200px] leading-tight select-none">
                  {data.ref}
                </span>
              </div>
              <Button
                variant="ghost"
                size={copied ? "default" : "icon"}
                onClick={() => copyToClipboard(data.ref)}
                className={`h-9 rounded-full shrink-0 transition-all ${
                  copied
                    ? "px-3 bg-emerald-500/10 text-emerald-500"
                    : isDark
                    ? "hover:bg-white/5 text-zinc-400 w-9"
                    : "hover:bg-black/5 text-slate-500 w-9"
                }`}
              >
                {copied ? (
                  <div className="flex items-center gap-1">
                    <Check size={14} />
                    <span className="text-[10px] font-black uppercase">
                      Copied
                    </span>
                  </div>
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Cashback / Bonus Section */}
        {data.status === "success" && data.cashback && (
          <div className="mt-4 flex justify-between items-center px-5 py-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">
                Bonus Earned
              </span>
              <span className="text-[9px] text-emerald-500/60 font-medium italic">
                Added to your bonus wallet
              </span>
            </div>
            <span className="text-lg font-black text-emerald-500">
              +₦{data.cashback}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Reusable row for detail items
 */
function DetailRow({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span
        className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${
          isDark ? "text-zinc-500" : "text-slate-400"
        }`}
      >
        {label}
      </span>
      <span className="text-[13px] font-black tracking-tight text-right truncate">
        {value}
      </span>
    </div>
  );
}
