import React from "react";
import { useRecentActivity } from "../Context/RecentActivityContext";

function RecentActivityModal({ open, onClose }) {
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