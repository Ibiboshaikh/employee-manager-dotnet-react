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
                <h2 className="text-lg font-semibold text-navy-900 dark:text-gray-100 mb-3">Recent Activity</h2>
                <ul className="space-y-2 max-h-72 overflow-y-auto text-sm text-ink dark:text-gray-200">
                    {activities.length === 0 ? (
                        <li className="text-muted dark:text-gray-400">No recent activity.</li>
                    ) : (

                        activities.map((activity, index) => (
                            <li key={index} className="py-2 border-b border-line dark:border-gray-700 last:border-b-0">
                                <strong className="text-navy-900 dark:text-gray-100">{activity.action}</strong>: {activity.details} <em className="text-muted dark:text-gray-400">({new Date(activity.timestamp).toLocaleString()})</em>
                            </li>
                        ))
                    )}
                </ul>
                <div className="flex justify-end gap-2 mt-4">
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                    <button className="btn-danger" onClick={clear}>Clear</button>
                </div>
            </div>
        </div>
    );
}

export default RecentActivityModal;