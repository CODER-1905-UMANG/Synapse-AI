import React from "react";

import Hero from "../../components/landing/Hero";
import Features from "../../components/landing/Features";
import Footer from "../../components/common/Footer";
import SampleCode from "../../components/landing/SampleCode";
import SampleConversation from "../../components/landing/SampleMessages";
import Sidebar from "../../components/landing/Sidebar";

function Home() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black text-white">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col">

        <main className="flex-1">
          <Hero />
          <Features />
          <SampleConversation />
          <SampleCode />
        </main>

        <Footer />

      </div>

    </div>
  );
}

export default Home;