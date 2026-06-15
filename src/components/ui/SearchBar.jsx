import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { search, searchGeo } from "../../services/searchService";
import { FTP_TARGET } from "../../config/config";
import {
  SearchIcon,
  LocationPinIcon,
  LocationIcon,
  BuildingIcon,
  MedicalIcon,
  RegionIcon,
} from "../icons/IconService";

const DEBOUNCE_DELAY = 300;
const MIN_SEARCH_LENGTH = 3;

const DEFAULT_AVATARS = {
  female: "/images/user/avatar-doctor-female.webp",
  male: "/images/user/avatar-doctor-male.webp",
};

function SearchBar({ variant = "header" }) {
  const navigate = useNavigate();
  const isCompact = variant === "header";

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    doctors: [],
    businessSite: [],
    specialities: [],
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Location state
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState({ region: [] });
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [hasSearchedLocation, setHasSearchedLocation] = useState(false);

  // Refs
  const searchRef = useRef(null);
  const locationRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const locationTimeoutRef = useRef(null);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setIsLocationFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helpers
  const getDoctorImageUrl = (imagePath, gender) => {
    if (imagePath) return `${FTP_TARGET}/${imagePath}`;
    return DEFAULT_AVATARS[gender] || DEFAULT_AVATARS.male;
  };

  const hasResults = () => {
    const { doctors, businessSite, specialities } = searchResults;
    return (
      doctors?.length > 0 ||
      businessSite?.length > 0 ||
      specialities?.length > 0
    );
  };

  const hasLocationResults = () => {
    const { region } = locationResults;
    return region?.length > 0;
  };

  // API calls
  const fetchSearchResults = async (value) => {
    setIsLoadingSearch(true);
    const result = await search(value);
    if (result.success) {
      setSearchResults(result.data);
    } else {
      setSearchResults({ doctors: [], businessSite: [], specialities: [] });
    }
    setHasSearched(true);
    setIsLoadingSearch(false);
  };

  const fetchLocationResults = async (value) => {
    setIsLoadingLocation(true);
    const result = await searchGeo(value);
    if (result.success) {
      setLocationResults(result.data);
    } else {
      setLocationResults({ region: [] });
    }
    setHasSearchedLocation(true);
    setIsLoadingLocation(false);
  };

  // Event handlers
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < MIN_SEARCH_LENGTH) {
      setSearchResults({ doctors: [], businessSite: [], specialities: [] });
      setHasSearched(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(
      () => fetchSearchResults(value),
      DEBOUNCE_DELAY,
    );
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationQuery(value);

    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }

    if (value.length < MIN_SEARCH_LENGTH) {
      setLocationResults({ region: [] });
      setHasSearchedLocation(false);
      return;
    }

    locationTimeoutRef.current = setTimeout(
      () => fetchLocationResults(value),
      DEBOUNCE_DELAY,
    );
  };

  const handleDoctorSelect = (doctor) => {
    setSearchQuery(doctor.name);
    closeSearchDropdown();
  };

  const handleBusinessSiteSelect = (site) => {
    setSearchQuery(site.name);
    closeSearchDropdown();
  };

  const handleSpecialitySelect = (speciality) => {
    setSearchQuery(speciality.name);
    closeSearchDropdown();
  };

  const handleRegionSelect = (region) => {
    setLocationQuery(region.name);
    closeLocationDropdown();
  };

  const closeLocationDropdown = () => {
    setLocationResults({ region: [] });
    setIsLocationFocused(false);
    setHasSearchedLocation(false);
  };

  const closeSearchDropdown = () => {
    setSearchResults({ doctors: [], businessSite: [], specialities: [] });
    setIsSearchFocused(false);
    setHasSearched(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery || locationQuery) {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (locationQuery) params.set("loc", locationQuery);
      navigate(`/search?${params.toString()}`);
    }
  };

  // Render helpers
  const renderDoctorItem = (doctor) => (
    <button
      key={`doctor-${doctor.id}`}
      type="button"
      onClick={() => handleDoctorSelect(doctor)}
      className="w-full text-left px-3 py-2 text-white hover:bg-gray-600 transition cursor-pointer flex items-center gap-2"
    >
      <div className="w-9 h-9 rounded-full bg-gray-600 shrink-0 overflow-hidden">
        <img
          src={getDoctorImageUrl(doctor.image, doctor.gender)}
          alt={doctor.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm truncate">{doctor.name}</div>
        <div className="text-xs text-blue-400">{doctor.speciality}</div>
        {doctor.cities?.length > 0 && (
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <LocationIcon size="2.5" />
            <span className="truncate">{doctor.cities.join(" • ")}</span>
          </div>
        )}
      </div>
    </button>
  );

  const renderBusinessSiteItem = (site) => (
    <button
      key={`site-${site.id}`}
      type="button"
      onClick={() => handleBusinessSiteSelect(site)}
      className="w-full text-left px-3 py-2 text-white hover:bg-gray-600 transition cursor-pointer flex items-center gap-2"
    >
      <div className="w-9 h-9 rounded-lg bg-green-600/20 shrink-0 flex items-center justify-center">
        <BuildingIcon />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm truncate">{site.name}</div>
        <div className="text-xs text-green-400">Etablissement</div>
      </div>
    </button>
  );

  const renderSpecialityItem = (speciality) => (
    <button
      key={`spec-${speciality.id}`}
      type="button"
      onClick={() => handleSpecialitySelect(speciality)}
      className="w-full text-left px-3 py-2 text-white hover:bg-gray-600 transition cursor-pointer flex items-center gap-2"
    >
      <div className="w-9 h-9 rounded-lg bg-purple-600/20 shrink-0 flex items-center justify-center">
        <MedicalIcon />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm truncate">{speciality.name}</div>
        <div className="text-xs text-purple-400">Spécialité</div>
      </div>
    </button>
  );

  const renderSearchResults = () => {
    const { doctors, businessSite, specialities } = searchResults;
    const sections = [];

    if (doctors?.length > 0) {
      sections.push(<div key="doctors">{doctors.map(renderDoctorItem)}</div>);
    }

    if (businessSite?.length > 0) {
      sections.push(
        <div key="businessSite">
          {sections.length > 0 && <div className="border-t border-gray-600" />}
          {businessSite.map(renderBusinessSiteItem)}
        </div>,
      );
    }

    if (specialities?.length > 0) {
      sections.push(
        <div key="specialities">
          {sections.length > 0 && <div className="border-t border-gray-600" />}
          {specialities.map(renderSpecialityItem)}
        </div>,
      );
    }

    return sections;
  };

  const renderRegionItem = (region) => (
    <button
      key={`region-${region.id}`}
      type="button"
      onClick={() => handleRegionSelect(region)}
      className="w-full text-left px-3 py-2 text-white hover:bg-gray-600 transition cursor-pointer flex items-center gap-2"
    >
      <div className="w-9 h-9 rounded-lg bg-orange-600/20 shrink-0 flex items-center justify-center">
        <RegionIcon />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm truncate">{region.name}</div>
        <div className="text-xs text-orange-400">Région</div>
      </div>
    </button>
  );

  const renderLocationResults = () => {
    const { region } = locationResults;
    const sections = [];

    if (region?.length > 0) {
      sections.push(<div key="region">{region.map(renderRegionItem)}</div>);
    }

    return sections;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex ${isCompact ? "" : "w-full max-w-3xl mx-auto"}`}
    >
      {/* Search Field */}
      <div className="relative flex-1" ref={searchRef}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          placeholder="Nom, spécialité, établissement"
          className={`w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 rounded-l-lg border-r border-gray-600 ${isCompact ? "text-sm" : "py-3"}`}
        />
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2" />

        {isSearchFocused && (hasSearched || isLoadingSearch) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {isLoadingSearch ? (
              <div className="px-4 py-3 text-gray-400 text-sm">
                Recherche...
              </div>
            ) : !hasResults() ? (
              <div className="px-4 py-3 text-gray-400 text-sm">
                Aucun résultat trouvé
              </div>
            ) : (
              renderSearchResults()
            )}
          </div>
        )}
      </div>

      {/* Location Field */}
      <div
        className={`relative ${isCompact ? "w-36" : "w-66"}`}
        ref={locationRef}
      >
        <input
          type="text"
          value={locationQuery}
          onChange={handleLocationChange}
          onFocus={() => setIsLocationFocused(true)}
          placeholder="Où ?"
          className={`w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 rounded-none border-r border-gray-600 ${isCompact ? "text-sm" : "py-3"}`}
        />
        <LocationPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2" />

        {isLocationFocused && (hasSearchedLocation || isLoadingLocation) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {isLoadingLocation ? (
              <div className="px-4 py-3 text-gray-400 text-sm">
                Recherche...
              </div>
            ) : !hasLocationResults() ? (
              <div className="px-4 py-3 text-gray-400 text-sm">
                Aucun résultat trouvé
              </div>
            ) : (
              renderLocationResults()
            )}
          </div>
        )}
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className={`bg-green-600 hover:bg-green-800 text-white font-medium transition cursor-pointer flex items-center justify-center gap-2 rounded-r-lg ${isCompact ? "px-4 py-2 text-sm" : "px-6 py-3"}`}
      >
        <svg
          className={isCompact ? "h-4 w-4" : "h-5 w-5"}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className={isCompact ? "hidden sm:inline" : ""}>Rechercher</span>
      </button>
    </form>
  );
}

export default SearchBar;
