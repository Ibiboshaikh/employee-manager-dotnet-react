import { useRecentActivityStore } from "../stores/recentActivityStore";
import { useShallow } from 'zustand/react/shallow';

interface RecentActivityModalProps {
    open: boolean;              // Whether the modal is visible
    onClose: () => void;        // Callback when user wants to close the modal
}
function RecentActivityModal({ open, onClose }: RecentActivityModalProps) {
    const { activities, clear } = useRecentActivityStore(
        useShallow(s => ({activities: s.activities, clear: s.clear})),
    );

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
                            <li key={index}>
                                <strong>{activity.action}</strong>: {activity.details} <em>({new Date(activity.timestamp).toLocaleString()})</em>
                            </li>
                        ))
                    )}
                </ul>
                <button className="btn-danger" onClick={clear}>Clear</button>
                <button className="btn-secondary" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default RecentActivityModal;