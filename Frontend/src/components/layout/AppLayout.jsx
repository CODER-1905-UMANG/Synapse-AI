import React from "react";
import AppSidebar from "./AppSidebar";

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <AppSidebar />

      <main className="min-h-screen md:ml-[270px]">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;