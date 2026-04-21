import Layout from "../../../components/Layout/Layout";
import CabinetLayout from "../../../components/Layout/CabinetLayout";

function Traitements() {
  return (
    <Layout>
      <CabinetLayout>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Traitements</h2>
          <p className="text-gray-300">Gestion des traitements en cours.</p>
        </div>
      </CabinetLayout>
    </Layout>
  );
}

export default Traitements;
