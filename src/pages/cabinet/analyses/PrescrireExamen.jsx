import Layout from "../../../components/Layout/Layout";
import CabinetLayout from "../../../components/Layout/CabinetLayout";

function PrescrireExamen() {
  return (
    <Layout>
      <CabinetLayout>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">
            Prescrire examen
          </h2>
          <p className="text-gray-300">
            Prescrire un nouvel examen ou analyse.
          </p>
        </div>
      </CabinetLayout>
    </Layout>
  );
}

export default PrescrireExamen;
