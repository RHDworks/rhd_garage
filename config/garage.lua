return {
    change_veh_name = true,
    change_veh_garage = true,

    blip_data = {
        boat = { sprite = 356, color = 3 },
        plane = { sprite = 359, color = 3 },
        depot = { sprite = 473, color = 60 },
        basic = { sprite = 357, color = 3 },
        helicopter = { sprite = 360, color = 3 },
    },

    blip_category = true,

    state_status = {
        [0] = 'In Depot',
        [1] = 'In Garage',
        [2] = 'Impounded By Officer'
    },

    status_color = {
        [0] = 'yellow',
        [1] = 'green',
        [2] = 'red'
    },

    insurance_price = {
        [0] = 300, -- Compacts
        [1] = 500, -- Sedans
        [2] = 500, -- SUVs
        [3] = 800, -- Coupes
        [4] = 1200, -- Muscle
        [5] = 800, -- Sports Classics
        [6] = 1500, -- Sports
        [7] = 2500, -- Super
        [8] = 300, -- Motorcycles
        [9] = 500, -- Off-road
        [10] = 1000, -- Industrial
        [11] = 500, -- Utility
        [12] = 600, -- Vans
        [13] = 100, -- Cylces
        [14] = 2800, -- Boats
        [15] = 3500, -- Helicopters
        [16] = 3800, -- Planes
        [17] = 500, -- Service
        [18] = 0, -- Emergency
        [19] = 100, -- Military
        [20] = 1500, -- Commercial
        [21] = 0 -- Trains (lol)
    },

    category_class = {
        basic = {
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 17, 18, 19, 20, 21
        },
        boat = 14,
        plane = 16,
        helicopter = 15
    }
}