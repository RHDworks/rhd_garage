import React, { useEffect, useRef, useState } from "react";
import ProgresStatus from "./ProgresStatus";

import { VehicleProps, GarageExtraButtons, LogProps } from "../utils/interface";
import { ActionIcon, Container, Button, Loader, Group } from "@mantine/core";
import { FaArrowLeft, FaCircleInfo, FaPenToSquare, FaRightLeft, FaEye } from "react-icons/fa6";
import VehicleBadges from "./VehicleBadges";
import { fetchNui } from "../utils/fetchNui";

const VehicleDetails: React.FC<{
        visible: boolean,
        closeVehicleDetails: () => void,
        selectedVehicle: VehicleProps,
        updateVehicleName: () => void,
        updateVehicleGarage: () => void
        spawnVehicle: () => void
        garageExtraButtons?: GarageExtraButtons
        isDepotGarage?: boolean
        onShowPreview: () => void
    }> = ({
        visible,
        closeVehicleDetails,
        selectedVehicle,
        updateVehicleName,
        updateVehicleGarage,
        garageExtraButtons,
        spawnVehicle,
        isDepotGarage,
        onShowPreview
    }) => {
    
    const logsRef = useRef<HTMLDivElement>(null);
    
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [logs, setLogs] = useState<LogProps[]>([]);
    const [noLogsMessage, setNoLogsMessage] = useState<string>('');
    const [noLogsTextComplete, setNoLogsTextComplete] = useState<boolean>(false);
    
    const showExtraButtons = garageExtraButtons?.change_veh_name || garageExtraButtons?.change_veh_garage;

    useEffect(() => {
        let typingInterval: NodeJS.Timeout | undefined;
        
        if (visible) {
            setIsLoading(true);
            setLogs([]);
            setNoLogsMessage('');
            setNoLogsTextComplete(false);
            
            if (typingInterval !== undefined) {
                clearInterval(typingInterval);
            }

            const typeError = () => {
                const message = "No vehicle logs found for this vehicle...";
                let i = 0;
                
                typingInterval = setInterval(() => {
                    if (i < message.length) {
                        setNoLogsMessage(_ => message.substring(0, i + 1));
                        i++;
                    } else {
                        clearInterval(typingInterval);
                        setNoLogsTextComplete(true);
                    }
                }, 40);
            }

            fetchNui<LogProps[]|null>('getVehicleLogs', {vehicleId: selectedVehicle.id}, {
                data: [
                    {
                        date: new Date().toLocaleDateString(),
                        message: 'Test aja'
                    }
                ]
            })
            .then(response => {
                if (response && Array.isArray(response) && response.length > 0) {
                    setLogs(response);
                }
            })
            
            const fetchTimeout = setTimeout(() => {
                setIsLoading(false);

                if (logs.length < 1) {
                    typeError()
                }
            }, 2500);
            
            return () => {
                clearTimeout(fetchTimeout);
                clearInterval(typingInterval);
            };
        }
    }, [visible, selectedVehicle]);

    useEffect(() => {
        if (visible && logsRef.current && (logs.length > 0 || noLogsTextComplete)) {
            setTimeout(() => {
                if (logsRef.current) {
                    logsRef.current.scrollTop = logsRef.current.scrollHeight;
                }
            }, 100);
        }
    }, [visible, logs, noLogsMessage, noLogsTextComplete]);

    return visible && (
        <>
            <div 
                className="bg-[var(--mantine-color-dark-8)] border-l border-[var(--mantine-color-dark-4)] overflow-hidden"
                style = {{
                    width: '400px',
                    flexShrink: 0,
                }}
                >
                
                <div className="p-3 mt-0.5 bg-[var(--mantine-color-dark-8)] border-b border-[var(--mantine-color-dark-4)] flex items-center justify-between">
                    <div className="flex mb-[6px] items-center">
                        <FaCircleInfo className="mr-2 w-7 h-7 text-[var(--mantine-color-dark-1)]" />
                        <h2 className="text-lg text-[var(--mantine-color-dark-1)] font-bold">Vehicle Details</h2>
                    </div>

                    <ActionIcon variant="light" size="md" aria-label="Close Details" onClick={closeVehicleDetails}>
                        <FaArrowLeft style={{ width: '70%', height: '70%' }} />
                    </ActionIcon>
                </div>
                
                <div className="p-4">
                    <div className="mb-3 bg-[var(--mantine-color-dark-6)] p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg text-[var(--mantine-color-dark-1)] font-semibold">{selectedVehicle.name}</h3>
                            
                            <ActionIcon
                                top={15}
                                variant="light" 
                                color="blue" 
                                size="md" 
                                aria-label="Preview Vehicle"
                                onClick={onShowPreview}
                            >
                                <FaEye style={{ width: '70%', height: '70%' }} />
                            </ActionIcon>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            <VehicleBadges badges={selectedVehicle.badges} size="md"/>
                        </div>
                    </div>
        
                    <Container className="rounded-lg bg-[var(--mantine-color-dark-6)] p-4 space-y-4 mt-4 mb-4">
                        <ProgresStatus name="Fuel" level={selectedVehicle.vehicle_status.fuel}/>
                        <ProgresStatus name="Body" level={selectedVehicle.vehicle_status.body}/>
                        <ProgresStatus name="Engine" level={selectedVehicle.vehicle_status.engine}/>
                    </Container>

                    
                    <Container size='xs' className="rounded-lg bg-[var(--mantine-color-dark-6)] p-4">
                        <div className="flex items-center mb-2">
                            <div className="w-3 h-3 rounded-full bg-[var(--mantine-color-green-5)] mr-2"></div>
                            <h4 className="text-sm font-mono text-[var(--mantine-color-dark-1)]">VEHICLE LOGS</h4>
                        </div>
                        
                        <div 
                            ref={logsRef}
                            className="bg-[var(--mantine-color-dark-9)] rounded p-2 h-40 overflow-y-auto font-mono text-xs"
                            style={{
                                scrollBehavior: 'smooth'
                            }}
                        >
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <Loader size="sm" color="teal" />
                                    <p className="text-gray-400 mt-2">Loading logs...</p>
                                </div>
                            ) : logs.length > 0 ? (
                                logs.map((log, index) => (
                                    <div key={index} className="py-1">
                                        <span className="text-[var(--mantine-color-green-5)]">[{log.date}]</span> 
                                        <span className="text-gray-300"> {log.message}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="py-2 text-[#ffab09] flex">
                                    <span className="mr-1">{'>'}</span>
                                    <span className="text-[var(--mantine-color-dark-1)]">{noLogsMessage}</span>
                                    {!noLogsTextComplete && <span className="animate-pulse">_</span>}
                                </div>
                            )}
                        </div>
                    </Container>

                    <div className=" p-0 mt-6">
                        <Group
                            justify="space-between"
                            gap="xs"
                            grow
                        >
                            <Button
                                fullWidth
                                bottom={5}
                                variant="light"
                                size="sm"
                                onClick={spawnVehicle}
                            >
                                Take Out Vehicle
                            </Button>
                                {showExtraButtons && (
                                    <Group
                                        grow
                                        gap="xs"
                                        justify="space-between"
                                    >   
                                        {garageExtraButtons?.change_veh_name && (
                                            <>
                                                <Button
                                                    fullWidth
                                                    bottom={5}
                                                    variant= "light"
                                                    size= "sm"
                                                    onClick={updateVehicleName}
                                                >
                                                    <FaPenToSquare className="w-5 h-5"/>
                                                </Button>
                                            </>
                                        )}

                                        {garageExtraButtons?.change_veh_garage && (
                                            <>
                                                <Button
                                                    fullWidth
                                                    bottom={5}
                                                    variant= "light"
                                                    size= "sm"
                                                    onClick={updateVehicleGarage}
                                                    disabled={isDepotGarage}
                                                >
                                                    <FaRightLeft className="w-5 h-5"/>
                                                </Button>
                                            </>
                                        )}
                                    </Group>
                                )}
                        </Group>
                    </div>
                </div>
            </div>
        </>
    )
}

export default VehicleDetails;