fx_version 'cerulean'
game 'gta5'

name "garage"
description "Garage system for QBCore, QBox, ESX"
author "RHD TEAM"
version "1.0.0"

lua54 'yes'
ox_lib 'locale'

use_experimental_fxv2_oal 'yes'

ui_page 'web/build/index.html'

shared_scripts {
    '@ox_lib/init.lua',
	'shared/*.lua'
}

client_scripts {
	'client/*.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
	'server/main.lua',
    'server/sql.lua'
}

files {
    'web/build/index.html',
    'web/build/assets/*.js',
    'web/build/assets/*.css',

    'bridge/**/*.lua',
    'bridge/init.lua',

    'config/*.lua',
    'modules/*.lua'
}