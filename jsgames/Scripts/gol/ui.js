/// <reference path="game.js" />
/// <reference path="~/Scripts/easeljs-0.6.0.js" />
/// <reference path="~/Scripts/knockout-2.2.1.debug.js" />
/// <reference path="~/Scripts/jquery-2.0.0.intellisense.js"/>


(function () {
    //createjs.Ticker.useRAF = true;
    
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
    
    function Cell(stage,x,y) {
        this._isAlive = false;
        this._changed = true;
        
        this.shape = new createjs.Shape();
        this.stage = stage;
        this.x = x;
        this.y = y;

        this.stage.addChild(this.shape);
        this.shape.x = mm((x * defs.cellSize) + (x * defs.cellSep) + defs.cellSep);
        this.shape.y = mm((y * defs.cellSize) + (y * defs.cellSep) + defs.cellSep);
        var that = this;
        
        this.shape.addEventListener('click', function(ev) {
            that.toggleAlive();
        });

        this.toggleAlive = function() {
            that.isAlive(!that.isAlive());
        };

        this.isAlive = function(val) {
            if (val === undefined) {
                return this._isAlive;
            }
            if (val !== this._isAlive) {
                this._isAlive = val;
                this._changed = true;
            }
        };

        this.getColor = function() {
            return this.isAlive() ? defs.alivecolor : defs.deadcolor;
        };
        
        this.draw = function () {
            if (this._changed) {
                this.shape.graphics.clear();
                this.shape.graphics.beginFill(this.getColor()).drawRoundRect(0, 0, mm(defs.cellSize), mm(defs.cellSize), mm(defs.cellRadius));
                this._changed = false;
                return true;
            }
            return false;
        };
        

    }

    function UiManager() {
        this.stage = new createjs.Stage("golcanvas");
        this.background = null;
        this.cells = null;//the grid of all the Cells
        this.width = null;//the width of the canvas in mm
        this.height = null;//the height of the canvas in mm
        this.game = null;//the instance of the game

        this.gameIsRunning = ko.observable(false);
        this.generation = ko.observable(1);
        this.rows = ko.observable(defs.rows);
        this.columns = ko.observable(defs.cols);
        this.randomLivingCells = ko.observable(defs.randomLifePercent); //this is a percentage of total cells to generate random life.
        

        this.rows.subscribe(initUniverse, this);
        this.columns.subscribe(initUniverse, this);

        this._clickTime = createjs.Ticker.getTime();
        this._lastStep = this._clickTime;

        var that = this;


        this.init = function() {
            initUniverse.apply(this);
            createjs.Ticker.setFPS(60);
            createjs.Ticker.addEventListener('tick', function (ev) {
                nextStep.apply(that);
                updateStage.apply(that);
            });
        };

        this.startGame = function () {
            this.gameIsRunning(true);
            
            var init = getLivingCellCoords.apply(this);
            this.game = new gol.Game(this.rows(), this.columns(), init);
            this.generation(this.game.generation);
        };

        this.stopGame = function() {
            this.gameIsRunning(false);
        };

        this.generateRandomLife = function() {
            var lifes = parseInt( this.rows() * this.columns() * ( this.randomLivingCells()  / 100));

            var alive = this.randomLivingCells > 50;

            for (var i = 0; i < lifes; ) {
                var x = Math.floor(Math.random() * this.columns()),
                    y = Math.floor(Math.random() * this.rows());

                this.cells[y][x].isAlive(true);
                i++;
            }


        };

        this.init();
    }

    function getLivingCellCoords() {
        var alive = [];
        for (var y = 0; y < this.rows(); y++) {
            for (var x = 0; x < this.columns(); x++) {
                var c = this.cells[y][x];
                if (c.isAlive()) {
                    alive.push( [c.x, c.y]);
                }
            }
        }
        return alive;
    }

    
    function nextStep() {
        if (this.game && this.game.hasLife() && this.gameIsRunning()) {
            var thisStep = createjs.Ticker.getTime();
            if (thisStep - this._lastStep > defs.lifeInterval) {
                this._lastStep = thisStep;
                var life = this.game.nextGeneration();
                this.generation(this.game.generation);
                for (var y = 0; y < this.rows(); y++) {
                    for (var x = 0; x < this.columns(); x++) {
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
    
    function updateStage() {
        var update = false;
        if (this.cells) {
            for (var y = 0; y < this.rows(); y++) {
                for (var x = 0; x < this.columns(); x++) {
                    var cu = this.cells[y][x].draw();
                    if (!update && cu) {
                        update = true;
                    }
                }
            }
        }
        if (update) {
            this.stage.update();
        }
    }

    function initUniverse() {
        this.stage.removeAllChildren();
        this.stage.clear();
        this.width = mm((this.columns() * defs.cellSize) + (this.columns() * defs.cellSep) + defs.cellSep);
        this.height = mm((this.rows() * defs.cellSize) + (this.rows() * defs.cellSep) + defs.cellSep);
        $("#golcanvas").attr({ "width": this.width, "height": this.height });

        this.background = new createjs.Shape();
        this.background.graphics.beginFill(defs.bgcolor).rect(0, 0, this.width, this.height);
        this.stage.addChild(this.background);
        initCells.apply(this);

    }

    function initCells() {
        this.cells = [];
        for (var y = 0; y < this.rows(); y++) {
            this.cells.push([]);
            for (var x = 0; x < this.columns(); x++) {
                var cell = new Cell(this.stage, x, y);
                this.cells[y].push(cell);
            }
        }
    }


})();