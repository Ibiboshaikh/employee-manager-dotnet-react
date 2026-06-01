import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import { routes } from "../routes";
import DarkModeToggle from "../components/DarkModeToggle";
const AuthLayout = () =>{
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        navigate(routes.login());
    };

    return(
        <div style={styles.layoutWrapper}>
            <header style={styles.header}>
                <div style={styles.brand} onClick={() => navigate(routes.employees())}>
                    Employee Management Portal
                </div>
                <nav style={styles.navMenu}>
                    <DarkModeToggle />
                    <span style={styles.userBadge}> 👤 {user?.fullName}</span>
                    <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                </nav>
            </header>
            <main style={styles.mainContent}>
                <Outlet />
            </main>
        </div>
    );
}


const styles = {
  layoutWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    minHeight: "100vh",
    backgroundColor: "#f5f6fa",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 40px",
    height: "70px",
    backgroundColor: "#1a1a2e",
    color: "white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  brand: {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    cursor: "pointer",
  },
  navMenu: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  userBadge: {
    fontSize: "14px",
    color: "#cbd5e1",
  },
  logoutBtn: {
    padding: "8px 16px",
    backgroundColor: "#e11d48",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  mainContent: {
    flex: 1,
    width: "100%",
    boxSizing: "border-box" as const,
  },
};

export default AuthLayout;