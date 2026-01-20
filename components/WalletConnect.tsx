"use client";

import { Wallet } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { polygon } from "wagmi/chains";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
  useSwitchChain,
} from "wagmi";
import { formatNameWithWalletSuffix } from "@/lib/nameFormat";

export default function WalletConnect() {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connectAsync, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const [authStatus, setAuthStatus] = useState<"idle" | "signing" | "syncing" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const setupInFlightRef = useRef(false);
  const lastSetupKeyRef = useRef<string | null>(null);
  const authInFlightRef = useRef(false);

  const preferredConnector = useMemo(() => {
    const metaMaskConnector = connectors.find((c) => c.id === "metaMask");
    if (metaMaskConnector) return metaMaskConnector;
    const injectedConnector = connectors.find((c) => c.type === "injected");
    if (injectedConnector) return injectedConnector;
    const walletConnectConnector = connectors.find((c) => c.id === "walletConnect");
    if (walletConnectConnector) return walletConnectConnector;
    return connectors[0];
  }, [connectors]);

  const ensurePolygon = useCallback(async () => {
    if (!isConnected) return;
    if (!chainId) return;
    if (chainId === polygon.id) return;
    await switchChainAsync({ chainId: polygon.id });
  }, [chainId, isConnected, switchChainAsync]);

  const ensureBackendSession = useCallback(async () => {
    if (!address || !isConnected) return;
    if (authInFlightRef.current) return;
    setError(null);

    try {
      authInFlightRef.current = true;
      setAuthStatus("syncing");
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      const me = (await meRes.json()) as { address: string | null };
      if (me.address && me.address.toLowerCase() === address.toLowerCase()) {
        setAuthStatus("ready");
        return;
      }

      const nonceRes = await fetch("/api/auth/nonce", { cache: "no-store" });
      const { nonce } = (await nonceRes.json()) as { nonce: string };

      const message = `Block21 wants you to sign in with your Ethereum account:\n${address}\n\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`;

      setAuthStatus("signing");
      const signature = await signMessageAsync({ message });

      setAuthStatus("syncing");
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, message, signature }),
      });

      if (!loginRes.ok) {
        const body = (await loginRes.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || "Login failed");
      }

      setAuthStatus("ready");
    } catch (e) {
      setAuthStatus("error");
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      authInFlightRef.current = false;
    }
  }, [address, isConnected, signMessageAsync]);

  useEffect(() => {
    if (!isConnected || !address) {
      setAuthStatus("idle");
      setError(null);
      setDisplayName(null);
      setupInFlightRef.current = false;
      lastSetupKeyRef.current = null;
      authInFlightRef.current = false;
      return;
    }
    const key = `${address.toLowerCase()}:${chainId ?? ""}`;
    if (setupInFlightRef.current && lastSetupKeyRef.current === key) return;
    setupInFlightRef.current = true;
    lastSetupKeyRef.current = key;
    (async () => {
      try {
        await ensurePolygon();
        await ensureBackendSession();
      } catch (e) {
        setAuthStatus("error");
        setError(e instanceof Error ? e.message : "Wallet setup failed");
      } finally {
        setupInFlightRef.current = false;
      }
    })();
  }, [address, ensureBackendSession, ensurePolygon, isConnected, chainId]);

  useEffect(() => {
    if (!isConnected || !address) return;
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch(`/api/user/profile?address=${address}`, { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as any;
        if (cancelled) return;
        const name = typeof data?.username === "string" ? data.username.trim() : "";
        setDisplayName(name || null);
      } catch {
        if (cancelled) return;
        setDisplayName(null);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [address, isConnected]);

  const handleConnect = async () => {
    setError(null);
    try {
      if (!preferredConnector) throw new Error("No wallet connector available");
      await connectAsync({ connector: preferredConnector });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect");
    }
  };

  const handleDisconnect = async () => {
    disconnect();
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-2 bg-gray-900 px-4 py-2 rounded-full border border-gray-700">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <Link href="/profile" className="text-sm text-gray-300 font-bold hover:text-white transition-colors">
          {displayName ? formatNameWithWalletSuffix(displayName, address) : "Set Username"}
        </Link>
        <button
          onClick={handleDisconnect}
          className="ml-2 text-xs text-gray-400 hover:text-red-500"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting || authStatus === "signing" || authStatus === "syncing"}
      className="flex items-center space-x-2 bg-primary hover:bg-orange-600 text-white px-3 py-1 rounded-full font-medium transition-all text-sm"
    >
      <Wallet className="h-4 w-4" />
      <span>
        {error
          ? "Wallet Error"
          : isConnecting
            ? "Connecting..."
            : authStatus === "signing"
              ? "Signing..."
              : authStatus === "syncing"
                ? "Syncing..."
                : "Connect Wallet"}
      </span>
    </button>
  );
}
