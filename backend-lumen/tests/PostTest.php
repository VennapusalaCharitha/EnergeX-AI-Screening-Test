<?php

use Laravel\Lumen\Testing\DatabaseMigrations;
use Laravel\Lumen\Testing\DatabaseTransactions;
use Tymon\JWTAuth\Facades\JWTAuth;

class PostTest extends TestCase
{
    use DatabaseTransactions;

    protected function createUserAndGetToken()
    {
        $user = \App\Models\User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password123')
        ]);

        return JWTAuth::fromUser($user);
    }

    public function testGetPosts()
    {
        $this->get('/api/posts')
             ->seeStatusCode(200)
             ->seeJsonStructure([
                 'posts',
                 'cached'
             ]);
    }

    public function testCreatePost()
    {
        $token = $this->createUserAndGetToken();
        
        $postData = [
            'title' => 'Test Post',
            'content' => 'This is a test post content.'
        ];

        $this->post('/api/posts', $postData, ['Authorization' => "Bearer {$token}"])
             ->seeStatusCode(201)
             ->seeJsonStructure([
                 'id', 'title', 'content', 'user_id', 'created_at'
             ]);
    }

    public function testCreatePostRequiresAuth()
    {
        $postData = [
            'title' => 'Test Post',
            'content' => 'This is a test post content.'
        ];

        $this->post('/api/posts', $postData)
             ->seeStatusCode(401);
    }

    public function testGetSinglePost()
    {
        $token = $this->createUserAndGetToken();
        $user = auth()->user();
        
        $post = \App\Models\Post::create([
            'title' => 'Test Post',
            'content' => 'Test content',
            'user_id' => $user->id
        ]);

        $this->get("/api/posts/{$post->id}")
             ->seeStatusCode(200)
             ->seeJsonStructure([
                 'post' => ['id', 'title', 'content', 'user_id'],
                 'cached'
             ]);
    }
}