/// <reference path="game.js" />
/// <reference path="~/Scripts/easeljs-0.6.0.js" />
/// <reference path="~/Scripts/knockout-2.2.1.debug.js" />
/// <reference path="~/Scripts/jquery-2.0.0.intellisense.js"/>


(function () {
    createjs.Ticker.useRAF = true;
    window.gol = window.gol || {};

    $(function() {
        pixelratio();
        var uim = new UiManager();
        ko.applyBindings(uim, $("#gamearea")[0]);
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

    var defs= {
        cols : 40,
        rows : 30,
        cellSize : 3.5,
        cellSep : .7,
        cellRadius : .8,
        bgcolor : "#F2F2F2",
        deadcolor : "#FFFFFF",
        alivecolor : "#04BA6B",
        lifeInterval: 1000 * 1,
        randomLifePercent: 30
    };
    

    function UiManager() {
        this.stage = new createjs.Stage("golcanvas");
        this.background = null;
        this.cells = null;//the grid of all the Cells
        this.width = null;//the width of the canvas in mm
        this.height = null;//the height of the canvas in mm
        this.game = null;//the instance of the game
        this.eventHandler = new EventHandler(this.stage, this);

        this.gameIsRunning = ko.observable(false);
        this.generation = ko.observable(1);
        this.rows = ko.observable(defs.rows);
        this.columns = ko.observable(defs.cols);
        this.randomLivingCells = ko.observable(defs.randomLifePercent); //this is a percentage of total cells to generate random life.
        

        this.rows.subscribe(this.initUniverse, this);
        this.columns.subscribe(this.initUniverse, this);

        this._clickTime = createjs.Ticker.getTime();
        this._lastStep = this._clickTime;

        this.init();
    }

    var up = UiManager.prototype;
    up.init = function () {
        this.initUniverse();
        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener('tick', this.stage);
    }
    up.startGame = function () {
        this.gameIsRunning(true);

        var init = this.getLivingCellCoords();
        this.game = new gol.Game(this.rows(), this.columns(), init);
        this.generation(this.game.generation);
    }
    up.stopGame = function () {
        this.gameIsRunning(false);
    }
    up.generateRandomLife = function () {
        var total = parseInt(this.rows() * this.columns());
        var random = parseInt(this.randomLivingCells());
        var lifes = total * (random / 100);

        var alive = random < 50;
        if (!alive) {
            lifes = total - lifes;
        }

        for (var y = 0; y < this.rows() ; y++) {
            for (var x = 0; x < this.columns() ; x++) {
                var c = this.cells[y][x];
                c.isAlive(!alive);
            }
        }

        for (var i = 0; i < lifes;) {
            var x = Math.floor(Math.random() * this.columns()),
                y = Math.floor(Math.random() * this.rows());

            if (this.cells[y][x].isAlive() != alive) {
                this.cells[y][x].isAlive(alive);
                i++;
            }
        }
    }
    up.getLivingCellCoords = function() {
        var alive = [];
        for (var y = 0; y < this.rows() ; y++) {
            for (var x = 0; x < this.columns() ; x++) {
                var c = this.cells[y][x];
                if (c.isAlive()) {
                    alive.push([x, y]);
                }
            }
        }
        return alive;
    }
    up.nextStep= function() {
        if (this.game && this.game.hasLife() && this.gameIsRunning()) {
            var thisStep = createjs.Ticker.getTime();
            if (thisStep - this._lastStep > defs.lifeInterval) {
                this._lastStep = thisStep;
                var life = this.game.nextGeneration();
                this.generation(this.game.generation);
                for (var y = 0; y < this.rows() ; y++) {
                    for (var x = 0; x < this.columns() ; x++) {
                        var c = this.cells[y][x];
                        c.isAlive(life[y][x]);
                    }
                }
            }
        }
        else if (this.game && !this.game.hasLife()) {
            this.gameIsRunning(false);
        }
    }
    up.initUniverse=function() {
         this.stage.removeAllChildren();
         this.stage.clear();
         this.width = mm((this.columns() * defs.cellSize) + (this.columns() * defs.cellSep) + defs.cellSep);
         this.height = mm((this.rows() * defs.cellSize) + (this.rows() * defs.cellSep) + defs.cellSep);
         $("#golcanvas").attr({ "width": this.width, "height": this.height });

         this.background = new createjs.Shape();
         this.background.graphics.beginFill(defs.bgcolor).rect(0, 0, this.width, this.height);
         this.stage.addChild(this.background);
         this.initCells();

    }

    up.initCells = function() {
         this.cells = [];
         for (var y = 0; y < this.rows() ; y++) {
             this.cells.push([]);
             for (var x = 0; x < this.columns() ; x++) {
                 var cell = new Cell(x, y);
                 this.stage.addChild(cell);
                 this.cells[y].push(cell);
             }
         }
     }

    



    function EventHandler(stg, uim) {
        this.stage = stg;
        this.uiMan = uim;
        this.mouseIsDown = false

        this.init();
    }

    var ep = EventHandler.prototype;
    ep.init = function () {
        this.stage.addEventListener("stagemousemove", $.proxy(this.stgMouseMoveHandler, this));
        this.stage.addEventListener("stagemousedown", $.proxy(this.stgMouseDownHandler, this));
        this.stage.addEventListener("stagemouseup", $.proxy(this.stgMouseUpHandler, this));
        createjs.Ticker.addEventListener('tick', $.proxy(this.tickHandler, this));
        $(document).on("mouseup", $.proxy(this.mouseUpHandler, this))
            .on("mousedown", $.proxy(this.mouseDownHandler, this));
    }
    ep.tickHandler = function (ev) {
        this.uiMan.nextStep();
    }
    ep.mouseDownHandler = function (ev) {
        this.mouseIsDown = true;
    }
    ep.mouseUpHandler = function (ev) {
        this.mouseIsDown = false;
    }
    ep.stgMouseMoveHandler = function (ev) {
        if (this.mouseIsDown && !this.uiMan.gameIsRunning()) {
            var cell = this.findCellAtStgCoords(ev.stageX, ev.stageY)
            if (cell && !cell.isAlive()) {
                cell.isAlive(true);
            }
        }
    }
    ep.stgMouseDownHandler = function (ev) {
        var cell = this.findCellAtStgCoords(ev.stageX, ev.stageY)
        if (cell != null) {
            cell.toggleAlive();
        }
    }
    ep.stgMouseUpHandler = function (ev) {
    }
    
    ep.findCellAtStgCoords = function (x, y) {
        var cpw = mm(defs.cellSize);//get cell width in pixels
        //find the row
        var row = $.grep(this.uiMan.cells, function(row) {
            var cell = row[0];
            return cell.y <= y && cell.y + cpw >= y;
        });
        
        //may not always find a row.  Like if y is between 2 rows
        if (row.length == 1) {
            row = row[0];
            //find the cell
            var found = $.grep(row, function(cell) {
                return cell.x <= x && cell.x + cpw >= x;
            })
            
            //may not always find a cell, either
            if (found.length == 1) {
                return found[0];
            }
        }
        return null;
    }



    











    var Cell = function (x, y) {
        this.initialize(x, y);
    }

    var cp = Cell.prototype = new createjs.Shape();

    cp.Shape_initialize = cp.initialize;

    cp.initialize = function (column, row) {
        this.Shape_initialize();

        this.row = row;
        this.column = column;
        this.x = mm((column * defs.cellSize) + (column * defs.cellSep) + defs.cellSep);
        this.y = mm((row * defs.cellSize) + (row * defs.cellSep) + defs.cellSep);

    }

    cp._isAlive = false;
    cp._changed = true;

    cp.column = 0;
    cp.row = 0;

    cp.toggleAlive = function () {
        this.isAlive(!this.isAlive());
    };

    cp.isAlive = function (val) {
        if (val === undefined) {
            return this._isAlive;
        }
        if (val !== this._isAlive) {
            this._isAlive = val;
            this._changed = true;
        }
    };

    cp.getColor = function () {
        return this.isAlive() ? defs.alivecolor : defs.deadcolor;
    };


    cp.onTick = function (params) {
        if (this._changed) {
            this.graphics.clear();
            this.graphics.beginFill(this.getColor()).drawRoundRect(0, 0, mm(defs.cellSize), mm(defs.cellSize), mm(defs.cellRadius));
            this._changed = false;
        }
    };



})();