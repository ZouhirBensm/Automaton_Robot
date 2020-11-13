//Input data ie: the roads the robot can move.
//Our robot can go one place to the other based on this array.

var roads = [
  "Alice's House-Bob's House",   "Alice's House-Cabin",
  "Alice's House-Post Office",   "Bob's House-Town Hall",
  "Daria's House-Ernie's House", "Daria's House-Town Hall",
  "Ernie's House-Grete's House", "Grete's House-Farm",
  "Grete's House-Shop",          "Marketplace-Farm",
  "Marketplace-Post Office",     "Marketplace-Shop",
  "Marketplace-Town Hall",       "Shop-Town Hall"
];


//Transforms the data to become an object with properties. The properties are every location with each having an array as a value containing locations that can be accessed as elements.
function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (graph[from] == null) {
      graph[from] = [to]; //Creates the properties
    } else {
      graph[from].push(to); //Pushes it to the array if the propertie has already been created 
    }
  }
  for (let [from, to] of edges.map(r => r.split("-"))) { //splits the roads in 2 locations
    addEdge(from, to); //Puts destination into starting point properties value array
    addEdge(to, from);
  }
  return graph;
}

var roadGraph = buildGraph(roads);

console.log(roadGraph);

//This class builds the state a robot is at a particular state. The state can be defined by an object containing 2 properties (1): The current location (ie: place) it is at and (2): the parcels meant to be dropped of that have either been picked up, ie: parcel location will be equal to robots current spot -or not, ie: parcel are unchanged
//The robot states seconde propertie will be parcels and it's values is an array of objects containning the pickup location is: parcel.place and the dropoff location ie: parcel.address

var VillageState = class VillageState {
  constructor(place, parcels) {
    this.place = place; //Properties that define a state
    this.parcels = parcels;
  }

  move(destination) {
    if (!roadGraph[this.place].includes(destination)) { //Checks to see if it can move to the destination by seeing if destination is part of places propertie value array.
      return this;
    } else {
      let parcels = this.parcels.map(p => { //Iterates on each parcel
        if (p.place != this.place) return p; //If robot not at pick up location do nothing to parcel
        return {place: destination, address: p.address}; //If robot got to parcels pickup location onece the parcels place will always stay binded to the robots movements
      }).filter(p => p.place != p.address); //Once the parcels place equals it's destination the parcel is filtered out of the list of parcels TO BE delivered since IT GOT delivered!
      return new VillageState(destination, parcels); //The return new state always updates it's new location, ie: destination -per move!
    }
  }
}


//This function counts the number of movements the robot took to deliver a set of parcels
//This function also sets the first state of the system, the type of robot to be used (explained later), and the memory (explained later) of the places to go.
function runRobot(state, robot, memory) {
  for (let turn = 0;; turn++) {
    if (state.parcels.length == 0) {
      console.log(`=>	Done in ${turn} turns	<=`);
      break;
    }
    let action = robot(state, memory); //The action binding returns an object with 2 properties (1): the next direction the robot needs to take and (2) the next places to go to, ie: the memory.
    //Action depends on the current robot state and current memory. It helps to think of the robot function as a dynamic function because it's inputs are constantly changing.
    state = state.move(action.direction); //Updates the robot state based on new destination to achieve and withdrew from memory!
    memory = action.memory; //Updates the memory by dumping the location just achieved and using the next!
    console.log(`Moved to ${action.direction}`); //displays where the robot is moving to!
  }
}

//This function just randomly returns a element from an array and can thus be used as component to a type of robot. I'm talking about the one that moves randomly, ie: randomRobot!
function randomPick(array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

//All robots in this project are simply input to the runRobot function. What is important is that define a object with properties (next) direction and a memory of future destinations that is not necessary for the randomRobot.

//Type 1 robot: Random Robot
//This robot returns a object direction by calling the randomPick function.
//The array element that is randomly chosen is provided thanks to the current place the robot is at, thus it is one of the locations the robot is allowed to access defined by the roadGraph object!
function randomRobot(state) {
  return {direction: randomPick(roadGraph[state.place])};
}


//This method generates 5 parcels put as an array of objects containing 2 properties each: (1): location (parcel.place) & (2): destination (parcel.address)
VillageState.random = function(parcelCount = 5) {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick(Object.keys(roadGraph)); //picks a random parcel.address destination
    let place;
    do {
      place = randomPick(Object.keys(roadGraph)); //picks a random parcel.place
    } while (place == address); //if it accidently picks the same destination as the place it is, it then re-picks another location making sure they are different
    parcels.push({place, address}); //Packages the parcels as object array elements for the state parcel property!
  }
  return new VillageState("Post Office", parcels); //The first state our robot has to deal with! It starts at the Post Office as a place, and the parcels property will contain all 5 parcels!
};


console.log("\nLet's run our random robot to deliver our 5 parcels!\n")
runRobot(VillageState.random(), randomRobot);

//Type 2 robot: Mail Route Robot
//This is the starting memory we were discussing earlier
//The robot goes around a predefined route several times until all the parcels have been delivered
var mailRoute = [
  "Alice's House", "Cabin", "Alice's House", "Bob's House",
  "Town Hall", "Daria's House", "Ernie's House",
  "Grete's House", "Shop", "Grete's House", "Farm",
  "Marketplace", "Post Office"
];

//The Mail Route Robot: The direction property returned is the next place the robot has got to move to. The memory is updated by deleting the the place that is going to get processed by the move in runRobot
function routeRobot(state, memory) {
  if (memory.length == 0) { //Re-creates the same route needed to take as memory for the robot once the previous memory array has been all "sliced" (removed one by one starting from the the leftmost element)
    memory = mailRoute;
  }
  return {direction: memory[0], memory: memory.slice(1)}; //
}

console.log("\nLet's run our Mail Route robot to deliver our 5 parcels!\n")
runRobot(VillageState.random(), routeRobot, []);

//Type 3 robot: Goal Orriented Robot
//This is a sophisticard robot that will compute the shortest path to the current parcels place or destination based on the first parcel the robot has to consider!

//This function takes the graph object and computes the shortest path from "from" (place) to "to" (parcel.place or parcel.address)
function findRoute(graph, from, to) {
  let work = [{at: from, route: []}];
  for (let i = 0; i < work.length; i++) {
    let {at, route} = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place); //concat the destination to route if its within the graphs reach
      if (!work.some(w => w.at == place)) { //looks at all possible routes possible and automatically backtracks to the shortest route possible to the destination thanks to the preceding if statement
      //if all the places it can go are not equal to the place it needs to be, it will concat all of the places it can attend until it can compute the route to the destination. This will branch out until the the function is capable of returning a route to the destination thanks to the preceding if statement!
        work.push({at: place, route: route.concat(place)});
      }
    }
  }
}

//This function 
function goalOrientedRobot({place, parcels}, route) {
  if (route.length == 0) {
    let parcel = parcels[0]; //Takes the first parcel of the list of parcels (first element)
    if (parcel.place != place) { //if the place of the current parcel is not equal to the robots location
      route = findRoute(roadGraph, place, parcel.place); //...then compute the shortest route to the parcel with the function findRoute!
    } else { //if the parcel has been picked up 
      route = findRoute(roadGraph, place, parcel.address); //...then compute the shortest route to the address with the function findRoute!
    }
  }
  return {direction: route[0], memory: route.slice(1)}; //As usual it returns the direction and memory to the runRobot action object!
}


//This function counts the number of movements the robot took to deliver a set of parcels
//This function also sets the first state of the system, the type of robot to be used (explained later), and the memory (explained later) of the places to go.
function runRobot(state, robot, memory) {
  for (let turn = 0;; turn++) {
    if (state.parcels.length == 0) {
      console.log(`=>	Done in ${turn} turns	<=`);
      break;
    }
    let action = robot(state, memory); //The action binding returns an object with 2 properties (1): the next direction the robot needs to take and (2) the next places to go to, ie: the memory.
    //Action depends on the current robot state and current memory. It helps to think of the robot function as a dynamic function because it's inputs are constantly changing.
    state = state.move(action.direction); //Updates the robot state based on new destination to achieve and withdrew from memory!
    memory = action.memory; //Updates the memory by dumping the location just achieved and using the next!
    console.log(`Moved to ${action.direction}`); //displays where the robot is moving to!
  }
}


console.log("\nLet's run our Goal Oriented robot to deliver our 5 parcels!\n")
runRobot(VillageState.random(), goalOrientedRobot, []);



//Type 4 robot: Lazy Robot
//Finds best route for all parcels then operates on the shortest route it needs to get and un-picked up parcels routes get a 0.5 priority compared to picked up ones that need to the address route when the robot needs to choose the destination! 
function lazyRobot({place, parcels}, route) {
  if (route.length == 0) {
    // Describe a route for every parcel
    let routes = parcels.map(parcel => {
      if (parcel.place != place) {
        return {route: findRoute(roadGraph, place, parcel.place),
                pickUp: true};
      } else {
        return {route: findRoute(roadGraph, place, parcel.address),
                pickUp: false};
      }
    });

    // This determines the precedence a route gets when choosing.
    // Route length counts negatively, routes that pick up a package
    // get a small bonus.
    function score({route, pickUp}) {
      return (pickUp ? 0.5 : 0) - route.length;
    }
    route = routes.reduce((a, b) => score(a) > score(b) ? a : b).route;
  }

  return {direction: route[0], memory: route.slice(1)};
}


console.log("\nLet's run our lazy robot to deliver our 5 parcels!\n")
runRobot(VillageState.random(), lazyRobot, []);

//This function returns the total number of steps the robot takes to deliver all the parcels it needs to
function countSteps(state, robot, memory) {
  for (let steps = 0;; steps++) {
    if (state.parcels.length == 0) return steps;
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
  }
}

//This function generates 100 states and each time it generates the sums of the total amounts of steps the robot took to deliver all the parcels for each robot it is comparing

function compareRobots(robot1, memory1, robot2, memory2) {
  let total1 = 0, total2 = 0; //initialises the counts for robot 1 and 2
  for (let i = 0; i < 100; i++) {
    let state = VillageState.random(); //generates a new state with new 5 parcels to deliver
    total1 += countSteps(state, robot1, memory1); //counts the number of steps for each state of 5 parcels to deliver and does that 100 times and sums the total
    total2 += countSteps(state, robot2, memory2);
  }
  console.log(`\n${robot1.name} needed ${total1 / 100} steps per task`) //calculates the average number of steps the robot takes to deliver 5 parcels
  console.log(`${robot2.name} needed ${total2 / 100}`)
}

compareRobots(randomRobot, [], routeRobot, []); //here we are comparing 2 robots

compareRobots(routeRobot, [], goalOrientedRobot, []); //here we are comparing 2 robots

compareRobots(goalOrientedRobot, [], lazyRobot, []); //here we are comparing 2 robots

//Lazy robot is the most efficient robot
//The efficiency drastically increases from the random robot to the route robot!
