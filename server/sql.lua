
Citizen.CreateThreadNow(function()
    local vehicleTable

    if framework == 'esx' then
        vehicleTable = 'owned_vehicles'
    elseif framework == 'qbox' or framework == 'qb' then
        vehicleTable = 'player_vehicles'
    else
        return
    end

    local result = MySQL.query.await(('SHOW COLUMNS FROM `%s`'):format(vehicleTable))

    if result then
        local custom_veh_name, veh_logs

        for i = 1, #result do
            local column = result[i]
            if column.Field == 'custom_veh_name' then
                custom_veh_name = true
            end

            if column.Field == 'veh_logs' then
                veh_logs = true
            end
        end

        if not custom_veh_name then
            MySQL.query(('ALTER TABLE `%s` ADD COLUMN `custom_veh_name` LONGTEXT NULL'):format(vehicleTable))
        end

        if not veh_logs then
            MySQL.query(('ALTER TABLE `%s` ADD COLUMN `veh_logs` JSON'):format(vehicleTable))
        end
    end
end)