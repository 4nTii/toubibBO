import Layout from "../../../components/Layout/Layout";
import CabinetLayout from "../../../components/Layout/CabinetLayout";

function Antecedents() {
  return (
    <Layout>
      <CabinetLayout>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Antécédents</h2>
          <p className="text-gray-300">Gestion des antécédents médicaux.</p>
        </div>
      </CabinetLayout>
    </Layout>
  );
}

export default Antecedents;
