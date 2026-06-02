import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

export interface ActivityInterface {
    id: string;
    action: string;
    details: string;
    timestamp: string;
    userId?: string;
}

export type Activity = ActivityInterface;

interface RecentActivityState {
    activities: Activity[];
    addActivity: (activity: Activity) => void;
    clear: () => void;
}

const MAX_ENTRIES = 5;

export const useRecentActivityStore = create<RecentActivityState>()(
    devtools(
        persist(
            (set) => ({
                activities: [],
                addActivity: (activity) =>
                    set((s) => {
                        const updated = [activity, ...s.activities].slice(0, MAX_ENTRIES);
                        return { activities: updated };
                    }),
                clear: () => {
                    set({ activities: [] });
                },
            }),
            {
                name: 'employee-manager:recent-activities',
                partialize: (s) => ({ activities: s.activities }), // don't persist actions
            }
        ),
        {
            name: 'RecentActivity',
        }
    ),
);