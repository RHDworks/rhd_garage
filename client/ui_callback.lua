local garage = require 'config.garage'
local location = require 'config.location'

local function getSpawnPoints(garage)
    local garageData = location[garage]
    if not garageData then
        return
    end

    local coords = GetEntityCoords(cache.ped)
    local heading = GetEntityHeading(cache.ped)

    local spawn_points = garageData.spawn_points

    if spawn_points and #spawn_points > 0 then
        local freeLoc = lib.array.find(spawn_points, function (c)
            local vehicles = lib.getNearbyVehicles(c.xyz, 3.5)

            if #vehicles < 0 then
                return c
            end
        end)

        return freeLoc
    end

    return vec(coords.xyz, heading)
end

local function spawnVehicle(vehicleId, isDepot)
    local vehicleData = vehicle_cache:getVehicleData(vehicleId)

    if not vehicleData then
        return
    end

    local props = vehicleData.props
    if not pcall(lib.requestModel, props.model, 1500) then
        return
    end

    local allowedSpawn = not isDepot and true or lib.callback.await(
        'rhd_garage:server:payDepotInvoice', false, vehicleData.invoice
    )

    if not allowedSpawn then
        lib.notify({
            title = 'Garage',
            description = ('You don\'t have $%s in your pocket'):format(vehicleData.invoice),
            type = 'error'
        })
        return
    end

    local coords = getSpawnPoints(vehicleData.currentGarage)
    local vehicle = utils.spawnCar(props.model, coords, coords.w, nil, true)

    if not vehicle then
        return
    end

    lib.setVehicleProperties(vehicle, props)
    TaskWarpPedIntoVehicle(cache.ped, vehicle, -1)

    Wait(100)
    utils.setFuel(vehicle, props.fuelLevel)

    local netId = NetworkGetNetworkIdFromEntity(vehicle)
    TriggerServerEvent('rhd_garage:server:setVehicleOut', netId, vehicleData.currentGarage)
end

RegisterNUICallback('exit', function (data, cb)
    SetNuiFocus(false, false)
    LocalPlayer.state.garage_mode = false

    SetTimeout(500, function ()
        vehicle_cache:clear()
    end)
    cb(1)
end)

RegisterNUICallback('getGarageList', function (data, cb)
    local vehicleData = vehicle_cache:getVehicleData(data.vehicleId)

    if not vehicleData then
        return
    end

    local model = vehicleData.props.model
    local class = GetVehicleClassFromName(model)

    local garageName = {}

    for label, gData in pairs(location) do
        if gData.type ~= 'depot' then
            local garagClass = garage.category_class[gData.category]
            if utils.isVehicleClassAllowed(class, garagClass) then
                garageName[#garageName+1] = label
            end
        end
    end

    cb(garageName)
end)

RegisterNUICallback('spawnVehicle', function (data, cb)
    spawnVehicle(data.vehicleId, data.isDepot)
    cb(1)
end)

RegisterNUICallback('getVehicleLogs', function (data, cb)
    local vehicleData = vehicle_cache:getVehicleData(data.vehicleId)

    if not vehicleData then
        return
    end

    local vehicleLogs = lib.callback.await(
        'rhd_garage:server:getVehicleLogs', false, vehicleData.plate
    )

    cb(vehicleLogs)
end)

RegisterNUICallback('updateVehicleName', function (data, cb)
    local success = false
    local vehicleData = vehicle_cache:getVehicleData(data.vehicleId)

    if vehicleData and vehicleData.name then
        success = lib.callback.await(
            'rhd_garage:server:updateVehicleName', false, vehicleData.plate, data.newName, vehicleData.name
        )
    
        if not success then
            lib.notify({
                description = 'Failed to process vehicle name change',
                type = 'error',
                duration = 8000
            })
        end
    end

    cb(success)
end)

RegisterNUICallback('updateGarageName', function (data, cb)
    local success = false
    local vehicleData = vehicle_cache:getVehicleData(data.vehicleId)
    
    if vehicleData and vehicleData.currentGarage then
        success = lib.callback.await(
            'rhd_garage:server:updateGarageName', false, vehicleData.plate, data.newName, vehicleData.name
        )
    
        if not success then
            lib.notify({
                description = 'Failed to process vehicle name change',
                type = 'error',
                duration = 8000
            })
        end
    end

    cb(success)
end)

RegisterNUICallback('showVehiclePreview', function(data, cb)

    NetworkStartSoloTutorialSession()
    SetPlayerInvincible(cache.playerId, true)
    SetEntityVisible(cache.ped, false, false)

    local vehicleId = data.vehicleId
    local previewReady = vehPreview:set(vehicleId)

    if not previewReady then
        NetworkEndTutorialSession()
    end

    cb(previewReady)
end)

RegisterNUICallback('hideVehiclePreview', function(data, cb)
    vehPreview:exit()

    NetworkEndTutorialSession()
    SetPlayerInvincible(cache.playerId, false)
    SetEntityVisible(cache.ped, true, true)

    cb(1)
end)

RegisterNUICallback('getVehicleStats', function(data, cb)
    cb(vehPreview:getStats())
end)