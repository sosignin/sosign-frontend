"use client";

import { useState } from "react";
import { FaTimes, FaLock, FaEye, FaEyeSlash, FaSpinner, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function PasswordModal({ isOpen, onClose }) {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const hasPassword = user?.hasPassword === true;
  const isGoogleUser = !!user?.googleId;
  const showCurrentPasswordField = hasPassword;

  const title = hasPassword ? "Change Password" : "Create Password";
  const buttonText = hasPassword ? "Update Password" : "Create Password";
  const description = hasPassword ? "Update your existing account password" : "Secure your account with a new password";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(showCurrentPasswordField ? currentPassword : "", newPassword);
      setSuccess(hasPassword ? "Password updated successfully!" : "Password created successfully! You can now log in using your email and password.");
      
      // Clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-pink-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F43676] to-[#e02a60] p-6 text-white relative">
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-2xl" />
            <h2 className="text-2xl font-bold">
              {title}
            </h2>
          </div>
          <p className="text-pink-100 text-sm mt-1">
            {description}
          </p>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <FaTimes className="text-white" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {showCurrentPasswordField && (
            <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <FaLock className="text-[#F43676] text-xs" />
                      Current Password
                    </span>
                    {isGoogleUser && (
                      <span className="text-[10px] bg-pink-100 text-[#F43676] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Optional for Google Login
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-[#F43676] transition-all bg-gray-50/50"
                      placeholder={isGoogleUser ? "Enter current password (if known)" : "Enter current password"}
                      required={!isGoogleUser}
                    />
                <button
                  type="button"
                  onClick={() => toggleVisibility("current")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F43676]"
                >
                  {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaShieldAlt className="text-[#F43676] text-xs" />
              {hasPassword ? "New Password" : "Password"}
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-[#F43676] transition-all bg-gray-50/50"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => toggleVisibility("new")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F43676]"
              >
                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaShieldAlt className="text-[#F43676] text-xs" />
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-[#F43676] transition-all bg-gray-50/50"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => toggleVisibility("confirm")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F43676]"
              >
                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm animate-pulse">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-green-600 text-sm">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white font-bold rounded-xl shadow-lg hover:shadow-pink-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin text-lg" />
                Processing...
              </>
            ) : (
              buttonText
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
