/*
 * IMPORTS
 */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useLazyQuery, useMutation, useSubscription } from "@apollo/client";
import { motion, AnimatePresence } from "framer-motion";
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
      className="h-full text-white flex flex-col relative overflow-hidden bg-gradient-to-b from-gray-900 via-black to-gray-800"
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
        className="p-4 border-b border-cyan-500/20 backdrop-blur-sm bg-black/30 relative z-10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <span className="text-black font-bold text-sm">M</span>
            </motion.div>
            <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              MicroCore
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300"
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
        className="p-4 border-b border-cyan-500/20 relative z-10"
      >
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedConversation("new")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 hover:border-cyan-400/50 backdrop-blur-sm shadow-lg shadow-cyan-500/10 transition-all duration-300"
        >
          <motion.span className="text-xl text-cyan-400">➕</motion.span>
          <span className="text-sm font-medium text-white">New AI Session</span>
        </motion.button>
      </motion.div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="p-2">
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-8"
              >
                <motion.div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full" />
                <span className="ml-3 text-cyan-400">
                  Loading conversations...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
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
                className={`w-full text-left px-3 py-3 rounded-xl mb-2 transition-all duration-300 relative cursor-pointer backdrop-blur-sm border ${
                  selectedConversation === c.id
                    ? "bg-cyan-500/20 border-cyan-400/50 shadow-lg shadow-cyan-500/20 text-white"
                    : "hover:bg-gray-700/50 text-gray-300 border-gray-600/30 hover:border-gray-500/50"
                }`}
                onClick={() => setSelectedConversation(c.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-8">
                    <div className="text-sm font-medium truncate">
                      {c.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-full border border-red-500/30 transition-all duration-300"
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
        className="p-4 border-t border-cyan-500/20 backdrop-blur-sm bg-black/30 relative z-10"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30"
              whileHover={{ scale: 1.1 }}
              animate={{
                boxShadow: [
                  "0 0 10px rgba(168,85,247,0.3)",
                  "0 0 20px rgba(168,85,247,0.6)",
                  "0 0 10px rgba(168,85,247,0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-white text-sm font-bold">
                {user?.name?.[0] || "U"}
              </span>
            </motion.div>
            <div>
              <div className="text-sm text-white font-medium">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-gray-400 truncate max-w-[150px]">
                {user?.email || "user@example.com"}
              </div>
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="px-4 py-2 w-full text-sm bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-400/30 hover:border-red-400/50 rounded-xl text-red-400 font-medium transition-all duration-300 backdrop-blur-sm"
        >
          Disconnect Session
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
