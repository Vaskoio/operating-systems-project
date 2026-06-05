<?php

require_once __DIR__ . '/db.php';

function b64url_enc(string $data): string { return rtrim(strtr(base64_encode($data), '+/', '-_'), '='); }
function b64url_dec(string $data): string { return base64_decode(strtr($data, '-_', '+/')); }

function jwt_encode(array $claims): string {
    $cfg = require __DIR__ . '/config.php';
    $claims['iat'] = time();
    $claims['exp'] = time() + ($cfg['jwt_hours'] * 3600);
    $h = b64url_enc(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $p = b64url_enc(json_encode($claims));
    $sig = b64url_enc(hash_hmac('sha256', "$h.$p", $cfg['jwt_secret'], true));
    return "$h.$p.$sig";
}

function jwt_decode(string $token): ?array {
    $cfg = require __DIR__ . '/config.php';
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$h, $p, $sig] = $parts;
    $expected = b64url_enc(hash_hmac('sha256', "$h.$p", $cfg['jwt_secret'], true));
    if (!hash_equals($expected, $sig)) return null;
    $claims = json_decode(b64url_dec($p), true);
    if (!$claims || ($claims['exp'] ?? 0) < time()) return null;
    return $claims;
}

function json_out($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
function json_err(int $code, string $msg): void { json_out(['detail' => $msg], $code); }

function body(): array {
    $raw = file_get_contents('php://input');
    return $raw ? (json_decode($raw, true) ?? []) : [];
}

function current_user(): array {
    $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(.+)/i', $hdr, $m)) json_err(401, 'Missing token');
    $claims = jwt_decode(trim($m[1]));
    if (!$claims) json_err(401, 'Invalid or expired token');
    $user = one('SELECT * FROM Users WHERE Id = ?', [$claims['sub']]);
    if (!$user) json_err(401, 'User not found');
    return $user;
}

function require_admin(): array {
    $u = current_user();
    if (!$u['IsAdmin']) json_err(403, 'Admin only');
    return $u;
}

function calc_age(string $birthdate): int {
    $b = new DateTime($birthdate);
    $today = new DateTime('today');
    return $today->diff($b)->y;
}

function photo_urls(string $userId): array {
    return array_map(fn($r) => $r['Url'],
        all('SELECT Url FROM Photos WHERE UserId = ? ORDER BY Position ASC', [$userId]));
}

function user_to_profile(array $u): array {
    return [
        'id'            => $u['Id'],
        'email'         => $u['Email'],
        'name'          => $u['Name'],
        'age'           => calc_age($u['Birthdate']),
        'gender'        => $u['Gender'],
        'interestedIn'  => $u['InterestedIn'],
        'bio'           => $u['Bio'],
        'city'          => $u['City'],
        'minAge'        => (int) $u['MinAge'],
        'maxAge'        => (int) $u['MaxAge'],
        'maxDistanceKm' => (int) $u['MaxDistanceKm'],
        'interests'     => $u['InterestsCsv'] === '' ? [] : array_map('trim', explode(',', $u['InterestsCsv'])),
        'photos'        => photo_urls($u['Id']),
        'isAdmin'       => (bool) $u['IsAdmin'],
    ];
}

function user_to_feed(array $u): array {
    return [
        'id'        => $u['Id'],
        'name'      => $u['Name'],
        'age'       => calc_age($u['Birthdate']),
        'gender'    => $u['Gender'],
        'bio'       => $u['Bio'],
        'city'      => $u['City'],
        'interests' => $u['InterestsCsv'] === '' ? [] : array_map('trim', explode(',', $u['InterestsCsv'])),
        'photos'    => photo_urls($u['Id']),
    ];
}

function uuid4(): string {
    $d = random_bytes(16);
    $d[6] = chr((ord($d[6]) & 0x0f) | 0x40);
    $d[8] = chr((ord($d[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($d), 4));
}

function now_utc(): string { return gmdate('Y-m-d H:i:s'); }
