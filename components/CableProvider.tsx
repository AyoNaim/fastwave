"use client";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";

const providers = [
  { id: "2", name: "DStv", logo: "/dstv.svg" },
  { id: "1", name: "GOtv", logo: "/gotv.png" },
  { id: "3", name: "StarTimes", logo: "/startimes.png" },
  { id: "startimes-on", name: "StarTimes ON", logo: "/startimes-on.png" },
  { id: "showmax", name: "SHOWMAX", logo: "/showmax.png" },
];

export function ProviderModal({ selected, onSelect, isDark }: any) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div
          className={`p-4 rounded-[1.5rem] flex justify-between items-center border cursor-pointer active:scale-95 transition-all duration-300 ${
            isDark
              ? "bg-[#1c1425] border-white/5"
              : "bg-white border-slate-100 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-[10px] uppercase shadow-lg shadow-emerald-500/20">
              {selected.name.substring(0, 2)}
            </div>
            <span
              className={`font-black text-base ${
                isDark ? "text-white" : "text-slate-800"
              }`}
            >
              {selected.name}
            </span>
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
        <DrawerHeader
          className={`pb-4 border-b ${
            isDark ? "border-zinc-900" : "border-slate-50"
          }`}
        >
          <div className="flex items-center gap-4">
            <DrawerTitle
              className={`text-xl font-black ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Select Provider
            </DrawerTitle>
          </div>
        </DrawerHeader>
        <div className="p-4 space-y-1">
          {providers.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelect(p)}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer active:scale-95 ${
                selected.id === p.id
                  ? isDark
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-emerald-50"
                  : "hover:bg-zinc-900/40"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center p-2 ${
                    isDark ? "bg-zinc-900" : "bg-slate-100"
                  }`}
                >
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="w-full h-full object-contain grayscale-[0.2]"
                  />
                </div>
                <span
                  className={`font-bold ${
                    isDark ? "text-zinc-100" : "text-slate-800"
                  }`}
                >
                  {p.name}
                </span>
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
