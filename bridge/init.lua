local function isStarted(resource, alias)
    return GetResourceState(resource) == 'started' and (alias or resource)
end

local qb = isStarted('qb-core', 'qb')
local esx = isStarted('es_extended', 'esx')
local qbox = isStarted('qbx_core', 'qbox')

framework = qbox or qb or esx

local path = ('bridge.%s.%s'):format(framework, lib.context)

return require(path)