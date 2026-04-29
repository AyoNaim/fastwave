"use client";
import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Check } from "lucide-react";

const networks = [
  { id: "1", name: "MTN", icon: "/mtn-logo.svg", color: "bg-yellow-400" },
  { id: "4", name: "Airtel", icon: "/airtel-logo.png", color: "bg-red-600" },
  { id: "2", name: "Glo", icon: "/glo-logo.png", color: "bg-green-600" },
  {
    id: "3",
    name: "9mobile",
    icon: "/mobile-logo.png",
    color: "bg-emerald-900",
  },
];

export function NetworkModal({ selected, onSelect, isDark }: any) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div
          className={`h-14 w-14 rounded-2xl flex items-center justify-center cursor-pointer active:scale-90 transition-all shrink-0 ${selected.color}`}
        >
          <img
            src={selected.icon}
            alt={selected.name}
            className="w-8 h-8 object-contain"
          />
        </div>
      </DrawerTrigger>

      <DrawerContent
        className={`border-none rounded-t-[2.5rem] pb-10 ${
          isDark ? "bg-zinc-950" : "bg-white"
        }`}
      >
        <div
          className={`w-12 h-1.5 rounded-full mx-auto mt-4 mb-2 ${
            isDark ? "bg-zinc-800" : "bg-slate-200"
          }`}
        />

        <div className="p-6">
          <h3
            className={`font-bold mb-4 ${
              isDark ? "text-slate-200" : "text-slate-700"
            }`}
          >
            Choose Network
          </h3>

          {/* Horizontal layout matching the screenshot */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {networks.map((net) => (
              <DrawerClose key={net.id} asChild>
                <div
                  onClick={() => onSelect(net)}
                  className={`shrink-0 w-[72px] h-[72px] rounded-2xl flex items-center justify-center transition-all cursor-pointer border-2 ${
                    String(selected.id) === String(net.id)
                      ? "border-amber-400 bg-white" // The distinct gold/orange border from the screenshot
                      : isDark
                      ? "border-zinc-800 bg-zinc-900"
                      : "border-slate-100 bg-white"
                  }`}
                >
                  <img
                    src={net.icon}
                    alt={net.name}
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </DrawerClose>
            ))}
          </div>

          {/* The detected network span matching the screenshot */}
          <div className="mt-8">
            <div
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium ${
                isDark
                  ? "bg-emerald-950/40 text-emerald-400"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <div className="bg-emerald-500 rounded-full p-[2px]">
                <Check className="text-white w-2.5 h-2.5" strokeWidth={4} />
              </div>
              Detected: {selected.name.toUpperCase()} • Verified
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
