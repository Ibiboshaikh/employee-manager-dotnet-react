import { useRecentActivity } from "../Context/RecentActivityContext";
interface RecentActivityModalProps {
    open: boolean;              // Whether the modal is visible
    onClose: () => void;        // Callback when user wants to close the modal
}
function RecentActivityModal({ open, onClose }: RecentActivityModalProps) {
    const { getRecentActivities } = useRecentActivity();
    const activities = getRecentActivities();

    if (!open) return null;
    return(
        <div className="modal-overlay">
            <div className="modal">
                <h2>Recent Activity</h2>
                <ul>
                    {activities.length === 0 ? (
                        <li>No recent activity.</li>
                    ) : (
                        activities.map((activity, index) => (
                            <li key={index}>{activity}</li>
                        ))
                    )}
                </ul>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default RecentActivityModal;