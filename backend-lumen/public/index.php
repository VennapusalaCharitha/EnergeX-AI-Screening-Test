<?php

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Simple routing
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Database connection
$pdo = new PDO('mysql:host=mysql;dbname=energex_db', 'root', 'password');

if ($uri === '/api/register' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $role = isset($input['role']) ? $input['role'] : 'user';
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())");
    $result = $stmt->execute([
        $input['name'],
        $input['email'],
        password_hash($input['password'], PASSWORD_DEFAULT),
        $role
    ]);
    
    if ($result) {
        echo json_encode([
            'user' => ['id' => $pdo->lastInsertId(), 'name' => $input['name'], 'email' => $input['email']],
            'token' => 'token-' . $pdo->lastInsertId()
        ]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Registration failed']);
    }
    exit;
}

if ($uri === '/api/login' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$input['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($input['password'], $user['password'])) {
        echo json_encode([
            'user' => ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email']],
            'token' => 'token-' . $user['id']
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
    exit;
}

if ($uri === '/api/posts' && $method === 'GET') {
    $stmt = $pdo->query("SELECT p.id, p.title, p.content, p.user_id, p.created_at, u.name as user_name FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC");
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format posts properly
    $formattedPosts = [];
    foreach ($posts as $post) {
        $formattedPosts[] = [
            'id' => (int)$post['id'],
            'title' => $post['title'],
            'content' => $post['content'],
            'user_id' => (int)$post['user_id'],
            'user_name' => $post['user_name'],
            'created_at' => $post['created_at']
        ];
    }
    
    echo json_encode(['posts' => $formattedPosts, 'cached' => false]);
    exit;
}

if ($uri === '/api/posts' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Get user ID from token (simplified)
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';
    $userId = $token ? (int)str_replace('token-', '', $token) : 1;
    
    $stmt = $pdo->prepare("INSERT INTO posts (title, content, user_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
    $result = $stmt->execute([$input['title'], $input['content'], $userId]);
    
    if ($result) {
        // Get user name for response
        $stmt = $pdo->prepare("SELECT name FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'id' => $pdo->lastInsertId(), 
            'title' => $input['title'], 
            'content' => $input['content'], 
            'user_id' => $userId,
            'user_name' => $user['name'],
            'created_at' => date('Y-m-d H:i:s')
        ]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Post creation failed']);
    }
    exit;
}

if (preg_match('/\/api\/posts\/(\d+)/', $uri, $matches) && $method === 'DELETE') {
    $postId = $matches[1];
    
    // Get user ID from token
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';
    $userId = $token ? (int)str_replace('token-', '', $token) : 0;
    
    // Check if post belongs to user
    $stmt = $pdo->prepare("SELECT user_id FROM posts WHERE id = ?");
    $stmt->execute([$postId]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$post) {
        http_response_code(404);
        echo json_encode(['error' => 'Post not found']);
        exit;
    }
    
    // Get user role
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $userRole = $stmt->fetchColumn();
    
    // Allow deletion if user owns post OR user is admin/moderator
    if ($post['user_id'] != $userId && !in_array($userRole, ['admin', 'moderator'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $stmt = $pdo->prepare("DELETE FROM posts WHERE id = ?");
    $result = $stmt->execute([$postId]);
    
    if ($result) {
        echo json_encode(['message' => 'Post deleted successfully']);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Delete failed']);
    }
    exit;
}

// Default response
echo json_encode(['message' => 'EnergeX API Working']);
?>