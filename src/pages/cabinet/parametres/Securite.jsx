import Layout from "../../../components/Layout/Layout";
import CabinetLayout from "../../../components/Layout/CabinetLayout";

function Securite() {
  return (
    <Layout>
      <CabinetLayout>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Sécurité</h2>
          <p className="text-gray-300">Paramètres de sécurité.</p>
        </div>
      </CabinetLayout>
    </Layout>
  );
}

export default Securite;
