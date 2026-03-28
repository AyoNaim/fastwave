"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Send,
  Mail,
  MessageCircle,
  ShieldQuestion,
  Sparkles,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { useRouter } from "next/navigation";

export default function SupportPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    message: "",
  });

  useEffect(() => {
    // 1. Theme Sync
    const savedTheme = localStorage.getItem("app_theme");
    setIsDarkMode(savedTheme !== "light");

    // 2. Pre-fill email from session if available
    const raw = localStorage.getItem("user_session");
    if (raw) {
      try {
        const session = JSON.parse(raw);
        setFormData((prev) => ({
          ...prev,
          email: session.user_data?.email || "",
        }));
      } catch (e) {
        console.error("Session parse error");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message || !formData.email) return;

    setLoading(true);
    await Haptics.impact({ style: ImpactStyle.Heavy });

    try {
      const response = await fetch(
        "https://fastwave.com.ng/app/api/issues/index.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        setTrackingId(result.tracking_id);
        await Haptics.notification({ type: NotificationType.Success });
        setSubmitted(true);
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error) {
      console.error("Support Error:", error);
      await Haptics.notification({ type: NotificationType.Error });
      // You could add a toast notification here for "Submission Failed"
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center px-8 text-center transition-colors duration-500 ${
          isDarkMode ? "bg-[#0f0a14] text-white" : "bg-slate-50 text-slate-900"
        }`}
      >
        <div className="h-24 w-24 bg-emerald-500/20 rounded-[2.5rem] flex items-center justify-center text-emerald-500 mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black tracking-tighter mb-2">
          Message Sent!
        </h2>
        <p className="opacity-60 text-sm mb-6">
          Our admin team will review your query and reach out via{" "}
          <span className="font-bold">{formData.email}</span>.
        </p>

        {/* Tracking ID Display */}
        {trackingId && (
          <div
            className={`mb-10 p-4 rounded-2xl border flex flex-col items-center gap-1 ${
              isDarkMode
                ? "bg-white/5 border-white/10"
                : "bg-white border-slate-200"
            }`}
          >
            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
              Tracking Number
            </span>
            <span className="text-xl font-mono font-bold text-emerald-500">
              {trackingId}
            </span>
          </div>
        )}

        <Button
          onClick={() => router.back()}
          className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black shadow-lg shadow-emerald-500/20"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`w-full min-h-screen pt-safe pb-10 font-sans transition-colors duration-500 ${
        isDarkMode ? "bg-[#0f0a14] text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Header */}
      <header className="px-5 flex justify-between items-center py-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className={`rounded-full h-10 w-10 ${
            isDarkMode
              ? "bg-zinc-900/50 text-white"
              : "bg-white shadow-sm border border-slate-100"
          }`}
        >
          <ChevronLeft size={24} />
        </Button>
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
          Support Vault
        </h2>
        <div className="h-10 w-10" />
      </header>

      <div className="px-6 mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500 rounded-lg text-white">
            <ShieldQuestion size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
            Help Center
          </span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white">
          Report an <br />
          <span className="text-emerald-500">Issue.</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="px-5 space-y-4">
        {/* Email Field */}
        <div
          className={`p-5 rounded-[2rem] border transition-all ${
            isDarkMode
              ? "bg-[#1c1425] border-white/5"
              : "bg-white border-slate-100 shadow-sm"
          }`}
        >
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 block">
            Your Registered Email
          </label>
          <div className="flex items-center gap-3">
            <Mail size={18} className="opacity-30" />
            <Input
              type="email"
              value={formData.email}
              required
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border-none bg-transparent p-0 h-auto focus-visible:ring-0 font-bold placeholder:opacity-20"
              placeholder="e.g. user@vault.com"
            />
          </div>
        </div>

        {/* Message Field */}
        <div
          className={`p-5 rounded-[2.5rem] border transition-all ${
            isDarkMode
              ? "bg-[#1c1425] border-white/5"
              : "bg-white border-slate-100 shadow-sm"
          }`}
        >
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 block">
            Describe the problem
          </label>
          <div className="flex gap-3">
            <MessageCircle size={18} className="opacity-30 mt-1" />
            <Textarea
              placeholder="Type your message here..."
              required
              value={formData.message}
              onChange={(e: any) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="border-none bg-transparent p-0 focus-visible:ring-0 min-h-[150px] resize-none font-medium leading-relaxed"
            />
          </div>
        </div>

        <p
          className={`text-[11px] px-2 opacity-50 font-medium leading-relaxed`}
        >
          By submitting, your message will be forwarded to our technical team.
          Responses are sent within 24 hours.
        </p>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={loading || !formData.message || !formData.email}
            className={`w-full h-16 rounded-[2rem] font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl ${
              isDarkMode
                ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 text-white"
                : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 text-white"
            }`}
          >
            {loading ? (
              <div className="h-6 w-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Submit Query</span>
                <Send size={20} />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Aesthetic Background Detail */}
      <div className="fixed bottom-0 right-0 opacity-10 pointer-events-none">
        <Sparkles size={300} strokeWidth={0.5} />
      </div>
    </div>
  );
}
