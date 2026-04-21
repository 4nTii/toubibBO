import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/DoctorContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/auth/Auth";
import Home from "./pages/Home";

// Cabinet - Dashboard
import VueGlobale from "./pages/cabinet/dashboard/VueGlobale";
import ActiviteRecente from "./pages/cabinet/dashboard/ActiviteRecente";

// Cabinet - Patients
import ListePatients from "./pages/cabinet/patients/ListePatients";
import AjouterPatient from "./pages/cabinet/patients/AjouterPatient";
import RechercheAvancee from "./pages/cabinet/patients/RechercheAvancee";

// Cabinet - Dossiers médicaux
import TousDossiers from "./pages/cabinet/dossiers/TousDossiers";
import Antecedents from "./pages/cabinet/dossiers/Antecedents";
import Traitements from "./pages/cabinet/dossiers/Traitements";
import Documents from "./pages/cabinet/dossiers/Documents";

// Cabinet - Rendez-vous
import Agenda from "./pages/cabinet/rendez-vous/Agenda";
import NouveauRendezVous from "./pages/cabinet/rendez-vous/NouveauRendezVous";
import EnAttente from "./pages/cabinet/rendez-vous/EnAttente";

// Cabinet - Consultations
import NouvelleConsultation from "./pages/cabinet/consultations/NouvelleConsultation";
import HistoriqueConsultations from "./pages/cabinet/consultations/Historique";

// Cabinet - Ordonnances
import CreerOrdonnance from "./pages/cabinet/ordonnances/CreerOrdonnance";
import HistoriqueOrdonnances from "./pages/cabinet/ordonnances/Historique";

// Cabinet - Analyses
import PrescrireExamen from "./pages/cabinet/analyses/PrescrireExamen";
import Resultats from "./pages/cabinet/analyses/Resultats";

// Cabinet - Facturation
import Factures from "./pages/cabinet/facturation/Factures";
import Paiements from "./pages/cabinet/facturation/Paiements";

// Cabinet - Messagerie
import BoiteReception from "./pages/cabinet/messagerie/BoiteReception";
import Notifications from "./pages/cabinet/messagerie/Notifications";

// Cabinet - Paramètres
import ProfilCabinet from "./pages/cabinet/parametres/Profil";
import Preferences from "./pages/cabinet/parametres/Preferences";
import Securite from "./pages/cabinet/parametres/Securite";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<AuthRoute />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        {/* Cabinet - Dashboard */}
        <Route
          path="/cabinet"
          element={
            <ProtectedRoute>
              <VueGlobale />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cabinet/activite"
          element={
            <ProtectedRoute>
              <ActiviteRecente />
            </ProtectedRoute>
          }
        />

        {/* Cabinet - Patients */}
        <Route
          path="/cabinet/patients"
          element={
            <ProtectedRoute>
              <ListePatients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cabinet/patients/ajouter"
          element={
            <ProtectedRoute>
              <AjouterPatient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cabinet/patients/recherche"
          element={
            <ProtectedRoute>
              <RechercheAvancee />
            </ProtectedRoute>
          }
        />

        {/* Cabinet - Dossiers médicaux */}
        <Route
          path="/cabinet/dossiers"
          element={
            <ProtectedRoute>
              <TousDossiers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cabinet/dossiers/antecedents"
          element={
            <ProtectedRoute>
              <Antecedents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cabinet/dossiers/traitements"
          element={
            <ProtectedRoute>
              <Traitements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cabinet/dossiers/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />

        {/* Cabinet - Rendez-vous */}
        <Route
          path="/cabinet/rendez-vous"
          element={
            <ProtectedRoute>
              <Agenda />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cabinet/rendez-vous/nouveau"
          element={
            <ProtectedRoute>
              <NouveauRendezVous />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cabinet/rendez-vous/attente"
          element={
            <ProtectedRoute>
              <EnAttente />
            </ProtectedRoute>
          }
        />

        {/* Cabinet - Consultations */}
        <Route
          path="/cabinet/consultations"
          element={
            <ProtectedRoute>
              <HistoriqueConsultations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cabinet/consultations/nouvelle"
          element={
            <ProtectedRoute>
              <NouvelleConsultation />
            </ProtectedRoute>
          }
        />

        {/* Cabinet - Ordonnances */}
        <Route
          path="/cabinet/ordonnances"
          element={
            <ProtectedRoute>
              <HistoriqueOrdonnances />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cabinet/ordonnances/creer"
          element={
            <ProtectedRoute>
              <CreerOrdonnance />
            </ProtectedRoute>
          }
        />

        {/* Cabinet - Analyses */}
        <Route
          path="/cabinet/analyses"
          element={
            <ProtectedRoute>
              <Resultats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cabinet/analyses/prescrire"
          element={
            <ProtectedRoute>
              <PrescrireExamen />
            </ProtectedRoute>
          }
        />

        {/* Cabinet - Facturation */}
        <Route
          path="/cabinet/facturation"
          element={
            <ProtectedRoute>
              <Factures />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cabinet/facturation/paiements"
          element={
            <ProtectedRoute>
              <Paiements />
            </ProtectedRoute>
          }
        />

        {/* Cabinet - Messagerie */}
        <Route
          path="/cabinet/messagerie"
          element={
            <ProtectedRoute>
              <BoiteReception />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cabinet/messagerie/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Cabinet - Paramètres */}
        <Route
          path="/cabinet/parametres"
          element={
            <ProtectedRoute>
              <ProfilCabinet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cabinet/parametres/preferences"
          element={
            <ProtectedRoute>
              <Preferences />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cabinet/parametres/securite"
          element={
            <ProtectedRoute>
              <Securite />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Redirect to home if already logged in
function AuthRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <Auth />;
}

export default App;
