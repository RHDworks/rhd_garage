---@alias garageCategory
---| 'basic' [car, bicycle, motorcycle]
---| 'boat'
---| 'plane'
---| 'helicopter'

---@alias garageType
---| 'default'
---| 'depot'
---| 'shared'

---@alias groupData string | string[] | table<string, number | number[]>

---@class GarageData
---@field coords vector3
---@field distance number
---@field blip? boolean
---@field type? garageType
---@field category? garageCategory
---@field spawn_points? vector4[]
---@field groups? groupData

---@class VehicleData
---@field id number|string
---@field owner string
---@field plate string
---@field state number
---@field citizenid string
---@field custom_name string
---@field props table
---@field class? number
---@field currentGarage? string

---@class blipData
---@field sprite number
---@field color number
---@field label string

---@class PlayerGroup
---@field name string
---@field rank number
---@field duty? boolean
---@field type? string

---@class CategoryClass
---@field basic number[]
---@field boat number
---@field plane number
---@field helicopter number


















