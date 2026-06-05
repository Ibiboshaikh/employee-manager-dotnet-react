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
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Forgot password</h1>
            <form onSubmit={handleSubmit} className="space-y-4 card">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Enter the email on your account. We'll send a reset link
                </p>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    required placeholder="email@example.com" className="w-full rounded border-gray-300" />

                <button type="submit" disabled={submitting} className="btn-primary w-full">
                    {submitting ? "Submitting..." : "Send reset link"}
                </button>
                {devUrl && (
                    <div className="p-3 rounded bg-yellow-50 border border-yellow-300">
                        <p className="text-sm font-medium mb-1">
                            Dev mode: reset link
                        </p>
                        <Link to={devUrl} className="text-sm text-brand-600 underline">
                            {devUrl}
                        </Link>
                    </div>
                )};
            </form>
            <div className="mt-4 text-center">
                <Link to={routes.login()} className="text-sm text-brand-600">
                    Back to login
                </Link>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;