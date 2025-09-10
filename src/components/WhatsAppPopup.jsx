"use client";
import { useState, useEffect } from "react";

export default function WhatsAppPopup({ onPopupStateChange }) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("whatsapp_popup_closed");
    if (hasSeenPopup) {
      onPopupStateChange(false); // popup not visible
      return;
    }

    const timer = setTimeout(() => {
      setShowPopup(true);
      document.body.style.overflow = "hidden";
      onPopupStateChange(true); // popup visible
    }, 10000); // 30 seconds

    return () => clearTimeout(timer);
  }, [onPopupStateChange]);

  const handleYes = () => {
    window.open("https://whatsapp.com/channel/0029Vb6VjYS5fM5Yi9h8pA2K", "_blank");
    closePopup();
  };

  const handleNo = () => {
    closePopup();
  };

  const closePopup = () => {
    setShowPopup(false);
    document.body.style.overflow = "auto";
    localStorage.setItem("whatsapp_popup_closed", "true");
    onPopupStateChange(false); // popup closed
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center px-4">
      <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center text-white animate-popup border-4 border-white">
        
        {/* WhatsApp Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-white p-3 rounded-full shadow-lg animate-bounce">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#25D366"
              viewBox="0 0 24 24"
              width="50"
              height="50"
            >
              <path d="M20.52 3.48a11.91 11.91 0 0 0-16.88 0 11.91 11.91 0 0 0-2.57 13.15L.1 24l7.55-1.97a11.91 11.91 0 0 0 13.15-2.57 11.91 11.91 0 0 0 0-16.88zM12 21.5a9.5 9.5 0 0 1-4.86-1.3l-.35-.21-4.49 1.17 1.19-4.36-.22-.36A9.5 9.5 0 1 1 12 21.5zm5.28-7.07c-.29-.15-1.7-.84-1.96-.94-.26-.1-.45-.15-.64.15s-.74.94-.91 1.13c-.17.19-.34.21-.63.07-.29-.15-1.23-.45-2.35-1.42-.86-.76-1.44-1.7-1.61-1.99-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.03-.51-.08-.15-.64-1.55-.88-2.12-.23-.56-.47-.48-.64-.49h-.55c-.19 0-.51.07-.78.36s-1.02.99-1.02 2.41 1.04 2.79 1.19 2.98c.15.19 2.04 3.11 4.95 4.37.69.3 1.23.48 1.65.61.69.22 1.31.19 1.8.12.55-.08 1.7-.69 1.94-1.35.24-.66.24-1.23.17-1.35-.07-.12-.26-.19-.55-.34z" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold mb-3 drop-shadow-lg">
          📢 Join Our WhatsApp Group!
        </h2>
        <p className="text-sm md:text-base mb-6 leading-relaxed">
          Stay updated with the latest <b>serial video updates</b> and exclusive
          news. Click below to join our{" "}
          <span className="font-semibold">active WhatsApp community</span>.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleYes}
            className="bg-white text-green-600 font-bold px-6 py-2 rounded-lg shadow-lg hover:bg-green-100 transition"
          >
            ✅ Yes, Join Now
          </button>
          <button
            onClick={handleNo}
            className="bg-red-500 text-white font-bold px-6 py-2 rounded-lg shadow-lg hover:bg-red-600 transition"
          >
            ❌ No
          </button>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes popup {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-popup {
          animation: popup 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
