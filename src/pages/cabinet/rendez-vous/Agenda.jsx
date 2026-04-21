import Layout from "../../../components/Layout/Layout";
import CabinetLayout from "../../../components/Layout/CabinetLayout";

function Agenda() {
  return (
    <Layout>
      <CabinetLayout>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Agenda</h2>
          <p className="text-gray-300">Votre agenda de rendez-vous docteur.</p>
          <p className="text-gray-300">
            Si proprietaire d'un cabinet, peut voir, modifier et supprimer les
            rendez-vous des autres docteurs.
          </p>
        </div>
      </CabinetLayout>
    </Layout>
  );
}

export default Agenda;
