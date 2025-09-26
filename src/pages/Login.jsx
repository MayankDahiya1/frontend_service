/*
 * IMPORTS
 */
import React, { useState, useMemo } from "react";
import { gql, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion"; // eslint-disable-line
import toast from "react-hot-toast";
import { loginSuccess } from "../store/slices/authSlice";
import { validateEmail, validatePassword } from "../utils/validation";
import { handleApolloError } from "../utils/errorHandling";
import { authLogger } from "../utils/debug";

/*
 * CONFIG
 */
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    AccountLogin(email: $email, password: $password) {
      Account {
        id
        email
        name
      }
      accessToken
      refreshToken
      message
      status
    }
  }
`;

/*
 * COMPONENT
 */
export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /*
   * STATE
   */
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  /*
   * HOOKS
   */
  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const { accessToken, refreshToken, ...user } = data.AccountLogin;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user.Account));
      dispatch(loginSuccess({ user: user.Account, token: accessToken }));
      authLogger.info("User login successful", { email: form.email });
      toast.success("Welcome back!");
      navigate("/");
    },
    onError: (error) => {
      const errorMessage = handleApolloError(error);
      toast.error(errorMessage);
      authLogger.error("Login failed", error);
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
      await login({
        variables: {
          email: form.email,
          password: form.password,
        },
      });
    } catch (error) {
      // Error handling is done in onError callback
      authLogger.error("Login submission failed", error);
    }
  };

  /*
   * UI Components
   */
  const FloatingParticle = ({ index }) => (
    <motion.div
      className="absolute w-1 h-1 bg-white/40 rounded-full opacity-60"
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

  const AnimatedBackground = useMemo(
    () => (
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient matching Web3 background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/30 to-cyan-950/20" />

        {/* Organic Blob - Left Side */}
        <motion.div
          className="absolute left-[-15%] sm:left-[-10%] top-[20%] w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 30% 40%, rgba(0, 255, 255, 0.6) 0%, rgba(0, 200, 255, 0.3) 30%, rgba(0, 150, 255, 0.1) 60%, transparent 100%)",
            filter: "blur(50px)",
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          }}
          animate={{
            scale: [1, 1.4, 0.8, 1.2, 1],
            rotate: [0, 45, -30, 60, 0],
            borderRadius: [
              "60% 40% 30% 70% / 60% 30% 70% 40%",
              "30% 60% 70% 40% / 50% 60% 30% 60%",
              "50% 40% 60% 30% / 40% 50% 60% 30%",
              "40% 70% 30% 60% / 70% 40% 50% 60%",
              "60% 40% 30% 70% / 60% 30% 70% 40%",
            ],
            x: [-50, -20, -80, -40, -50],
            y: [0, 30, -20, 10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Organic Blob - Right Side */}
        <motion.div
          className="absolute right-[-10%] sm:right-[-5%] top-[60%] w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 60% 30%, rgba(255, 255, 255, 0.4) 0%, rgba(0, 255, 255, 0.3) 40%, rgba(0, 200, 255, 0.1) 70%, transparent 100%)",
            filter: "blur(45px)",
            borderRadius: "40% 60% 70% 30% / 40% 60% 30% 70%",
          }}
          animate={{
            scale: [1.1, 0.7, 1.3, 0.9, 1.1],
            rotate: [0, -60, 40, -20, 0],
            borderRadius: [
              "40% 60% 70% 30% / 40% 60% 30% 70%",
              "70% 30% 40% 60% / 60% 40% 70% 30%",
              "30% 70% 60% 40% / 30% 70% 40% 60%",
              "60% 40% 30% 70% / 70% 30% 60% 40%",
              "40% 60% 70% 30% / 40% 60% 30% 70%",
            ],
            x: [20, -10, 40, 0, 20],
            y: [-30, 20, -40, 10, -30],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Central Floating Blob */}
        <motion.div
          className="absolute top-[40%] left-[40%] sm:left-[45%] w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 40% 50%, rgba(0, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.15) 30%, rgba(0, 150, 255, 0.08) 60%, transparent 100%)",
            filter: "blur(35px)",
            borderRadius: "50% 70% 30% 50% / 60% 40% 60% 40%",
          }}
          animate={{
            scale: [0.8, 1.2, 0.9, 1.1, 0.8],
            rotate: [0, 120, -80, 200, 0],
            borderRadius: [
              "50% 70% 30% 50% / 60% 40% 60% 40%",
              "70% 30% 50% 70% / 40% 60% 40% 60%",
              "30% 50% 70% 30% / 60% 40% 60% 40%",
              "50% 70% 30% 50% / 40% 60% 40% 60%",
              "50% 70% 30% 50% / 60% 40% 60% 40%",
            ],
            x: [-20, 30, -40, 20, -20],
            y: [10, -30, 25, -15, 10],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Small Ambient Blobs */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)",
              filter: "blur(20px)",
              borderRadius: "50%",
              left: `${20 + i * 20}%`,
              top: `${15 + i * 15}%`,
            }}
            animate={{
              scale: [0.5, 1.5, 0.7, 1.2, 0.5],
              opacity: [0.3, 0.7, 0.4, 0.8, 0.3],
              x: [0, 50, -30, 40, 0],
              y: [0, -40, 30, -20, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}

        {/* Glassmorphism glow effects */}
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-white/3 rounded-full blur-3xl"></div>

        {/* Animated Gradient Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
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
        {[...Array(20)].map((_, i) => (
          <FloatingParticle key={i} index={i} />
        ))}

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>
    ),
    []
  );

  return (
    <div className="min-h-screen flex flex-col fixed inset-0">
      {AnimatedBackground}

      {/* Header */}
      <motion.div
        className="flex justify-center pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6 px-4 relative z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <motion.div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-2xl border"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            }}
            whileHover={{
              scale: 1.1,
              boxShadow: "0 25px 50px -12px rgba(6, 182, 212, 0.4)",
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-white font-bold text-xl">M</span>
          </motion.div>
          <span className="text-2xl font-bold text-white/90">MicroCore</span>
        </div>
      </motion.div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Form Container with enhanced glass effect */}
          <motion.div
            className="backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div
              className="text-center mb-6 sm:mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white/90 mb-3 sm:mb-4">
                Connect to MicroCore
              </h1>
              <p className="text-xs sm:text-sm text-white/70 px-2">
                Sign in to access your AI microservices dashboard
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-6"
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
                  type="email"
                  name="email"
                  placeholder="Email address"
                  className={`w-full text-white px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base border rounded-xl sm:rounded-2xl placeholder-white/50 backdrop-blur-sm border-white/20 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                    errors.email
                      ? "focus:ring-red-400/50 border-red-400/50"
                      : "focus:ring-white/20 hover:border-white/30"
                  }`}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                    backdropFilter: "blur(10px)",
                  }}
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
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className={`w-full text-white px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base border rounded-xl sm:rounded-2xl placeholder-white/50 backdrop-blur-sm border-white/20 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                    errors.password
                      ? "border-red-400 focus:ring-red-400/50 bg-red-900/20"
                      : "focus:ring-white/20 hover:border-white/30"
                  }`}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                    backdropFilter: "blur(10px)",
                  }}
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
                className="w-full text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl border border-white/10"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
                  backdropFilter: "blur(10px)",
                  boxShadow:
                    "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                }}
                whileHover={{
                  scale: loading ? 1 : 1.02,
                  boxShadow: "0 25px 50px -12px rgba(6, 182, 212, 0.4)",
                }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </motion.form>

            {/* Divider */}
            <motion.div
              className="my-6 sm:my-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span
                    className="px-3 backdrop-blur-sm text-white/60 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                    }}
                  >
                    or
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Register link */}
            <motion.div
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <p className="text-sm text-white/70">
                Don't have an account?{" "}
                <motion.button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-white/90 font-semibold hover:text-white transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Account
                </motion.button>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        className="text-center py-4 sm:py-6 text-xs sm:text-sm text-cyan-400/60 px-4 relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.1 }}
      >
        <p className="hidden sm:block">
          Secure access to your AI microservices platform.
        </p>
        <p className="mt-1 text-cyan-500/60 text-xs sm:text-sm">
          MicroCore - AI Microservices Platform
        </p>
      </motion.div>
    </div>
  );
}
