
local core = require 'bridge.init'
local location = require 'config.location'
local garage = require 'config.garage'

AddTextEntry('garageHelpText', 'Press ~INPUT_PICKUP~ to access this garage')

---@param garageName string
---@param garageType garageType
local function openMenu(garageName, garageType)
    local vehicleData = {}

    local garageClass = garage.category_class[location[garageName].category]
    local vehicleList = lib.callback.await('rhd_garage:server:getVehicles', 500, garageName)
    
    if vehicleList and #vehicleList > 0 then
        for i=1, #vehicleList do
            local vehicle = vehicleList[i]
            local vehicleModel = vehicle.props.model
            local vehicle_class = GetVehicleClassFromName(vehicleModel)

            if utils.isVehicleClassAllowed(vehicle_class, garageClass) and not utils.isOutside(vehicle.plate:trim()) then
                local badges = {
                    [('plate %s'):format(vehicle.plate)] = {
                        pos = 1,
                        color = 'blue'
                    },
                    [garage.state_status[vehicle.state]] = {
                        pos = 2,
                        color = garage.status_color[vehicle.state]
                    }
                }

                if garageType == 'shared' then
                    ---@diagnostic disable-next-line: assign-type-mismatch
                    badges[('Owner (%s)'):format(vehicle.owner)] = 'pink'
                elseif garageType == 'depot' then
                    ---@diagnostic disable-next-line: assign-type-mismatch
                    badges[('Invoice $(%s)'):format(garage.insurance_price[vehicle_class])] = 'yellow'
                end

                local vehicle_data = {
                    id = vehicle.id,
                    name = vehicle.custom_name or utils.getVehicleName(vehicleModel),
                    plate = vehicle.plate:trim(),
                    icon = utils.getVehicleIcon(vehicle_class),
                    vehicle_status = {
                        body = math.floor((vehicle.props.bodyHealth or 1000)),
                        engine = math.floor((vehicle.props.engineHealth or 1000)),
                        fuel = math.floor(vehicle.props.fuelLevel)
                    },
                    badges = badges,
                    currentGarage = garageName,
                    citizenid = vehicle.citizenid
                }

                vehicleData[#vehicleData+1] = vehicle_data

                vehicle_data.props = vehicle.props
                vehicle_data.invoice = garage.insurance_price[vehicle_class]
                vehicle_cache:storeVehicleData(vehicle_data.id, vehicle_data)
            end
        end
    end

    SendNUIMessage({
        action = 'setVisible',
        data = {
            visible = true,
            vehicles = vehicleData,
            garage = {
                label = garageName,
                extra_buttons = {
                    change_veh_name = garage.change_veh_name,
                    change_veh_garage = garage.change_veh_garage
                },
                isDepot = location[garageName]?.type == 'depot'
            }
        }
    })
    SetNuiFocus(true, true)
    LocalPlayer.state.garage_mode = true
end

CreateThread(function()
    for label, data --[[@as GarageData]] in pairs(location) do
        local garage_points = lib.points.new(data.coords.xyz, data.distance or 5, {
            hasAccess = true
        })

        local blipData = garage.blip_data[data.type] or garage.blip_data[data.category]
        utils.createGarageBlip(data.coords.xyz, label, blipData, garage.blip_category)

        function garage_points:onEnter()
            if not data.groups then return end

            self.hasAccess = utils.validateGroups(core.playerGang --[[@as PlayerGroup]], data.groups --[[@as groupData]])
        
            if not self.hasAccess then
                self.hasAccess = utils.validateGroups(core.playerJob --[[@as PlayerGroup]], data.groups --[[@as groupData]])    
            end
        end

        function garage_points:onExit()
            self.hasAccess = true
        end
        
        function garage_points:nearby()
            if LocalPlayer.state.garage_mode then
                return
            end

            if not self.hasAccess then
                return
            end

            DisplayHelpTextThisFrame('garageHelpText', false)

            if IsControlJustPressed(0, 38) then
                if cache.vehicle and data.type ~= 'depot' then
                    local isAllowd = (data.type == 'shared')

                    local vehicle = cache.vehicle
                    local state = Entity(vehicle).state

                    local vehiclePlate = GetVehicleNumberPlateText(vehicle):trim()
                    local vehicleProps = lib.getVehicleProperties(vehicle)

                    local netId = NetworkGetNetworkIdFromEntity(vehicle)
                    local vehicle_class = GetVehicleClass(vehicle)
                
                    if not utils.isVehicleClassAllowed(vehicle_class, garage.category_class[data.category]) then
                        lib.notify({
                            description = 'Kendaraan ini tidak bisa disimpan disini!',
                            type = 'error'
                        })
                        return
                    end
                
                    if not isAllowd then
                        isAllowd = lib.callback.await(
                            'rhd_garage:server:getOwner', false, vehiclePlate
                        )
                    end

                    if not isAllowd then
                        return
                    end

                    TaskLeaveVehicle(cache.ped, vehicle, 1)
                    state:set('vehicleProps', vehicleProps, true)

                    repeat
                        Wait(100)
                    until not IsPedInAnyVehicle(cache.ped, true)
                    
                    TriggerServerEvent('rhd_garage:server:saveVehicle',
                        netId, label
                    )
    
                    Wait(800)
                    return
                end

                openMenu(label, data.type)
            end
        end
    end
    
    LocalPlayer.state.garage_mode = false
end)