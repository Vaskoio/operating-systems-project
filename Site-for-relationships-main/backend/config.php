<?php
return [
    'db' => [
        'host'    => '127.0.0.1',
        'port'    => 3306,
        'name'    => 'crush_db',
        'user'    => 'root',
        'pass'    => '',    
        'charset' => 'utf8mb4',
    ],
    'jwt_secret'  => 'change-this-super-long-school-project-secret-min-32-chars-please',
    'jwt_hours'   => 168, 
    'cors_origin' => '*',
];
