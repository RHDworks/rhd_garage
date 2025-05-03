import React from "react";
import { Badge } from "@mantine/core";

const VehicleBadges: React.FC<{
    badges?: { [key: string]: string | { color: string; pos?: number } };
    size?: string
}> = ({ badges = {}, size = 'sm' }) => {
    const badgeArray = Object.entries(badges).map(([label, value]) => {
        if (typeof value === 'string') {
            return { label, color: value, pos: Infinity };
        } else {
            return { label, color: value.color || 'blue', pos: value.pos ?? Infinity };
        }
    });

    badgeArray.sort((a, b) => a.pos - b.pos);

    return badgeArray.length > 0 && (
        <>
            {badgeArray.map((badge, index) => (
                <Badge key={index} variant="light" color={badge.color} size={size}>
                    {badge.label}
                </Badge>
            ))}
        </>
    );
};

export default VehicleBadges;
