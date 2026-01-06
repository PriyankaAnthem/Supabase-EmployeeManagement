// src/components/Layout.tsx
import React from "react";
import KeyboardAccessible from "@/components/ui/KeyboardAccessible";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <KeyboardAccessible onClick={() => {}}>
      {children}
    </KeyboardAccessible>
  );
};

export default Layout;
