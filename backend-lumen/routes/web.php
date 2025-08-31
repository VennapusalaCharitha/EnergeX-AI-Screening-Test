<?php

// CORS preflight
$router->options('/{any:.*}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});

$router->get('/', function () use ($router) {
    return $router->app->version();
});

$router->group(['prefix' => 'api'], function () use ($router) {
    // Authentication routes
    $router->post('register', 'AuthController@register');
    $router->post('login', 'AuthController@login');
    
    // Protected routes
    $router->group(['middleware' => 'auth'], function () use ($router) {
        $router->get('me', 'AuthController@me');
        $router->post('logout', 'AuthController@logout');
        $router->post('posts', 'PostController@store');
        $router->put('posts/{id}', 'PostController@update');
        $router->delete('posts/{id}', 'PostController@destroy');
    });
    
    // Public routes
    $router->get('posts', 'PostController@index');
    $router->get('posts/{id}', 'PostController@show');
});