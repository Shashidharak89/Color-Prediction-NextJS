// lib/wallet.js

const WALLET_KEY = 'user_wallet';

export const getWalletBalance = () => {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(WALLET_KEY);
  return stored ? parseInt(stored) : 1000; // Default 1000 coins
};

export const setWalletBalance = (amount) => {
  localStorage.setItem(WALLET_KEY, amount);
};

export const deductFromWallet = (amount) => {
  const current = getWalletBalance();
  if (current < amount) return false;
  setWalletBalance(current - amount);
  return true;
};
