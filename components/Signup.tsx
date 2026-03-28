"use client";

import React, { useState, useMemo, memo } from "react";
import {
  ArrowLeft,
  EyeOff,
  Eye,
  XCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

// Memoized State Selector to prevent re-rendering 37+ items on every keystroke
const StateSelector = memo(
  ({ onValueChange }: { onValueChange: (val: string) => void }) => (
    <Select onValueChange={onValueChange}>
      <SelectTrigger className="w-full h-14 bg-gray-50 border-gray-200 focus:ring-1 focus:ring-yellow-500 rounded-xl px-4 text-base">
        <SelectValue placeholder="State of Residence" />
      </SelectTrigger>
      <SelectContent className="bg-white border-gray-200 max-h-[300px]">
        {NIGERIAN_STATES.map((stateName) => (
          <SelectItem key={stateName} value={stateName.toLowerCase()}>
            {stateName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
);
StateSelector.displayName = "StateSelector";

export default function PersonalDetailsScreen() {
  const router = useRouter();

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [referral, setReferral] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Optimization: Only recalculate password requirements when password changes
  const passwordReqs = useMemo(
    () => ({
      small: /[a-z]/.test(password),
      capital: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
      length: password.length >= 8,
    }),
    [password]
  );

  // Derived state for button disabled logic
  const isFormValid = useMemo(
    () =>
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      email.includes("@") &&
      state !== "" &&
      phone.length >= 10 &&
      pin.length === 5 &&
      Object.values(passwordReqs).every(Boolean) &&
      agreed,
    [firstName, lastName, email, state, phone, pin, passwordReqs, agreed]
  );

  const handleSignup = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      const response = await fetch(
        "https://fastwave.com.ng/app/api/user/signup/index.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            state,
            phone,
            pin,
            password,
            referral,
          }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        localStorage.clear();
        const storageData = {
          token: data.token,
          user_data: {
            id: String(data.user_data.id),
            full_name: data.user_data.full_name,
            phone: data.user_data.phone,
            email: data.user_data.email,
            state: data.user_data.state,
            balance: String(data.user_data.balance || "0"),
            cashback: String(data.user_data.cashback || "0.00"),
            token: data.token,
          },
        };

        localStorage.setItem("user_token", storageData.token);
        localStorage.setItem(
          "user_data",
          JSON.stringify(storageData.user_data)
        );

        window.location.href = "/dashboard";
      } else {
        alert(data.msg || "Registration failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("A connection error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-white text-black flex flex-col font-sans relative overflow-hidden">
      <div className="flex-1 overflow-y-auto px-5 pb-40 [&::-webkit-scrollbar]:hidden">
        <div className="flex justify-between items-center mb-4 pt-4">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 active:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-7 h-7 text-black" />
          </button>
        </div>

        <div className="mb-6">
          {/* <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="25" cy="15" r="5" fill="black" />
            <circle cx="15" cy="25" r="5" fill="black" />
            <circle cx="25" cy="25" r="5" fill="black" />
            <circle cx="35" cy="25" r="5" fill="black" />
            <circle cx="25" cy="35" r="5" fill="black" />
            <circle cx="17" cy="17" r="4" fill="black" />
            <circle cx="33" cy="33" r="4" fill="black" />
            <path
              d="M18 18L22 22M28 22L32 18M18 32L22 28M28 28L32 32"
              stroke="black"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg> */}
          <img
            src={"./fastwave_color.png"}
            alt="logo"
            width={130}
            height={130}
          />
        </div>

        <h1 className="text-[32px] font-bold tracking-tight mb-3">
          Personal details
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed mb-8">
          Ensure you enter your correct details. You won't be able to change
          this once you submit.
        </p>

        <div className="flex flex-col gap-5">
          <Input
            placeholder="Official First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full h-14 bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-yellow-500 rounded-xl pl-4 text-base"
          />

          <Input
            placeholder="Official Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full h-14 bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-yellow-500 rounded-xl pl-4 text-base"
          />

          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-14 bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-yellow-500 rounded-xl pl-4 text-base"
          />

          <StateSelector onValueChange={setState} />

          <Input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-14 bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-yellow-500 rounded-xl pl-4 text-base"
          />

          <Input
            type="text"
            maxLength={5}
            inputMode="numeric"
            placeholder="5-Digit Transaction Pin"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="w-full h-14 bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-yellow-500 rounded-xl pl-4 text-base"
          />

          <div className="space-y-4">
            <div className="relative w-full">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-yellow-500 rounded-xl pl-4 pr-12 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
              <RequirementItem met={passwordReqs.small} text="1 small letter" />
              <RequirementItem
                met={passwordReqs.capital}
                text="1 capital letter"
              />
              <RequirementItem met={passwordReqs.number} text="1 number" />
              <RequirementItem
                met={passwordReqs.special}
                text="1 special character"
              />
              <RequirementItem
                met={passwordReqs.length}
                text="8 characters"
                className="col-span-2"
              />
            </div>
          </div>

          <Input
            placeholder="Referral Code (Optional)"
            value={referral}
            onChange={(e) => setReferral(e.target.value)}
            className="w-full h-14 bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-yellow-500 rounded-xl pl-4 text-base"
          />
        </div>
      </div>

      <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-5 py-4 pb-8">
        <div className="flex items-start gap-3 mb-6">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
            className="mt-1 border-gray-300 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
          />
          <label
            htmlFor="terms"
            className="text-gray-600 text-[14px] leading-tight"
          >
            I acknowledge that I have read and agree to{" "}
            <span className="text-yellow-600 underline underline-offset-2 font-medium">
              Fastwave's Agreements
            </span>
          </label>
        </div>

        <Button
          onClick={handleSignup}
          disabled={!isFormValid || loading}
          className="w-full h-14 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:text-gray-400 text-black text-[17px] font-bold rounded-xl transition-all active:scale-[0.98] shadow-sm"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Continue"}
        </Button>
      </div>
    </div>
  );
}

// RequirementItem is also memoized for performance
const RequirementItem = memo(
  ({
    met,
    text,
    className = "",
  }: {
    met: boolean;
    text: string;
    className?: string;
  }) => (
    <div className={`flex items-center gap-2 ${className}`}>
      {met ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-300" />
      )}
      <span className={met ? "text-gray-700 font-medium" : "text-gray-400"}>
        {text}
      </span>
    </div>
  )
);
RequirementItem.displayName = "RequirementItem";
