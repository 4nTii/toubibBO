import { Link } from "react-router-dom";
import { APP_NAME } from "../../config/config";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Legal Links */}
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Informations légales
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link
                  to="/legal"
                  className="text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  Gestion des cookies
                </Link>
              </li>
              <li>
                <Link
                  to="/gdpr"
                  className="text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  RGPD
                </Link>
              </li>
            </ul>
          </div>

          {/* Card 2: Site Map */}
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Plan du site
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  Rechercher un médecin
                </Link>
              </li>
              <li>
                <Link
                  to="/specialties"
                  className="text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  Spécialités
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-blue-400 transition duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Card 3: Empty for now */}
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              &nbsp;
            </h3>
            {/* Empty card - content to be added later */}
          </div>
        </div>

        {/* App Name + Year */}
        <div className="text-center border-t border-gray-700 pt-6">
          <p className="text-gray-400">
            {APP_NAME} &copy; {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
