import React from "react";
import { Badge, Progress } from "@mantine/core";
import { getColorProgress } from "./ColorStatus";

const ProgresStatus: React.FC<{
        name: string,
        level: number
    }> = ({name, level}) => {

    return (
        <>
            <div>
                <div className="flex justify-between mb-2">
                    <Badge
                        variant="light"
                        color='blue'
                        size="sm"
                    >
                        {name}:
                    </Badge>
                </div>
                
                <Progress.Root size="xl">
                <Progress.Section value={level} color={getColorProgress(level)}>
                    <Progress.Label>{level}%</Progress.Label>
                </Progress.Section>
                </Progress.Root>
            </div>
        </>
    )
}

export default ProgresStatus