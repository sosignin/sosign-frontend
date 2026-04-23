"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import Image from "next/image";
import { auth, provider } from "../../utils/Firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";

function LoginContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/");

  // State for login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // State for signup form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [designation, setDesignation] = useState("");
  const [mobile, setMobile] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupError, setSignupError] = useState("");

  // Phone OTP verification states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const recaptchaVerifierRef = useRef(null);

  const { login, signup, loading, googleLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect URL from query parameters
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, [searchParams]);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Send OTP to phone number
  const handleSendOtp = async () => {
    if (!mobile.trim()) {
      setOtpError("Please enter your mobile number");
      return;
    }

    // Validate mobile number (10 digits)
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setOtpError("Please enter a valid 10-digit mobile number");
      return;
    }

    setSendingOtp(true);
    setOtpError("");

    try {
      const response = await axios.post(`${backendUrl}/api/otp/send`, {
        phoneNumber: cleanMobile
      });
      setSessionId(response.data.sessionId);
      setOtpSent(true);
      setOtpError("");
    } catch (error) {
      console.error("Error sending OTP:", error);
      setOtpError(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setOtpError("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    setVerifyingOtp(true);
    setOtpError("");

    try {
      await axios.post(`${backendUrl}/api/otp/verify`, {
        sessionId,
        otp
      });
      setPhoneVerified(true);
      setOtpError("");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOtpError(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    setOtpSent(false);
    setOtp("");
    setSessionId("");
    handleSendOtp();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      await login(loginEmail, loginPassword);
      router.push(redirectUrl);
    } catch (error) {
      setLoginError(error?.message || String(error) || "Login failed");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError("");

    // Validate required fields
    if (!firstName.trim()) {
      setSignupError("First name is required");
      return;
    }
    if (!designation.trim()) {
      setSignupError("Designation is required");
      return;
    }
    if (!signupEmail.trim()) {
      setSignupError("Email is required");
      return;
    }
    if (!mobile.trim()) {
      setSignupError("Mobile number is required");
      return;
    }

    // Check phone verification
    if (!phoneVerified) {
      setSignupError("Please verify your mobile number with OTP");
      return;
    }

    if (!createPassword.trim()) {
      setSignupError("Password is required");
      return;
    }

    // Password validation: 6+ chars, uppercase, lowercase, special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
    if (!passwordRegex.test(createPassword)) {
      setSignupError("Password must be at least 6 characters with uppercase, lowercase, and special character");
      return;
    }

    if (!confirmPassword.trim()) {
      setSignupError("Please confirm your password");
      return;
    }

    if (createPassword !== confirmPassword) {
      setSignupError("Passwords do not match");
      return;
    }

    try {
      const name = `${firstName} ${lastName}`;
      await signup(name, designation, signupEmail, mobile, createPassword);
      router.push(redirectUrl);
    } catch (error) {
      setSignupError(error?.message || String(error) || "Signup failed");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // The signed-in user info.
      const user = result.user;

      // Call the simulated backend login from AuthContext
      await googleLogin(user);
      router.push(redirectUrl);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setLoginError("Failed to sign in with Google.");
    }
  };

  // Handle forgot password submission
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");

    if (!forgotEmail.trim()) {
      setForgotError("Please enter your email address");
      return;
    }

    setForgotLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotMessage(data.message || "Password reset link has been sent to your email.");
        setForgotEmail("");
      } else {
        setForgotError(data.message || "Failed to send reset email. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setForgotError("Something went wrong. Please try again later.");
    } finally {
      setForgotLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-50 px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 border border-pink-100">
        {/* Toggle Heading */}
        <h2 className="text-3xl font-bold text-center mb-6 text-[#1a1a2e]">
          {isLogin ? "Welcome Back!" : "Join SoSign"}
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          {isLogin ? "Login to continue your journey" : "Create your account to get started"}
        </p>

        {/* Continue with Google */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center border-2 border-gray-200 rounded-xl py-3 mb-4 hover:border-[#F43676] hover:bg-pink-50 transition-all duration-200 font-medium"
        >
          <Image
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-5 h-5 mr-3"
            width={20}
            height={20}
          />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-200" />
          <span className="px-3 text-gray-400 text-sm font-medium">or</span>
          <hr className="flex-grow border-gray-200" />
        </div>

        {isLogin ? (
          // ------------------- LOGIN FORM -------------------
          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#F43676] focus:outline-none transition-colors"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#F43676] focus:outline-none transition-colors"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-11 text-gray-400 hover:text-[#F43676] transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right -mt-2">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-[#F43676] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {loginError && (
              <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              Login
            </button>

            <p className="text-xs text-gray-500 text-center leading-relaxed">
              By joining or logging in, you accept{" "}
              <Link href="/terms" className="text-[#F43676] cursor-pointer hover:underline">
                sosign.in Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#F43676] cursor-pointer hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            <p className="text-sm text-center text-gray-600 pt-2">
              Don&apos;t have an account?{" "}
              <span
                className="text-[#F43676] font-semibold cursor-pointer hover:underline"
                onClick={() => setIsLogin(false)}
              >
                Sign up
              </span>
            </p>
          </form>
        ) : (
          // ------------------- SIGNUP FORM -------------------
          <form className="space-y-4" onSubmit={handleSignupSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="First name"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#F43676] focus:outline-none transition-colors"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Last name"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#F43676] focus:outline-none transition-colors"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Designation
              </label>
              <select
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#F43676] focus:outline-none transition-colors bg-white"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
              >
                <option value="">Select your designation</option>
                <option value="Individual">Individual</option>
                <option value="Personal">Personal</option>
                <option value="Politician">Politician</option>
                <option value="NGO">NGO</option>
                <option value="Political Party">Political Party</option>
                <option value="Social Worker">Social Worker</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex flex-1">
                  <div className="flex items-center px-3 border-2 border-gray-200 border-r-0 rounded-l-xl bg-gray-50 text-gray-600 font-medium">
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit number"
                    className={`flex-1 border-2 border-gray-200 rounded-r-xl px-4 py-3 focus:border-[#F43676] focus:outline-none transition-colors min-w-0 ${phoneVerified ? 'bg-green-50 border-green-300' : ''} ${otpSent && !phoneVerified ? 'bg-gray-50' : ''}`}
                    value={mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setMobile(value);
                    }}
                    disabled={otpSent || phoneVerified}
                    required
                  />
                </div>
                {!otpSent && !phoneVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || mobile.length !== 10}
                    className="w-full sm:w-auto px-4 py-3 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
                  >
                    {sendingOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Sending...</span>
                        <span className="sm:hidden">Sending</span>
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                )}
                {phoneVerified && (
                  <div className="flex items-center justify-center sm:justify-start px-4 text-green-600">
                    <Check className="w-6 h-6" />
                    <span className="ml-2 sm:hidden text-sm font-medium">Verified</span>
                  </div>
                )}
              </div>

              {/* OTP Input Section */}
              {otpSent && !phoneVerified && (
                <div className="mt-3 p-4 bg-pink-50 rounded-xl border border-pink-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#F43676] focus:outline-none transition-colors text-center tracking-widest font-mono text-lg"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(value);
                      }}
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otp.length !== 6}
                      className="px-6 py-3 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                    >
                      {verifyingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify'
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Didn&apos;t receive OTP?{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#F43676] font-semibold hover:underline"
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>
              )}

              {/* Phone Verified Success Message */}
              {phoneVerified && (
                <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Mobile number verified successfully!
                </p>
              )}

              {/* OTP Error */}
              {otpError && (
                <p className="text-red-500 text-sm mt-2">{otpError}</p>
              )}

            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter email"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#F43676] focus:outline-none transition-colors"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Create Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#F43676] focus:outline-none transition-colors"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-11 text-gray-400 hover:text-[#F43676] transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Min 6 chars with uppercase, lowercase & special character
              </p>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#F43676] focus:outline-none transition-colors"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-11 text-gray-400 hover:text-[#F43676] transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {signupError && (
              <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{signupError}</p>
            )}

            <button className="w-full bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 mt-2">
              Sign Up
            </button>

            <p className="text-sm text-center text-gray-600 pt-2">
              Already have an account?{" "}
              <span
                className="text-[#F43676] font-semibold cursor-pointer hover:underline"
                onClick={() => setIsLogin(true)}
              >
                Login
              </span>
            </p>
          </form>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-[#1a1a2e] mb-2">Reset Password</h3>
            <p className="text-gray-500 text-sm mb-4">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#F43676] focus:outline-none transition-colors"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              {forgotError && (
                <p className="text-red-500 text-sm bg-red-50 py-2 px-3 rounded-lg">{forgotError}</p>
              )}

              {forgotMessage && (
                <p className="text-green-600 text-sm bg-green-50 py-2 px-3 rounded-lg">{forgotMessage}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmail("");
                    setForgotError("");
                    setForgotMessage("");
                  }}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-50 px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 border border-pink-100">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-xl w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-1/2 mx-auto mb-6"></div>
          <div className="h-12 bg-gray-200 rounded-xl mb-4"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-1/4 mx-auto mb-6"></div>
          <div className="space-y-5">
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-12 bg-pink-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
