"use client";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CheckCircle2, ChevronRight, Zap } from "lucide-react";

const discoProviders = [
  { id: "1", name: "Ikeja Electric", type: "Postpaid/Prepaid" },
  { id: "2", name: "Eko Electric", type: "Postpaid/Prepaid" },
  { id: "3", name: "Abuja Electric (AEDC)", type: "Postpaid/Prepaid" },
  { id: "4", name: "Kano Electric", type: "Postpaid/Prepaid" },
  { id: "6", name: "PHED Electric", type: "Postpaid/Prepaid" },
];

export function ElectricityProviderModal({ selected, onSelect, isDark }: any) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div
          className={`p-5 rounded-[2rem] flex justify-between items-center border cursor-pointer active:scale-95 transition-all duration-300 ${
            isDark
              ? "bg-[#1c1425] border-white/5"
              : "bg-white border-slate-100 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <span
                className={`font-black text-lg block leading-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {selected.name}
              </span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Tap to change provider
              </span>
            </div>
          </div>
          <ChevronRight
            size={20}
            className={isDark ? "text-zinc-800" : "text-slate-200"}
          />
        </div>
      </DrawerTrigger>
      <DrawerContent
        className={`border-none rounded-t-[2.5rem] pb-8 ${
          isDark ? "bg-zinc-950" : "bg-white"
        }`}
      >
        <div
          className={`w-12 h-1.5 rounded-full mx-auto mt-4 mb-2 ${
            isDark ? "bg-zinc-800" : "bg-slate-200"
          }`}
        />
        <DrawerHeader className="pb-6 pt-4">
          <DrawerTitle
            className={`text-2xl font-black text-center ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Select Disco
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 mt-2 space-y-1">
          {discoProviders.map((p: any) => (
            <div
              key={p.id}
              onClick={() => onSelect(p)}
              className={`flex items-center justify-between p-5 rounded-3xl transition-all cursor-pointer active:scale-95 ${
                selected.id === p.id
                  ? isDark
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-emerald-50"
                  : "hover:bg-zinc-900/40"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isDark
                      ? "bg-zinc-900 text-zinc-500"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Zap size={20} />
                </div>
                <div>
                  <p
                    className={`font-bold ${
                      isDark ? "text-zinc-100" : "text-slate-800"
                    }`}
                  >
                    {p.name}
                  </p>
                  <p
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      isDark ? "text-zinc-600" : "text-slate-400"
                    }`}
                  >
                    {p.type}
                  </p>
                </div>
              </div>
              {selected.id === p.id ? (
                <CheckCircle2
                  className="text-emerald-500"
                  size={24}
                  fill="currentColor"
                  color={isDark ? "#0a0a0a" : "white"}
                />
              ) : (
                <div
                  className={`w-6 h-6 border-2 rounded-full ${
                    isDark ? "border-zinc-800" : "border-slate-100"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
