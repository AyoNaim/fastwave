import BuyAirtimePage from "@/components/Airtime";
import BuyCablePage from "@/components/BuyCable";
import BuyDataPage from "@/components/BuyData";
import BuyElectricityPage from "@/components/BuyElectricity";
import FintechDashboard from "@/components/Homepage";
import Login from "@/components/Login";
import VerifyNinPage from "@/components/Nin";
import FundAccountPage from "@/components/Topup";
import TransactionList from "@/components/TransactionsList";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {/* <FintechDashboard /> */}
      {/* <BuyAirtimePage /> */}
      {/* <BuyDataPage /> */}
      {/* <FundAccountPage /> */}
      {/* <TransactionList /> */}
      {/* <BuyElectricityPage /> */}
      {/* <BuyCablePage /> */}
      {/* <Login /> */}
      <VerifyNinPage />
    </div>
  );
}
