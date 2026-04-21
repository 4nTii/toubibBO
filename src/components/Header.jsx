import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/DoctorContext";
import { useNavigate, Link } from "react-router-dom";
import { APP_NAME } from "../config/config";
import SearchBar from "./SearchBar";

import logo from "../assets/images/app/toubib-logo-w500.webp";

function Header() {
  const { isAuthenticated, logout, user, fetchUserInfo } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get user's first name or fallback
  const userName = user?.firstName || "Utilisateur";
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    // Fetch user info if authenticated but user data is missing
    const checkUserInfo = async () => {
      if (isAuthenticated && !user) {
        const result = await fetchUserInfo();
        if (!result) {
          // User info fetch failed, redirect to login
          logout();
          navigate("/auth");
        }
      }
    };
    checkUserInfo();
  }, [isAuthenticated, user, fetchUserInfo, logout, navigate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate("/auth");
  };

  return (
    <header className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt={APP_NAME} className="h-10 w-auto" />
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <SearchBar variant="header" />
          </div>

          {/* Auth Section */}
          <div className="flex items-center">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 hover:bg-gray-700 px-3 py-2 rounded-lg transition duration-200 cursor-pointer"
              >
                {/* Avatar */}
                <div
                  className={`avatar-user-${user?.gender || "male"} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm`}
                ></div>
                <span className="text-white">Bonjour {userName}</span>
                <svg
                  className={`h-4 w-4 text-white transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg py-1 z-50">
                  <Link
                    to="/cabinet"
                    className="block px-4 py-2 text-gray-200 hover:bg-gray-600 transition duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Mon cabinet
                  </Link>
                  <hr className="my-1 border-gray-600" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-600 transition duration-200 cursor-pointer"
                  >
                    Déconnexion
                  </button>
                  <Link
                    to="/help"
                    className="block px-4 py-2 text-gray-200 hover:bg-gray-600 transition duration-200 cursor-pointer"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Aide
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
