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
        let newMap = new Map([...this.field],this.width,this.height)
        return newMap
    }
    get(x,y) {
        return this.field[(x+this.width)%this.width+(y+this.height)%this.height*(this.width)]

    }
    set(x,y,value) {
        this.field[(x+this.width)%this.width+((y+this.height)%this.height)*(this.width)]=value;
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
        let w = this.width;
        let cells = [];
        
        while(this.get(x,y-U-1)!="#"&&U<h){
            cells.push({x:x,y:y-U-1})
            U++;
        }
        while(this.get(x,y+D+1)!="#"&&D<h){
            cells.push({x:x,y:y+D+1})
            D++;}
        while(this.get(x-L-1,y)!="#"&&L<w){
            cells.push({x:x-L-1,y:y})
            L++;}
        while(this.get(x+R+1,y)!="#"&&R<w){
            cells.push({x:x+R+1,y:y})
            R++;}

        return {
            U:U,
            D:D,
            L:L,
            R:R,
            cells
        }

    }
    printOut() {
        let h = this.height;
        let w = this.width;
        for (let i=0;i<h;i++)
            console.error(this.field.slice(0+i*w,w+i*w).join``);
    }
    listPoints(value) { 
        let list = []
        for (let x=0;x<this.width;x++)for (let y=0;y<this.height;y++) {
            if (this.get(x,y)==value)
                list.push(new Point(x,y));
        }
        return list;
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
    move(gmap,x,y,output) {
        let h = gmap.height;
        let w = gmap.width;
        if (this.abilityCoolD) this.abilityCoolD--;
        if (this.speedTimer) this.speedTimer--;
        
        output.push(`MOVE ${this.Id} ${(x+w)%w} ${(y+h)%h}`);
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
    let gmap
    var inputs = readline().split(' ');
    width = parseInt(inputs[0]); // size of the grid
    height = parseInt(inputs[1]); // top L corner is (x=0, y=0)
    for (let i = 0; i < height; i++) {
        const row = readline(); // one line of the grid: space " " is floor, pound "#" is wall
        if (i) gmap = gmap + row;
        else gmap = row;
    }
    return gmap;
}
function updateSight(game) {
    let myPacs = game.pacs.filter(pac=>pac.owner==1)
    for (i=0;i<myPacs.length;i++) {
       let pac = myPacs[i]
       let lineOfSight = game.map.lineOfSight(pac.x,pac.y);
       lineOfSight.cells.map(c=>game.map.set(c.x,c.y,"0"));
       game.map.set(pac.x,pac.y,"0");

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
    game.map.printOut();
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

        let targets = []
        

        if (targets.length==0) {
            targets = pellets.filter(p=>p.value==10);
            
        }
        if (targets.length == 0) {
            targets=pellets.filter(p=>p.x==pac.x||p.y==pac.y)
        }
        if (targets.length==0) {
            targets = game.map.listPoints("1")
        }
        if (targets.length==0) {
            targets = game.map.listPoints("0")
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

let graphModel = {
    listNodes: function(gmap) {
        let nodes = []
        for (let x=0;x<gmap.width;x++)for (let y=0;y<gmap.height;y++){
            let n = gmap.neighbour(x,y).length
            if (n!=2&&gmap.get(x,y)!="#") {
                nodes.push(new Node(x,y,n));
            }
        }
        
        return nodes; 
    },
    showNodes: function(gmap, nodes) {
        let nodeMap = gmap.copy();
        for (let i=0; i<nodes.length;i++) {
            let n=nodes[i];
            nodeMap.set(n.x,n.y,n.edges)
        }
    },
    findEdges: function(gmap,nodes) {
        console.error("Finding edges")
        let edgeID = gmap.copy();
        let distances = gmap.copy();
        for (let i = 0;i<nodes.length;i++) {
            let n = nodes[i]
            edgeID.set(n.x,n.y,`N:${i}:${n.edges}`)
            let neighbours = 
                gmap.neighbour(n.x,n.y)
                .filter(p=>gmap.neighbour(p.x,p.y).length==2)
            neighbours.map((p,j)=>{
                edgeID.set(p.x,p.y,`E:${i}:${j}`);
                distances.set(p.x,p.y,1);
            });

        }
        let edgePoints = [];
        for (let x=0;x<this.width;x++)for (let y=0;y<this.height;y++){
            let n = this.neighbour(x,y).length;
            if (n==2&&this.get(x,y)!="#") {
                edgePoints.push(new Point(x,y));
            }
        }
        console.error(edgePoints)
        let pointsToSet = edgePoints.filter(p=>edgeID.get(p.x,p.y)==" ");
        console.error(pointsToSet)
        while (pointsToSet.length) {
            console.error(pointsToSet.length)
            for (let i = 0; i<pointsToSet.length;i++) {
                let p = pointsToSet[i]
                
                let n = edgeID.neighbour(p.x,p.y).find(pn=> edgeID.get(pn.x,pn.y)!=" ")
                if (n) {
                    let value = edgeID.get(n.x,n.y);
                    let dist = distances.get(n.x,n.y);
                    edgeID.set(p.x,p.y,value);
                    distances.set(p.x,p.y,dist+1);
                }
            }
            pointsToSet = pointsToSet.filter(p=>edgeID.get(p.x,p.y)==" ");
        }
        console.error(distances)
        distances.printOut();

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
let nodes = graphModel.listNodes(game.map);

graphModel.showNodes(game.map,nodes)
graphModel.findEdges(game.map,nodes)



// game loop
while (true) {
    let pellets = readTurn(game);
    applyLogic(game,pellets);
    console.log(game.output.join` | `);     // MOVE <pacId> <x> <y>

}
