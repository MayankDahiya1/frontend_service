/*
 * IMPORTS
 */
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";

/*
 * EXPORTS
 */
export default function Chat() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get current user from Redux
  const user = useSelector((state) => state.auth.user);

  // Clear selected conversation when user changes
  useEffect(() => {
    if (user) {
      setSelectedConversation(null);
    }
  }, [user]);

  /*
   * UI Components
   */
  const FloatingParticle = ({ index }) => (
    <motion.div
      className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
      animate={{
        x: [0, Math.random() * 100 - 50],
        y: [0, Math.random() * 100 - 50],
        opacity: [0.6, 0.2, 0.6],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        repeatType: "reverse",
        delay: index * 0.2,
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  );

  const AnimatedBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black" />

      {/* Glow effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>

      {/* Animated Gradient Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/8 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "loop",
        }}
      />

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <FloatingParticle key={i} index={i} />
      ))}

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[size:80px_80px]" />
    </div>
  );

  return (
    <div className="h-screen flex w-full max-w-full relative overflow-hidden">
      <AnimatedBackground />
      {/* Sidebar */}
      <motion.div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 overflow-hidden relative z-10`}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Sidebar
          setSelectedConversation={setSelectedConversation}
          selectedConversation={selectedConversation}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </motion.div>

      {/* Chat window */}
      <motion.div
        className="flex-1 flex flex-col w-full max-w-full relative z-10"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {selectedConversation ? (
          <ChatWindow
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            selectedConversation={selectedConversation}
          />
        ) : (
          <div className="flex-1 w-full max-w-full relative">
            {!sidebarOpen && (
              <motion.button
                onClick={() => setSidebarOpen(true)}
                className="absolute top-4 left-4 p-3 bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-black/60 rounded-xl transition-all duration-300 text-white hover:border-white/40 z-20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </motion.button>
            )}
            <div className="h-full w-full flex flex-col justify-center items-center">
              <motion.div
                className="text-center mb-12 max-w-2xl"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30 border border-white/10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    delay: 0.6,
                    duration: 0.8,
                  }}
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.4)",
                  }}
                >
                  <span className="text-white font-bold text-3xl">M</span>
                </motion.div>
                <motion.h1
                  className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  Welcome to MicroCore
                </motion.h1>
                <motion.p
                  className="text-gray-300 text-lg mb-8"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  Your AI assistant for microservices development. Start a
                  conversation to get help with your projects.
                </motion.p>
              </motion.div>
              <motion.button
                onClick={() => setSelectedConversation("new")}
                className="w-full max-w-md bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 backdrop-blur-xl border border-white/20 hover:border-white/40 text-white px-8 py-6 rounded-2xl font-medium transition-all duration-500 text-left shadow-2xl relative overflow-hidden group"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.4)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Animated background overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={false}
                />

                {/* Glowing border effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
                  initial={false}
                />

                <div className="flex items-center space-x-4 relative z-10">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-xl border border-white/20"
                    whileHover={{
                      rotate: [0, -5, 5, 0],
                      scale: 1.1,
                      boxShadow: "0 20px 40px -12px rgba(16, 185, 129, 0.4)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      duration: 0.6,
                    }}
                  >
                    <motion.svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      whileHover={{ scale: 1.1 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </motion.svg>
                  </motion.div>
                  <div>
                    <motion.div
                      className="text-xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent"
                      whileHover={{ scale: 1.02 }}
                    >
                      Start New Chat
                    </motion.div>
                    <motion.div
                      className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300"
                      whileHover={{ scale: 1.01 }}
                    >
                      Begin a new conversation with MicroCore AI
                    </motion.div>
                  </div>
                </div>
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
