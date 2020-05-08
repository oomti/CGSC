/**
 * Grab the pellets as fast as you can!
 **/

class Map {
    constructor(mapData,width,height) {
        this.field=mapData.map(x=>x);
        this.width=width;
        this.height=height;
    }
    copy() {
        let newMap = new Map(this.field,this.width,this.weight)
        return newMap
    }
    get(x,y) {
        return this.field[x+y*(this.width)]

    }
    set(x,y,value) {
        this.field[x+y*(this.width)]=value;
    }
    reset() {
        this.field=this.field.map(tile=>tile=="#"?"#":" ");
    }
}
class Pac {
    constructor(x,y,pacId,owner) {
        this.x=x;
        this.y=y;
        this.Id=pacId;
        this.owner=owner;
    }
    move(x,y) {

    }
}
class Player {
    constructor(score) {
        this.score=score
    }

}


let width
let height
function readMap() {
    let map
    var inputs = readline().split(' ');
    width = parseInt(inputs[0]); // size of the grid
    height = parseInt(inputs[1]); // top left corner is (x=0, y=0)
    for (let i = 0; i < height; i++) {
        const row = readline(); // one line of the grid: space " " is floor, pound "#" is wall
        if (i) map = map + row;
        else map = row;
    }
    return map;
}

function readTurn(game) {
    var inputs = readline().split(' ');
    const myScore = parseInt(inputs[0]);
    const opponentScore = parseInt(inputs[1]);
    const visiblePacCount = parseInt(readline()); // all your pacs and enemy pacs in sight
    
    game.players[0].score = myScore;
    game.players[1].score = opponentScore;
    game.pacs=[]    
    let myPac
    for (let i = 0; i < visiblePacCount; i++) {
        var inputs = readline().split(' ');
        const pacId = parseInt(inputs[0]); // pac number (unique within a team)
        const mine = inputs[1] !== '0'; // true if this pac is yours
        const x = parseInt(inputs[2]); // position in the grid
        const y = parseInt(inputs[3]); // position in the grid
        const typeId = inputs[4]; // unused in wood leagues
        const speedTurnsLeft = parseInt(inputs[5]); // unused in wood leagues
        const abilityCooldown = parseInt(inputs[6]); // unused in wood leagues
        game.pacs.push(new Pac(x,y,pacId,mine));
        
    }
    const visiblePelletCount = parseInt(readline()); // all pellets in sight
    let pellets=[]
    game.map.reset()
    for (let i = 0; i < visiblePelletCount; i++) {
        var inputs = readline().split(' ');
        const x = parseInt(inputs[0]);
        const y = parseInt(inputs[1]);
        const value = parseInt(inputs[2]); // amount of points this pellet is worth
        pellets.push({x:x,y:y,value:value})
        game.map.set(x,y,value)
    }
    return pellets;

}




console.error("hi")
let startMap = new Map([...readMap()],width,height);

let game = {
    map : startMap,
    pacs : [],
    players : [new Player(0) , new Player(0)],
    output : null
}


// game loop
while (true) {
    let pellets = readTurn(game);

    myPacs = game.pacs.filter(pac=>pac.owner==1)
    // Write an action using console.log()
    // To debug: console.error('Debug messages...');
    for(i=0;i<myPacs.length;i++) {
        let distances=pellets.map(p=>(p.x-myPacs[i].x)**2+(p.y-myPacs[i].y)**2)
        cp=pellets[distances.indexOf(Math.min(...distances))]
        if (i) game.output += ` | MOVE ${myPacs[i].Id} ${cp.x} ${cp.y}`;
        else game.output = `MOVE ${myPacs[i].Id} ${cp.x} ${cp.y}`;

    }
    console.error(myPacs.length)
    console.log(game.output);     // MOVE <pacId> <x> <y>

}
