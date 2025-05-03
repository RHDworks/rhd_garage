import { useState, useEffect } from 'react';
import { Modal, TextInput, Button, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { VehicleNameModalProps } from '../../utils/interface';
import { fetchNui } from '../../utils/fetchNui';

export const VehicleNameModal = ({ visible, vehicle, onUpdateName, onClose }: VehicleNameModalProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [currentName, setCurrentName] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processTimeOut, setProcessTimeOut] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible && vehicle) {
      setCurrentName(vehicle.name);
      open()
    }
  }, [vehicle]);

  const handleClose = () => {
    close();
    onClose();
  }

  const handleChangeName = async () => {
          if (isProcessing) {
              return;
          }

          const trimmedName = newName.trim();

          if (!trimmedName) {
            setError('Vehicle name cannot be empty');
            return;
          }
          
          setIsProcessing(true);
          setError(null);
  
          const transferStartTime = Date.now();
          
          try {
              const success = await fetchNui<boolean>('updateVehicleName', {vehicleId: vehicle?.id, newName: newName}, {
                  data: true
              });
  
              console.log('Change name result:', success);
              
              const elapsedTime = Date.now() - transferStartTime;
              const remainingTime = Math.max(0, 5000 - elapsedTime);
              
              if (remainingTime > 0) {
                  const timeout = setTimeout(() => {
                      if (success) {
                        onUpdateName(trimmedName);
                          console.log('successfully change vehicle name');
                          handleClose();
                      } else {
                          setError('Failed to change vehicle name. Please try again.');
                          setIsProcessing(false);
                      }
                  }, remainingTime);
                  
                  setProcessTimeOut(timeout);
              } else {
                  if (success) {
                    onUpdateName(trimmedName);
                      console.log('successfully change vehicle name');
                      handleClose();
                  } else {
                    setError('Failed to change vehicle name. Please try again.');
                    setIsProcessing(false);
                  }
              }
          } catch (err) {
              console.error('Error during transfer:', err);
              
              const elapsedTime = Date.now() - transferStartTime;
              const remainingTime = Math.max(0, 5000 - elapsedTime);
              
              if (remainingTime > 0) {
                  const timeout = setTimeout(() => {
                      setError('An error occurred while trying to change the vehicle name.');
                      setIsProcessing(false);
                  }, remainingTime);
                  
                  setProcessTimeOut(timeout);
              } else {
                  setError('An error occurred while trying to change the vehicle name.');
                  setIsProcessing(false);
              }
          }
      };
  
    useEffect(() => {
        return () => {
            if (processTimeOut) {
                clearTimeout(processTimeOut);
            }
        };
    }, [processTimeOut]);

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title="Edit Vehicle Name"
        centered
        closeOnClickOutside = {false}
        closeOnEscape = {false}
        withCloseButton={false}
        className='text-[var(--mantine-color-dark-1)]'
      >
        <>
            <div className="mb-4">
                <TextInput
                    label="Current Name:"
                    required= {true}
                    description= "This is your current vehicle name"
                    value={currentName}
                    disabled
                    mb="md"
                />
                
                <TextInput
                    label="New Name:"
                    required= {true}
                    description="Enter a new name for your vehicle"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value)

                      if (e.target.value == currentName) {
                        setError('This is your current vehicle name');
                        return;
                      } else if (error != '') {
                        setError('');
                      }
                    }}
                    error={error}
                    mb="md"
                    placeholder="MY LOVE"
                    autoFocus
                />
            </div>
            <Group mt="xl" justify='flex-end'>
                <Button
                    variant="light"
                    color='red'
                    onClick={handleClose}
                    disabled={isProcessing}
                >
                    Cancel
                </Button>

                <Button
                    variant='light'
                    onClick={handleChangeName}
                    loading={isProcessing}
                    disabled={!newName || (newName == currentName) || isProcessing}
                >
                    Save Changes
                </Button>
            </Group>
        </>
      </Modal>
    </>
  );
};