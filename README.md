# Spaz Snake
http://spazsnake.herokuapp.com/

## Inspiration

My inspiration for this project was the Twitch Plays Pokemon project. 
This project livestreamed a Pokemon game that the viewers were able to interact with. 
Using the chat, viewers were able to play the game. 
However, with so many people sending commands it was difficult for the game to progress.
Yet, eventually they were able to beat the game. 

## The Game

I thought this was a very interesting mechanic where many people try to play the same instance of a game.
So I wanted to try applying this mechanic to a different game and see how successful it would be.
I decided to use snake as my base game as it is a simple game that many people know how to play and can be built using p5.js and node.js.
The biggest challenge I had was developing the best method of data transfer. What data I needed to send, where the data should be held, and how often should sketches be updated.
Often I would experience one user's instance running smoothly while others lagged or new connections wouldn't load the current snake.
My current solution assigns one user as a 'host' that brings any new user's data up to speed with the current session when they connect.
In attempt to keep each user's experience as similar as possible, sketches rely on the server for any new data.
This way when there is new data, all users will get it at the same time. 

## Thoughts
What I found most interesting about this project was the visual representation of the other users playing the same game as you.
Having the chat/message box makes the game feel more fluid and alive as it gives the feeling that you are playing together as a collective.
I also really liked that segments you add retain your color as it is a visual representation of your contribution to the progression of the game. 

All code used in the files index.html, server.js, and SnakeS.js are all my own. I did not use any templates or examples in any major way other than to better understand the syntax.
