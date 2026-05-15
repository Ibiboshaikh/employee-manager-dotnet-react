import { createContext, useContext, useState, ReactNode } from "react";

export type Activity = any;
interface RecentActivityContextType {
    activities: Activity[];
    addActivity: (activity: Activity) => void;
    getRecentActivities: () => Activity[];
}

const RecentActivityContext = createContext<RecentActivityContextType | undefined>(undefined);

export function RecentActivityProvider({ children }: { children: ReactNode }) {
    const [activities, setActivities] = useState<Activity[]>(() => 
        JSON.parse(localStorage.getItem('recentActivities') || '[]')
    )

    const addActivity = (activity: Activity) => {
        const updatedActivities = [activity, ...activities].slice(0, 5); 
        setActivities(updatedActivities);
        localStorage.setItem('recentActivities', JSON.stringify(updatedActivities));
    }

    const getRecentActivities = () => {
        return activities;
    }

    return (
        <RecentActivityContext.Provider value={{ activities, addActivity, getRecentActivities }}>
            {children}
        </RecentActivityContext.Provider>
    );
}

export function useRecentActivity() {
    const context = useContext(RecentActivityContext);
    if (context === undefined) {
        throw new Error("useRecentActivity must be used within a RecentActivityProvider");
    }
    return context;
}