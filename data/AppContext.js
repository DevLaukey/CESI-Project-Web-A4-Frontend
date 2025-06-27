// components/AppContext.js
"use client";

import React from "react";
import { CartProvider } from "./CartContext";

// Main App Context that wraps all providers
export const AppContextProvider = ({ children }) => {
  return <CartProvider>{children}</CartProvider>;
};

