import Layout from "../../../components/Layout/Layout";
import CabinetLayout from "../../../components/Layout/CabinetLayout";

function EnAttente() {
  return (
    <Layout>
      <CabinetLayout>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">En attente</h2>
          <p className="text-gray-300">Rendez-vous en attente de confirmation.</p>
        </div>
      </CabinetLayout>
    </Layout>
  );
}

export default EnAttente;
