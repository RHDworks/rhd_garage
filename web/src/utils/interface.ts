type BadgeValue = string | { color: string; pos?: number };

export interface VehicleStatusProps {
    fuel: number;
    body: number;
    engine: number;
}

export interface VehicleStatsProps {
    speed: number;
    acceleration: number;
    braking: number;
    handling: number;
    traction: number;
}

export interface VehicleBadgeProps {
    [key: string]: BadgeValue;
}

export interface GarageExtraButtons {
    change_veh_name?: boolean,
    change_veh_garage?: boolean
}

export interface VehicleProps {
    id: string|number;
    icon: 'car' | 'motorcycle';
    name: string;
    plate: string;
    vehicle_status: VehicleStatusProps;
    badges: VehicleBadgeProps
}
  
export interface PositionProps {
    x: number;
    y: number;
}
  
export interface GarageDataProps {
    label: string
    extra_buttons?: GarageExtraButtons
    isDepot?: boolean
}

export interface VehicleNameModalProps {
    visible: boolean,
    vehicle: VehicleProps | null;
    onUpdateName: (newName: string) => void;
    onClose: () => void
}

export interface VehicleTransferModalProps {
    visible: boolean;
    vehicle: VehicleProps;
    onClose: () => void;
    onTransferSuccess: (vehicleId: string|number) => void;
    currentGarage: string;
}

export interface LogProps {
    date: string,
    message: string
}