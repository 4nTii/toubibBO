import Header from "./Header";
import CGUBanner from "./CGUBanner";

function Layout({ children }) {
  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto min-h-0">{children}</main>
      <CGUBanner />
    </div>
  );
}

export default Layout;
