import { FaMotorcycle, FaPlane, FaHelicopter, FaCar, FaShip, FaBicycle } from "react-icons/fa";

export function getVehicleIcon(type:string) {
   const vehType = type.toLocaleLowerCase();

   switch (vehType) {
    case 'boat':
        return <FaShip style={{ width: '90', height: '90', color:'var(--mantine-color-dark-1)'}}/>
    case 'plane':
        return <FaPlane style={{ width: '90', height: '90', color:'var(--mantine-color-dark-1)'}}/>
    case 'motorcycle':
        return <FaMotorcycle style={{ width: '90', height: '90', color:'var(--mantine-color-dark-1)'}}/>
    case 'helicopter':
        return <FaHelicopter style={{ width: '90', height: '90', color:'var(--mantine-color-dark-1)'}}/>
    case 'bicycle':
        return <FaBicycle style={{ width: '90', height: '90', color:'var(--mantine-color-dark-1)'}}/>
    default:
        return <FaCar style={{ width: '90', height: '90', color:'var(--mantine-color-dark-1)'}}/>
   }
}