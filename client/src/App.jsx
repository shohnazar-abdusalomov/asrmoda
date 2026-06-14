import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router";
import Storefront from "./store/Storefront.jsx";
import StaffPortal from "./admin/StaffPortal.jsx";
import Login from "./admin/Login.jsx";
import RegisterPage from "./store/RegisterPage.jsx";

export default function App() {
  const savedUser = JSON.parse(localStorage.getItem("asrmoda_user") || "null");
  const [user, setUser] = useState(savedUser);
  const navigate = useNavigate();
  const authenticated = Boolean(user && localStorage.getItem("asrmoda_token"));
  const openStaff = () => navigate(authenticated ? "/admin/dashboard" : "/login");

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authenticated
            ? <Navigate to="/admin/dashboard" replace />
            : <Login
                onBack={() => navigate("/")}
                onSuccess={(nextUser) => { setUser(nextUser); navigate("/admin/dashboard"); }}
              />
        }
      />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="/admin/:section"
        element={
          authenticated
            ? <StaffPortal user={user} setUser={setUser} onStore={() => navigate("/")} onLogout={() => { setUser(null); navigate("/"); }} />
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/register"
        element={
          <RegisterPage
            onBack={() => navigate("/")}
            onSuccess={() => navigate("/")}
          />
        }
      />
      <Route path="/*" element={<Storefront onStaff={openStaff} />} />
    </Routes>
  );
}
