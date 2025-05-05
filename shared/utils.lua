local utils = {}

---@param t table type: Hash
---@param fn fun(...):any
---@return table|boolean Results
function utils.loopHash(t, fn)
    for k, v in pairs(t) do
        local response = fn and fn()
        if response ~= nil then
            return {key = k, val = v}
        end
    end
    return false
end

---@param ... any
function utils.notify(...)
    local args = {...}

    if lib.context == 'server' then
        return lib.notify(args[1], {
            description = args[2],
            type = args[3],
            duration = args[4] or 8000
        })
    end

    return lib.notify({
        description = args[1],
        type = args[2],
        duration = args[3] or 8000
    })
end

---@param str string
function string.trim(str)
    local trimmed = str:gsub('^%s*(.-)%s*$', '%1')
    return trimmed
end

if lib.context == 'client' then

    ---@param vehicle integer
    ---@param level number
    function utils.setFuel(vehicle, level)
        Entity(vehicle).state:set('fuel', level, true)
    end

    ---@param vehicle integer
    ---@return number FuelLevel
    function utils.getFuel(vehicle)
        local fuelLevel = Entity(vehicle).state.fuel
        return fuelLevel or 100
    end

    ---@param plate string
    function utils.isOutside(plate)
        local vehicles = GetGamePool('CVehicle')

        for i=1, #vehicles do
            local vehicle = vehicles[i]
            local vehPlate = GetVehicleNumberPlateText(vehicle):trim()

            if vehPlate == plate then
                return true
            end
        end
        return false
    end

    ---@param model integer
    ---@return string
    function utils.getVehicleName(model)
        local makeName = GetLabelText(GetMakeNameFromVehicleModel(model))
        local displayName = GetLabelText(GetDisplayNameFromVehicleModel(model))
        return ('%s %s'):format(makeName, displayName)
    end

    ---@param class number
    function utils.getVehicleIcon(class)
        return (class == 8 and 'motorcycle') or
        (class == 13 and 'bicycle') or (class == 14 and 'boat') or
        (class == 15 and 'helicopter') or (class == 16 and 'plane') or 'car'
    end

    ---@param coords vector3
    ---@param blipData blipData
    ---@param category boolean
    function utils.createGarageBlip(coords, garage, blipData, category)
        local blip = AddBlipForCoord(coords.x, coords.y, coords.z)
        SetBlipSprite(blip, blipData?.sprite or 285)
        SetBlipScale(blip, 0.8)
        SetBlipColour(blip, blipData?.color or 3)
        SetBlipAsShortRange(blip, true)
        BeginTextCommandSetBlipName("STRING")
        AddTextComponentString(garage)
        EndTextCommandSetBlipName(blip)

        if category then
            SetBlipCategory(blip, 10)
        end
    end

    ---@param garage_class number|number[]
    ---@param vehicle_class number
    function utils.checkClass(garage_class, vehicle_class)
        local _gct = type(garage_class)

        if _gct == 'table' and table.type(garage_class) == 'array' then
            return lib.array.find(garage_class, function (e)
                if e == vehicle_class then
                    return true
                end
            end)
        elseif _gct == "number" then
            return vehicle_class == garage_class
        end
    end

    ---@param vehicleClass number
    ---@param allowedClass number|number[]
    ---@return boolean AllowedClass
    function utils.isVehicleClassAllowed(vehicleClass, allowedClass)
        if not vehicleClass then
            return false
        end

        local allowed = type(allowedClass) == "number" and vehicleClass == allowedClass

        return allowed or lib.array.isArray(allowedClass) and lib.array.find(allowedClass, function (class)
            if class == vehicleClass then
                return true
            end
        end)
    end
    
    ---@param vehicleModel integer | string
    ---@param coords table | vector3
    ---@param heading number
    ---@return number? vehicle
    function utils.spawnCar(vehicleModel, coords, heading, cb, networked)
        local model = type(vehicleModel) == "number" and vehicleModel or joaat(vehicleModel)
        local vector = type(coords) == "vector3" and coords or vec(coords.x, coords.y, coords.z)
        local isNetworked = networked == nil or networked

        local playerCoords = GetEntityCoords(cache.ped)
        if not vector or not playerCoords then
            return
        end

        local dist = #(playerCoords - vector)

        if dist > 424 then -- Onesync infinity Range (https://docs.fivem.net/docs/scripting-reference/onesync/)
            return
        end

        local promise = not cb and promise.new()

        local function results(res)
            if promise then
                promise:resolve(res)
            elseif cb then
                cb(res)
            end
        end

        CreateThread(function()
            if not pcall(lib.requestModel, model, 15000) then
                return results(nil)
            end
            
            local vehicle = CreateVehicle(model, vector.x, vector.y, vector.z, heading, isNetworked, true)

            if networked then
                local id = NetworkGetNetworkIdFromEntity(vehicle)
                SetNetworkIdCanMigrate(id, true)
                SetEntityAsMissionEntity(vehicle, true, true)
            end
            
            SetVehicleHasBeenOwnedByPlayer(vehicle, true)
            SetVehicleNeedsToBeHotwired(vehicle, false)
            SetModelAsNoLongerNeeded(model)
            SetVehRadioStation(vehicle, "OFF")

            RequestCollisionAtCoord(vector.x, vector.y, vector.z)
            while not HasCollisionLoadedAroundEntity(vehicle) do
                Wait(0)
            end

            results(vehicle)
        end)

        if promise then
            return Citizen.Await(promise)
        end
    end

    ---@param playerGroup PlayerGroup
    ---@return boolean HasAccess
    function utils.validateGroups(playerGroup, groupTable)
        local group = playerGroup
        local groups = groupTable ---@type groupData

        if not group or not (group.name and group.rank) then
            return false
        end

        local groupType = type(groups)
        local tableType = groupType == "table" and table.type(groups)

        if groupType == 'string' then
            return group.name == groups or group.type == groups
        elseif groupType == 'table' then
            if tableType == 'hash' then
                local grade = groups[group.name] or
                (group.type and groups[group.type])

                if not grade then return false end
                
                if type(grade) == "table" then
                    return lib.array.find(grade, function (e)
                        if group.rank == e then
                            return true
                        end
                    end)
                else
                    return group.rank >= grade
                end
            elseif tableType == 'array' then
                return lib.array.find(groups, function (e)
                    if group.name == e or group.type == e then
                        return true
                    end
                end)
            elseif tableType == 'mixed' then
                for key, value in pairs(groups) do
                    local valueType = type(value)
                    
                    if valueType == "string" and (group.name == value or group.type == value) then
                        return true
                    elseif valueType == "number" and (group.name == key or group.type == key) then
                        return group.rank >= value
                    elseif valueType == "table" and (group.name == key or group.type == key) then
                        for _, gradeLevel in ipairs(value) do
                            if group.rank == gradeLevel then
                                return true
                            end
                        end
                    end
                end
            end
        end
        return true
    end
else
    ---@param source number
    ---@param plate string
    function utils.giveKeys(source, plate)
        ---@qbx_vehiclekeys
        exports.qbx_vehiclekeys:GiveKeys(source, plate)

        ---@qb-vehiclekeys
        -- exports['qb-vehiclekeys']:GiveKeys(source, plate)
    end
end

_ENV.utils = utils