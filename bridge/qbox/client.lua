local client = {
    playerJob = {},
    playerGang = {}
}

local qbox = exports.qbx_core
local playerData = QBX.PlayerData

local vehicleHashes = qbox:GetVehicleHash()

---@param modelHash number
---@return string? VehicleName
function client.getVehicleName(modelHash)
    local vehicleData = vehicleHashes[modelHash]

    if not vehicleData then
        return
    end

    return ('%s %s'):format(vehicleData.brand, vehicleData.name)
end

RegisterNetEvent('QBCore:Client:OnJobUpdate', function(job)
    client.playerJob = {
        name = job.name,
        rank = job.grade.level,
        duty = job.onduty
    }
end)

RegisterNetEvent('QBCore:Client:OnGangUpdate', function(gang)
    client.playerGang = {
        name = gang.name,
        rank = gang.grade.level,
    }
end)

CreateThread(function()
    if LocalPlayer.state.isLoggedIn then
        client.playerJob = {
            name = playerData.job.name,
            rank = playerData.job.grade.level,
            duty = playerData.job.onduty
        }

        client.playerGang = {
            name = playerData.gang.name,
            rank = playerData.gang.grade.level
        }
    end
end)

return client