"use client";
import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Check } from "lucide-react";

const networks = [
  { id: "1", name: "MTN", icon: "/mtn-logo.svg", color: "bg-yellow-400" },
  { id: "3", name: "Airtel", icon: "/airtel-logo.png", color: "bg-red-600" },
  { id: "2", name: "Glo", icon: "/glo-logo.png", color: "bg-green-600" },
  {
    id: "4",
    name: "9mobile",
    icon: "/9mobile-logo.png",
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
        <DrawerHeader
          className={`pb-4 border-b ${
            isDark ? "border-zinc-900" : "border-slate-50"
          }`}
        >
          <DrawerTitle
            className={`text-center font-black uppercase tracking-widest text-xs ${
              isDark ? "text-zinc-500" : "text-slate-400"
            }`}
          >
            Select Provider
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-6 space-y-3">
          {networks.map((net) => (
            <DrawerClose key={net.id} asChild>
              <div
                onClick={() => onSelect(net)}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer ${
                  String(selected.id) === String(net.id)
                    ? isDark
                      ? "bg-white/5 border border-white/10"
                      : "bg-slate-50 border border-slate-100"
                    : isDark
                    ? "hover:bg-zinc-900"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${net.color}`}
                  >
                    <img
                      src={net.icon}
                      alt={net.name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <span
                    className={`text-lg font-black tracking-tight ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {net.name}
                  </span>
                </div>
                {String(selected.id) === String(net.id) && (
                  <div className="bg-emerald-500 rounded-full p-1">
                    <Check className="text-white w-4 h-4" strokeWidth={4} />
                  </div>
                )}
              </div>
            </DrawerClose>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
