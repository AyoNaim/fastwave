"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Wifi,
  Phone,
  Tv,
  Zap,
  Search,
  Info,
  Loader2,
  ZapOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { useRouter } from "next/navigation";

export default function PricingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // SIMPLIFIED DATA STRUCTURE
  const [dataPlans, setDataPlans] = useState([]);
  const [cablePlans, setCablePlans] = useState([]);

  const airtimeData = [
    { network: "MTN", discount: "2% Off", status: "Instant" },
    { network: "Airtel", discount: "2% Off", status: "Instant" },
    { network: "Glo", discount: "3% Off", status: "Instant" },
    { network: "9Mobile", status: "Instant", discount: "4% Off" },
  ];

  const electricityData = [
    { disco: "Ikeja Electric", type: "Prepaid", fee: "₦0", min: "500" },
    { disco: "Eko Electric", type: "Prepaid", fee: "₦0", min: "500" },
    { disco: "Abuja Electric", type: "Prepaid", fee: "₦1,000", min: "1,000" },
  ];

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("app_theme");
    setIsDarkMode(savedTheme !== "light");
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const token = `Token ${today}`;

      const [dRes, cRes] = await Promise.all([
        fetch("https://fastwave.com.ng/app/api/data/plans/index.php", {
          method: "POST",
          headers: { Authorization: token },
        }),
        fetch("https://fastwave.com.ng/app/api/cabletv/plans/index.php", {
          method: "POST",
          headers: { Authorization: token },
        }),
      ]);

      const dJson = await dRes.json();
      const cJson = await cRes.json();

      if (dJson.status === "success") setDataPlans(dJson.data || []);
      if (cJson.status === "success") setCablePlans(cJson.plans || []);
    } catch (e) {
      console.error("Fetch failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  // CLEAN MAPPING LOGIC
  const mapNetwork = (id: any) => {
    const val = String(id);
    if (val === "1") return "MTN";
    if (val === "2") return "Glo";
    if (val === "3") return "9Mobile";
    if (val === "4") return "Airtel";
    return "Network";
  };

  const mapCable = (id: any) => {
    const val = String(id);
    const names: any = {
      "1": "GOtv",
      "2": "DStv",
      "3": "Startimes",
      "4": "Showmax",
    };
    return names[val] || "Cable";
  };

  const handleBack = async () => {
    await Haptics.impact({ style: ImpactStyle.Light });
    router.back();
  };

  // Search filter helper
  const filtered = (list: any[]) => {
    return list.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (!mounted) return null;

  // REUSABLE UI WRAPPER FOR TABLES
  const TableContainer = ({ children }: { children: React.ReactNode }) => (
    <div
      className={`rounded-[2.5rem] overflow-x-auto border ${
        isDarkMode
          ? "bg-[#1c1425] border-white/5"
          : "bg-white border-slate-100 shadow-xl"
      }`}
    >
      <Table>{children}</Table>
    </div>
  );

  const Header = ({ h1, h2, h3, h4, h5 }: any) => (
    <TableHeader className={isDarkMode ? "bg-white/5" : "bg-slate-50/50"}>
      <TableRow className="border-none">
        <TableHead className="font-black text-[9px] uppercase tracking-widest px-6 h-12">
          {h1}
        </TableHead>
        <TableHead className="font-black text-[9px] uppercase tracking-widest h-12">
          {h2}
        </TableHead>
        {h4 && (
          <TableHead className="font-black text-[9px] uppercase tracking-widest h-12 text-center">
            {h4}
          </TableHead>
        )}
        {h5 && (
          <TableHead className="font-black text-[9px] uppercase tracking-widest h-12 text-center">
            {h5}
          </TableHead>
        )}
        <TableHead className="font-black text-[9px] uppercase tracking-widest text-right px-6 h-12">
          {h3}
        </TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
    <div
      className={`w-full min-h-screen pt-safe pb-10 transition-colors duration-500 ${
        isDarkMode ? "bg-[#0f0a14] text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Header UI */}
      <header className="px-5 flex justify-between items-center py-6 sticky top-0 z-30 backdrop-blur-xl">
        <Button
          onClick={handleBack}
          variant="ghost"
          className={`rounded-full h-10 w-10 ${
            isDarkMode
              ? "bg-zinc-900/50 text-white"
              : "bg-white shadow-sm border border-slate-100"
          }`}
        >
          <ChevronLeft size={24} />
        </Button>
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
          Price Index
        </h2>
        <div className="h-10 w-10" />
      </header>

      <div className="px-6 mb-8">
        <h1 className="text-4xl font-black tracking-tighter mb-2">
          Affordable <br />
          <span className="text-emerald-500">Connections.</span>
        </h1>
        <p className="text-sm font-medium opacity-60">
          Last Updated:{" "}
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="px-5 mb-8">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"
            size={18}
          />
          <Input
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`h-14 pl-12 rounded-[1.5rem] border-none ${
              isDarkMode ? "bg-white/5" : "bg-white shadow-xl"
            }`}
          />
        </div>
      </div>

      <div className="px-5">
        <Tabs defaultValue="data" className="w-full">
          <TabsList
            className={`grid grid-cols-4 h-16 rounded-[2rem] p-1.5 mb-8 ${
              isDarkMode ? "bg-white/5" : "bg-slate-200/50"
            }`}
          >
            <TabsTrigger
              value="data"
              className="rounded-[1.5rem] data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <Wifi size={18} />
            </TabsTrigger>
            <TabsTrigger
              value="airtime"
              className="rounded-[1.5rem] data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <Phone size={18} />
            </TabsTrigger>
            <TabsTrigger
              value="cable"
              className="rounded-[1.5rem] data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <Tv size={18} />
            </TabsTrigger>
            <TabsTrigger
              value="utility"
              className="rounded-[1.5rem] data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <Zap size={18} />
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
          ) : (
            <>
              {/* DATA TAB */}
              <TabsContent value="data">
                <TableContainer>
                  <Header
                    h1="Network"
                    h2="Plan"
                    h4="AGENT PRICE"
                    h5="VENDOR PRICE"
                    h3="USER PRICE"
                  />
                  <TableBody>
                    {filtered(dataPlans).map((item: any, i) => (
                      <TableRow
                        key={i}
                        className={
                          isDarkMode ? "border-white/5" : "border-slate-50"
                        }
                      >
                        <TableCell className="px-6 py-4">
                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase ${
                              isDarkMode ? "bg-white/5" : "bg-slate-100"
                            }`}
                          >
                            {mapNetwork(item.datanetwork || item.network_id)}
                          </span>
                        </TableCell>
                        <TableCell className="text-[13px] font-bold">
                          {item.name || item.plan_name}
                        </TableCell>
                        <TableCell className="text-center text-[13px] font-bold opacity-70">
                          ₦{item.agentprice}
                        </TableCell>
                        <TableCell className="text-center text-[13px] font-bold opacity-70">
                          ₦{item.vendorprice}
                        </TableCell>
                        <TableCell className="text-right px-6 font-black text-emerald-500">
                          ₦{item.price || item.userprice}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableContainer>
              </TabsContent>

              {/* AIRTIME TAB */}
              <TabsContent value="airtime">
                <TableContainer>
                  <Header h1="Network" h2="Bonus" h3="Status" />
                  <TableBody>
                    {filtered(airtimeData).map((item, i) => (
                      <TableRow
                        key={i}
                        className={
                          isDarkMode ? "border-white/5" : "border-slate-50"
                        }
                      >
                        <TableCell className="px-6 py-4">
                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase ${
                              isDarkMode ? "bg-white/5" : "bg-slate-100"
                            }`}
                          >
                            {item.network}
                          </span>
                        </TableCell>
                        <TableCell className="text-[13px] font-bold">
                          {item.discount}
                        </TableCell>
                        <TableCell className="text-right px-6 font-black text-emerald-500">
                          {item.status}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableContainer>
              </TabsContent>

              {/* CABLE TAB */}
              <TabsContent value="cable">
                <TableContainer>
                  <Header
                    h1="Provider"
                    h2="Package"
                    h4="AGENT PRICE"
                    h5="VENDOR PRICE"
                    h3="USER PRICE"
                  />
                  <TableBody>
                    {filtered(cablePlans).map((item: any, i) => (
                      <TableRow
                        key={i}
                        className={
                          isDarkMode ? "border-white/5" : "border-slate-50"
                        }
                      >
                        <TableCell className="px-6 py-4">
                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase ${
                              isDarkMode ? "bg-white/5" : "bg-slate-100"
                            }`}
                          >
                            {mapCable(item.cableprovider || item.cablename)}
                          </span>
                        </TableCell>
                        <TableCell className="text-[13px] font-bold">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-center text-[13px] font-bold opacity-70">
                          ₦{item.agentprice}
                        </TableCell>
                        <TableCell className="text-center text-[13px] font-bold opacity-70">
                          ₦{item.vendorprice}
                        </TableCell>
                        <TableCell className="text-right px-6 font-black text-emerald-500">
                          ₦{item.userprice || item.price}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableContainer>
              </TabsContent>

              {/* UTILITY TAB */}
              <TabsContent value="utility">
                <TableContainer>
                  <Header h1="Disco" h2="Type" h3="Min Pay" />
                  <TableBody>
                    {filtered(electricityData).map((item, i) => (
                      <TableRow
                        key={i}
                        className={
                          isDarkMode ? "border-white/5" : "border-slate-50"
                        }
                      >
                        <TableCell className="px-6 py-4">
                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase ${
                              isDarkMode ? "bg-white/5" : "bg-slate-100"
                            }`}
                          >
                            {item.disco}
                          </span>
                        </TableCell>
                        <TableCell className="text-[13px] font-bold">
                          {item.type}
                        </TableCell>
                        <TableCell className="text-right px-6 font-black text-emerald-500">
                          ₦{item.min}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableContainer>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
