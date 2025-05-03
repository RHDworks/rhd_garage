import React from "react";
import { isEnvBrowser } from "../utils/misc";
import { Button } from "@mantine/core";
import { debugData } from "../utils/debugData";
import { defaultVehicles } from "../debug/data";

const GarageDev: React.FC = () => {
    return isEnvBrowser() && (
        <>
            <div style={{ position: 'fixed', top: '850px', right: 20, zIndex: 9999 }}>
            <Button
                color="dark"
                
                onClick={() => {
                    debugData([
                    {
                        action: 'setVisible',
                        data: {
                        visible: true,
                        vehicles: defaultVehicles,
                        garage: {
                            label: 'RHD Garage',
                            extra_buttons: {
                            change_veh_name: true,
                            change_veh_garage: true
                            }
                        }
                        }
                    }
                    ])
                }}
                >
                Open Garage
                </Button>
            </div>
        </>
    )
};

export default GarageDev;