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
    neighbour(x,y) {
        let directions = [];
        if (this.get(x,(2*y-1)%this.height)!="#") directions=[{x:x,y:(2*y-1)%this.height}];
        if (this.get((x+1)%this.width,y)!="#") directions=[{x:(x+1)%this.width,y:y},...directions];
        if (this.get(x,(y+1)%this.height)!="#") directions=[{x:x,y:(y+1)%this.height},...directions];
        if (this.get((2*x-1)%this.width,y)!="#") directions=[{x:(2*x-1)%this.width,y:y},...directions];
        return directions;
    }
}
class Pac {
    constructor(x,y,pacId,owner,type,speedTimer=0,cooldown=0) {
        this.x=x;
        this.y=y;
        this.Id=pacId;
        this.owner=owner;
        this.type=type
        this.abilityCooldown=cooldown;
        this.speed=speedTimer?2:1;
        this.speedTimer=speedTimer;
    }
    move(map,x,y,output) {
        if (this.abilityCooldown) this.abilityCooldown--;
        if (this.speedTimer) this.speedTimer--;
        
        output.push(`MOVE ${this.Id} ${x} ${y}`);
        return true; 
        

    }
    speedX(output) {
        this.speed = 2;
        this.abilityCooldown = 10;
        this.speedTimer = 5;
        output.push(`SPEED ${this.Id}`);
    }
    changeType(type,output) {
        this.type=type;
        this.abilityCooldown=10;
        output.push(`SWITCH ${this.Id} ${this.type}`)
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
    game.output=[];
    game.pacs=[];

    var inputs = readline().split(' ');
    const myScore = parseInt(inputs[0]);
    const opponentScore = parseInt(inputs[1]);
    const visiblePacCount = parseInt(readline()); // all your pacs and enemy pacs in sight
    
    game.players[0].score = myScore;
    game.players[1].score = opponentScore;
       
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
        game.pacs.push(new Pac(x,y,pacId,mine,typeId,speedTurnsLeft,abilityCooldown));
        
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
    output : []
}


// game loop
while (true) {
    let pellets = readTurn(game);

    myPacs = game.pacs.filter(pac=>pac.owner==1)
    // Write an action using console.log()
    // To debug: console.error('Debug messages...');
    for(i=0;i<myPacs.length;i++) {
        pac=myPacs[i]

        let targets = pellets.filter(p=>p.x==pac.x||p.y==pac.y)
        
        let distances=targets.map(p=>Math.abs(p.x-pac.x)+Math.abs(p.y-pac.y))
        let cp=targets[distances.indexOf(Math.min(...distances))];
        console.error(targets, pac.Id,cp,distances)
        if (targets.length==0) {
            targets = pellets.filter(p=>p.value==10);
            console.error(targets, pac.Id)
            distances=targets.map(p=>(p.x-pac.x)**2+(p.y-pac.y)**2)
            cp=targets[distances.indexOf(Math.min(...distances))];
        }
        if (pac.abilityCooldown == 0) pac.speedX(game.output);
        else pac.move(game.map,cp.x,cp.y,game.output);
        console.error(pac)
        

    }
    console.error(myPacs.length)
    console.log(game.output.join` | `);     // MOVE <pacId> <x> <y>

}
