import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/api";
import { routes } from "../routes";

const ForgotPasswordPage = () =>{
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [devUrl, setDevUrl] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await forgotPassword(email);
            setDevUrl(response.data.devResetUrl || null);
        } catch (err) {
            setDevUrl(null);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-card space-y-4">
                <h1 className="page-title text-center">Forgot password</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-muted dark:text-gray-300">
                        Enter the email on your account. We'll send a reset link
                    </p>
                    <div>
                        <label htmlFor="email" className="label">Email</label>
                        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                            required placeholder="email@example.com" className="input" />
                    </div>

                    <button type="submit" disabled={submitting} className="btn-primary w-full">
                        {submitting ? "Submitting..." : "Send reset link"}
                    </button>
                    {devUrl && (
                        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-800">
                            <p className="text-sm font-medium mb-1 text-ink dark:text-gray-100">
                                Dev mode: reset link
                            </p>
                            <Link to={devUrl} className="text-sm text-brand-600 underline break-all">
                                {devUrl}
                            </Link>
                        </div>
                    )}
                </form>
                <div className="text-center">
                    <Link to={routes.login()} className="text-sm text-brand-600 hover:text-brand-700">
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;