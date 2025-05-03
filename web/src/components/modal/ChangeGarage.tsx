import React, { useState, useEffect } from 'react';
import { Modal, Button, NativeSelect, Group, Text, Loader } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { VehicleTransferModalProps } from "../../utils/interface";
import { fetchNui } from '../../utils/fetchNui';

export const ChangeGarageModal: React.FC<VehicleTransferModalProps> = ({
    visible,
    vehicle,
    onClose,
    onTransferSuccess,
    currentGarage
}) => {
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedGarage, setSelectedGarage] = useState<string | null>(null);
    const [garageList, setGarageList] = useState<string[]>([]);
    const [isLoadingGarages, setIsLoadingGarages] = useState(true);
    const [isTransferring, setIsTransferring] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transferTimeOut, setTransferTimeOut] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (visible) {
            setSelectedGarage(null);
            setIsLoadingGarages(true);
            setError(null);

            open();

            fetchNui<string[]>('getGarageList', {vehicleId: vehicle.id}, {
                data: [
                    'RHD GARAGE 1',
                    'RHD GARAGE 2',
                    'RHD GARAGE 3',
                    'RHD GARAGE 4',
                    'RHD GARAGE 5',
                    'RHD GARAGE 6'
                ]
            })
            .then(response => {
                let garageData: string[] = [];
                
                if (response && Array.isArray(response)) {
                    garageData = response;
                }
                
                if (garageData.length > 0) {
                    setGarageList(garageData);
                    
                    if (garageData.length === 1) {
                        setSelectedGarage(garageData[0]);
                    }
                } else {
                    setError('No garages available or failed to load garage list.');
                }
            })
            .catch(err => {
                console.error('Error fetching garage list:', err);
                setError('Failed to load garage list. Please try again.');
            })
            
            const fetchTimeout = setTimeout(() => {
                setIsLoadingGarages(false);
            }, 2500);

            return () => {
                clearTimeout(fetchTimeout);
            };
        }
    }, [visible, currentGarage]);

    const handleClose = () => {
        close();
        onClose();
    };

    const handleTransfer = async () => {
        if (isTransferring) {
            return;
        }

        if (!selectedGarage) {
            setError('Please select a garage');
            return;
        }

        setIsTransferring(true);
        setError(null);

        const transferStartTime = Date.now();
        
        try {
            const success = await fetchNui<boolean>('updateGarageName', {vehicleId: vehicle.id, garage: selectedGarage}, {
                data: true
            });

            console.log('Transfer result:', success);
            
            const elapsedTime = Date.now() - transferStartTime;
            const remainingTime = Math.max(0, 5000 - elapsedTime);
            
            if (remainingTime > 0) {
                const timeout = setTimeout(() => {
                    if (success) {
                        onTransferSuccess(vehicle.id);
                        console.log('success transfer vehicle');
                        handleClose();
                    } else {
                        setError('Transfer failed. Please try again.');
                        setIsTransferring(false);
                    }
                }, remainingTime);
                
                setTransferTimeOut(timeout);
            } else {
                if (success) {
                    onTransferSuccess(vehicle.id);
                    console.log('success transfer vehicle');
                    handleClose();
                } else {
                    setError('Transfer failed. Please try again.');
                    setIsTransferring(false);
                }
            }
        } catch (err) {
            console.error('Error during transfer:', err);
            
            const elapsedTime = Date.now() - transferStartTime;
            const remainingTime = Math.max(0, 5000 - elapsedTime);
            
            if (remainingTime > 0) {
                const timeout = setTimeout(() => {
                    setError('An error occurred while transferring the vehicle.');
                    setIsTransferring(false);
                }, remainingTime);
                
                setTransferTimeOut(timeout);
            } else {
                setError('An error occurred while transferring the vehicle.');
                setIsTransferring(false);
            }
        }
    };

    useEffect(() => {
        return () => {
            if (transferTimeOut) {
                clearTimeout(transferTimeOut);
            }
        };
    }, [transferTimeOut]);

    const isSameGarage = selectedGarage === currentGarage;

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={`Transfer ${vehicle?.name} (${vehicle?.plate})`}
            centered
            size="md"
            closeOnClickOutside={false}
            closeOnEscape={false}
            withCloseButton={false}
            className='text-[var(--mantine-color-dark-1)]'
        >
            {isLoadingGarages ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <Loader color="blue" size="xl" type="dots" className='mb-5' />
                    <Text className="mt-4">Loading available garages...</Text>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <NativeSelect
                            label='Select destination garage:'
                            description='Please select one of the available garages below.'
                            data={garageList.length > 0 ? garageList : ['No garages available']}
                            value={selectedGarage || ''}
                            size='sm'
                            required={true}
                            onChange={(event) => setSelectedGarage(event.currentTarget.value)}
                            disabled={isTransferring || garageList.length === 0}
                            onFocus={() => {
                                setError('')
                            }}
                            error={!selectedGarage && error === 'Please select a garage' ? 'Garage selection required' : undefined}
                            className="w-full mt-1"
                        />
                        
                        <div className="mt-2 text-xs">
                            <p>Available garages: {garageList.length}</p>
                            {isSameGarage && selectedGarage && (
                                <p className="text-yellow-500">Selected garage is the same as current garage.</p>
                            )}
                        </div>
                    </div>

                    {error && error !== 'Please select a garage' && (
                        <Text color="red" size="sm" className="mb-4">
                            {error}
                        </Text>
                    )}

                    <Group gap="md" justify="flex-end" className="mt-6">
                        <Button
                            variant="light"
                            onClick={handleClose}
                            disabled={isTransferring}
                            color='red'
                        >
                            Cancel
                        </Button>

                        <Button 
                            variant="light"
                            onClick={handleTransfer} 
                            loading={isTransferring}
                            disabled={!selectedGarage || isTransferring || isSameGarage || garageList.length === 0}
                        >
                            {isTransferring ? 'Transferring...' : 'Confirm Transfer'}
                        </Button>
                    </Group>
                </>
            )}
        </Modal>
    );
};