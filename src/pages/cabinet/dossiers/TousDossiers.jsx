import Layout from "../../../components/Layout/Layout";
import CabinetLayout from "../../../components/Layout/CabinetLayout";

function TousDossiers() {
  return (
    <Layout>
      <CabinetLayout>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Tous les dossiers</h2>
          <p className="text-gray-300">Liste de tous les dossiers médicaux.</p>
        </div>
      </CabinetLayout>
    </Layout>
  );
}

export default TousDossiers;
