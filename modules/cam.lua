local cam_asu = {}

cam_asu.CONFIG = {
    DEFAULT_RADIUS = 5.0,
    MIN_RADIUS = 2.5,
    MAX_RADIUS = 10.0,
    SCROLL_INCREMENT = 0.5,
    MOUSE_SENSITIVITY = 8.0,
    ENTITY_HEIGHT_OFFSET = 0.5,
    MAX_ANGLE_Y = 89.0
}

local state = {
    cam = nil,
    entity = nil,
    running = false,
    radius = cam_asu.CONFIG.DEFAULT_RADIUS,
    angleY = 0.0,
    angleZ = 0.0
}

local function cos(degrees)
    return math.cos(math.rad(degrees))
end

local function sin(degrees)
    return math.sin(math.rad(degrees))
end

local function calculateCameraPosition()
    local entityCoords = GetEntityCoords(state.entity)

    local cosAngleZ = cos(state.angleZ)
    local cosAngleY = cos(state.angleY)
    local sinAngleZ = sin(state.angleZ)
    local sinAngleY = sin(state.angleY)

    local offset = vec3(
        ((cosAngleZ * cosAngleY) + (cosAngleY * cosAngleZ)) / 2 * state.radius,
        ((sinAngleZ * cosAngleY) + (cosAngleY * sinAngleZ)) / 2 * state.radius,
        (sinAngleY) * state.radius
    )

    return vec3(
        entityCoords.x + offset.x,
        entityCoords.y + offset.y,
        entityCoords.z + offset.z
    ), entityCoords
end

local function updateCameraView()
    local camPos, entityCoords = calculateCameraPosition()
    
    SetCamCoord(state.cam, camPos.x, camPos.y, camPos.z)
    PointCamAtCoord(
        state.cam, 
        entityCoords.x, 
        entityCoords.y, 
        entityCoords.z + cam_asu.CONFIG.ENTITY_HEIGHT_OFFSET
    )
end

local function handleMouseMovement()
    local mouseX = GetDisabledControlNormal(0, 1) * cam_asu.CONFIG.MOUSE_SENSITIVITY
    local mouseY = GetDisabledControlNormal(0, 2) * cam_asu.CONFIG.MOUSE_SENSITIVITY

    state.angleZ = state.angleZ - mouseX
    state.angleY = state.angleY + mouseY
    
    state.angleY = math.clamp(state.angleY, 0.0, cam_asu.CONFIG.MAX_ANGLE_Y)

    updateCameraView()
end

local function handleMouseDrag()
    CreateThread(function()
        while state.running do
            handleMouseMovement()

            if IsDisabledControlJustReleased(0, 25) or IsControlJustReleased(0, 25) then
                SetMouseCursorSprite(3) -- Reset cursor
                return
            end

            Wait(0)
        end
    end)
end

local function startInputListener()

    updateCameraView()

    CreateThread(function()
        while state.running do
            DisableAllControlActions(0)

            if IsDisabledControlJustPressed(0, 25) or IsControlJustPressed(0, 25) then
                SetMouseCursorSprite(4)
                handleMouseDrag()
            end

            if IsDisabledControlJustReleased(0, 14) or IsControlJustReleased(0, 14) then
                if state.radius + cam_asu.CONFIG.SCROLL_INCREMENT <= cam_asu.CONFIG.MAX_RADIUS then
                    state.radius = state.radius + cam_asu.CONFIG.SCROLL_INCREMENT
                    updateCameraView()
                end
            elseif IsDisabledControlJustReleased(0, 15) or IsControlJustReleased(0, 15) then
                if state.radius - cam_asu.CONFIG.SCROLL_INCREMENT >= cam_asu.CONFIG.MIN_RADIUS then
                    state.radius = state.radius - cam_asu.CONFIG.SCROLL_INCREMENT
                    updateCameraView()
                end
            end

            Wait(0)
        end
    end)
end

function cam_asu.create(entity, config)

    cam_asu.destroy()

    if config then
        if config.radius then state.radius = config.radius end
        if config.minRadius then cam_asu.CONFIG.MIN_RADIUS = config.minRadius end
        if config.maxRadius then cam_asu.CONFIG.MAX_RADIUS = config.maxRadius end
        if config.scrollIncrement then cam_asu.CONFIG.SCROLL_INCREMENT = config.scrollIncrement end
    end

    state.entity = entity
    state.running = true
    state.cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)

    state.angleY = 0.0
    state.angleZ = 0.0

    RenderScriptCams(true, true, 0, true, false)

    startInputListener()

    return state.cam
end

function cam_asu.destroy()
    if state.cam and DoesCamExist(state.cam) then
        state.running = false
        RenderScriptCams(false, true, 500, true, false)
        DestroyCam(state.cam, false)
        state.cam = nil
        state.entity = nil
    end
end

function cam_asu.getCamera()
    return state.cam
end

function cam_asu.isActive()
    return state.running
end

return cam_asu