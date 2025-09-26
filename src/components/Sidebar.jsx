/*
 * IMPORTS
 */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useLazyQuery, useMutation, useSubscription } from "@apollo/client";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line
import {
  GET_CONVERSATIONS,
  DELETE_CONVERSATION,
  SUBSCRIBE_CONVERSATION_CREATED,
} from "../graphql/chat";
import { runWithAuth } from "../utils/accessToken";
import { chatLogger } from "../utils/debug";
import { handleApolloError } from "../utils/errorHandling";
import toast from "react-hot-toast";

/*
 * EXPORTS
 */
export default function Sidebar({
  setSelectedConversation,
  selectedConversation,
  sidebarOpen,
  setSidebarOpen,
}) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);

  /*
   * APOLLO QUERIES
   */
  const [fetchConversations, { data, loading, error, refetch }] =
    useLazyQuery(GET_CONVERSATIONS);

  const [deleteConversation] = useMutation(DELETE_CONVERSATION, {
    onCompleted: (data) => {
      if (data.ChatDeleteConversation.status === "SUCCESSFULLY_DELETED") {
        // Refetch conversations after successful deletion
        runWithAuth(() => refetch());

        // Clear selection if deleted conversation was selected
        if (selectedConversation) {
          setSelectedConversation(null);
        }

        chatLogger.info("Conversation deleted successfully");
        toast.success("Conversation deleted successfully");
      } else {
        const errorMessage =
          data.ChatDeleteConversation.message ||
          "Failed to delete conversation";
        chatLogger.warn("Conversation deletion failed", {
          message: errorMessage,
        });
        toast.error(errorMessage);
      }
    },
    onError: (error) => {
      const errorMessage = handleApolloError(error);
      chatLogger.error("Delete conversation mutation failed", error);
      toast.error(errorMessage);
    },
  });

  /*
   * SUBSCRIPTION HANDLERS
   */
  useSubscription(SUBSCRIBE_CONVERSATION_CREATED, {
    onData: ({ data }) => {
      try {
        const newConversation = data?.data?.conversationCreated;
        chatLogger.debug(
          "New conversation subscription received",
          newConversation
        );
        console.log("New conversation via subscription:", newConversation);

        if (newConversation) {
          setConversations((prev) => [
            {
              id: newConversation.conversationId,
              title: newConversation.title,
              createdAt: newConversation.createdAt,
            },
            ...prev,
          ]);

          chatLogger.info("New conversation added to sidebar", {
            conversationId: newConversation.conversationId,
          });
        }
      } catch (error) {
        chatLogger.error(
          "Failed to process new conversation subscription",
          error
        );
      }
    },
    onError: (error) => {
      chatLogger.error("Conversation subscription error", error);
    },
  });

  /*
   * EFFECTS
   */
  useEffect(() => {
    if (user) {
      setConversations([]);
      setSelectedConversation(null);

      const loadConversations = async () => {
        try {
          await runWithAuth(async () => {
            // ye hamesha network se fetch karega
            return await fetchConversations({ fetchPolicy: "network-only" });
          });

          chatLogger.info("Conversations fetched for new user", {
            userId: user.id,
          });
        } catch (error) {
          chatLogger.error("Failed to fetch conversations for new user", error);
          toast.error("Failed to load conversations");
        }
      };

      loadConversations();
    } else {
      setConversations([]);
      setSelectedConversation(null);
    }
  }, [user, fetchConversations, setSelectedConversation]);

  useEffect(() => {
    if (data?.ChatGetConversations) {
      setConversations(data.ChatGetConversations);
      chatLogger.debug("Conversations state updated", {
        count: data.ChatGetConversations.length,
      });
    }
  }, [data]);

  /*
   * EVENT HANDLERS
   */
  const handleLogout = () => {
    try {
      dispatch(logout());
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      chatLogger.info("User logged out successfully");
      navigate("/login");
    } catch (error) {
      chatLogger.error("Logout failed", error);
      toast.error("An error occurred during logout");
    }
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this conversation?")) {
      return;
    }

    try {
      chatLogger.info("Attempting to delete conversation", { conversationId });
      await runWithAuth(async () => {
        return await deleteConversation({ variables: { conversationId } });
      });
    } catch (error) {
      const errorMessage = handleApolloError(error);
      chatLogger.error("Failed to delete conversation", error, {
        conversationId,
      });
      toast.error(errorMessage);
    }
  };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full text-white flex flex-col relative overflow-hidden backdrop-blur-md bg-black/20 border-r border-white/10"
      style={{
        background:
          "linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
          }}
        />

        {/* Floating particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-cyan-400 rounded-full"
            initial={{
              x: Math.random() * 300,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              x: Math.random() * 300,
              y: Math.random() * window.innerHeight,
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="p-3 sm:p-4 border-b border-white/10 backdrop-blur-lg bg-white/5 relative z-10"
        style={{
          boxShadow:
            "0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <motion.div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
              }}
            >
              <span className="text-white font-bold text-xs sm:text-sm">M</span>
            </motion.div>
            <span className="font-bold text-base sm:text-lg text-white/90">
              MicroCore
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 sm:p-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 transition-all duration-300 hover:text-white text-sm"
          >
            ✖
          </motion.button>
        </div>
      </motion.div>

      {/* New Chat Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="p-3 sm:p-4 border-b border-white/10 relative z-10"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setSelectedConversation("new");
            // Close sidebar on mobile after selecting new conversation
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
          className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl backdrop-blur-lg border transition-all duration-300 group"
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
            borderImage:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)) 1",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          }}
        >
          <motion.div
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-base sm:text-lg text-white/90 font-bold">
              +
            </span>
          </motion.div>
          <span className="text-xs sm:text-sm font-medium text-white/90 group-hover:text-white transition-colors duration-300">
            New AI Session
          </span>
        </motion.button>
      </motion.div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="p-1.5 sm:p-2">
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-6 sm:py-8"
              >
                <motion.div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-cyan-400 border-t-transparent rounded-full" />
                <span className="ml-2 sm:ml-3 text-cyan-400 text-xs sm:text-sm">
                  Loading conversations...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-300 text-sm p-3 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm"
            >
              Error: {error.message}
            </motion.div>
          )}

          <AnimatePresence>
            {conversations.map((c, index) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className={`w-full text-left px-2.5 sm:px-3 py-2.5 sm:py-3 rounded-xl mb-1.5 sm:mb-2 transition-all duration-300 relative cursor-pointer backdrop-blur-sm border ${
                  selectedConversation === c.id
                    ? "bg-white/15 border-white/30 shadow-lg text-white"
                    : "hover:bg-white/5 text-gray-300 border-white/10 hover:border-white/20"
                }`}
                onClick={() => {
                  setSelectedConversation(c.id);
                  // Close sidebar on mobile after selecting conversation
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-6 sm:pr-8">
                    <div className="text-xs sm:text-sm font-medium truncate">
                      {c.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-red-300 hover:text-red-200 bg-red-500/20 hover:bg-red-500/30 rounded-full border border-red-400/30 transition-all duration-300 backdrop-blur-sm text-xs sm:text-sm"
                    title="Delete conversation"
                  >
                    ✕
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="p-3 sm:p-4 border-t border-white/10 backdrop-blur-lg bg-white/5 relative z-10"
        style={{
          boxShadow:
            "0 -4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <motion.div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
              }}
              whileHover={{ scale: 1.1 }}
              animate={{
                boxShadow: [
                  "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  "0 8px 32px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                  "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-white text-xs sm:text-sm font-bold">
                {user?.name?.[0] || "U"}
              </span>
            </motion.div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm text-white/90 font-medium truncate">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-white/60 truncate max-w-[120px] sm:max-w-[150px]">
                {user?.email || "user@example.com"}
              </div>
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="px-3 sm:px-4 py-1.5 sm:py-2 w-full text-xs sm:text-sm bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 rounded-xl text-red-300 font-medium transition-all duration-300 backdrop-blur-sm"
        >
          Disconnect Session
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
