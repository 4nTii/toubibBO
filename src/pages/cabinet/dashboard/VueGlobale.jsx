import Layout from "../../../components/Layout/Layout";
import CabinetLayout from "../../../components/Layout/CabinetLayout";

function VueGlobale() {
  return (
    <Layout>
      <CabinetLayout>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Vue globale</h2>
          <p className="text-gray-300">Aperçu général de votre cabinet.</p>
        </div>
      </CabinetLayout>
    </Layout>
  );
}

export default VueGlobale;
