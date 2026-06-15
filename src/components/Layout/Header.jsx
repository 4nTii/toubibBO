import { useState, useRef, useEffect } from "react";
import { useAuth, useDoctor } from "../../context/DoctorContext";
import { useNavigate, Link } from "react-router-dom";
import { APP_NAME, FTP_TARGET } from "../../config/config";
import SearchBar from "../ui/SearchBar";

import logo from "../../assets/images/app/toubib-logo-w500.webp";

function Header() {
  const { isAuthenticated, logout, user, fetchUserInfo } = useAuth();
  const { doctor } = useDoctor();
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
                {doctor?.profilePicture ? (
                  <img
                    src={`${FTP_TARGET}${doctor.profilePicture}`}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div
                    className={`avatar-doctor-${user?.gender || "male"} w-10 h-10 rounded-full shrink-0`}
                  />
                )}
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
                <div className="absolute right-0 mt-2 w-56 bg-gray-700 rounded-lg shadow-lg py-1 z-50">
                  {user?.role === "ROLE_ADMIN" && (
                    <>
                      <Link
                        to="/admin/utilisateurs"
                        className="flex items-center gap-2 px-4 py-2 text-purple-300 hover:bg-gray-600 transition duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Gestion des utilisateurs
                      </Link>
                      <hr className="my-1 border-gray-600" />
                    </>
                  )}
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
