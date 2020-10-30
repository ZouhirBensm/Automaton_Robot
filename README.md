# Automaton_Robot
Most Sophisticated project I have achieved so far! This computer program creates a Robot state with embedded parcels to be delivered on a graph. The robot delivers the parcels. Four different types of computed route methodologies were programmed and compared.


## Input

A roads array with the starting and ending points the robot is allowed to take! Then we modify it to a graph. The data structure of the graph is an object. The onject has each place as a property. The values of each properties is an array of all the places the robot can move to.

## How the code operates

Please look at the comments on the source code. I give a line by line explanation!

## Types of robots
### Robot 1: Random Robot
After defining the place the robot is, and the parcels that need to get delivered. This robot chooses a random place to move to. Whithin a numbers of movements the robot eventually suceeds in delivering all of the 5 parcels.
### Robot 2: Mail Route Robot
This robot follows a specific route. The datastructure of the route is an array saved as memory. The robot follows the route twice, at most, to deliver all of the parcels.
### Robot 3: Goal Orriented Robot
This robot implements an algorithm to compute the best route to take for a particular parcel. Once the best route is computes it is stored in memory. The robot executes on that specific route. Every time the move achieved it re-computes the best move detination. 
### Robot 4: Lazy Robot
This robot implements a more optimised algorith. Instead of computing the best direction for each parcel at a time, it computes the best direction based on all the parcels it needs to pick up and deliver. For this task it implement a algorithm that branches all of the routes and by a is statement determines the shortest, ie: computed the fastest. The most importante criteria for a route to be taken is its length. The second criteria that weights in is priority for pick ups. 

## Comparisions
After this I programmed a algorithm that computes the averrage number of steps it takes for each robot to deliver 5 parcels. The program calculates this average based on 100 cases. The code outputs the result when it is assigne 2 robots for comparison.

## Conclusion
The results go from 68, 18, 15 to 12 steps on average to deliver 5 parcels for Random Robot, Mail Route Robot, Goal oriented Robot and Lazy Robot respectively. The efficiency drastically increases by implementing a route. The worst case scenario for Mail Route Robot is 2 iterations over it's route. This worst case scenario is rare. Random Robot on the other hand can most likely take numerous steps to finish and has the potentiality to never finish (extremely rare case)! The major conclusion is to always consider worste case scenarions in applications and to consider them as number one factors if they can cause crucial consequences. Average and best case scenarios are also important! 
