"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaCircle, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle, FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Polling for new notifications every 1 minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("user"));
      if (!userInfo?.token) return;

      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      if (response.ok) {
        setNotifications(notifications.map(n => 
          n._id === id ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("user"));
      const response = await fetch("/api/notifications/read-all", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success": return <FaCheckCircle className="text-green-500" />;
      case "error": return <FaTimesCircle className="text-red-500" />;
      case "warning": return <FaExclamationTriangle className="text-yellow-500" />;
      default: return <FaInfoCircle className="text-blue-500" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-[#F43676] transition-colors"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-[#F43676] rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999] overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#F43676] font-semibold hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaBell className="text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => !notification.read && markAsRead(notification._id)}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notification.read ? "bg-blue-50/30" : ""}`}
                    >
                      <div className="mt-1 flex-shrink-0 text-lg">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-sm leading-tight ${!notification.read ? "font-bold text-gray-900" : "text-gray-700"}`}>
                            {notification.title}
                          </p>
                          {!notification.read && <FaCircle className="text-[6px] text-[#F43676] mt-1.5 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-3">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-400">Powered by SOSign Security</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
