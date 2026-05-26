"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedCart = localStorage.getItem("corralon_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("corralon_cart", JSON.stringify(cart));
    }
  }, [cart, isClient]);

  const addToCart = (item, quantity) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.ARTICULO === item.ARTICULO);
      if (existing) {
        return prevCart.map((c) =>
          c.ARTICULO === item.ARTICULO ? { ...c, cantidad: c.cantidad + quantity } : c
        );
      }
      return [...prevCart, { ...item, cantidad: quantity }];
    });
  };

  const removeFromCart = (articulo) => {
    setCart((prevCart) => prevCart.filter((c) => c.ARTICULO !== articulo));
  };

  const updateQuantity = (articulo, newQty) => {
    if (newQty <= 0) {
      removeFromCart(articulo);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((c) =>
        c.ARTICULO === articulo ? { ...c, cantidad: newQty } : c
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, curr) => acc + curr.cantidad, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
