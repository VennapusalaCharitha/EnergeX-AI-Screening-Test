# Getting Started with EnergeX

Hey there! Thanks for checking out my EnergeX project. I built this as part of a technical assessment, and I'm pretty excited to show you what it can do.

## What I Built

This is basically a mini social media platform where people can sign up, post their thoughts, and interact with content from others. Think of it like a simplified Twitter or Facebook feed.

The cool part is that I built it using a bunch of different technologies working together - React for the frontend, PHP for the main API, Node.js for caching, MySQL for the database, and Redis to make everything super fast.

## Running It On Your Machine

Don't worry, I made this really easy to run. You just need Docker installed (which handles all the complicated setup stuff for you).

### Quick Start

1. Make sure you have Docker Desktop running on your computer
2. Open your terminal and navigate to this project folder
3. Run this command:
   ```
   docker-compose up -d
   ```
4. Wait about 30 seconds (grab a coffee!)
5. Open your browser and go to http://localhost:3000

That's it! Everything should be up and running.

## Playing Around With It

Once you're on the site, here's what you can do:

**First time?** Hit the "Register" button and create an account. I kept it simple - just name, email, and password.

**Already have an account?** Just log in with your email and password.

**Want to post something?** Click "Create Post" and share whatever's on your mind.

**See what others posted?** The main page shows all posts from everyone.

**Want to delete something you posted?** You'll see a delete button on your own posts (but not on other people's posts - that would be chaos!).

## The Technical Stuff (For Fellow Developers)

If you're curious about how this all works under the hood, here's the breakdown:

I've got 5 different services running:
- **React app** (port 3000) - The pretty frontend you interact with
- **PHP API** (port 8000) - Handles all the user accounts and post management
- **Node.js cache service** (port 3001) - Makes everything load faster
- **MySQL database** - Stores all the actual data
- **Redis cache** - Keeps frequently accessed stuff in memory

The flow is pretty straightforward: you interact with the React app, which talks to the PHP API, which saves stuff to MySQL. The Node.js service sits in between to cache popular content so it loads instantly.

### Want to Test the API Directly?

I included a Postman collection (`EnergeX-API.postman_collection.json`) that you can import. It has all the endpoints set up so you can test the API without using the web interface.

### Bonus Features I Added

I went a bit overboard and added some extra features:

- **Role-based permissions** - You can register as an admin and delete anyone's posts
- **Real-time updates** - Open two browser tabs and watch posts appear instantly in both
- **GraphQL endpoint** - Visit http://localhost:3001/graphql for a fancy query interface
- **Smart caching** - Posts are cached for 5 minutes to make everything snappy

## If Something Goes Wrong

**App won't start?** Make sure Docker Desktop is actually running and ports 3000, 8000, and 3001 aren't being used by something else.

**Can't register or login?** Give it a minute - the database takes a bit to warm up when you first start everything.

**Posts not showing up?** The cache service might still be starting. Refresh the page after a minute.

**Want to start fresh?** Run these commands:
```
docker-compose down
docker volume rm energex-ai-hiring-test_mysql_data
docker-compose up -d
```

## Why I Built It This Way

I wanted to show that I can work with different technologies and make them play nicely together. The whole thing is containerized so it runs the same way on any machine, and I tried to follow best practices for security (passwords are hashed, users can only delete their own content, etc.).

The caching layer was fun to implement - it makes the app feel much more responsive, especially if you had lots of users hitting it at once.

## Wrapping Up

This was a really fun project to work on. I tried to balance showing off technical skills while keeping the user experience simple and clean.

If you run into any issues or have questions about how something works, feel free to check the logs with `docker-compose logs` or just reach out!

---

*P.S. - When you're done playing around, you can shut everything down with `docker-compose down`*