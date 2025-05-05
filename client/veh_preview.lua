local vehiclePreview = {}

local cam_asu = require 'modules.cam'
local location = require 'config.location'

function vehiclePreview:set(vehicleId)
    local vehicleData = vehicle_cache:getVehicleData(vehicleId) --[[@as VehicleData]]

    if not vehicleData then
        return
    end

    local props = vehicleData.props
    local model = props.model

    if self.vehEntity and DoesEntityExist(self.vehEntity) then
        SetEntityAsMissionEntity(self.vehEntity, true, true)
        pcall(DeleteEntity, self.vehEntity)
    end

    local garage = vehicleData.currentGarage
    local garageData = location[garage]

    if not garageData then
        return
    end

    local spawn_points = garageData.spawn_points
    local coords = spawn_points and spawn_points[1] or garageData.coords

    local vehicle = utils.spawnCar(model, coords, coords.w --[[@as number]] or 0.0)

    if not vehicle then
        return
    end

    lib.setVehicleProperties(vehicle, props)

    self.vehEntity = vehicle

    cam_asu.create(vehicle, {
        radius = 6.0,        -- Default distance zoom
        minRadius = 3.0,     -- Minimum zoom
        maxRadius = 12.0     -- Maximum zoom
    })

    SetNuiFocusKeepInput(true)

    return true
end

function vehiclePreview:exit()

    cam_asu.destroy()

    if self.vehEntity and DoesEntityExist(self.vehEntity) then
        SetEntityAsMissionEntity(self.vehEntity, true, true)
        pcall(DeleteEntity, self.vehEntity)
    end
    
    self.vehEntity = nil
    SetNuiFocusKeepInput(false)
end

function vehiclePreview:getStats()
    if not self.vehEntity then
        return
    end

    local stats = {
        speed = 0,
        acceleration = 0,
        braking = 0,
        handling = 0,
        traction = 0
    }

    Wait(500)

    if not self.vehEntity or not DoesEntityExist(self.vehEntity) then
        return
    end

    local fInitialDriveMaxFlatVel = GetVehicleHandlingFloat(self.vehEntity, "CHandlingData", "fInitialDriveMaxFlatVel")
    local fInitialDriveForce = GetVehicleHandlingFloat(self.vehEntity, "CHandlingData", "fInitialDriveForce")
    local fBrakeForce = GetVehicleHandlingFloat(self.vehEntity, "CHandlingData", "fBrakeForce")
    local fTractionCurveMax = GetVehicleHandlingFloat(self.vehEntity, "CHandlingData", "fTractionCurveMax")
    local fTractionCurveMin = GetVehicleHandlingFloat(self.vehEntity, "CHandlingData", "fTractionCurveMin")
    local fSteeringLock = GetVehicleHandlingFloat(self.vehEntity, "CHandlingData", "fSteeringLock")

    local maxSpeedKMH = (fInitialDriveMaxFlatVel * 0.75) * 3.6

    stats.speed = math.floor((maxSpeedKMH / 530.0) * 100)
    stats.acceleration = math.floor((fInitialDriveForce / 1.3) * 100)
    stats.braking = math.floor((fBrakeForce / 2.0) * 100)
    stats.handling = math.floor(((fSteeringLock / 42.0) * 0.7 + ((fTractionCurveMax + fTractionCurveMin) / 5.5) * 0.3) * 100)
    stats.traction = math.floor((fTractionCurveMax / 3.0) * 100)

    for k, v in pairs(stats) do
        stats[k] = math.min(100, math.max(0, v))
    end

    return stats
end

_ENV.vehPreview = vehiclePreview