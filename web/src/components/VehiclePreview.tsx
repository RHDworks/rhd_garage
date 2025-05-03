import React, { useEffect, useState } from "react";
import { ActionIcon, Container, Progress, Badge, Text, Loader, Center, Box } from "@mantine/core";
import { FaArrowLeft } from "react-icons/fa6";
import { fetchNui } from "../utils/fetchNui";
import { VehicleProps } from "../utils/interface";

interface VehicleStatsProps {
  speed: number;
  acceleration: number;
  braking: number;
  handling: number;
  traction: number;
}

const VehiclePreview: React.FC<{
  visible: boolean;
  selectedVehicle: VehicleProps;
  onClose: () => void;
}> = ({ visible, selectedVehicle, onClose }) => {
  const [vehicleStats, setVehicleStats] = useState<VehicleStatsProps | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [_, setVehicleSpawned] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      // Reset state saat komponen muncul
      setIsLoading(true);
      setVehicleStats(null);
      setVehicleSpawned(false);
      
      // Aktifkan kamera preview di FiveM client
      fetchNui('showVehiclePreview', { vehicleId: selectedVehicle.id }, {
        data: true
      }).then(response => {
        if (response) {
          setVehicleSpawned(true);
          
          // Setelah kendaraan ter-spawn, ambil statistiknya
          fetchNui<VehicleStatsProps|null>('getVehicleStats', { vehicleId: selectedVehicle.id }, {
            data: null
          })
          .then(statsResponse => {
            if (statsResponse) {
              setVehicleStats(statsResponse);
              setIsLoading(false);
            }
          })
          .catch(error => {
            console.error("Error fetching vehicle stats:", error);
            setIsLoading(false);
          });
        } else {
          console.error("Failed to spawn preview vehicle");
          setIsLoading(false);
        }
      })
      .catch(error => {
        console.error("Error showing vehicle preview:", error);
        setIsLoading(false);
      });
    } else {
      // Matikan kamera preview saat komponen tidak terlihat
      fetchNui('hideVehiclePreview', {});
    }

    return () => {
      // Cleanup: Pastikan kamera preview dimatikan saat komponen unmount
      fetchNui('hideVehiclePreview', {});
    };
  }, [visible, selectedVehicle]);

  if (!visible) return null;

  const handleClose = () => {
    fetchNui('hideVehiclePreview', {});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Panel statistik kendaraan di sebelah kanan - tidak full height */}
      <div className="w-96 max-h-[800px] bg-[var(--mantine-color-dark-8)] border-l border-[var(--mantine-color-dark-4)] shadow-xl rounded-lg overflow-auto absolute right-6 top-1/2 transform -translate-y-1/2">
        {/* Header */}
        <div className="p-3 bg-[var(--mantine-color-dark-8)] border-b border-[var(--mantine-color-dark-4)] flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-lg text-[var(--mantine-color-dark-1)] font-bold">Vehicle Preview</h2>
          </div>
          <ActionIcon variant="light" size="md" aria-label="Back to Details" onClick={handleClose}>
            <FaArrowLeft style={{ width: '70%', height: '70%' }} />
          </ActionIcon>
        </div>

        {/* Nama Kendaraan */}
        <div className="p-4">
            <Box className="mb-3 bg-[var(--mantine-color-dark-6)] p-3 rounded-lg">
                <h3 className="text-lg text-[var(--mantine-color-dark-1)] font-semibold">{selectedVehicle.name}</h3>
                <Badge
                    variant="light"
                    size="md"
                >
                    plate: {selectedVehicle.plate}
                </Badge>
            </Box>

          {isLoading || !vehicleStats ? (
            // Tampilkan loader jika masih loading atau data belum ada
            <Container className="rounded-lg bg-[var(--mantine-color-dark-6)] p-8 my-4">
              <Center className="flex flex-col">
                <Loader size="lg" color="blue" className="mb-4" />
                <Text className="center" size="sm" color="dimmed">
                  Memuat data kendaraan...
                </Text>
              </Center>
            </Container>
          ) : (
            <>
              {/* Performa Kendaraan */}
              <Container className="rounded-lg bg-[var(--mantine-color-dark-6)] p-4 space-y-4 mt-4 mb-4">
                <h4 className="text-md font-semibold text-[var(--mantine-color-dark-1)]">Performance</h4>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Text size="sm">Speed</Text>
                    <Text size="sm" className="font-mono text-[var(--mantine-color-blue-5)]">{vehicleStats.speed}</Text>
                  </div>
                  <Progress value={vehicleStats.speed} color="blue" size="md" radius="xs" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Text size="sm">Acceleration</Text>
                    <Text size="sm" className="font-mono text-[var(--mantine-color-blue-5)]">{vehicleStats.acceleration}</Text>
                  </div>
                  <Progress value={vehicleStats.acceleration} color="blue" size="md" radius="xs" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Text size="sm">Braking</Text>
                    <Text size="sm" className="font-mono text-[var(--mantine-color-blue-5)]">{vehicleStats.braking}</Text>
                  </div>
                  <Progress value={vehicleStats.braking} color="blue" size="md" radius="xs" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Text size="sm">Handling</Text>
                    <Text size="sm" className="font-mono text-[var(--mantine-color-blue-5)]">{vehicleStats.handling}</Text>
                  </div>
                  <Progress value={vehicleStats.handling} color="blue" size="md" radius="xs" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Text size="sm">Traction</Text>
                    <Text size="sm" className="font-mono text-[var(--mantine-color-blue-5)]">{vehicleStats.traction}</Text>
                  </div>
                  <Progress value={vehicleStats.traction} color="blue" size="md" radius="xs" />
                </div>
              </Container>

              {/* Status Kendaraan */}
              <Container className="rounded-lg bg-[var(--mantine-color-dark-6)] p-4 space-y-4 mt-4 mb-4">
                <h4 className="text-md font-semibold text-[var(--mantine-color-dark-1)]">Status</h4>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Text size="sm">Fuel</Text>
                    <Text size="sm" className="font-mono text-[var(--mantine-color-green-5)]">{selectedVehicle.vehicle_status.fuel}%</Text>
                  </div>
                  <Progress value={selectedVehicle.vehicle_status.fuel} color="green" size="md" radius="xs" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Text size="sm">Body</Text>
                    <Text size="sm" className="font-mono text-[var(--mantine-color-green-5)]">{selectedVehicle.vehicle_status.body}%</Text>
                  </div>
                  <Progress value={selectedVehicle.vehicle_status.body} color="green" size="md" radius="xs" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Text size="sm">Engine</Text>
                    <Text size="sm" className="font-mono text-[var(--mantine-color-green-5)]">{selectedVehicle.vehicle_status.engine}%</Text>
                  </div>
                  <Progress value={selectedVehicle.vehicle_status.engine} color="green" size="md" radius="xs" />
                </div>
              </Container>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehiclePreview;