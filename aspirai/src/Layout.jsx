// Layout.jsx
import Header from "./Header";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Header />
      <main className="page-content">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
