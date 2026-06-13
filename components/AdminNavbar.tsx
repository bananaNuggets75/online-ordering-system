import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const AdminNavbar = () => {
  const { logout, isAdmin } = useAuth();

  // Only render for a signed-in admin (so it never shows on the login page).
  if (!isAdmin) {
    return null;
  }

  return (
    <nav className="admin-navbar">
      {/* Center: Navigation Links */}
      <div className="admin-nav-links">
        <Link href="/admin/dashboard">Admin Dashboard</Link>
        <Link href="/admin/menu-items">Menu Items</Link>
        <Link href="/admin/orders">Orders</Link>
      </div>

      {/* Right Side: Logout Button */}
      <div className="admin-logout-container">
        <button onClick={logout} className="admin-logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
