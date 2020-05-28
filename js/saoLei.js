function Mine(tr,td,mineNum) {
    this.tr = tr;//行数
    this.td = td;//列数
    this.mineNum = mineNum;//雷的数列

    this.squares=[];//存储所有方块信息，是一个二维数组，按行和列顺序排放，存取都使用行列形式
    this.tds=[];//存储所有单元格Dom
    this.surplusMine = mineNum;//剩余雷的数量
    this.allRight = false;//判断是不是都是雷，是否游戏成功

    this.parent = document.querySelector('.gamebox')
}
//生成不重复数字
Mine.prototype.randomNum=function () {
    var square=new Array(this.tr*this.td);//生成一个空数组，长度为格子总数
    for(var i=0;i<square.length;i++){
        square[i]=i;
    }
    square.sort(function () {
        return 0.5-Math.random()
    });
    return square.slice(0,this.mineNum)
}

Mine.prototype.init=function () {
    // console.log(this.randomNum());
    var rn=this.randomNum();//雷在格子里的位置
    var n = 0;//用来找到格子对应的索引
    for (var i=0;i<this.tr;i++){
        this.squares[i]=[]
        for (var j=0;j<this.td;j++){
            // this.squares[i][j]=
            //取一个方块在数组里的数据要使用行与列的形式去取
            if(rn.indexOf(++n)!=-1){
                //如果这个条件成立，说明现在循环到的这个索引在雷的数组里找到了，那就表示这个索引对应是雷
                this.squares[i][j]={type:'mine',x:j,y:i};
            }else {
                this.squares[i][j] = {type: 'number', x: j, y: i, value: 0}
            }
        }
    }
    this.updateNum();
    this.createDom();

    this.parent.ontextmenu=function () {
        return false;
    }
    //剩余雷数
    this.mineNumDom = document.querySelector('.mineNum');
    this.mineNumDom.innerHTML=this.surplusMine;

}

//创建表格
Mine.prototype.createDom=function () {
    var This=this;
    var table=document.createElement('table');
    for (var i=0;i<this.tr;i++){
        var domTr=document.createElement('tr');
        this.tds[i]=[];

        for (var j=0;j<this.td;j++){
            var domTd=document.createElement('td');//列
            // domTd.innerHTML=0;
            domTd.pos=[i,j];//把格子对应的行与列存到格子上去
            domTd.onmousedown=function () {
                This.play(event,this);//This指实例对象，this指的点击td
            }
            this.tds[i][j]=domTd;//把所有创建的td添加到数组中


            // if(this.squares[i][j].type=='mine'){
            //     domTd.className='mine'
            // }
            // if(this.squares[i][j].type=='number'){
            //     domTd.innerHTML=this.squares[i][j].value
            // }
            domTd.oncontextmenu=function () {
                return false
            }
            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML=' ';
    this.parent.appendChild(table);

}

//找某个字周围所有格子
Mine.prototype.getAround=function (square) {
    var x=square.x;
    var y=square.y;
    var result=[];//找到周围格子坐标返回出去

    for (var i=x-1;i<=x+1;i++){
        for (var j=y-1;j<=y+1;j++){
            if(
                i<0 || j<0 || i>this.td-1 || j>this.tr-1 || (i==x && j==y) ||
                    this.squares[j][i].type=='mine'
            ){
                continue;
            }
            result.push([j,i]);//以行与列的形式返回出去，因为到时候要取出其数据
        }
    }
    return result;
};

//更新所有数字
Mine.prototype.updateNum=function () {
    for (var i=0;i<this.tr;i++){
        for (var j=0;j<this.td;j++){
            //只更新雷周围的数字
            if(this.squares[i][j].type=='number'){
                continue;
            }
            var num=this.getAround(this.squares[i][j]);//获取到每一个雷周围的数字
            for(var k=0;k<num.length;k++){


                this.squares[num[k][0]][num[k][1]].value+=1;
            }
        }

    }
}

Mine.prototype.play=function (ev,obj) {
    var This = this;
    if(ev.which==1 && obj.className!='flag'){
    // console.log(obj)
        var curSquare=this.squares[obj.pos[0]][obj.pos[1]]
        var cl=['zero','one','two','three','four','five','six','seven','eight']
        // console.log(curSquare)
        if (curSquare.type=='number'){
            //点到数字
            console.log("数字")
            obj.innerHTML=curSquare.value
            obj.className=cl[curSquare.value];;

            if(curSquare.value==0){
                /*用户点0
                */
                obj.innerHTML='';
                function getAllZero(square) {
                    var around=This.getAround(square);//找到周围n个格子

                    for(var i=0;i<around.length;i++){
                        var x=around[i][0];//行
                        var y=around[i][1];//列

                        This.tds[x][y].className=cl[This.squares[x][y].value];

                        if(This.squares[x][y].value==0){
                            //如果以某个格子为中心找到格子值为0
                            if(!This.tds[x][y].check){
                                //给对应的td添加一属性，这条属性用于决定这个格子有没有接触过，找过的话为true
                                This.tds[x][y].check=true;
                                getAllZero(This.squares[x][y]);
                            }
                        }else {
                            //如果以某个格子为中心找到四周格子值不为0，酒吧格子显现出来
                            This.tds[x][y].innerHTML=This.squares[x][y].value
                        }
                    }
                }
                getAllZero(curSquare)
            }
        }else {
            this.gameOver(obj);
            // console.log("雷")
        }
    }
    //用户点击右键
    if(ev.which==3){
        //如果右击的是数字，不能点击
        if(obj.className && obj.className!='flag'){
            return
        }
        obj.className=obj.className=='flag'?'':'flag';//切换class

        if(this.squares[obj.pos[0]][obj.pos[1]].type=='mine'){
            this.allRight=true;//用户标记小红旗都是雷
        }else {
            this.allRight=false;
        }
        if(obj.className=='flag'){
            this.mineNumDom.innerHTML=--this.surplusMine;
        }else {
            this.mineNumDom.innerHTML = ++this.surplusMine;
        }
        if(this.surplusMine==0){
            //剩余雷的数量为0，表示用户已经标完小红旗，判断游戏是否成功或失败
            if(this.allRight){
                //说明用户全部标对，通过
                alert("恭喜你，游戏通过");
            }else {
                alert("游戏失败");
                this.gameOver();
            }
        }
    }
}
//游戏失败
Mine.prototype.gameOver=function (clickTd) {
//    1、显示所有雷
//    2、取消所有盒子点击事件
//    3、点击雷，加上红色背景
    for(var i=0;i<this.tr;i++){
        for(var j=0;j<this.td;j++){
            if(this.squares[i][j].type=='mine'){
                this.tds[i][j].className='mine';
            }
            this.tds[i][j].onmousedown=null;
        }
    }
    if(clickTd){
        clickTd.style.backgroundColor='#f00';
    }
}

//上边button功能
var btns=document.querySelectorAll('.level button');
var mine=null;//用来存储生成的实例
var ln=0;//用来处理当前选中状态
var arr=[[9,9,10],[16,16,40],[28,28,99]];//不同级别的行数列数和雷数

for (let i=0;i<btns.length;i++){
    btns[i].onclick=function () {
        btns[ln].className=' ';
        this.className='active';

        mine = new Mine(...arr[i]);
        mine.init();

        ln=i;
    }
}
btns[0].onclick();//初始化
btns[3].onclick=function () {
    mine.init();
};
// var mine = new Mine(28,28,99);
// mine.init();
// console.log(mine.getAround(mine.squares[0][0]))