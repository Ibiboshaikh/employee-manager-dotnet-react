import { Link } from "react-router-dom";
import { routes } from "../routes";

const Forbidden = () => {
    return (
        <div className="auth-shell">
            <div className="auth-card text-center space-y-4">
                <h1 className="font-heading text-5xl font-bold text-brand-600">403</h1>
                <p className="text-muted dark:text-gray-400">
                  You don't have permission to view this page.
                </p>
                <Link to={routes.employees()} className="btn-primary inline-block">← Back to employees</Link>
            </div>
        </div>
    );
}

export default Forbidden;