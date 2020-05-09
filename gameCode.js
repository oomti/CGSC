/**
 * Grab the pellets as fast as you can!
 **/
class Point {
    constructor(x,y) {
        this.x=x;
        this.y=y;
    }
}
class Node extends Point {
    constructor(x,y,edges) {
        super(x,y);
        this.edges=edges;
        this.friends = [];
    }
}
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
        return this.field[(x+this.width)%this.width+(y+this.height)%this.height*(this.width)]

    }
    set(x,y,value) {
        this.field[x+y*(this.width)]=value;
    }
    reset() {
        this.field=this.field.map(tile=>tile=="#"?"#":" ");
    }
    neighbour(x,y) {
        let h = this.height;
        let w = this.width;
        let directions = [];
        if (this.get(x,(h+y-1)%h)!="#") directions=[{x:x,y:(h+y-1)%h}];
        if (this.get((x+1)%w,y)!="#") directions=[{x:(x+1)%w,y:y},...directions];
        if (this.get(x,(y+1)%h)!="#") directions=[{x:x,y:(y+1)%h},...directions];
        if (this.get((w+x-1)%w,y)!="#") directions=[{x:(w+x-1)%w,y:y},...directions];
        return directions;
    }
    lineOfSight(x,y) {
        let U= 0
        let D= 0
        let L= 0
        let R= 0
        let h = this.height;
        let w = this.width
        
        while(this.get(x,y-U-1)!="#"&&U<h)U++;
        while(this.get(x,y+D+1)!="#"&&D<h)D++;
        while(this.get(x-L-1,y)!="#"&&L<w)L++;
        while(this.get(x+R+1,y)!="#"&&R<w)R++;

        return {
            U:U,
            D:D,
            L:L,
            R:R
        }

    }
    printOut() {
        let h = this.height;
        let w = this.width;
        for (i=0;i<h;i++)
            console.error(this.field.slice(0+i*w,w+i*w).join``);
    }
    listPoints(value) {
        let list = []
        for (x=0;x<this.width;x++)for (y=0;y<this.height;y++) {
            if (this.get(x,y)==value)
                list.push(new Point(x,y));
        }
        return list;
    }
    listNodes() {
        let nodes = []
        for (let x=0;x<this.width;x++)for (let y=0;y<this.height;y++){
            let n = this.neighbour(x,y).length
            if (n!=2&&this.get(x,y)!="#") {
                nodes.push(new Node(x,y,n));
            }
        }
        console.error(nodes.length,nodes)
        return nodes; 
    }
}
class Pac {
    constructor(x,y,pacId,owner,type,speedTimer=0,coolD=0) {
        this.x=x;
        this.y=y;
        this.Id=pacId;
        this.owner=owner;
        this.type=type
        this.abilityCoolD=coolD;
        this.speed=speedTimer?2:1;
        this.speedTimer=speedTimer;
    }
    move(map,x,y,output) {
        if (this.abilityCoolD) this.abilityCoolD--;
        if (this.speedTimer) this.speedTimer--;
        
        output.push(`MOVE ${this.Id} ${x} ${y}`);
        return true; 
        

    }
    speedX(output) {
        this.speed = 2;
        this.abilityCoolD = 10;
        this.speedTimer = 5;
        output.push(`SPEED ${this.Id}`);
    }
    changeType(type,output) {
        this.type=type;
        this.abilityCoolD=10;
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
    height = parseInt(inputs[1]); // top L corner is (x=0, y=0)
    for (let i = 0; i < height; i++) {
        const row = readline(); // one line of the grid: space " " is floor, pound "#" is wall
        if (i) map = map + row;
        else map = row;
    }
    return map;
}
function updateSight(game) {
    let myPacs = game.pacs.filter(pac=>pac.owner==1)
    for (i=0;i<myPacs.length;i++) {
       let pac = myPacs[i]
       let directions = game.map.lineOfSight(pac.x,pac.y);
       for (j = 0; j < directions.U ; j++) game.map.set(pac.x,pac.y-directions.U,0);
       for (j = 0; j < directions.D ; j++) game.map.set(pac.x,pac.y+directions.D,0);
       for (j = 0; j < directions.L ; j++) game.map.set(pac.x-directions.L,pac.y,0);
       for (j = 0; j < directions.R ; j++) game.map.set(pac.x-directions.R,pac.y,0);

    }

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
        const speedTurnsL = parseInt(inputs[5]); // unused in wood leagues
        const abilityCoolD = parseInt(inputs[6]); // unused in wood leagues
        game.pacs.push(new Pac(x,y,pacId,mine,typeId,speedTurnsL,abilityCoolD));
        
    }
    updateSight(game)
    const visiblePelletCount = parseInt(readline()); // all pellets in sight
    let pellets=[]
    for (let i = 0; i < visiblePelletCount; i++) {
        var inputs = readline().split(' ');
        const x = parseInt(inputs[0]);
        const y = parseInt(inputs[1]);
        const value = parseInt(inputs[2]); // amount of points this pellet is worth
        pellets.push({x:x,y:y,value:value})
        game.map.set(x,y,value==10?9:value)
    }
    return pellets;

}

function applyLogic(game,pellets) {
    myPacs = game.pacs.filter(pac=>pac.owner==1);
    // Write an action using console.log()
    // To debug: console.error('Debug messages...');
    for(i=0;i<myPacs.length;i++) {
        pac=myPacs[i]

        let targets = pellets.filter(p=>p.x==pac.x||p.y==pac.y)
        

        if (targets.length==0) {
            targets = pellets.filter(p=>p.value==10);
            
        }
        if (targets.length==0) {
            targets = game.map.listPoints(" ")
        }
        if (targets.length==0) {
            targets = game.map.listPoints("1")
        }

        let distances=targets.map(p=>Math.abs(p.x-pac.x)+Math.abs(p.y-pac.y))
        let cp=targets[distances.indexOf(Math.min(...distances))];
        
        if ((Math.abs(pac.x-cp.x)+Math.abs(pac.y-cp.y))==1&&pac.speed==2) {
            console.error(pac.Id, "moves less")
            cp.x+=cp.x-pac.x;
            cp.y+=cp.y-pac.y;
        }
        if (pac.abilityCoolD == 0) pac.speedX(game.output);
        else pac.move(game.map,cp.x,cp.y,game.output);
        

    }
}









console.error("hi")
let startMap = new Map([...readMap()],width,height);

let game = {
    map : startMap,
    pacs : [],
    players : [new Player(0) , new Player(0)],
    output : []
}
game.map.listNodes();



// game loop
while (true) {
    let pellets = readTurn(game);
    applyLogic(game,pellets);
    console.log(game.output.join` | `);     // MOVE <pacId> <x> <y>

}
