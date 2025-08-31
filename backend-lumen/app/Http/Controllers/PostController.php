<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class PostController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth', ['except' => ['index', 'show']]);
    }

    public function index()
    {
        $cacheKey = 'posts:all';
        $cachedPosts = Redis::get($cacheKey);

        if ($cachedPosts) {
            return response()->json([
                'posts' => json_decode($cachedPosts, true),
                'cached' => true
            ]);
        }

        $posts = Post::with('user:id,name')->latest()->get();
        Redis::setex($cacheKey, 300, $posts->toJson()); // Cache for 5 minutes

        return response()->json([
            'posts' => $posts,
            'cached' => false
        ]);
    }

    public function show($id)
    {
        $cacheKey = "posts:{$id}";
        $cachedPost = Redis::get($cacheKey);

        if ($cachedPost) {
            return response()->json([
                'post' => json_decode($cachedPost, true),
                'cached' => true
            ]);
        }

        $post = Post::with('user:id,name')->findOrFail($id);
        Redis::setex($cacheKey, 300, $post->toJson()); // Cache for 5 minutes

        return response()->json([
            'post' => $post,
            'cached' => false
        ]);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $post = Post::create([
            'title' => $request->title,
            'content' => $request->content,
            'user_id' => auth()->id(),
        ]);

        // Clear cache when new post is created
        Redis::del('posts:all');

        return response()->json($post->load('user:id,name'), 201);
    }

    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        if ($post->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $this->validate($request, [
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
        ]);

        $post->update($request->only(['title', 'content']));

        // Clear cache when post is updated
        Redis::del('posts:all');
        Redis::del("posts:{$id}");

        return response()->json($post->load('user:id,name'));
    }

    public function destroy($id)
    {
        $post = Post::findOrFail($id);

        if ($post->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $post->delete();

        // Clear cache when post is deleted
        Redis::del('posts:all');
        Redis::del("posts:{$id}");

        return response()->json(['message' => 'Post deleted successfully']);
    }
}