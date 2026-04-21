import Header from "../Header";
import Footer from "../Footer";
import CGUBanner from "../CGUBanner";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 w-full mx-auto">{children}</main>
      <Footer />
      <CGUBanner />
    </div>
  );
}

export default Layout;
