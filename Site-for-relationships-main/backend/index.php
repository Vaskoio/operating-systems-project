<?php
// Run with:  xampp\php\php.exe -S localhost:8000 -t backend

require_once __DIR__ . '/auth.php';

$cfg = require __DIR__ . '/config.php';
$origin = ($cfg['cors_origin'] === '*') ? '*' : $cfg['cors_origin'];

header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With'); 
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit; 
}

$method = $_SERVER['REQUEST_METHOD'];
$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';

$path = urldecode($path);

$script_dir = dirname($_SERVER['SCRIPT_NAME']);

if ($script_dir !== '/' && $script_dir !== '\\' && strpos($path, $script_dir) === 0) {
    $path = substr($path, strlen($script_dir));
}

$match = fn(string $m, string $re) => $method === $m && preg_match("#^$re$#", $path, $M) ? $M : null;

try {
    if ($method === 'GET' && $path === '/') json_out(['app' => 'crush', 'status' => 'ok']);

    if ($method === 'POST' && $path === '/api/auth/register') register();
    if ($method === 'POST' && $path === '/api/auth/login')    login();

    if ($method === 'GET'    && $path === '/api/profile/me')     me();
    if ($method === 'PUT'    && $path === '/api/profile/me')     update_me();
    if ($method === 'DELETE' && $path === '/api/profile')       profile_delete();
    if ($method === 'GET'    && $path === '/api/profile/photos') list_photos();
    if ($method === 'POST'   && $path === '/api/profile/photos') add_photo();
    if ($m = $match('DELETE', '/api/profile/photos/([^/]+)'))    delete_photo($m[1]);

    if ($method === 'GET'  && $path === '/api/feed')   feed();
    if ($method === 'POST' && $path === '/api/swipes') swipe();

    if ($method === 'GET' && $path === '/api/matches') list_matches();
    if ($m = $match('GET',  '/api/matches/([^/]+)/messages')) get_messages($m[1]);
    if ($m = $match('POST', '/api/matches/([^/]+)/messages')) send_message($m[1]);

    if ($method === 'GET'    && $path === '/api/admin/stats')    admin_stats();
    if ($method === 'GET'    && $path === '/api/admin/users')    admin_users();
    if ($m = $match('DELETE', '/api/admin/users/([^/]+)'))       admin_delete_user($m[1]);
    if ($method === 'GET'    && $path === '/api/admin/matches')  admin_matches();
    if ($method === 'GET'    && $path === '/api/admin/messages') admin_messages();

    json_err(404, 'Not found');
} catch (Throwable $e) {
    error_log($e);
    json_err(500, 'Server error: ' . $e->getMessage());
}

function register(): void {
    $b = body();
    foreach (['email','password','name','birthdate','gender','interestedIn'] as $k)
        if (empty($b[$k])) json_err(400, "Field '$k' is required");
    if (strlen($b['password']) < 6)        json_err(400, 'Password must be at least 6 characters');
    if (!filter_var($b['email'], FILTER_VALIDATE_EMAIL)) json_err(400, 'Invalid email');

    $email = strtolower(trim($b['email']));
    if (one('SELECT Id FROM Users WHERE Email = ?', [$email])) json_err(400, 'Email already registered');

    $id = uuid4();
    q('INSERT INTO Users (Id, Email, PasswordHash, Name, Birthdate, Gender, InterestedIn, Bio, City, MinAge, MaxAge, MaxDistanceKm, InterestsCsv, IsAdmin, CreatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, "", "", 18, 60, 100, "", 0, ?)',
       [$id, $email, password_hash($b['password'], PASSWORD_BCRYPT), $b['name'], $b['birthdate'], $b['gender'], $b['interestedIn'], now_utc()]);
    $user = one('SELECT * FROM Users WHERE Id = ?', [$id]);
    json_out(['token' => jwt_encode(['sub' => $id]), 'user' => user_to_profile($user)]);
}

function login(): void {
    $b = body();
    if (empty($b['email']) || empty($b['password'])) json_err(400, 'Email and password required');
    $user = one('SELECT * FROM Users WHERE Email = ?', [strtolower(trim($b['email']))]);
    if (!$user || !password_verify($b['password'], $user['PasswordHash'])) json_err(401, 'Invalid email or password');
    json_out(['token' => jwt_encode(['sub' => $user['Id']]), 'user' => user_to_profile($user)]);
}

function me(): void { json_out(user_to_profile(current_user())); }

function update_me(): void {
    $u = current_user(); $b = body();
    $map = ['bio' => 'Bio', 'city' => 'City', 'gender' => 'Gender', 'interestedIn' => 'InterestedIn',
            'minAge' => 'MinAge', 'maxAge' => 'MaxAge', 'maxDistanceKm' => 'MaxDistanceKm'];
    $sets = []; $params = [];
    foreach ($map as $k => $col) if (array_key_exists($k, $b)) { $sets[] = "$col = ?"; $params[] = $b[$k]; }
    if (array_key_exists('interests', $b) && is_array($b['interests'])) {
        $sets[] = 'InterestsCsv = ?'; $params[] = implode(',', array_map('trim', $b['interests']));
    }
    if ($sets) {
        $params[] = $u['Id'];
        q('UPDATE Users SET ' . implode(', ', $sets) . ' WHERE Id = ?', $params);
    }
    json_out(user_to_profile(one('SELECT * FROM Users WHERE Id = ?', [$u['Id']])));
}

function list_photos(): void {
    $u = current_user();
    json_out(all('SELECT Id AS id, Url AS url, Position AS position FROM Photos WHERE UserId = ? ORDER BY Position ASC', [$u['Id']]));
}

function add_photo(): void {
    $u = current_user(); 
    
    $count = (int) one('SELECT COUNT(*) AS c FROM Photos WHERE UserId = ?', [$u['Id']])['c'];
    if ($count >= 6) json_err(400, 'Maximum 6 photos allowed');

    if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
        json_err(400, 'Please select a valid image file');
    }

    $file = $_FILES['photo'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    $allowed = ['jpg', 'jpeg', 'png', 'webp'];
    if (!in_array($ext, $allowed)) json_err(400, 'Only JPG, PNG and WEBP files are allowed');

    $uploadDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = uuid4() . '.' . $ext;
    $targetPath = $uploadDir . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        json_err(500, 'Failed to save the uploaded file');
    }

    $url = 'http://localhost:8000/uploads/' . $fileName;

    $id = uuid4();
    q('INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) VALUES (?, ?, ?, ?, ?)', 
      [$id, $u['Id'], $url, $count, now_utc()]);
      
    json_out(['id' => $id, 'url' => $url, 'position' => $count]);
}

function delete_photo(string $photoId): void {
    $u = current_user();
    $res = q('DELETE FROM Photos WHERE Id = ? AND UserId = ?', [$photoId, $u['Id']]);
    if ($res->rowCount() === 0) json_err(404, 'Photo not found');
    json_out(['ok' => true]);
}

function feed(): void {
    $me = current_user();
    $excluded = array_map(fn($r) => $r['TargetId'], all('SELECT TargetId FROM Swipes WHERE SwiperId = ?', [$me['Id']]));
    $excluded[] = $me['Id'];
    $ph = implode(',', array_fill(0, count($excluded), '?'));
    $sql = "SELECT * FROM Users WHERE Id NOT IN ($ph) AND IsAdmin = 0";
    $params = $excluded;
    
    if ($me['InterestedIn'] !== 'everyone') { 
        $sql .= ' AND Gender = ?'; 
        $params[] = $me['InterestedIn']; 
    }
    
    $candidates = all($sql, $params);
    
    $myAge = calc_age($me['BirthDate'] ?? $me['Birthdate']); 
    
    $myMinAge = $me['MinAge'] ?? 18;
    $myMaxAge = $me['MaxAge'] ?? 100;

    $out = [];
    foreach ($candidates as $c) {
        $age = calc_age($c['BirthDate'] ?? $c['Birthdate']);
        
        if ($age < $myMinAge || $age > $myMaxAge) continue;
        
        if ($c['InterestedIn'] !== 'everyone' && $c['InterestedIn'] !== $me['Gender']) continue;
        
        $theirMinAge = $c['MinAge'] ?? 18;
        $theirMaxAge = $c['MaxAge'] ?? 100;
        if ($myAge < $theirMinAge || $myAge > $theirMaxAge) continue;
        
        $out[] = user_to_feed($c);
    }
    
    json_out($out);
}

function swipe(): void {
    $me = current_user(); $b = body();
    if (empty($b['targetId'])) json_err(400, 'targetId required');
    if ($b['targetId'] === $me['Id']) json_err(400, 'Cannot swipe yourself');
    $target = one('SELECT * FROM Users WHERE Id = ?', [$b['targetId']]);
    if (!$target) json_err(404, 'Target not found');
    $liked = !empty($b['liked']) ? 1 : 0;

    $existing = one('SELECT Id FROM Swipes WHERE SwiperId = ? AND TargetId = ?', [$me['Id'], $b['targetId']]);
    if ($existing) {
        q('UPDATE Swipes SET Liked = ?, CreatedAt = ? WHERE Id = ?', [$liked, now_utc(), $existing['Id']]);
    } else {
        q('INSERT INTO Swipes (Id, SwiperId, TargetId, Liked, CreatedAt) VALUES (?, ?, ?, ?, ?)',
          [uuid4(), $me['Id'], $b['targetId'], $liked, now_utc()]);
    }

    $result = ['match' => false, 'matchInfo' => null];
    if ($liked) {
        $reciprocal = one('SELECT Id FROM Swipes WHERE SwiperId = ? AND TargetId = ? AND Liked = 1', [$b['targetId'], $me['Id']]);
        if ($reciprocal) {
            $a = $me['Id']; $c = $b['targetId'];
            if (strcmp($a, $c) > 0) [$a, $c] = [$c, $a];
            $m = one('SELECT Id FROM Matches WHERE User1Id = ? AND User2Id = ?', [$a, $c]);
            if (!$m) {
                $mid = uuid4();
                q('INSERT INTO Matches (Id, User1Id, User2Id, CreatedAt) VALUES (?, ?, ?, ?)', [$mid, $a, $c, now_utc()]);
            } else { $mid = $m['Id']; }
            $result = ['match' => true, 'matchInfo' => ['matchId' => $mid, 'user' => user_to_feed($target)]];
        }
    }
    json_out($result);
}

function list_matches(): void {
    $me = current_user();
    $rows = all('SELECT * FROM Matches WHERE User1Id = ? OR User2Id = ? ORDER BY CreatedAt DESC', [$me['Id'], $me['Id']]);
    $out = [];
    foreach ($rows as $m) {
        $otherId = $m['User1Id'] === $me['Id'] ? $m['User2Id'] : $m['User1Id'];
        $other = one('SELECT * FROM Users WHERE Id = ?', [$otherId]);
        if (!$other) continue;
        $last = one('SELECT Id AS id, MatchId AS matchId, SenderId AS sender_id, Body AS body, CreatedAt AS created_at FROM Messages WHERE MatchId = ? ORDER BY CreatedAt DESC LIMIT 1', [$m['Id']]);
        $out[] = [
            'matchId'     => $m['Id'],
            'createdAt'   => $m['CreatedAt'],
            'user'        => user_to_feed($other),
            'lastMessage' => $last ?: null,
        ];
    }
    json_out($out);
}

function get_messages(string $matchId): void {
    $me = current_user();
    $m = one('SELECT * FROM Matches WHERE Id = ?', [$matchId]);
    if (!$m || ($m['User1Id'] !== $me['Id'] && $m['User2Id'] !== $me['Id'])) json_err(404, 'Match not found');
    $otherId = $m['User1Id'] === $me['Id'] ? $m['User2Id'] : $m['User1Id'];
    $other = one('SELECT * FROM Users WHERE Id = ?', [$otherId]);
    $msgs = all('SELECT Id AS id, MatchId AS matchId, SenderId AS sender_id, Body AS body, CreatedAt AS created_at FROM Messages WHERE MatchId = ? ORDER BY CreatedAt ASC', [$matchId]);
    json_out(['matchId' => $matchId, 'user' => user_to_feed($other), 'messages' => $msgs]);
}

function send_message(string $matchId): void {
    $me = current_user(); $b = body();
    if (empty($b['body'])) json_err(400, 'Empty message');
    if (strlen($b['body']) > 1000) json_err(400, 'Message too long');
    $m = one('SELECT * FROM Matches WHERE Id = ?', [$matchId]);
    if (!$m || ($m['User1Id'] !== $me['Id'] && $m['User2Id'] !== $me['Id'])) json_err(404, 'Match not found');
    $id = uuid4(); $now = now_utc();
    q('INSERT INTO Messages (Id, MatchId, SenderId, Body, CreatedAt) VALUES (?, ?, ?, ?, ?)', [$id, $matchId, $me['Id'], $b['body'], $now]);
    json_out(['id' => $id, 'matchId' => $matchId, 'sender_id' => $me['Id'], 'body' => $b['body'], 'created_at' => $now]);
}

function admin_stats(): void {
    require_admin();
    json_out([
        'users'    => (int) one('SELECT COUNT(*) AS c FROM Users')['c'],
        'matches'  => (int) one('SELECT COUNT(*) AS c FROM Matches')['c'],
        'messages' => (int) one('SELECT COUNT(*) AS c FROM Messages')['c'],
        'swipes'   => (int) one('SELECT COUNT(*) AS c FROM Swipes')['c'],
    ]);
}

function admin_users(): void {
    require_admin();
    $rows = all('SELECT * FROM Users ORDER BY CreatedAt DESC');
    $out = [];
    foreach ($rows as $u) {
        $photos = photo_urls($u['Id']);
        $out[] = [
            'id'           => $u['Id'],
            'email'        => $u['Email'],
            'name'         => $u['Name'],
            'age'          => calc_age($u['Birthdate']),
            'gender'       => $u['Gender'],
            'interestedIn' => $u['InterestedIn'],
            'city'         => $u['City'],
            'isAdmin'      => (bool) $u['IsAdmin'],
            'createdAt'    => $u['CreatedAt'],
            'photo'        => $photos[0] ?? null,
        ];
    }
    json_out($out);
}

function admin_delete_user(string $id): void {
    $admin = require_admin();
    if ($id === $admin['Id']) json_err(400, 'Admins cannot delete themselves');
    if (!one('SELECT Id FROM Users WHERE Id = ?', [$id])) json_err(404, 'User not found');
    q('DELETE FROM Users WHERE Id = ?', [$id]);
    json_out(['ok' => true]);
}

function admin_matches(): void {
    require_admin();
    $rows = all('SELECT * FROM Matches ORDER BY CreatedAt DESC');
    $out = [];
    foreach ($rows as $m) {
        $u1 = one('SELECT Name, Email FROM Users WHERE Id = ?', [$m['User1Id']]) ?: ['Name' => '(deleted)', 'Email' => ''];
        $u2 = one('SELECT Name, Email FROM Users WHERE Id = ?', [$m['User2Id']]) ?: ['Name' => '(deleted)', 'Email' => ''];
        $count = (int) one('SELECT COUNT(*) AS c FROM Messages WHERE MatchId = ?', [$m['Id']])['c'];
        $out[] = [
            'matchId'      => $m['Id'],
            'createdAt'    => $m['CreatedAt'],
            'user1'        => ['name' => $u1['Name'], 'email' => $u1['Email']],
            'user2'        => ['name' => $u2['Name'], 'email' => $u2['Email']],
            'messageCount' => $count,
        ];
    }
    json_out($out);
}

function admin_messages(): void {
    require_admin();
    $rows = all('SELECT * FROM Messages ORDER BY CreatedAt DESC LIMIT 500');
    $out = [];
    foreach ($rows as $m) {
        $s = one('SELECT Name, Email FROM Users WHERE Id = ?', [$m['SenderId']]) ?: ['Name' => '(deleted)', 'Email' => ''];
        $out[] = [
            'id'        => $m['Id'],
            'matchId'   => $m['MatchId'],
            'sender'    => ['name' => $s['Name'], 'email' => $s['Email']],
            'body'      => $m['Body'],
            'createdAt' => $m['CreatedAt'],
        ];
    }
    json_out($out);
}

function profile_delete(): void {
    $u = current_user(); 
    $userId = $u['Id'];

    q('DELETE FROM Messages WHERE SenderId = ?', [$userId]);

    $matches = all('SELECT Id FROM Matches WHERE User1Id = ? OR User2Id = ?', [$userId, $userId]);
    foreach ($matches as $m) {
        q('DELETE FROM Messages WHERE MatchId = ?', [$m['Id']]);
    }

    q('DELETE FROM Matches WHERE User1Id = ? OR User2Id = ?', [$userId, $userId]);

    q('DELETE FROM Swipes WHERE SwiperId = ? OR TargetId = ?', [$userId, $userId]);
    
    q('DELETE FROM Photos WHERE UserId = ?', [$userId]);

    q('DELETE FROM Users WHERE Id = ?', [$userId]);

    json_out(['ok' => true, 'message' => 'Account deleted perfectly']);
}