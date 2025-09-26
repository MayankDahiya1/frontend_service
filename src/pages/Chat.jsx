/*
 * IMPORTS
 */
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion"; // eslint-disable-line
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import Web3Background from "../components/Web3Background.jsx";

/*
 * EXPORTS
 */
export default function Chat() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get current user from Redux
  const user = useSelector((state) => state.auth.user);

  // Clear selected conversation when user changes
  useEffect(() => {
    if (user) {
      setSelectedConversation(null);
    }
  }, [user]);

  // Set initial sidebar state and handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-screen flex w-full max-w-full relative overflow-hidden">
      <Web3Background />

      {/* Sidebar */}
      <motion.div
        className={`${
          sidebarOpen
            ? "w-64 sm:w-72 lg:w-80 fixed inset-y-0 left-0 md:relative md:translate-x-0"
            : "w-0 md:w-0"
        } transition-all duration-300 overflow-hidden z-20 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
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

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Chat window */}
      <motion.div
        className="flex-1 flex flex-col w-full max-w-full relative z-0 md:z-10"
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
                className="absolute top-3 sm:top-4 left-3 sm:left-4 p-2 sm:p-3 bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-black/60 rounded-lg sm:rounded-xl transition-all duration-300 text-white hover:border-white/40 z-20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
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
            <div className="h-full w-full flex flex-col justify-center items-center px-4 sm:px-8">
              <motion.div
                className="text-center mb-8 sm:mb-12 max-w-2xl"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <motion.div
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl shadow-blue-500/30 border border-white/10"
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
                  <span className="text-white font-bold text-2xl sm:text-3xl">
                    M
                  </span>
                </motion.div>
                <motion.h1
                  className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3 sm:mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  Welcome to MicroCore
                </motion.h1>
                <motion.p
                  className="text-gray-300 text-sm sm:text-lg mb-6 sm:mb-8 px-4 sm:px-0"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  Your advanced AI companion for intelligent conversations and
                  insights
                </motion.p>
              </motion.div>

              <motion.button
                onClick={() => {
                  setSelectedConversation({
                    id: Date.now(),
                    title: "New Conversation",
                    messages: [],
                  });
                }}
                className="group flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-xl sm:rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-600/30 hover:via-purple-600/30 hover:to-cyan-600/30 hover:shadow-2xl hover:shadow-blue-500/20"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <motion.div
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-cyan-500/30 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
                      className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent"
                      whileHover={{ scale: 1.02 }}
                    >
                      Start New Chat
                    </motion.div>
                    <motion.div
                      className="text-xs sm:text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300"
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
