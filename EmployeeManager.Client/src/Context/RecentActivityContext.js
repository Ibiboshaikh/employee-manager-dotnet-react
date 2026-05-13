import { createContext, useContext, useState } from "react";

const RecentActivityContext = createContext();

export function RecentActivityProvider({ children }) {
    const [activities, setActivities] = useState(() =>
        JSON.parse(localStorage.getItem('recentActivities') || '[]')
    );

    const addActivity = (activity) => {
        const updatedActivities = [activity, ...activities].slice(0, 5); // Keep only the 5 most recent activities
        setActivities(updatedActivities);
        localStorage.setItem('recentActivities', JSON.stringify(updatedActivities));
    };

    const getRecentActivities = () => {
        return activities;
    };

    return (
        <RecentActivityContext.Provider value={{ activities, addActivity, getRecentActivities }}>
            {children}
        </RecentActivityContext.Provider>
    );
}

export function useRecentActivity() {
    return useContext(RecentActivityContext);
}