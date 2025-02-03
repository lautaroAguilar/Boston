"use client";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
export default function Home() {
  const { checkUserSession } = useAuth();

  useEffect(() => {
    checkUserSession();
  }, []);
  return <></>;
}
