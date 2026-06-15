import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CGU_STORAGE_KEY = "CGUAccepted";

function CGUBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if CGU has already been accepted or refused
    const cguAccepted = localStorage.getItem(CGU_STORAGE_KEY);
    // Show banner only if CGUAccepted doesn't exist in localStorage
    if (cguAccepted === null) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CGU_STORAGE_KEY, "true");
    setIsVisible(false);
  };

  const handleRefuse = () => {
    localStorage.setItem(CGU_STORAGE_KEY, "false");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-300 text-sm text-center sm:text-left">
            En utilisant ce site, vous acceptez nos{" "}
            <Link
              to="/terms"
              className="text-blue-400 hover:text-blue-300 underline transition duration-200"
            >
              Conditions d'utilisation
            </Link>
            . Veuillez les lire attentivement avant de continuer.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleRefuse}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition duration-200 text-sm"
            >
              Refuser
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 text-sm"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CGUBanner;
