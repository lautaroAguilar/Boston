"use client"
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const { userInfo, loading, logout} = useAuth();
  const router = useRouter();
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <p>Bienvenido {userInfo?.name}</p>
      </main>
    </div>
  );
}
