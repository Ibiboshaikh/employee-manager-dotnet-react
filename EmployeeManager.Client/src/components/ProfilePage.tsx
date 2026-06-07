import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useProfile } from "../Queries/useProfile";
import AvatarUpload from "./AvatarUpload";

const Field = ({label, value}: {label: string, value: string}) => (
    <div className="flex flex-col py-2 border-b border-line dark:border-gray-700 last:border-b-0">
        <span className="text-xs uppercase tracking-wider text-muted dark:text-gray-400">
            {label}
        </span>
        <span className="text-sm text-ink dark:text-gray-100">
            {value || '--'}
        </span>
    </div>
);

const ProfilePage = () => {
    const { data: profile, isLoading, error } = useProfile();
    console.log(profile);
    if (isLoading)
        return <div className="p-6 text-muted dark:text-gray-400">Loading profile...</div>;
    if (error || !profile)
        return <div className="p-6 text-red-600">Error loading profile.</div>;
    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-3">
                <h1 className="page-title">My Profile</h1>
                <div className="flex gap-2">
                    <Link to="/profile/edit" className="btn-primary">
                        Edit
                    </Link>
                    <Link to="/profile/change-password" className="btn-secondary">
                        Change Password
                    </Link>
                </div>
            </div>
            <div className="card">
                <AvatarUpload currentUrl={profile.avatarUrl ?? ""} />
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