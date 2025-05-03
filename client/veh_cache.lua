---@class VehData: OxClass
local VehCache = lib.class('VehData')

function VehCache:constructor()
    self.private = {}
end

---@param vehicleId number|string
---@param data VehicleData
function VehCache:storeVehicleData(vehicleId, data)
    if not vehicleId or not data then return end

    if not self.private then
        self.private = {}
    end
    
    self.private[vehicleId] = data
    lib.print.info('Vehicle data cached: '..vehicleId)

    return true
end

---@param vehicleId number|string
---@return VehicleData?
function VehCache:getVehicleData(vehicleId)
    if not vehicleId then return nil end
    return self.private[vehicleId]
end

---@param vehicleId number|string
function VehCache:removeVehicleData(vehicleId)
    if not vehicleId then return end

    if self.private[vehicleId] then

        self.private[vehicleId] = nil
        
        if lib.logger then
            lib.logger.debug('Vehicle data removed from cache: '..vehicleId)
        end
        
        return true
    end
    
    return false
end

function VehCache:clear()
    self.private = {}
end

_ENV.vehicle_cache = VehCache:new()