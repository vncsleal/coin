"use client";

import { useState, useEffect } from "react";
import MobileSplashScreen from "./mobile-splash-screen";

export default function SplashScreenWrapper({
  children,
}: { 
  children: React.ReactNode 
}) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // Show splash for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && <MobileSplashScreen />}
      {children}
    </>
  );
}
