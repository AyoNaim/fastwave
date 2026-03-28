"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Smartphone,
  Wifi,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  History,
} from "lucide-react";

interface SmilePlan {
  id: string;
  name: string;
  validity: string;
  price: number;
}

const SmileService = () => {
  const [mode, setMode] = useState("data"); // 'data' or 'airtime'
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<SmilePlan[]>([]);

  // Dropdown states
  const [isAccountTypeOpen, setIsAccountTypeOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    phoneNumber: "",
    planId: "",
    amount: "",
    accountType: "phone_number",
  });

  const accountTypes = [
    { value: "phone_number", label: "Smile Phone Number" },
    { value: "account_number", label: "Smile Account ID" },
  ];

  // FIXED: Typed the ref correctly for a div
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Handle Dark Mode
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }

    // 2. Mocking plans
    setPlans([
      { id: "345", name: "Smile 1.5GB", validity: "30 Days", price: 1000 },
      { id: "346", name: "Smile 2GB", validity: "30 Days", price: 1200 },
      { id: "347", name: "Smile 5GB", validity: "30 Days", price: 3000 },
    ]);

    // 3. FIXED: Click Outside Logic with proper MouseEvent typing
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsAccountTypeOpen(false);
        setIsPlanOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePurchase = async () => {
    // FIXED: Bulletproof token extraction checking both local storage keys
    let userToken = localStorage.getItem("userToken") || "";

    if (!userToken) {
      const userSession = localStorage.getItem("user_session");
      try {
        userToken = userSession ? JSON.parse(userSession).token : "";
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }

    if (!userToken) return alert("Session expired. Please login again.");
    if (!formData.phoneNumber) return alert("Please enter a target number.");
    if (mode === "data" && !formData.planId)
      return alert("Please select a data bundle.");
    if (mode === "airtime" && !formData.amount)
      return alert("Please enter an amount.");

    setLoading(true);
    const endpoint = "https://fastwave.com.ng/app/api/smile/index.php";

    const payload = {
      token: userToken,
      number: formData.phoneNumber,
      ref: `SMILE_${Date.now()}`,
      account_type: formData.accountType,
      service_id: mode === "data" ? "smile-bundle" : "smile-airtime",
      plan_id: mode === "data" ? formData.planId : "",
      amount: mode === "airtime" ? formData.amount : "",
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === "success") {
        alert("Transaction Successful!");
        setFormData({ ...formData, amount: "", planId: "", phoneNumber: "" });
      } else {
        // This is likely where Ameenwebkey's error is surfacing
        alert(data.msg || "Transaction Failed");
      }
    } catch (error) {
      console.error("Purchase Error:", error);
      alert("Network Error: Could not connect to the service.");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans.find((p) => p.id === formData.planId);
  const selectedAccountType = accountTypes.find(
    (t) => t.value === formData.accountType
  );

  return (
    <div className="max-w-md w-full mx-auto bg-white dark:bg-slate-900 sm:rounded-2xl sm:shadow-lg sm:border border-gray-100 dark:border-slate-800 overflow-hidden font-sans transition-colors duration-300">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
            <Wifi size={20} className="text-yellow-950" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Smile Network
            </h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Data & Voice Recharge
            </p>
          </div>
        </div>
      </div>

      <div className="p-6" ref={formRef}>
        <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl mb-6">
          <button
            onClick={() => {
              setMode("data");
              setFormData({ ...formData, amount: "" });
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              mode === "data"
                ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500"
            }`}
          >
            <Wifi size={16} /> Data
          </button>
          <button
            onClick={() => {
              setMode("airtime");
              setFormData({ ...formData, planId: "" });
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              mode === "airtime"
                ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500"
            }`}
          >
            <Smartphone size={16} /> Airtime
          </button>
        </div>

        <div className="space-y-5">
          {/* Account Type */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Account Type
            </label>
            <button
              type="button"
              onClick={() => setIsAccountTypeOpen(!isAccountTypeOpen)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl"
            >
              <span className="text-gray-900 dark:text-white text-sm font-medium">
                {selectedAccountType?.label}
              </span>
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform ${
                  isAccountTypeOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isAccountTypeOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
                {accountTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setFormData({ ...formData, accountType: type.value });
                      setIsAccountTypeOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between"
                  >
                    {type.label}
                    {formData.accountType === type.value && (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {formData.accountType === "phone_number"
                ? "Phone Number"
                : "Account ID"}
            </label>
            <input
              type="text"
              placeholder={
                formData.accountType === "phone_number"
                  ? "e.g. 080..."
                  : "e.g. 102938..."
              }
              className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500/20"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
            />
          </div>

          {mode === "data" ? (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Select Bundle
              </label>
              <button
                type="button"
                onClick={() => setIsPlanOpen(!isPlanOpen)}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl"
              >
                <span
                  className={`text-sm font-medium ${
                    selectedPlan
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400"
                  }`}
                >
                  {selectedPlan ? selectedPlan.name : "Choose a data plan"}
                </span>
                <div className="flex items-center gap-2">
                  {selectedPlan && (
                    <span className="text-sm font-bold text-emerald-600">
                      ₦{selectedPlan.price}
                    </span>
                  )}
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform ${
                      isPlanOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>
              {isPlanOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setFormData({ ...formData, planId: p.id });
                        setIsPlanOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 border-b dark:border-slate-700 last:border-0 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.validity}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-emerald-600">
                        ₦{p.price}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Amount (₦)
              </label>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white text-sm font-medium"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
          )}

          <button
            disabled={loading}
            onClick={handlePurchase}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center shadow-md active:scale-95"
          >
            {loading ? (
              <Activity className="animate-spin" size={20} />
            ) : (
              "Pay Now"
            )}
          </button>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-gray-500">
          <ShieldCheck size={14} />
          <span className="text-xs font-medium uppercase tracking-wider">
            Secured
          </span>
        </div>
        <button className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
          <History size={14} /> History
        </button>
      </div>
    </div>
  );
};

export default SmileService;
