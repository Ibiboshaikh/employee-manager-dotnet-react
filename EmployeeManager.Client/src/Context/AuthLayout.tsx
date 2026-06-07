import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";
import { routes } from "../routes";
import DarkModeToggle from "../components/DarkModeToggle";
import { NavLink } from "react-router-dom";

const AuthLayout = () =>{
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const queryClient = useQueryClient();

    const handleLogout = () => {
        logout();
        // Wipe the React Query cache so the next user can't read the previous
        // user's cached data (e.g. profileKeys.me() is a static key — without
        // this, staleTime would serve the prior user's profile after re-login).
        queryClient.clear();
        toast.success("Logged out successfully");
        navigate(routes.login());
    };

    return(
        <div style={styles.layoutWrapper}>
            <header style={styles.header}>
                <div style={styles.brand} onClick={() => navigate(routes.employees())}>
                    <img src="/logo.svg" alt="" style={styles.brandLogo} />
                    NoviManager
                </div>
                <nav style={styles.navMenu}>
                    <NavLink to={routes.profile()} style={({ isActive }) => ({ ...styles.navLink, color: isActive ? '#ffffff' : styles.navLink.color, fontWeight: isActive ? 700 : 400 })}>
                      My Profile
                    </NavLink>
                    <NavLink to={routes.myDocuments()} style={({ isActive }) => ({ ...styles.navLink, color: isActive ? '#ffffff' : styles.navLink.color, fontWeight: isActive ? 700 : 400 })}>
                      My Documents
                    </NavLink>
                    <span style={styles.navDivider} />
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
    backgroundColor: "#f5f7fa",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 40px",
    height: "70px",
    backgroundColor: "#0b1f3a",
    color: "white",
    boxShadow: "0 6px 24px -16px rgba(11, 31, 58, 0.6)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "0.3px",
    cursor: "pointer",
  },
  brandLogo: {
    width: "32px",
    height: "32px",
  },
  navMenu: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },
  navLink: {
    color: "#e2e8f0",
    textDecoration: "none",
    fontSize: "14px",
    padding: "6px 4px",
  },
  navDivider: {
    width: "1px",
    height: "22px",
    backgroundColor: "rgba(255,255,255,0.18)",
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