"use client";
import React from "react";
import {
  X,
  Smartphone,
  Wifi,
  Tv,
  Zap,
  Copy,
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
  const getStatusConfig = () => {
    switch (data.status) {
      case "success":
        return {
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
          icon: <CheckCircle2 size={14} />,
          label: "Successful",
        };
      case "pending":
        return {
          color: "text-amber-500",
          bg: "bg-amber-500/10",
          icon: <Clock size={14} />,
          label: "Processing",
        };
      default:
        return {
          color: "text-rose-500",
          bg: "bg-rose-500/10",
          icon: <AlertCircle size={14} />,
          label: "Failed",
        };
    }
  };

  const status = getStatusConfig();

  const getIcon = () => {
    const iconSize = 24;
    switch (data.type) {
      case "airtime":
        return <Smartphone size={iconSize} />;
      case "data":
        return <Wifi size={iconSize} />;
      case "cable":
        return <Tv size={iconSize} />;
      default:
        return <Zap size={iconSize} />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="relative group">
      <div className="absolute -top-12 right-0">
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

      <div
        className={`p-6 rounded-[2.5rem] transition-all border shadow-2xl ${
          isDark
            ? "bg-[#0f0a14] text-white border-white/5"
            : "bg-white text-slate-900 border-slate-100"
        }`}
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className={`w-16 h-16 ${status.bg} rounded-full flex items-center justify-center ${status.color} mb-4`}
          >
            {getIcon()}
          </div>

          <h2
            className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
              isDark ? "text-zinc-500" : "text-slate-400"
            }`}
          >
            {data.provider || "Transaction Receipt"}
          </h2>

          <div className="text-4xl font-black tracking-tighter mb-2">
            ₦{parseFloat(data.amount).toLocaleString()}
          </div>

          <div
            className={`flex items-center gap-1.5 ${status.bg} ${status.color} px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider`}
          >
            {status.icon}
            {status.label}
          </div>
        </div>

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
              label="Type"
              value={data.type.charAt(0).toUpperCase() + data.type.slice(1)}
              isDark={isDark}
            />
            <DetailRow label="Date & Time" value={data.date} isDark={isDark} />

            <Separator className={isDark ? "bg-white/5" : "bg-slate-200"} />

            <div className="flex justify-between items-start pt-2">
              <div className="flex flex-col">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    isDark ? "text-zinc-500" : "text-slate-400"
                  }`}
                >
                  Transaction No.
                </span>
                <span className="text-[12px] font-mono opacity-80 break-all max-w-[180px]">
                  {data.ref}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(data.ref)}
                className={`h-8 w-8 rounded-full ${
                  isDark ? "hover:bg-white/5" : "hover:bg-black/5"
                }`}
              >
                <Copy size={14} />
              </Button>
            </div>
          </div>
        </div>

        {data.status === "success" && data.cashback && (
          <div className="mt-4 flex justify-between items-center px-5 py-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              Bonus Earned
            </span>
            <span className="text-sm font-black text-emerald-500">
              +₦{data.cashback}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

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
    <div className="flex justify-between items-center">
      <span
        className={`text-[10px] font-bold uppercase tracking-wider ${
          isDark ? "text-zinc-500" : "text-slate-400"
        }`}
      >
        {label}
      </span>
      <span className="text-sm font-black tracking-tight">{value}</span>
    </div>
  );
}
