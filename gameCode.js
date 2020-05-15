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
        this.notActed = true;
    }
    move(gmap,x,y,output) {
        let h = gmap.height;
        let w = gmap.width;
        if (this.abilityCoolD) this.abilityCoolD--;
        if (this.speedTimer) this.speedTimer--;
        
        if (this.notActed) output.push(`MOVE ${this.Id} ${(x+w)%w} ${(y+h)%h}`);
        this.notActed = false;
        return true; 
        

    }
    speedX(output) {
        this.speed = 2;
        this.abilityCoolD = 10;
        this.speedTimer = 5;
        if (this.notActed)
            output.push(`SPEED ${this.Id}`);
        this.notActed = false;
    }
    changeType(type,output) {
        this.type=type;
        this.abilityCoolD=10;
        if (this.notActed)
            output.push(`SWITCH ${this.Id} ${this.type}`)
        this.notActed = false;
    }
    

}
class Player {
    constructor(score) {
        this.score=score
    }

}
let width
let height

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

        }
        for (let i = 0;i<nodes.length;i++) {
            let n = nodes[i]
            let nbor = edgeID.neighbour(n.x,n.y);
            nbor=nbor.filter(nb=>edgeID.get(nb.x,nb.y)==" ");
            if (nbor) nbor.map((e,j)=>{
                let edgePoints = [e];
                edgeID.set(e.x,e.y,`E:${i}:${j}`)
                distances.set(e.x,e.y,1)
                let next = edgeID.neighbour(e.x,e.y).find(en=>edgeID.get(en.x,en.y)==" ");
                let c = 1;
                while (next) {
                    edgePoints.push(next);
                    edgeID.set(next.x,next.y,`E:${i}:${j}`);
                    c++;
                    next = edgeID.neighbour(next.x,next.y).find(en=>edgeID.get(en.x,en.y)==" ");
                    
                }
                edgePoints.map(e=>distances.set(e.x,e.y,c));
            });

        }
        let connections = []
        let edgePoints = gmap.listPoints(" ");
        edgePoints.map(e=>{
            let eID = edgeID.get(e.x,e.y).split`:`
            let nb = edgeID.neighbour(e.x,e.y);
            nb = nb.find(n=>{
                let nID = edgeID.get(n.x,n.y)
                nID=nID.toString().split(":");
                
                if (nID[0] == "N"&&nID[1]!=eID[1])
                    return true;
                return false;
            });
            if (nb) {
                let nID = edgeID.get(nb.x,nb.y).split`:`;
                nodes[eID[1]].friends.push({
                    node:nID[1],
                    length:distances.get(e.x,e.y),
                    edge:eID[2]
                }); 
                nodes[nID[1]].friends.push({
                    node:eID[1],
                    length:distances.get(e.x,e.y),
                    edge:eID[2]
                })
            } 

        });
        edgePoints.map(e=>{
            let eV = edgeID.get(e.x,e.y).split`:`;
            let partnerNode = nodes[eV[1]].friends.find(f=>f.edge==eV[2]);
            if (partnerNode) {
                tilesInEdge = edgeID.listPoints(eV.join`:`)
                tilesInEdge.map(t=>edgeID.set(t.x,t.y,`${eV[1]}:${partnerNode.node}:${partnerNode.length}:${partnerNode.edge}`));
            }
        });
        return {graphMap:edgeID, nodes:nodes}

    },
    createFullGraph: function(gmap) {
        let nodes = this.listNodes(gmap);
        let fullGraph = this.findEdges(gmap,nodes);
        return fullGraph;

    }
}
class Graph {
    constructor(gmap) {
        let graph = graphModel.createFullGraph(gmap);
        this.nodes = graph.nodes;
        this.graphMap = graph.graphMap;
    }
    nodeFromXY(x,y) {
        let tile = this.graphMap.get(x,y);
        tile = tile.split`:`
        if (tile[0]=="N") {
            return this.nodes[tile[1]].friends.map(t=>t.node)
        }
        else  
        return [tile[0],tile[1]]
    }
    nodeLocation(node) {
        let pos = this.graphMap.field.indexOf(f=>{
            f=f.split`:`;
            return f[0]=="N"&&f[1]==node;
        })
        if (!pos) return false
        return new Point(pos%this.graphMap.width,Math.floor(pos/this.graphMap.height));
    }
    edgeTiles(nodeA,nodeB) {
        tiles = [];
        this.graphMap.field.map((tile,i)=>{
            tile=tile.split`:`
            if(tile[0]==nodeA&&tile[1]==nodeB||tile[1]==nodeA&&tile[0]==nodeB) {
                tiles.push(new Point(i%this.graphMap.width,Math.floor(i/this.graphMap.height)));
            }
        });
    }
    listEdges() {
        this.graphMap.field.filter(tile=>tile.match("E"))
    }

}

let logicFunction = {
    detectEnemy(x,y,pacs) {
        let enemies = []
        for (let i=0;i<pacs.length;i++) {
            let p = pacs[i];
            if (p.owner == 1 && p.x==x && p.y == y)  {
                enemies.push(p);
            }

        }
        return enemies;
    },
    isBlocked(x,y,pacs) {
        let b = [];
        for (let i=0;i<pacs.length;i++) {
            let p = pacs[i];
            if (p.x==x+1 || p.x==x-1 || p.y==y+1 || p.y==y-1) {
                b.push(p);
            }

        }
        return b;
    },
    findNextNode(x,y,graph) {
        return graph.nodeFromXY(x,y);
    },
    isNode(x,y,graph) {
        let tile = graph.graphMap.get(x,y).split`:`;
        if (tile[0]=="N")
            return tile[1];
        else
            return false;
    },
    evalEdges(graph,gmap) {
        let edges = {}
        for (let x=0;x<gmap.width;x++)for (let y=0;y<gmap.height;y++) {
            ep = graph.graphMap.get(x,y);
            if (ep.match(/^[0-9]/)) {
                let tileValue = gmap.get(x,y);
                let v  = tileValue==" "?1:tileValue==0?0.01:Number(tileValue)
                if (edges[ep]) {
                    edges[ep]+=v;
                }
                else edges[ep]=v;
            }
        }
        return edges;
    }



}

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
    const visiblePelletCount = parseInt(readline()); // all pellets in sight
    let pellets=[]
    for (let i = 0; i < visiblePelletCount; i++) {
        var inputs = readline().split(' ');
        const x = parseInt(inputs[0]);
        const y = parseInt(inputs[1]);
        const value = parseInt(inputs[2]); // amount of points this pellet is worth
        pellets.push({x:x,y:y,value:value})
        game.map.set(x,y,value)
    }
    game.edges=logicFunction.evalEdges(game.graph,game.map)
    console.error("Edges value")
    console.error(game.edges);
    return pellets;


}

function applyLogic(game,pellets) {
    myPacs = game.pacs.filter(pac=>pac.owner==1);
    
    // Write an action using console.log()
    // To debug: console.error('Debug messages...');
    console.error("apply logic");
    for(let i=0;i<myPacs.length;i++) {
        pac=myPacs[i];

        let targets = [];
        let enemies = logicFunction.detectEnemy(pac.x,pac.y,game.pacs).filter(x=>x.owner==1);
        console.error(`PAC ${pac.Id}`);
        console.error("blockers:");
        console.error(logicFunction.isBlocked(pac.x,pac.y,game.pacs).map(x=>x.Id+":"+x.owner));
        console.error("enemies");
        console.error(logicFunction.detectEnemy(pac.x,pac.y,game.pacs).filter(x=>x.owner==1).map(x=>x.Id+":"+x.owner + ":" +x.type));
        console.error("next nodes");
        console.error(logicFunction.findNextNode(pac.x,pac.y,game.graph));
        let np
        if (np=logicFunction.isNode(pac.x,pac.y,game.graph))
            console.error(np)

        console.error(pac.lastNode);
        let dist = game.pacs.map(p=>(Math.abs(p.x-pac.x)+Math.abs(p.y-pac.y))?(Math.abs(p.x-pac.x)+Math.abs(p.y-pac.y)):99);
        let nearest = Math.min(...dist);
        console.error(`Nearest to ${pac.Id} ${nearest}`)
        if (nearest<3) {
            let index = dist.indexOf(nearest)
            let pac2 = game.pacs[index]; 
            if (pac2.owner == true && pac.Id > pac2.Id) {
                targets = game.graph
                    .nodeFromXY(pac.x,pac.y)
                    .map(node=>game.graph.nodeLocation(node.x,node.y));
            }
            else if (pac2.owner == false 
                &&(pac2.type=="ROCK" && pac.type == "PAPER"
                || pac2.type=="PAPER" && pac.type == "SCISSORS"
                || pac2.type=="SCISSORS" && pac.type == "ROCK")) {
                    targets=[new Point(pac2.x,pac2.y)]
            }
            else if (pac2.owner == false && pac.abilityCoolD==0) {
                console.error(`Pac ${pac.Id} changing type `)
                switch(pac2.type) {
                    case "ROCK":
                        pac.changeType("PAPER",game.output)
                        break;
                    case "PAPER":
                        pac.changeType("SCISSORS",game.output);
                        break;
                    case "SCISSORS":
                        pac.changeType("ROCK",game.output);
                        break;
                }
            }

        }

        let pts=false;
        if (targets.length==0) {
            targets = pellets.filter(p=>p.value==10);
            if (targets.length) pts=true;

            
        }
        if (targets.length == 0) {
            targets=pellets.filter(p=>p.x==pac.x||p.y==pac.y);
        }
        if (targets.length==0) {
            targets = game.map.listPoints("1");
        }
        if (targets.length==0) {
            targets = game.map.listPoints("0");
        }

        let distances=targets.map(p=>Math.abs(p.x-pac.x)+Math.abs(p.y-pac.y));
        let cp=targets[distances.indexOf(Math.min(...distances))];
        
        if ((Math.abs(pac.x-cp.x)+Math.abs(pac.y-cp.y))==1&&pac.speed==2) {
            console.error(pac.Id, "moves less")
            cp.x+=cp.x-pac.x;
            cp.y+=cp.y-pac.y;
        }
        if (pac.abilityCoolD == 0) pac.speedX(game.output);
        else {
            if (pts) {
                let ind = pellets.indexOf(pellets.find(p=>p.x==cp.x&&p.y==cp.yp))
                pellets.splice(ind,1);
            }
            if (myPacs.find(mp=>mp.Id<pac.Id&&(Math.abs(mp.x-pac.x)<1||Math.abs(mp.y-pac.y)<1))) {
                cp=targets[distances.indexOf(Math.max(...distances))];
            }
            pac.move(game.map,cp.x,cp.y,game.output);
        }
        

    }
}
console.error("hi")
let startMap = new Map([...readMap()],width,height);

let game = {
    map : startMap,
    pacs : [],
    players : [new Player(0) , new Player(0)],
    output : [],
    graph : new Graph(startMap),
    history : []

}
let nodes = graphModel.listNodes(game.map);
console.error(game.graph.graphMap.listPoints(" "));
// game loop
while (true) {
    let pellets = readTurn(game);
    game.history.push(game.pacs);
    applyLogic(game,pellets);
    console.log(game.output.join` | `);     // MOVE <pacId> <x> <y>

}
