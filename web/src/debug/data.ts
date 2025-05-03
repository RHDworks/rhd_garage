import { VehicleProps } from "../utils/interface";

export const defaultVehicles: VehicleProps[] = [
    {
        id: 'vehicle_1',
        icon: 'motorcycle',
        name: 'NAGASAKI BF400',
        plate: '40BGB809',
        vehicle_status: {
            engine: 50,
            body: 35,
            fuel: 80
        },
        badges: {
            "In Garage": "green",
            "Plate RHD 01": "blue",
            "Price $500": {
                color: "yellow",
                pos: 1
            },
        }
    },
    {
        id: 'vehicle_2',
        icon: 'car',
        name: 'KARIN SULTAN3',
        plate: '87KKV380',
        vehicle_status: {
            engine: 50,
            body: 35,
            fuel: 80
        },
        badges: {
            "In Garage": "green",
            "Plate RHD 01": "blue"
        }
    },
    {
        id: 'vehicle_3',
        icon: 'car',
        name: 'PEGASSI ZENTORNO',
        plate: '45AKL192',
        vehicle_status: {
            engine: 34,
            body: 45,
            fuel: 67
        },
        badges: {
            "In Garage": "green",
            "Plate RHD 01": "blue"
        }
    },
    {
        id: 'vehicle_4',
        icon: 'car',
        name: 'PEGASSI ZENTORNO',
        plate: '45AKL192',
        vehicle_status: {
            engine: 34,
            body: 56,
            fuel: 99
        },
        badges: {
            "In Garage": "green",
            "Plate RHD 01": "blue"
        }
    },
    {
        id: 'vehicle_5',
        icon: 'car',
        name: 'PEGASSI ZENTORNO',
        plate: '45AKL192',
        vehicle_status: {
            engine: 78,
            body: 23,
            fuel: 56
        },
        badges: {
            "In Garage": "green",
            "Plate RHD 01": "blue"
        }
    },
    {
        id: 'vehicle_6',
        icon: 'car',
        name: 'PEGASSI ZENTORNO',
        plate: '45AKL192',
        vehicle_status: {
            engine: 34,
            body: 87,
            fuel: 65
        },
        badges: {
            "In Garage": "green",
            "Plate RHD 01": "blue"
        }
    },
    {
        id: 'vehicle_7',
        icon: 'car',
        name: 'PEGASSI ZENTORNO',
        plate: '45AKL192',
        vehicle_status: {
            engine: 89,
            body: 56,
            fuel: 78
        },
        badges: {
            "In Garage": "green",
            "Plate RHD 01": "blue"
        }
    },
    // {
    //     id: 'vehicle_8',
    //     icon: 'car',
    //     name: 'PEGASSI ZENTORNO',
    //     plate: '45AKL192',
    //     status: 'Impounded',
    //     licensePlateState: 'SA',
    //     vehicle_status: {
    //         engine: 5,
    //         body: 45,
    //         fuel: 32
    //     }
    // },
    // {
    //     id: 'vehicle_9',
    //     icon: 'car',
    //     name: 'PEGASSI ZENTORNO',
    //     plate: '45AKL192',
    //     status: 'Impounded',
    //     licensePlateState: 'SA',
    //     vehicle_status: {
    //         engine: 23,
    //         body: 45,
    //         fuel: 13
    //     }
    // }
];