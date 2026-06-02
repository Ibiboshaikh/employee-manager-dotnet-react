import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useProfile } from "../Queries/useProfile";

const Field = ({label, value}: {label: string, value: string}) => (
    <div className="flex flex-col py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {label}
        </span>
        <span className="text-sm text-gray-900 dark:text-gray-100">
            {value || '--'}
        </span>
    </div>
);

const ProfilePage = () => {
    const { data: profile, isLoading, error } = useProfile();
    if (isLoading)
        return <div className="p-4">Loading profile...</div>;
    if (error || !profile)
        return <div className="p-4 text-red-500">Error loading profile.</div>;
    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">My Profile</h1>
                <Link to="/profile/edit" className="btn-primary">
                    Edit
                </Link>
            </div>
            <div className="card">
                <Field label="Name" value={`${profile.firstName} ${profile.lastName}`} />
                <Field label="Email" value={profile.email} />
                <Field label="Phone" value={profile.phoneNumber} />
                <Field label="Department" value={profile.department} />
                <Field label="Position" value={profile.position} />
                <Field label="Date of Joining" value={profile.dateOfJoining
                    ? format(new Date(profile.dateOfJoining), 'MMM d, yyyy') : '—'} />

                <Field label="Role" value={profile.role} />
            </div>
        </div>
    );
}

export default ProfilePage;