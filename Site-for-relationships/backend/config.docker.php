<?php
// config.php – reads from environment variables (Docker) with localhost fallback
return [
    'db' => [
        'host'    => getenv('DB_HOST')    ?: '127.0.0.1',
        'port'    => (int)(getenv('DB_PORT') ?: 3306),
        'name'    => getenv('DB_NAME')    ?: 'crush_db',
        'user'    => getenv('DB_USER')    ?: 'root',
        'pass'    => getenv('DB_PASS')    ?: '',
        'charset' => 'utf8mb4',
    ],
    'jwt_secret' => getenv('JWT_SECRET') ?: 'change-me-in-production',
    'jwt_hours'  => (int)(getenv('JWT_HOURS') ?: 24),
    'cors_origin'=> getenv('CORS_ORIGIN') ?: '*',
];
