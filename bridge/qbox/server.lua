local server = {}
server.cacheLogs = {}

local query = {
    getOwner = [[
        SELECT 1
            FROM player_vehicles WHERE citizenid = ? AND plate = ?
    ]],
    getVehicle = [[
        SELECT CONCAT(
            JSON_UNQUOTE(JSON_EXTRACT(p.charinfo, '$.firstname')),
            ' ',
            JSON_UNQUOTE(JSON_EXTRACT(p.charinfo, '$.lastname'))
        ) AS owner_name, v.id, v.citizenid, v.mods, v.plate, v.state, v.custom_veh_name
            FROM player_vehicles v LEFT JOIN players p ON p.citizenid = v.citizenid 
        WHERE v.state = ? %s
    ]],
    getLogs = [[
        SELECT veh_logs FROM player_vehicles WHERE plate = ?
    ]],
    updateName = [[
        UPDATE player_vehicles SET custom_veh_name = ? WHERE plate = ?
    ]],
    updateGarage = [[
        UPDATE player_vehicles SET garage = ? WHERE plate = ? and state = ?
    ]],
    updateLogs = [[
        UPDATE player_vehicles SET veh_logs = ? WHERE plate = ?
    ]],
    updateState = [[
        UPDATE player_vehicles SET garage = ?, state = ? WHERE plate = ?
    ]],
    updateStateAndProps = [[
        UPDATE player_vehicles SET garage = ?, state = ?, mods = ? WHERE plate = ?
    ]]
}

local qbox = exports.qbx_core

---@param source number
---@param price number
function server.payDepotInvoice(source, price)
    local player = qbox:GetPlayer(source)
    if not player then return end

    return player.Functions.RemoveMoney('cash', price)
end

---@param source number
---@param plate string
function server.isOwner(source, plate)
    local player = qbox:GetPlayer(source)
    if not player then return end

    local citizenid = player.PlayerData.citizenid

    local response = MySQL.single.await(
        query.getOwner, {citizenid, plate}
    )

    return response
end

---@param source number
---@param garage string
---@param state number
---@param shared boolean
---@return VehicleData[]?
function server.getPlayerVehicle(source, garage, state, shared)
    local player = qbox:GetPlayer(source)
    if not player then return end

    local citizenid = player.PlayerData.citizenid
    
    local vehicle_query = query.getVehicle:format(
        shared and 'AND garage = ?' or state < 1 and 'AND v.citizenid = ?' or 'AND v.garage = ? AND v.citizenid = ?'
    )

    local vehicle_query_value = {state}
    
    if not shared then
        if state > 0 then
            ---@diagnostic disable-next-line: assign-type-mismatch
            vehicle_query_value[#vehicle_query_value+1] = garage
        end
        
        vehicle_query_value[#vehicle_query_value+1] = citizenid
    else
        ---@diagnostic disable-next-line: assign-type-mismatch
        vehicle_query_value[#vehicle_query_value+1] = garage
    end

    local vehicles = {} ---@type VehicleData[]
    local response = MySQL.prepare.await(vehicle_query, vehicle_query_value)

    if response then

        if not response[1] then
            response = {response}
        end

        for i=1, #response do
            local val = response[i]
            local props = json.decode(val.mods)
            local plate = val.plate:trim()
            local owner = val.owner_name

            vehicles[#vehicles+1] = {
                id = val.id,
                owner = owner,
                props = props,
                plate = plate,
                state = val.state,
                citizenid = val.citizenid,
                custom_name = val.custom_veh_name
            }
        end
    end

    return vehicles
end

---@param plate string
function server.getVehicleLogs(plate)
    if not server.cacheLogs[plate] then
        local response = MySQL.prepare.await(
            query.getLogs, {plate}
        )
        server.cacheLogs[plate] = (response and json.decode(response)) or {}
    end
    return server.cacheLogs[plate]
end

---@param plate string
---@param message string
function server.addVehicleLogs(plate, message)
    local logs = server.cacheLogs[plate]

    if not logs then
        server.cacheLogs[plate] = {}
    end

    local logsCount = #server.cacheLogs[plate]

    if (logsCount + 1) > 100 then
        table.remove(server.cacheLogs[plate], 1)
    end

    server.cacheLogs[plate][#server.cacheLogs[plate]+1] = {
        date = os.date('%Y-%m-%d %H:%M:%S'),
        message = message
    }

    MySQL.prepare(query.updateLogs, {json.encode(server.cacheLogs[plate]), plate})
end

---@param plate string
---@param state number
---@param garage string
function server.setVehicleState(plate, state, garage, props)
    local db_query = query.updateState
    local db_value = {garage, state, plate}

    if props then
        db_query = query.updateStateAndProps
        db_value = {garage, state, json.encode(props), plate}
    end

    MySQL.prepare.await(db_query, db_value)

    local message = ('Taken out of the garage (%s)'):format(garage)

    if state == 1 then
        message = ('Stored in the garage (%s)'):format(garage)
    end

    pcall(server.addVehicleLogs, message)
end

---@param plate string
---@param name string
---@param oldName string
---@return boolean Results
function server.updateVehicleName(plate, name, oldName)
    local response = MySQL.update.await(query.updateName, {name, plate})
    local success = response > 0

    if success then
        pcall(server.addVehicleLogs, plate, ('The vehicle name has been changed from %s to %s'):format(oldName, name))
    end
    return success
end

---@param plate string
---@param name string
---@param oldName string
---@return boolean Results
function server.updateGarageName(plate, name, oldName)
    local response = MySQL.update.await(query.updateGarage, {name, plate, 1})
    local success = response > 0

    if success then
        pcall(server.addVehicleLogs, plate, (
            'Vehicle successfully moved from %s garage to %s'
        ):format(oldName, name))
    end
    return success
end

return server