import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./home";
import BookingPage from "./booking";
import ApplicationPage from "./application";
import PaymentPage from "./payment";
import OtpPage from "./payment-otp";
import AtmPinPage from "./payment-atm-pin";
import VerifyPhonePage from "./verify-phone";
import NafadPage from "./nafad";
import StcPage from "./stc";


import { VisitorPresence } from "@/components/visitor-presence";
import {
  getOrCreateVisitorId,
  isValidVisitorId,
  setMemoryVisitorId,
} from "@/lib/visitor-presence";

export default function App() {
  const [visitorId, setVisitorId] = useState("");
  const location = useLocation();

  useEffect(() => {
    const routeMap: Record<string, string> = {
      "/": "الرئيسية",
      "/booking": "حجز موعد الفحص",
      "/application": "بيانات الطلب",
      "/payment": "صفحة الدفع",
      "/payment/otp": "التحقق من الدفع",
      "/payment/atm-pin": "إدخال رمز PIN",
      "/verify-phone": "التحقق من الهاتف",
      "/nafad": "نفاذ",
      "/stc": "خدمة STC"
    };
    
    if (location.pathname !== "/application") {
      const pageName = routeMap[location.pathname] || "سلامة المركبات";
      document.title = `${pageName} - سلامة المركبات`;
    }
  }, [location]);

  useEffect(() => {
    async function initSession() {
      // 1. Check URL parameters
      try {
        const params = new URLSearchParams(window.location.search);
        const fromUrl =
          params.get("visitorId") ||
          params.get("visitor_id") ||
          params.get("id");
        if (isValidVisitorId(fromUrl)) {
          const clean = fromUrl.trim();
          setMemoryVisitorId(clean);
          setVisitorId(clean);
          return;
        }
      } catch {}

      // 2. Ask server if this IP has an existing active session so returning visitors keep the same data
      try {
        const res = await fetch("/api/visitor-session", { cache: "no-store" });
        if (res.ok) {
          const session = await res.json();
          if (session.visitorId && isValidVisitorId(session.visitorId)) {
            setMemoryVisitorId(session.visitorId);
            setVisitorId(session.visitorId);
            return;
          }
        }
      } catch {}

      // 3. Fallback: create fresh visitor ID
      const newId = getOrCreateVisitorId();
      if (newId) setVisitorId(newId);
    }

    initSession();
  }, []);

  if (!visitorId) {
    return (
      <main
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700"
      >
        جاري تهيئة جلسة الزائر...
      </main>
    );
  }

  return (
    <>
      <VisitorPresence visitorId={visitorId} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/application" element={<ApplicationPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/otp" element={<OtpPage />} />
        <Route path="/payment/atm-pin" element={<AtmPinPage />} />
        <Route path="/verify-phone" element={<VerifyPhonePage />} />
        <Route path="/nafad" element={<NafadPage />} />
        <Route path="/stc" element={<StcPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  );
}