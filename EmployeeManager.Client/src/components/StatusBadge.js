// ============================================================================
// STATUSBADGE.JS — Displays a colored pill for Active / Inactive status.
//
// Simplest possible component: one prop in, one styled span out.
// Color is derived from the prop — no state needed.
//
// PROPS:
//   isActive (bool) — true → green "Active", false → red "Inactive"
// ============================================================================

import React from "react";

// Spreads shared badge styles, then overrides backgroundColor per status.
// JS equivalent of: class="badge active" or class="badge inactive"
const StatusBadge = ({ isActive }) => (
    <span style={{
        ...styles.badge,
        backgroundColor: isActive ? "#4caf50" : "#f44336",
    }}>
        {isActive ? "Active" : "Inactive"}
    </span>
);

const styles = {
    badge: {
        padding: "4px 10px",
        borderRadius: "12px",  // Pill shape
        color: "white",
        fontSize: "12px",
        fontWeight: "600",
    },
};

export default StatusBadge;
