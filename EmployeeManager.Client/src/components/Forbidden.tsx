import { Link } from "react-router-dom";
import { routes } from "../routes";

const Forbidden = () => {
    return (
        <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: 48, marginBottom: 8 }}>403</h1>
            <p style={{ color: '#666', marginBottom: 24 }}>
              You don't have permission to view this page.
            </p>
            <Link to={routes.employees()}>← Back to employees</Link>
        </div>
    );
}

export default Forbidden;