import React, { useState, useEffect } from 'react';
import { isEnvBrowser } from "../utils/misc";
import { VehicleProps, GarageDataProps  } from "../utils/interface";
import { Button, ActionIcon, Group, Container, Text, Input } from "@mantine/core";
import { FaStar, FaRegStar, FaAngleDown, FaAngleUp, FaXmark, FaWarehouse, FaMagnifyingGlass } from 'react-icons/fa6';

import VehicleDetails from '../components/VehicleDetails';
import VehiclePreview from '../components/VehiclePreview';
import { getVehicleIcon } from '../components/VehicleIcons';

import { fetchNui } from '../utils/fetchNui';
import { useNuiEvent } from '../hooks/useNuiEvent';
import { useDraggable } from "../components/Drag";
import VehicleBadges from '../components/VehicleBadges';
import { VehicleNameModal } from '../components/modal/ChangeName';
import { ChangeGarageModal } from '../components/modal/ChangeGarage';

const FAVORITE_STORAGE_KEY = 'garage_favorite';

const App: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [garageData, setGarageData] = useState<GarageDataProps | null>(null);
  const [vehicles, setVehicles] = useState<VehicleProps[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleProps | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showDetailPanel, setShowDetailPanel] = useState<boolean>(false);
  const [showPreviewMode, setShowPreviewMode] = useState<boolean>(false);

  const { isDragging, position, garageRef, setIsDragging, setStartPos, onMouseDown, onMouseMove, onMouseUp } = useDraggable();

  const [favorites, setFavorites] = useState<{ [vehicleId: string]: boolean }>({});
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const [showChangeNameModal, setShowChangeNameModal] = useState<boolean>(false);
  const [showChangeGarageModal, setShowChangeGarageModal] = useState<boolean>(false);

  const handleClose = () => {
    setVisible(false);
    setShowDetailPanel(false);
    setSelectedVehicle(null);
    setIsMinimized(false);
    setShowOnlyFavorites(false);
    setShowChangeNameModal(false);
    setShowChangeGarageModal(false);
    setShowPreviewMode(false);

    if (!isEnvBrowser()) {
      fetchNui('exit');
    };
  }

  useNuiEvent('setVisible', (data: {visible: boolean, vehicles: VehicleProps[], garage: GarageDataProps}) => {
  
    setVisible(data.visible || false);

    if (data.vehicles && Array.isArray(data.vehicles)) {
      setVehicles(data.vehicles);
    }

    if (data.garage) {
      setGarageData(data.garage);
    }
  })
  
  useEffect(() => {
    try {
        const savedPosition = localStorage.getItem(FAVORITE_STORAGE_KEY);
        if (savedPosition) {
          setFavorites(JSON.parse(savedPosition));
        }
    } catch (error) {
        console.error('Error: loading data from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' && 
        !showChangeNameModal && 
        !showChangeGarageModal &&
        !showPreviewMode
      ) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showChangeNameModal, showChangeGarageModal, showPreviewMode]);

  const toggleFavorite = (vehicleId:string|number) => {
    setFavorites(prev => ({
      ...prev,
      [vehicleId]: !prev[vehicleId]
    }));
    
    try {
      localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(favorites));
      console.error('Success: saving favorite vehicles to localStorage:');
    } catch (error) {
        console.error('Error: saving favorite vehicles to localStorage:', error);
    }
  };

  const spawnVehicle = () => {
    fetchNui('spawnVehicle', {vehicleId: selectedVehicle?.id, isDepot: garageData?.isDepot});
    handleClose();
  }
  
  const updateVehicleName = (newName: string) => {
    if (!selectedVehicle) {
      console.error("No vehicle selected");
      return;
    }
    
    setVehicles(prevVehicles => 
      prevVehicles.map(vehicle => 
        vehicle.id === selectedVehicle.id 
          ? { ...vehicle, name: newName } 
          : vehicle
      )
    );

    setSelectedVehicle(prev => prev ? { ...prev, name: newName } : null);
  };

  const handleTransferSuccess = (vehicleId: string|number) => {
    setVehicles(prevVehicles => prevVehicles.filter(v => v.id !== vehicleId));
    
    setShowDetailPanel(false);
    setSelectedVehicle(null);
    console.log(`Vehicle ${vehicleId} successfully transferred to another garage`);
  };

  const toggleShowOnlyFavorites = () => {
    setShowOnlyFavorites(prev => !prev);
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const search = searchTerm ? String(searchTerm).toLowerCase() : "";
    
    const matchesName = vehicle && vehicle.name ? 
      vehicle.name.toLowerCase().includes(search) : false;
    
    const matchesPlate = vehicle && vehicle.plate ? 
      vehicle.plate.toLowerCase().includes(search) : false;
    
    const matchesSearch = matchesName || matchesPlate;
    
    if (showOnlyFavorites) {
      return matchesSearch && favorites && favorites[vehicle.id];
    }
    
    return matchesSearch;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const showVehicleDetails = (vehicle: VehicleProps) => {
    setSelectedVehicle(vehicle);
    setShowDetailPanel(true);
    setShowPreviewMode(false);
  };

  const closeVehicleDetails = () => {
    setShowDetailPanel(false);
    setSelectedVehicle(null);
  };

  const showVehiclePreview = () => {
    setShowPreviewMode(true);
  };

  const closeVehiclePreview = () => {
    setShowPreviewMode(false);
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
    setShowDetailPanel(false);
  };

  if (visible && showPreviewMode && selectedVehicle) {
    return (
      <VehiclePreview
        visible={showPreviewMode}
        selectedVehicle={selectedVehicle}
        onClose={closeVehiclePreview}
      />
    );
  }

  return visible && (
    <>
      <div 
          ref={garageRef}
          className="absolute shadow-lg rounded-lg overflow-hidden flex"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: showDetailPanel ? '1000px' : '600px',
            cursor: isDragging ? 'grabbing' : 'default',
            zIndex: 1000
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          <div className="bg-[var(--mantine-color-dark-8)] text-white" style={{ 
            width: '600px', 
            minWidth: '600px',
            flexShrink: 0
          }}>
            
            {/* Garage main */}
            <div 
              className={`p-4 ${!isMinimized && 'border-b border-[var(--mantine-color-dark-4)]'} flex items-center justify-between cursor-grab`}
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDragging(true);
                setStartPos({
                  x: e.clientX - position.x,
                  y: e.clientY - position.y
                });
              }}
            >
              <div className="flex items-center">
                <FaWarehouse className="mr-2 w-7 h-7 text-[var(--mantine-color-dark-1)]" />
                <h1 className="text-xl text-[var(--mantine-color-dark-1)] font-bold">{garageData?.label || 'Vehicle Garage'}</h1>
              </div>
              
              <Group justify="flex-end" gap="xs">
                <ActionIcon variant="light" size="md" aria-label="Toggle Minimized" onClick={toggleMinimized}>
                  {isMinimized ? (
                    <FaAngleDown className="w-5 h-5" />
                  ) : (
                    <FaAngleUp className="w-5 h-5" />
                  )}
                </ActionIcon>
                <ActionIcon variant="light" size="md" color='red' aria-label="Close" onClick={handleClose}>
                  <FaXmark className="w-5 h-5" />
                </ActionIcon>
              </Group>
            </div>
      
            <div className={`${isMinimized ? 'hidden' : 'block'}`}>
              <Container className=" pt-3">
                <Group justify='flex-end' gap='xs'>
                  
                  <Input
                    placeholder="Search"
                    onChange={handleSearch}
                    style={{width: '522px'}}
                    right={2}
                    rightSection={
                      <FaMagnifyingGlass aria-label="Search" />
                    }
                  />

                  <ActionIcon 
                    variant="light"
                    color={showOnlyFavorites ? "yellow" : "gray"}
                    size="lg" 
                    onClick={toggleShowOnlyFavorites}
                    title="Show only favorites"
                  >
                    <FaStar className="w-5 h-5" />
                  </ActionIcon>
                </Group>
              </Container>
              
              <div className="p-3">
                <div className="border h-[560px] border-[var(--mantine-color-dark-4)] rounded-lg overflow-hidden">
                  <div className="max-h-136 overflow-y-auto p-3">
                      {filteredVehicles.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {filteredVehicles.map((vehicle) => (
                            <div 
                              key={vehicle.id} 
                              className="rounded-md bg-[var(--mantine-color-dark-7)] overflow-hidden"
                            >
                              <ActionIcon 
                                variant="subtle"
                                color="yellow"
                                size="md"
                                left='85%'
                                onClick={() => toggleFavorite(vehicle.id)}
                                className="absolute top-2 right-2 z-10"
                              >
                                {favorites[vehicle.id] ? (
                                  <FaStar className="w-5 h-5" />
                                ) : (
                                  <FaRegStar className="w-5 h-5" />
                                )}
                              </ActionIcon>

                              <div className="p-3 flex flex-col items-center">
                                
                                <div className="rounded-4 mb-4">
                                  {getVehicleIcon(vehicle.icon || 'car')}
                                </div>
                                
                                <div className="font-medium text-[var(--mantine-color-dark-1)] text-center text-lg mb-3 truncate w-full">
                                  {vehicle.name}
                                </div>
                                
                                <div className="flex flex-wrap justify-center gap-1 mb-4 min-h-6 w-full">
                                  <VehicleBadges badges={vehicle.badges}/>
                                </div>
                                
                                <Button 
                                  variant="light" 
                                  color="blue" 
                                  size="sm"
                                  style={{
                                    paddingLeft:'100px',
                                    paddingRight:'100px'
                                  }}
                                  onClick={() => showVehicleDetails(vehicle)}
                                >
                                  DETAILS
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex justify-center items-center h-[500px]">
                          <div className="text-center">
                            <Text
                              ta="center"
                              fz="xl"
                              fw={700}
                              c="dimmed"
                              className="empty-state-text"
                            >
                              No Vehicles
                            </Text>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
      
          {showDetailPanel && selectedVehicle && (
            <VehicleDetails
              visible={showDetailPanel}
              closeVehicleDetails={closeVehicleDetails}
              selectedVehicle={selectedVehicle}
              updateVehicleName={() => {
                if (!showChangeNameModal) {
                  setShowChangeNameModal(true);
                }
              }}
              updateVehicleGarage={() => {
                if (!showChangeGarageModal) {
                  setShowChangeGarageModal(true);
                }
              }}
              garageExtraButtons={garageData?.extra_buttons}
              spawnVehicle={spawnVehicle}
              isDepotGarage={garageData?.isDepot}
              onShowPreview={showVehiclePreview}
            />
          )}

          {showChangeNameModal && selectedVehicle && (
            <VehicleNameModal
                visible={showChangeNameModal}
                vehicle={selectedVehicle}
                onUpdateName={(new_name:string) => {
                  updateVehicleName(new_name)
                  setShowChangeNameModal(false);
                }}
                onClose={() => {
                    setShowChangeNameModal(false);
                }}
            />
          )}

          {showChangeGarageModal && selectedVehicle && (
            <ChangeGarageModal
              visible={showChangeGarageModal}
              vehicle={selectedVehicle}
              onTransferSuccess={(vehId:string|number) => {
                handleTransferSuccess(vehId);
                setShowChangeGarageModal(false);
              }}
              onClose={() => {
                  setShowChangeGarageModal(false);
              }}
              currentGarage={garageData?.label || 'Vehicle Garage'}
            />
          )}
        
        </div>
    </>
  );
};

export default App;