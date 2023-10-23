var c=document.getElementById('c');
var ctx=c.getContext('2d');//canvas shit
var lin=1, col=1;
var cellSize=10, boardSize=50, wallNumber;
const directions=4;
function Create2DArray(rows) {//weird declaring of 2d array(missing C)
  var arr = [];
  for (var i=0;i<rows;i++){//plug array at all places in start array
    arr[i] = [];
  }
  return arr;//pass a reference for other functions- JS can do that
}
var i, j;
var a=Create2DArray(boardSize+2);
for(i=0; i<=boardSize+1; i++){
  for(j=0; j<=boardSize+1; j++)
    a[i][j]=1;//set it all as 1
}
for(i=1; i<boardSize+1; i++){
  for(j=1; j<boardSize+1; j++){
    a[i][j]=0; //place zeroes where we can operate, can plug a few ones
  }
}
var linSet=[], colSet=[];//these 2 arrays store all walls
var seenLine=[], seenCol=[];// these folks store all squares we have seen, thus grayscaling them
const img=document.getElementsByClassName('ghostie');
function draw(){
  var i;
  //part one-draw the framework
  ctx.clearRect(0, 0, cellSize*boardSize, cellSize*boardSize);
  ctx.strokeRect(0, 0, cellSize*boardSize, cellSize*boardSize);
  ctx.fillStyle="#9878d1";
  ctx.fillRect(cellSize*(lin-1),cellSize*(col-1), cellSize, cellSize);
  ctx.fillStyle="#15ed25";
  ctx.fillRect(cellSize*(boardSize-1), cellSize*(boardSize-1), cellSize, cellSize);
  //part two- fill in black cells wherever there are obstacles
  ctx.fillStyle="black";
  for(i=0; i<linSet.length; i++){
     ctx.fillRect(cellSize*(linSet[i]-1), cellSize*(colSet[i]-1), cellSize, cellSize);
  }
  //part three - take inputs from the queue and color where BFS reaches
  ctx.fillStyle="firebrick";
  for(i=0; i<seenLine.length; i++){//WE gotta be ready- when the input comes, it'll come in bulk
        ctx.fillRect(cellSize*(seenLine[i]-1), cellSize*(seenCol[i]-1), cellSize, cellSize);
  }
  ctx.drawImage(img, 30, 30, 30, 30, 30, 30, 30, 30);
}
//Construct a Queue- we write a constructor, then build 4 prototypes for ADT ops
function Queue(){//works like a DIY class - coder's wit
   this.a=[];//it is a Queue class, but written in a weird way 
}
Queue.prototype.push = function (x) {
   this.a.push(x);
};
Queue.prototype.pop = function(){
  this.a.shift();
};
Queue.prototype.empty = function () {
    return this.a.length==0? 1: 0; //test whether the queue is empty- it will be useful later on
};//the code is coupled or not?
Queue.prototype.front = function () {
    return this.a[0];//The queue might be empty, so throw an exception otherwise
};
var dx =[-1, 0, 1, 0];//displacement vectors to code the shifting fast
var dy =[0, -1, 0, 1], steps=0;
var dist=Create2DArray(boardSize+2);//an array to tell whether I've been there or not
function highlightRoute(x, y){
    seenLine.push(x);///re-create the route the BFS has taken
    seenCol.push(y);
    var seenARoute=0;
    if(x==lin&&y==col){///if we're already there, there's nothing I can do
       return;
    }
    else {
       for(i=0; i<directions&&!seenARoute; i++){
          if(dist[x+dx[i]][y+dy[i]]==dist[x][y]-1){///if we find a square whose mimimum distance is one smaller than target,
              seenARoute=1;///a shortest path must go through there
              highlightRoute(x+dx[i], y+dy[i]);///then just recur from it, it's the same thing
          }
       }
    }
}
function checkMinPath(){
   var i, j;
   for(i=0; i<=boardSize+1; i++){
      for(j=0; j<=boardSize+1; j++){
         dist[i][j]=0;
      }
  }
    let q_lin= new Queue(), q_col=new Queue();
    q_lin.push(lin), q_col.push(col);//place the coordinates where they belong
    while(!q_lin.empty()){//while I haven't hit the end
       var i;
       for(i=0; i<directions; i++){//iterate through all directions, do BFS
           var l=q_lin.front(), c=q_col.front();//take queue heads
           if(a[l+dx[i]][c+dy[i]]==0&&dist[l+dx[i]][c+dy[i]]==0){//If I ain't hittin' a wall
              q_lin.push(l+dx[i]);//push the next cell
              q_col.push(c+dy[i]);
              dist[l+dx[i]][c+dy[i]]=dist[l][c]+1;
           }
       }
       q_lin.pop();
       q_col.pop();
    }
    highlightRoute(boardSize, boardSize);
}
const arrowShifter=37;
function showEndCredits(value){
  var p=document.createElement("p");
  p.innerHTML="Congrats! Total step count: "+ value ;
  document.body.appendChild(p);
}
const canvas=document.querySelector('canvas');
//we write 2 functions- one gets the line, one the mazeColumn
//I duplicate code, which is frowned upon- how can I not?
function getMouseLine(canvas, event){//where I clicked
   const rect = canvas.getBoundingClientRect();
   const x = event.clientX - rect.left;
   return x;
}
function getMouseColumn(canvas, event){//where I clicked
   const rect = canvas.getBoundingClientRect();
   const y = event.clientY - rect.top;
   return y;
}
wallNumber=0;
canvas.addEventListener('mousedown', function(event){//if I click somewhere,  throw a wall in there
     var lin=getMouseLine(canvas, event);
     var col=getMouseColumn(canvas, event);
     var mazeLine=Math.floor((lin/cellSize)+1), mazeColumn=Math.floor((col/cellSize)+1);//get coordinates
     a[mazeLine][mazeColumn]=1;//bookmark a region as impassable
     linSet.push(mazeLine);
     colSet.push(mazeColumn);
})
document.addEventListener('keydown', function(event) {//test arrow motions- need logic for each possible angle I'd be using to hit
   for(var i=0; i<4; i++){
     if(event.keyCode==arrowShifter+i && a[lin+dx[i]][col+dy[i]]==0){//if I hit an arrow key which doesn't lead into a block
        lin=lin+dx[i];
        col=col+dy[i];
        steps++;
     }
   }
   if(lin==boardSize&&col==boardSize){//if I hit the bottom-right corner- I can't be arsed to place the finish elsewhere
     showEndCredits(steps);
   }
});
setInterval(draw, 0.5);
