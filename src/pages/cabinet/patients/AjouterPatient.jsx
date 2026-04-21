import Layout from "../../../components/Layout/Layout";
import CabinetLayout from "../../../components/Layout/CabinetLayout";

function AjouterPatient() {
  return (
    <Layout>
      <CabinetLayout>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Ajouter un patient</h2>
          <p className="text-gray-300">Formulaire d'ajout de patient.</p>
        </div>
      </CabinetLayout>
    </Layout>
  );
}

export default AjouterPatient;
