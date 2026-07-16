"use client";

import { useState, useEffect, useRef } from "react";
import { FaSyncAlt, FaVolumeUp } from "react-icons/fa";

export default function Captcha({ onVerify, resetTrigger }) {
    const canvasRef = useRef(null);
    const captchaTextRef = useRef("");
    const initializedRef = useRef(false);
    const onVerifyRef = useRef(onVerify);

    const [captchaText, setCaptchaText] = useState("");
    const [userInput, setUserInput] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState("");

    // Keep onVerify ref updated
    useEffect(() => {
        onVerifyRef.current = onVerify;
    }, [onVerify]);

    // Generate random string for captcha
    const generateRandomString = (length = 6) => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    // Draw captcha on canvas
    const drawCaptcha = (text) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#f0f2f5");
        gradient.addColorStop(0.5, "#e8eaed");
        gradient.addColorStop(1, "#d9dce0");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add noise dots
        for (let i = 0; i < 100; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 2,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.5)`;
            ctx.fill();
        }

        // Add noise lines
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.strokeStyle = `rgba(${Math.random() * 150 + 50}, ${Math.random() * 150 + 50}, ${Math.random() * 150 + 50}, 0.3)`;
            ctx.lineWidth = Math.random() * 2;
            ctx.stroke();
        }

        // Draw text
        const colors = ["#2D3A8C", "#F43676", "#1a365d", "#c53030", "#2f855a"];
        const fontSize = 32;
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.textBaseline = "middle";

        const textWidth = ctx.measureText(text).width;
        let startX = (width - textWidth) / 2;
        const centerY = height / 2;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            ctx.save();

            // Random position offset
            const x = startX + i * (fontSize * 0.7);
            const y = centerY + (Math.random() - 0.5) * 10;

            // Random rotation
            const rotation = (Math.random() - 0.5) * 0.4;

            ctx.translate(x, y);
            ctx.rotate(rotation);

            // Random color
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

            // Random scale
            const scale = 0.9 + Math.random() * 0.3;
            ctx.scale(scale, scale);

            ctx.fillText(char, 0, 0);
            ctx.restore();
        }

        // Add more distortion lines over text
        for (let i = 0; i < 2; i++) {
            ctx.beginPath();
            ctx.moveTo(0, Math.random() * height);
            ctx.bezierCurveTo(
                width * 0.25, Math.random() * height,
                width * 0.75, Math.random() * height,
                width, Math.random() * height
            );
            ctx.strokeStyle = `rgba(100, 100, 100, 0.4)`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    };

    // Generate new captcha
    const generateCaptcha = () => {
        const newText = generateRandomString(6);
        captchaTextRef.current = newText;
        setCaptchaText(newText);
        setUserInput("");
        setIsVerified(false);
        setError("");
        onVerifyRef.current(false);

        // Use requestAnimationFrame to ensure canvas is ready
        requestAnimationFrame(() => {
            drawCaptcha(newText);
        });
    };

    // Initialize captcha on mount only once
    useEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true;
            generateCaptcha();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reset captcha when resetTrigger changes (but not on initial mount)
    useEffect(() => {
        if (resetTrigger > 0) {
            generateCaptcha();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetTrigger]);

    // Verify user input
    const handleVerify = () => {
        if (userInput === captchaTextRef.current) {
            setIsVerified(true);
            setError("");
            onVerifyRef.current(true);
        } else {
            setError("Incorrect captcha. Please try again.");
            setIsVerified(false);
            onVerifyRef.current(false);
            generateCaptcha();
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        setUserInput(value);
        setError("");

        // Auto-verify when length matches
        if (value.length === captchaTextRef.current.length) {
            if (value === captchaTextRef.current) {
                setIsVerified(true);
                setError("");
                onVerifyRef.current(true);
            }
        } else {
            setIsVerified(false);
            onVerifyRef.current(false);
        }
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleVerify();
        }
    };

    // Speak captcha (accessibility feature)
    const speakCaptcha = () => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(
                captchaTextRef.current.split("").join(" ")
            );
            utterance.rate = 0.5;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    Security Verification <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={speakCaptcha}
                        className="p-2 text-gray-500 hover:text-[#2D3A8C] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Listen to captcha"
                    >
                        <FaVolumeUp className="text-lg" />
                    </button>
                    <button
                        type="button"
                        onClick={generateCaptcha}
                        className="p-2 text-gray-500 hover:text-[#F43676] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Generate new captcha"
                    >
                        <FaSyncAlt className="text-lg" />
                    </button>
                </div>
            </div>

            {/* Captcha Canvas */}
            <div className="flex justify-center">
                <canvas
                    ref={canvasRef}
                    width={220}
                    height={70}
                    className="border border-gray-300 rounded-lg bg-white"
                />
            </div>

            {/* Input Field */}
            <div className="relative">
                <input
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter the characters shown above"
                    maxLength={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all text-center text-lg tracking-widest font-mono ${isVerified
                            ? "border-green-400 bg-green-50 focus:ring-green-400"
                            : error
                                ? "border-red-400 bg-red-50 focus:ring-red-400"
                                : "border-gray-300 focus:ring-[#F43676]"
                        }`}
                />
                {isVerified && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                        ✓
                    </div>
                )}
            </div>

            {/* Status Messages */}
            {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            {isVerified && (
                <p className="text-green-600 text-sm text-center font-medium">
                    ✓ Verification successful!
                </p>
            )}

            <p className="text-xs text-gray-500 text-center">
                Type the characters you see in the image (case-sensitive)
            </p>
        </div>
    );
}
