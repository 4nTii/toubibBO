import { useAuth } from "../context/DoctorContext";
import Layout from "../components/Layout/Layout";

function Home() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Welcome!</h2>
        <p className="text-gray-300 mb-4">
          Vous êtes connecté en tant que{" "}
          <span className="text-blue-400 font-semibold">{user?.role}</span>
        </p>
      </div>
    </Layout>
  );
}

export default Home;
