(function() {
    $(function() {
        pixelratio();
        var uim = new UiManager();
    });

    function pixelratio() {
        var test = $("<div />").css('width', "10cm").css("background-color", "green").appendTo("body");
        ppc = test.width()/10.0;
        test.remove();

        console.log(ppc);
    }

    var ppc;

    function cm(c) {
        return ppc * c;
    }

    function mm(m) {
        return (ppc / 10.0) * m;
    }

    var cols = 40, rows = 30, cellSize = 3.5, cellSep = .7, cellRadius=.8, bgcolor = "#F2F2F2", deadcolor = "#FFFFFF", alivecolor = "#04BA6B";
    
    function Cell(stage,x,y) {
        this.isAlive = false;
        this.shape = new createjs.Shape();
        this.stage = stage;
        this.color = this.isAlive ? alivecolor: deadcolor;
        
        this.stage.addChild(this.shape);
        this.shape.x = mm((x * cellSize) + (x * cellSep) + cellSep);
        this.shape.y = mm((y * cellSize) + (y * cellSep) + cellSep);
        
        this.draw = function() {
            this.shape.graphics.beginFill(this.color).drawRoundRect(0, 0, mm(cellSize), mm(cellSize), mm(cellRadius));
        };
        

    }

    function UiManager() {
        this.stage = new createjs.Stage("golcanvas");
        this.background = new createjs.Shape();
        this.cells = [];
        this.width = null;
        this.height = null;
        
        var that = this;

        this.init = function() {
            this.width = mm((cols * cellSize) + (cols * cellSep) + cellSep);
            this.height = mm((rows * cellSize) + (rows * cellSep) + cellSep);
            $("#golcanvas").attr({ "width": this.width, "height": this.height });

            this.background.graphics.beginFill(bgcolor).rect(0, 0, this.width, this.height);
            this.stage.addChild(this.background);

            initCells.apply(this);

            this.stage.update();
        };


        this.init();
    }


    function initCells() {
        for (var i = 0; i < rows; i++) {
            this.cells.push([]);
            for (var j = 0; j < cols; j++) {
                var cell = new Cell(this.stage, j, i);
                this.cells[i].push(cell);
                cell.draw();
            }
        }
    }


})();