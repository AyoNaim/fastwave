"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import {
  ChevronLeft,
  CreditCard,
  Banknote,
  Landmark,
  History,
  RefreshCw,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Loader2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const API_BASE_URL = "https://fastwave.com.ng/app/api/fund-wallet/index.php";

interface VirtualAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export default function FundAccountPage() {
  const router = useRouter();
  const [balance, setBalance] = useState("0.00");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [showBankModal, setShowBankModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [virtualAccounts, setVirtualAccounts] = useState<VirtualAccount[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [manualData, setManualData] = useState({
    senderBank: "",
    senderName: "",
    amount: "",
  });

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    const raw = localStorage.getItem("user_session");
    const token = localStorage.getItem("userToken");
    if (!raw || !token) return;

    const session = JSON.parse(raw);
    setBalance(parseFloat(session.user_data?.balance || "0").toFixed(2));

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

  useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme");
    setIsDarkMode(savedTheme !== "light");
    fetchData();
  }, [fetchData]);

  const refreshBalance = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const copyToClipboard = async (text: string, field: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    await Haptics.notification({ type: NotificationType.Success });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleMethodClick = async (method: string) => {
    await Haptics.impact({ style: ImpactStyle.Medium });
    if (method === "bank") setShowBankModal(true);
    if (method === "manual") setShowManualModal(true);
    if (method === "card") toast.info("Card payment coming soon");
  };

  const handleGenerateAccount = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return;
    setIsGenerating(true);
    await Haptics.impact({ style: ImpactStyle.Heavy });

    try {
      const response = await fetch(
        `https://fastwave.com.ng/app/debug.php?token=${encodeURIComponent(
          token
        )}`,
        {
          method: "POST",
        }
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

  const submitManualVerification = async () => {
    setMessage(null);
    if (
      !manualData.senderBank ||
      !manualData.senderName ||
      !manualData.amount
    ) {
      setMessage({ type: "error", text: "Required fields are missing" });
      return;
    }

    const token = localStorage.getItem("userToken");
    setIsSubmittingManual(true);

    try {
      await Haptics.impact({ style: ImpactStyle.Medium });

      const response = await fetch(
        "https://fastwave.com.ng/app/api/fund-wallet/manual/index.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "manual_fund",
            account: `${manualData.senderName} (${manualData.senderBank})`,
            amount: manualData.amount,
          }),
        }
      );

      const result = await response.json();

      if (result.status === "success" || result.status === "successful") {
        await Haptics.notification({ type: NotificationType.Success });
        setMessage({
          type: "success",
          text: result.msg || "Proof submitted successfully!",
        });

        // Delay closing so user sees the success state
        setTimeout(() => {
          setShowVerifyModal(false);
          setShowManualModal(false);
          setManualData({ senderBank: "", senderName: "", amount: "" });
          setMessage(null);
        }, 3000);
      } else {
        setMessage({ type: "error", text: result.msg || "Submission failed" });
        await Haptics.notification({ type: NotificationType.Error });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Connection error. Please try again.",
      });
      await Haptics.notification({ type: NotificationType.Error });
    } finally {
      setIsSubmittingManual(false);
      // Auto-clear error messages after 5 seconds
      if (message?.type === "error") {
        setTimeout(() => setMessage(null), 5000);
      }
    }
  };

  return (
    <div
      className={`min-h-screen w-full px-5 pt-safe pb-10 font-sans overflow-x-hidden ${
        isDarkMode ? "bg-[#0f0a14] text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <header className="flex justify-between items-center py-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className={`rounded-full h-9 w-9 ${
            isDarkMode ? "bg-zinc-900 text-white" : "bg-white shadow-sm"
          }`}
        >
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-base font-bold tracking-tight">Fund Wallet</h1>
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full h-9 w-9 ${
            isDarkMode ? "bg-zinc-900 text-white" : "bg-white shadow-sm"
          }`}
        >
          <History size={18} />
        </Button>
      </header>

      {/* Premium Dynamic Toast Notification */}
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

      <Card
        className={`border-none rounded-[2rem] overflow-hidden mb-8 shadow-2xl ${
          isDarkMode ? "bg-[#1c1425]" : "bg-white"
        }`}
      >
        <CardContent className="p-8 flex flex-col items-center justify-center relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full" />
          <div className="flex items-center gap-2 mb-1 z-10">
            <p
              className={`text-[10px] font-bold uppercase tracking-widest ${
                isDarkMode ? "text-zinc-500" : "text-slate-400"
              }`}
            >
              Available Balance
            </p>
            <RefreshCw
              size={12}
              className={`cursor-pointer ${
                isRefreshing ? "animate-spin" : ""
              } ${isDarkMode ? "text-zinc-500" : "text-slate-400"}`}
              onClick={refreshBalance}
            />
          </div>
          <h2
            className={`text-4xl font-black tracking-tight z-10 ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            <span className="text-xl font-medium text-emerald-500 mr-1">₦</span>
            {parseFloat(balance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </h2>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p
          className={`text-[10px] font-bold uppercase tracking-widest ml-1 mb-1 ${
            isDarkMode ? "text-zinc-500" : "text-slate-400"
          }`}
        >
          Select Method
        </p>
        <FundingMethod
          isDark={isDarkMode}
          title="Virtual Account"
          desc="Instant automated funding"
          icon={<Landmark className="text-blue-500" />}
          onClick={() => handleMethodClick("bank")}
        />
        <FundingMethod
          isDark={isDarkMode}
          title="Manual Funding"
          desc="Verify transfer with admin"
          icon={<Banknote className="text-emerald-500" />}
          onClick={() => handleMethodClick("manual")}
        />
        <FundingMethod
          isDark={isDarkMode}
          title="Debit Card"
          desc="Instant top-up via Paystack"
          icon={<CreditCard className="text-orange-500" />}
          onClick={() => handleMethodClick("card")}
        />
      </div>

      {/* VIRTUAL ACCOUNT MODAL */}
      <Dialog open={showBankModal} onOpenChange={setShowBankModal}>
        <DialogContent
          className={`border-none p-0 fixed bottom-0 top-auto translate-y-0 translate-x-[-50%] rounded-t-[2.5rem] w-full max-w-[420px] ${
            isDarkMode ? "bg-zinc-950 text-white" : "bg-white text-slate-900"
          }`}
        >
          <div
            className={`w-12 h-1.5 rounded-full mx-auto mt-4 mb-2 ${
              isDarkMode ? "bg-zinc-800" : "bg-slate-200"
            }`}
          />
          <DialogHeader className="px-6 py-4">
            <DialogTitle className="text-left text-xl font-black">
              Automated Funding
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-10 space-y-5">
            {virtualAccounts.length === 0 ? (
              <div
                className={`p-8 rounded-[2rem] border-2 border-dashed flex flex-col items-center text-center space-y-4 ${
                  isDarkMode
                    ? "border-zinc-800 bg-zinc-900/30"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Plus className="text-blue-500" size={32} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-lg">No Account Found</h4>
                  <p className="text-xs text-zinc-500 px-4">
                    Generate your unique virtual accounts to start funding
                    instantly.
                  </p>
                </div>
                <Button
                  onClick={handleGenerateAccount}
                  disabled={isGenerating}
                  className="w-full h-12 rounded-full bg-blue-600 text-white font-bold"
                >
                  {isGenerating ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    "Generate Accounts"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {virtualAccounts.map((acc, i) => (
                  <div
                    key={i}
                    className={`p-5 rounded-[2rem] border relative ${
                      isDarkMode
                        ? "bg-zinc-900/50 border-zinc-800"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                          {acc.bankName}
                        </span>
                        <h3 className="text-xl font-black tracking-tighter">
                          {acc.accountNumber}
                        </h3>
                      </div>
                      <Button
                        onClick={() =>
                          copyToClipboard(acc.accountNumber, `bank_${i}`)
                        }
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-blue-500/10 text-blue-500"
                      >
                        {copiedField === `bank_${i}` ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </Button>
                    </div>
                    <p
                      className={`text-[10px] font-bold ${
                        isDarkMode ? "text-zinc-500" : "text-slate-400"
                      }`}
                    >
                      NAME: {acc.accountName}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MANUAL FUNDING MODAL */}
      <Dialog open={showManualModal} onOpenChange={setShowManualModal}>
        <DialogContent
          className={`border-none p-0 fixed bottom-0 top-auto translate-y-0 translate-x-[-50%] rounded-t-[2.5rem] w-full max-w-[420px] ${
            isDarkMode ? "bg-zinc-950 text-white" : "bg-white text-slate-900"
          }`}
        >
          <div
            className={`w-12 h-1.5 rounded-full mx-auto mt-4 mb-2 ${
              isDarkMode ? "bg-zinc-800" : "bg-slate-200"
            }`}
          />
          <DialogHeader className="px-6 py-4">
            <DialogTitle className="text-left text-xl font-black">
              Manual Funding
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-10 space-y-6">
            <div
              className={`p-6 rounded-[2rem] border ${
                isDarkMode
                  ? "bg-zinc-900/40 border-zinc-800"
                  : "bg-slate-50 border-slate-100"
              }`}
            >
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3">
                Admin Account Details
              </p>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-zinc-500">Bank Name</p>
                  <h4 className="font-bold">PalmPay</h4>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Account Name</p>
                  <h4 className="font-bold">ThankGod Osolo</h4>
                </div>
              </div>
              <div
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  isDarkMode ? "bg-zinc-950" : "bg-white border"
                }`}
              >
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">
                    Account Number
                  </p>
                  <p className="text-lg font-black tracking-wider">
                    8035917659
                  </p>
                </div>
                <Button
                  onClick={() => copyToClipboard("8035917659", "admin_acc")}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500"
                >
                  {copiedField === "admin_acc" ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </Button>
              </div>
            </div>

            <div
              className={`flex gap-3 p-4 rounded-2xl ${
                isDarkMode
                  ? "bg-amber-500/5 text-amber-500/80"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-[11px] leading-relaxed font-medium">
                Please ensure you transfer the exact amount and provide proof
                details correctly to avoid delays.
              </p>
            </div>

            <Button
              onClick={() => setShowVerifyModal(true)}
              className="w-full h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-900/20"
            >
              I have made the transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* VERIFICATION FORM MODAL */}
      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent
          className={`border-none p-0 fixed bottom-0 top-auto translate-y-0 translate-x-[-50%] rounded-t-[2.5rem] w-full max-w-[420px] ${
            isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-slate-900"
          }`}
        >
          <div
            className={`w-12 h-1.5 rounded-full mx-auto mt-4 mb-2 ${
              isDarkMode ? "bg-zinc-800" : "bg-slate-200"
            }`}
          />
          <DialogHeader className="px-6 py-4">
            <DialogTitle className="text-left text-xl font-black">
              Submit Payment Proof
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-10 space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase ml-1 text-zinc-500">
                Sender Bank Name
              </Label>
              <Input
                placeholder="e.g. GTBank, Kuda"
                value={manualData.senderBank}
                onChange={(e) =>
                  setManualData({ ...manualData, senderBank: e.target.value })
                }
                className={`h-12 rounded-2xl border-none ${
                  isDarkMode ? "bg-zinc-800" : "bg-slate-100"
                }`}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase ml-1 text-zinc-500">
                Your Account Name
              </Label>
              <Input
                placeholder="The name on your transfer receipt"
                value={manualData.senderName}
                onChange={(e) =>
                  setManualData({ ...manualData, senderName: e.target.value })
                }
                className={`h-12 rounded-2xl border-none ${
                  isDarkMode ? "bg-zinc-800" : "bg-slate-100"
                }`}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase ml-1 text-zinc-500">
                Amount Sent (₦)
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={manualData.amount}
                onChange={(e) =>
                  setManualData({ ...manualData, amount: e.target.value })
                }
                className={`h-12 rounded-2xl border-none ${
                  isDarkMode ? "bg-zinc-800" : "bg-slate-100"
                }`}
              />
            </div>

            <Button
              onClick={submitManualVerification}
              disabled={isSubmittingManual}
              className="w-full h-14 mt-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {isSubmittingManual ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                "Submit for Verification"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FundingMethod({ title, desc, icon, onClick, isDark }: any) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-4 border rounded-[1.8rem] cursor-pointer active:scale-[0.96] transition-all group ${
        isDark
          ? "bg-[#1c1425]/40 border-white/5 hover:bg-zinc-900/60"
          : "bg-white border-slate-100 shadow-sm"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          isDark ? "bg-zinc-900" : "bg-slate-50"
        }`}
      >
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <div className="flex-1">
        <h3
          className={`font-bold text-[15px] leading-tight ${
            isDark ? "text-zinc-100" : "text-slate-800"
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-[11px] mt-0.5 font-medium ${
            isDark ? "text-zinc-500" : "text-slate-400"
          }`}
        >
          {desc}
        </p>
      </div>
      <ChevronLeft
        className="rotate-180 text-zinc-800 group-hover:text-zinc-600"
        size={18}
      />
    </div>
  );
}
