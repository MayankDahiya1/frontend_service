/*
 * IMPORTS
 */
import React, { useState, useEffect, useRef } from "react";
import { useMutation, useLazyQuery } from "@apollo/client";
import { motion } from "framer-motion"; // eslint-disable-line
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  START_CONVERSATION,
  GET_MESSAGES,
  SEND_MESSAGE,
} from "../graphql/chat";
import { runWithAuth } from "../utils/accessToken";
import { validateMessage } from "../utils/validation";
import { handleApolloError } from "../utils/errorHandling";
import { chatLogger, uiLogger } from "../utils/debug";
import toast from "react-hot-toast";

/*
 * TYPEWRITER COMPONENT
 */
const TypewriterText = ({ text, speed = 5, onComplete }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
  }, [text]);

  return <span>{displayText}</span>;
};

/*
 * TYPING DOTS COMPONENT
 */
const TypingDots = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex space-x-1 text-cyan-400 ml-2"
  >
    <motion.div
      className="w-2 h-2 bg-white/70 rounded-full"
      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
    />
    <motion.div
      className="w-2 h-2 bg-white/70 rounded-full"
      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
    />
    <motion.div
      className="w-2 h-2 bg-white/70 rounded-full"
      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
    />
  </motion.div>
);

/*
 * ANIMATED BACKGROUND COMPONENT
 */
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Animated grid */}
    <div
      className="absolute inset-0 opacity-5"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
        animation: "grid-move 20s linear infinite",
      }}
    />

    {/* Floating particles */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white/40 rounded-full"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: 0,
        }}
        animate={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: [0, 0.8, 0],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    ))}

    {/* Glowing orbs */}
    <motion.div
      className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-10"
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 30, 0],
        y: [0, -20, 0],
      }}
      transition={{ duration: 8, repeat: Infinity }}
    />
    <motion.div
      className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-10"
      animate={{
        scale: [1.2, 1, 1.2],
        x: [0, -40, 0],
        y: [0, 25, 0],
      }}
      transition={{ duration: 10, repeat: Infinity }}
    />
  </div>
);

/*
 * SPEECH TO TEXT HOOK
 */
const useSpeechToText = (setFinalInput, setInterimInput) => {
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      uiLogger.warn("Speech recognition not supported in this browser");
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      uiLogger.info("Speech recognition started");
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setFinalInput((prev) => prev + finalTranscript);
        uiLogger.debug("Speech recognition final result", {
          transcript: finalTranscript,
        });
      }
      setInterimInput(interimTranscript);
    };

    recognition.onerror = (event) => {
      uiLogger.error("Speech recognition error occurred", event.error);
      toast.error("Speech recognition error occurred");
    };

    recognition.onend = () => {
      uiLogger.info("Speech recognition session ended");
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      uiLogger.info("Speech recognition stopped");
    }
    setInterimInput("");
  };

  return { startListening, stopListening };
};

/*
 * MAIN COMPONENT
 */
export default function ChatWindow({
  sidebarOpen,
  setSidebarOpen,
  selectedConversation,
}) {
  /*
   * STATE
   */
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [finalInput, setFinalInput] = useState("");
  const [interimInput, setInterimInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typewriterMessages, setTypewriterMessages] = useState(new Set());
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  /*
   * HOOKS
   */
  const { startListening, stopListening } = useSpeechToText(
    setFinalInput,
    setInterimInput
  );
  const [startConversationMutation] = useMutation(START_CONVERSATION);
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);
  const [fetchMessagesQuery] = useLazyQuery(GET_MESSAGES);

  /*
   * EFFECT - when user selects old conversation
   */
  useEffect(() => {
    if (selectedConversation && selectedConversation !== "new") {
      setConversationId(selectedConversation);

      runWithAuth(async () => {
        try {
          const response = await fetchMessagesQuery({
            variables: { conversationId: selectedConversation },
          });

          if (response.data?.ChatGetMessages) {
            const _formattedMessages = response.data.ChatGetMessages.map(
              (m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: new Date(m.createdAt).toLocaleTimeString(),
              })
            );

            setMessages(_formattedMessages);
            setTypewriterMessages(new Set());
            chatLogger.debug("Loaded conversation messages", {
              conversationId: selectedConversation,
              messageCount: _formattedMessages.length,
            });
          }
        } catch (error) {
          const errorMessage = handleApolloError(error);
          toast.error(errorMessage);
          chatLogger.error("Failed to load conversation messages", error);
        }
      });
    } else if (selectedConversation === "new") {
      setConversationId(null);
      setMessages([]);
      setTypewriterMessages(new Set());
      chatLogger.info("Started new conversation");
    }
  }, [selectedConversation, fetchMessagesQuery]);

  /*
   * EFFECT - auto scroll
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /*
   * EFFECT - auto save draft
   */
  useEffect(() => {
    localStorage.setItem("chat-draft", finalInput);
  }, [finalInput]);

  useEffect(() => {
    const _savedDraft = localStorage.getItem("chat-draft");
    if (_savedDraft) {
      setFinalInput(_savedDraft);
    }
  }, []);

  /*
   * HANDLE SEND MESSAGE
   */
  const handleSendMessage = async () => {
    const _inputText = finalInput.trim();
    if (!_inputText) {
      uiLogger.warn("Attempted to send empty message");
      return;
    }

    const _validationResult = validateMessage(_inputText);
    if (!_validationResult.isValid) {
      toast.error(_validationResult.error);
      return;
    }

    const _userMessage = {
      id: `user-${Date.now()}`,
      role: "USER",
      content: _inputText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, _userMessage]);
    setFinalInput("");
    setInterimInput("");
    setIsTyping(true);

    try {
      if (!conversationId) {
        chatLogger.info("Starting new conversation", { message: _inputText });

        const response = await runWithAuth(() =>
          startConversationMutation({ variables: { message: _inputText } })
        );

        const _conversationData = response.data.ChatStartConversation;
        setConversationId(_conversationData.conversationId);

        const _newMessages = [
          _userMessage,
          {
            id: `assistant-${Date.now()}`,
            role: "ASSISTANT",
            content: _conversationData.assistantMessage,
            timestamp: new Date().toLocaleTimeString(),
          },
        ];

        setMessages(_newMessages);
        setTypewriterMessages(new Set([_newMessages[1].id]));

        chatLogger.info("Conversation started successfully", {
          conversationId: _conversationData.conversationId,
        });
      } else {
        chatLogger.debug("Sending message to existing conversation", {
          conversationId,
          message: _inputText,
        });

        const response = await runWithAuth(() =>
          sendMessageMutation({
            variables: { conversationId, message: _inputText },
          })
        );

        const _assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: response.data.ChatSendMessage.role,
          content: response.data.ChatSendMessage.content,
          timestamp: new Date(
            response.data.ChatSendMessage.createdAt
          ).toLocaleTimeString(),
        };

        setMessages((prev) => [...prev, _assistantMessage]);

        if (_assistantMessage.role === "ASSISTANT") {
          setTypewriterMessages(
            (prev) => new Set([...prev, _assistantMessage.id])
          );
        }

        chatLogger.debug("Message sent successfully");
      }
    } catch (error) {
      const errorMessage = handleApolloError(error);
      toast.error(errorMessage);
      chatLogger.error("Failed to send message", error);
      setIsTyping(false);
    }
  };

  /*
   * HANDLE ENTER KEY
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /*
   * HANDLE MIC CLICK
   */
  const handleMicClick = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
      uiLogger.info("Stopped voice recording");
    } else {
      startListening();
      setIsRecording(true);
      uiLogger.info("Started voice recording");
    }
  };

  /*
   * RENDER
   */
  return (
    <div
      className="flex flex-col h-full w-full max-w-full relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 backdrop-blur-lg bg-white/5 relative z-10"
        style={{
          boxShadow:
            "0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          {!sidebarOpen && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg border border-white/20 text-white/80 transition-all duration-300 hover:text-white text-sm sm:text-base"
              aria-label="Open sidebar"
            >
              ☰
            </motion.button>
          )}
          <motion.h1
            className="font-semibold text-base sm:text-xl text-white/90"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {conversationId ? "AI Conversation" : "New AI Session"}
          </motion.h1>
        </div>

        {/* Status indicator */}
        <motion.div
          className="flex items-center space-x-1 sm:space-x-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-300 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs hidden sm:inline">
            AI Online
          </span>
          <span className="text-green-400 text-xs sm:hidden">●</span>
        </motion.div>
      </motion.div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 scrollbar-hide"
        style={{
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
        }}
      >
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <motion.div
              className="w-20 h-20 border-2 border-cyan-400 rounded-full flex items-center justify-center mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                scale: { duration: 2, repeat: Infinity },
              }}
            >
              <span className="text-cyan-400 text-2xl font-bold">M</span>
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Welcome to MicroCore AI
            </h3>
            <p className="text-gray-400 max-w-md">
              I'm your advanced AI assistant. Ask me anything - from coding help
              to creative ideas. Let's start a conversation!
            </p>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className={`mb-4 sm:mb-6 flex ${
              msg.role === "USER" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-end max-w-[85%] sm:max-w-[70%] relative group ${
                msg.role === "USER" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`flex-shrink-0 ${
                  msg.role === "USER" ? "ml-2 sm:ml-3" : "mr-2 sm:mr-3"
                }`}
              >
                {msg.role === "USER" ? (
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
                      backdropFilter: "blur(10px)",
                      boxShadow:
                        "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <span className="text-white text-xs sm:text-sm font-bold">
                      U
                    </span>
                  </div>
                ) : (
                  <motion.div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
                      backdropFilter: "blur(10px)",
                      boxShadow:
                        "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                    }}
                    animate={{
                      boxShadow: [
                        "0 0 10px rgba(0,255,255,0.3)",
                        "0 0 20px rgba(0,255,255,0.6)",
                        "0 0 10px rgba(0,255,255,0.3)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-black text-xs sm:text-sm font-bold">
                      M
                    </span>
                  </motion.div>
                )}
              </motion.div>

              {/* Message bubble */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div
                  className={`inline-block px-3 sm:px-5 py-2 sm:py-3 rounded-2xl break-words backdrop-blur-sm border shadow-lg ${
                    msg.role === "USER"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-400/30 shadow-blue-500/20"
                      : "bg-gray-800/80 text-white border-cyan-400/20 shadow-cyan-500/10"
                  }`}
                  style={{ maxWidth: "100%" }}
                >
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.role === "ASSISTANT" &&
                    typewriterMessages.has(msg.id) ? (
                      <TypewriterText
                        text={msg.content}
                        speed={5}
                        onComplete={() => {
                          setTypewriterMessages((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(msg.id);
                            return newSet;
                          });
                          setIsTyping(false);
                        }}
                      />
                    ) : (
                      <ReactMarkdown
                        components={{
                          code({ inline, children }) {
                            return !inline ? (
                              <SyntaxHighlighter
                                language="javascript"
                                className="rounded-lg"
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-white/10 text-white/90 px-2 py-1 rounded border border-white/20 backdrop-blur-sm">
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </p>
                </div>

                {/* Timestamp and copy button */}
                <div
                  className={`text-xs text-gray-400 mt-2 flex items-center ${
                    msg.role === "USER" ? "justify-end" : "justify-start"
                  }`}
                >
                  <span className="bg-white/10 px-2 py-1 rounded border border-white/20 backdrop-blur-sm text-white/80">
                    {msg.timestamp}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      navigator.clipboard.writeText(msg.content);
                      toast.success("Message copied to clipboard");
                    }}
                    className="ml-2 opacity-0 group-hover:opacity-100 text-white/70 hover:text-white text-xs px-2 py-1 border border-white/20 rounded bg-white/10 transition-all duration-300 backdrop-blur-sm"
                    aria-label="Copy message"
                  >
                    Copy
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center text-sm text-white/80 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm border border-white/20"
          >
            <motion.div
              className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
                backdropFilter: "blur(10px)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
              }}
            >
              <span className="text-black text-xs font-bold">M</span>
            </motion.div>
            AI processing <TypingDots />
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="p-3 sm:p-4 lg:p-6 border-t border-white/10 backdrop-blur-lg bg-white/5 relative z-10"
        style={{
          boxShadow:
            "0 -4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 sm:items-end">
          <div className="relative flex-1">
            <motion.textarea
              whileFocus={{ scale: 1.02 }}
              value={finalInput}
              onChange={(e) => setFinalInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-white pr-12 sm:pr-16 resize-none border border-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/10 backdrop-blur-sm shadow-lg transition-all duration-300 placeholder-white/50 text-sm sm:text-base"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                backdropFilter: "blur(10px)",
              }}
              rows="1"
            />
            {interimInput && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute left-3 sm:left-4 bottom-2 sm:bottom-3 text-cyan-300 italic pointer-events-none text-xs sm:text-sm"
              >
                {interimInput}
              </motion.div>
            )}
          </div>

          <div className="flex space-x-2 sm:space-x-3 sm:flex-row">
            {/* Voice recording button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMicClick}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl flex items-center justify-center border-2 shadow-lg transition-all duration-300 text-sm sm:text-base ${
                isRecording
                  ? "bg-red-500/20 border-red-400 text-red-400 shadow-red-500/20"
                  : "bg-green-500/20 border-green-400 text-green-400 shadow-green-500/20 hover:bg-green-500/30"
              }`}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  ⏹
                </motion.span>
              ) : (
                "🎤"
              )}
            </motion.button>

            {/* Send button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-white font-semibold border border-white/20 shadow-lg hover:shadow-white/20 transition-all duration-300 backdrop-blur-sm text-sm sm:text-base"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
                backdropFilter: "blur(10px)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
              }}
              aria-label="Send message"
            >
              Send
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
