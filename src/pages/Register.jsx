/*
 * IMPORTS
 */
import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  validateEmail,
  validatePassword,
  validateName,
} from "../utils/validation";
import { handleApolloError } from "../utils/errorHandling";
import { authLogger } from "../utils/debug";

/*
 * CONFIG
 */
const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $name: String!) {
    AccountCreate(email: $email, password: $password, name: $name) {
      id
      email
      name
      createdAt
    }
  }
`;

/*
 * COMPONENT
 */
export default function Register() {
  const navigate = useNavigate();

  /*
   * STATE
   */
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [errors, setErrors] = useState({});

  /*
   * HOOKS
   */
  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: () => {
      authLogger.info("User registration successful", { email: form.email });
      toast.success("Account created successfully! Please log in.");
      navigate("/login");
    },
    onError: (error) => {
      const errorMessage = handleApolloError(error);
      toast.error(errorMessage);
      authLogger.error("Registration failed", error);
    },
  });

  /*
   * VALIDATION
   */
  const validateForm = () => {
    const newErrors = {};

    const emailError = validateEmail(form.email);
    if (emailError && !emailError.isValid) {
      newErrors.email = emailError.message;
    }

    const passwordError = validatePassword(form.password);
    if (passwordError && !passwordError.isValid) {
      newErrors.password = passwordError.message;
    }

    const nameError = validateName(form.name);
    if (nameError && !nameError.isValid) {
      newErrors.name = nameError.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /*
   * HANDLERS
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await register({
        variables: {
          email: form.email,
          password: form.password,
          name: form.name,
        },
      });
    } catch (error) {
      // Error handling is done in onError callback
      authLogger.error("Registration submission failed", error);
    }
  };

  /*
   * UI Components
   */
  const FloatingParticle = ({ index }) => (
    <motion.div
      className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-60"
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
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900" />

      {/* Additional glow effects */}
      <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>

      {/* Animated Gradient Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/8 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "loop",
        }}
      />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <FloatingParticle key={i} index={i} />
      ))}

      {/* Enhanced Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.08)_1px,transparent_1px)] bg-[size:60px_60px]" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col fixed inset-0">
      <AnimatedBackground />

      {/* Header */}
      <motion.div
        className="flex justify-center pt-8 pb-6 relative z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl shadow-purple-500/30 border border-purple-400/20"
            whileHover={{
              scale: 1.1,
              boxShadow: "0 25px 50px -12px rgba(168, 85, 247, 0.4)",
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-white font-bold text-xl">M</span>
          </motion.div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            MicroCore
          </span>
        </div>
      </motion.div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Form Container with enhanced glass effect */}
          <motion.div
            className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div
              className="text-center mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                Join MicroCore
              </h1>
              <p className="text-sm text-purple-300/80">
                Create your account to access advanced AI services
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  className={`w-full text-white px-5 py-4 text-sm border rounded-2xl placeholder-purple-300/70 bg-black/40 backdrop-blur-sm border-white/20 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:bg-black/50 ${
                    errors.name
                      ? "border-red-400 focus:ring-red-400/50 bg-red-900/20"
                      : "focus:ring-purple-400/50 hover:border-white/30"
                  }`}
                  value={form.name}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.name && (
                  <motion.p
                    className="text-xs text-red-400 mt-2 ml-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.name}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  className={`w-full text-white px-5 py-4 text-sm border rounded-2xl placeholder-purple-300/70 bg-black/40 backdrop-blur-sm border-white/20 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:bg-black/50 ${
                    errors.email
                      ? "border-red-400 focus:ring-red-400/50 bg-red-900/20"
                      : "focus:ring-purple-400/50 hover:border-white/30"
                  }`}
                  value={form.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.email && (
                  <motion.p
                    className="text-xs text-red-400 mt-2 ml-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className={`w-full text-white px-5 py-4 text-sm border rounded-2xl placeholder-purple-300/70 bg-black/40 backdrop-blur-sm border-white/20 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:bg-black/50 ${
                    errors.password
                      ? "border-red-400 focus:ring-red-400/50 bg-red-900/20"
                      : "focus:ring-purple-400/50 hover:border-white/30"
                  }`}
                  value={form.password}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.password && (
                  <motion.p
                    className="text-xs text-red-400 mt-2 ml-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 via-blue-600 to-cyan-600 text-white py-4 rounded-2xl text-sm font-semibold hover:from-purple-400 hover:via-blue-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-purple-500/25 border border-white/10"
                whileHover={{
                  scale: loading ? 1 : 1.02,
                  boxShadow: "0 25px 50px -12px rgba(168, 85, 247, 0.4)",
                }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </motion.button>
            </motion.form>

            {/* Divider */}
            <motion.div
              className="my-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-black/60 backdrop-blur-sm text-purple-300/80 rounded-full">
                    or
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Login link */}
            <motion.div
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              <p className="text-sm text-purple-300/80">
                Already have an account?{" "}
                <motion.button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-purple-400 font-semibold hover:text-purple-300 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        className="text-center py-6 text-xs text-purple-400/60 px-4 relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <p>
          By creating an account, you agree to our Terms of Service and Privacy
          Policy.
        </p>
        <p className="mt-1 text-purple-500/60">
          MicroCore - AI Microservices Platform
        </p>
      </motion.div>
    </div>
  );
}
