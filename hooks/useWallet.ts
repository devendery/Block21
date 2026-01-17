"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CHAIN_ID, CHAIN_NAME, RPC_URL } from "@/lib/utils";

const MESSAGE_TO_SIGN = `I confirm that I am participating in Block21 voluntarily.
I understand that Block21 has no guaranteed returns.
I take full responsibility for my decision.`;

export type WalletState = {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  signature: string | null;
  error: string | null;
};

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    signature: null,
    error: null,
  });

  const checkConnection = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        const network = await provider.getNetwork();

        if (accounts.length > 0) {
          setWalletState((prev) => ({
            ...prev,
            address: accounts[0].address,
            isConnected: true,
            chainId: Number(network.chainId),
          }));
        }
      } catch (err) {
        console.error("Check connection error:", err);
      }
    }
  }, []);

  useEffect(() => {
    checkConnection();
    
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
           checkConnection();
        } else {
            setWalletState({
                address: null,
                isConnected: false,
                chainId: null,
                signature: null,
                error: null,
            });
        }
      });
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
        if (typeof window !== "undefined" && window.ethereum) {
             // Remove listeners if needed
        }
    };
  }, [checkConnection]);

  const connectWallet = async () => {
    setWalletState((prev) => ({ ...prev, error: null }));
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();

        setWalletState((prev) => ({
          ...prev,
          address,
          isConnected: true,
          chainId: Number(network.chainId),
        }));

        // Switch network if needed
        if (Number(network.chainId) !== CHAIN_ID) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x' + CHAIN_ID.toString(16) }],
                });
            } catch (switchError: any) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: '0x' + CHAIN_ID.toString(16),
                                    chainName: CHAIN_NAME,
                                    rpcUrls: [RPC_URL],
                                    nativeCurrency: {
                                        name: "MATIC",
                                        symbol: "MATIC",
                                        decimals: 18
                                    },
                                    blockExplorerUrls: ["https://polygonscan.com/"]
                                },
                            ],
                        });
                    } catch (addError) {
                         setWalletState((prev) => ({ ...prev, error: "Failed to add network." }));
                    }
                } else {
                     setWalletState((prev) => ({ ...prev, error: "Failed to switch network." }));
                }
            }
        }

      } catch (err: any) {
        setWalletState((prev) => ({ ...prev, error: err.message || "Failed to connect" }));
      }
    } else {
      setWalletState((prev) => ({ ...prev, error: "Metamask not installed" }));
    }
  };

  const signConsent = async () => {
    setWalletState((prev) => ({ ...prev, error: null }));
    if (!walletState.isConnected) {
        await connectWallet();
    }
    
    if (typeof window !== "undefined" && window.ethereum) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const signature = await signer.signMessage(MESSAGE_TO_SIGN);
            setWalletState((prev) => ({ ...prev, signature }));
            return signature;
        } catch (err: any) {
             setWalletState((prev) => ({ ...prev, error: "User rejected signature" }));
             return null;
        }
    }
    return null;
  };

  const signMessage = async (message: string) => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const signature = await signer.signMessage(message);
        return signature;
      } catch (err: any) {
        console.error("Signing error:", err);
        throw new Error(err.message || "Failed to sign message");
      }
    }
    throw new Error("No wallet connected");
  };

  const disconnectWallet = () => {
    setWalletState({
      address: null,
      isConnected: false,
      chainId: null,
      signature: null,
      error: null,
    });
  };

  return { ...walletState, connectWallet, disconnectWallet, signMessage };
};
