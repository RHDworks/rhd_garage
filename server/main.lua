local server = require 'bridge.init'
local location = require 'config.location'

lib.callback.register('rhd_garage:server:getVehicles', function(source, garage)
    local garageData = location[garage]
    
    if not garageData then
        return
    end

    local ped = GetPlayerPed(source)
    local ped_coords = GetEntityCoords(ped)
    local ped_distance = #(ped_coords - garageData.coords.xyz)

    if ped_distance > garageData.distance then
        return
    end

    local garge_type = garageData.type
    local state = not (garge_type == 'depot') and 1 or 0
    local shared = garge_type == 'shared'

    local vehicles = server.getPlayerVehicle(source, garage, state, shared)

    return vehicles
end)

lib.callback.register('rhd_garage:server:getOwner', function (source, plate)
    return server.isOwner(source, plate)
end)

lib.callback.register('rhd_garage:server:getVehicleLogs', function (_, plate)
    return server.getVehicleLogs(plate)
end)

lib.callback.register('rhd_garage:server:updateVehicleName', function (_, plate, newName, oldName)
    return server.updateVehicleName(plate, newName, oldName)
end)

lib.callback.register('rhd_garage:server:updateGarageName', function (_, plate, newGarage, oldGarage)
    return server.updateGarageName(plate, newGarage, oldGarage)
end)

lib.callback.register('rhd_garage:server:payDepotInvoice', function (source, price)
    return server.payDepotInvoice(source, price)
end)

RegisterNetEvent('rhd_garage:server:setVehicleOut', function(netId, garage)
    local vehicle = NetworkGetEntityFromNetworkId(netId)

    if not vehicle then
        return
    end

    local plate = GetVehicleNumberPlateText(vehicle):trim()

    utils.giveKeys(source, plate)
    server.setVehicleState(plate, 0, garage)
end)

RegisterNetEvent('rhd_garage:server:saveVehicle', function(netId, garage)
    local vehicle = NetworkGetEntityFromNetworkId(netId)

    if not DoesEntityExist(vehicle) then
        return
    end

    local plate = GetVehicleNumberPlateText(vehicle):trim()

    local state = Entity(vehicle).state
    local props = state.vehicleProps

    server.setVehicleState(plate, 1, garage, props)

    pcall(DeleteEntity, vehicle)
end)