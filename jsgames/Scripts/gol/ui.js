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
        this._isAlive = false;
        this._changed = true;
        
        this.shape = new createjs.Shape();
        this.stage = stage;
        this.x = x;
        this.y = y;

        this.stage.addChild(this.shape);
        this.shape.x = mm((x * cellSize) + (x * cellSep) + cellSep);
        this.shape.y = mm((y * cellSize) + (y * cellSep) + cellSep);
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
            return this.isAlive() ? alivecolor : deadcolor;
        };
        
        this.draw = function () {
            if (this._changed) {
                this.shape.graphics.clear();
                this.shape.graphics.beginFill(this.getColor()).drawRoundRect(0, 0, mm(cellSize), mm(cellSize), mm(cellRadius));
                this._changed = false;
                return true;
            }
            return false;
        };
        

    }

    function UiManager() {
        this.stage = new createjs.Stage("golcanvas");
        this.background = new createjs.Shape();
        this.cells = [];
        this.width = null;//the width of the canvas in mm
        this.height = null;//the height of the canvas in mm
        this.game = null;

        this._clickTime = createjs.Ticker.getTime();

        var that = this;


        this.init = function() {
            this.width = mm((cols * cellSize) + (cols * cellSep) + cellSep);
            this.height = mm((rows * cellSize) + (rows * cellSep) + cellSep);
            $("#golcanvas").attr({ "width": this.width, "height": this.height });
            $("#start-game").click(function(ev) {
                startGame.apply(that);
                return false;
            });

            this.background.graphics.beginFill(bgcolor).rect(0, 0, this.width, this.height);
            this.stage.addChild(this.background);

            initCells.apply(this);
            createjs.Ticker.setFPS(60);
            createjs.Ticker.addEventListener('tick', function (ev) {
                
                updateStage.apply(that);
            });
        };


        this.init();
    }

    function getLivingCellCoords() {
        var alive = [];
        for (var y = 0; y < rows; y++) {
            for (var x = 0; x < cols; x++) {
                var c = this.cells[y][x];
                if (c.isAlive()) {
                    alive.push( [c.x, c.y]);
                }
            }
        }
        return alive;
    }

    function startGame() {
        var init = getLivingCellCoords.apply(this);
        this.game = new gol.Game(rows,cols, init);
    }
    
    function updateStage() {
        var update = false;
        for (var y = 0; y < rows; y++) {
            for (var x = 0; x < cols; x++) {
                var cu = this.cells[y][x].draw();
                if (!update && cu) {
                    update = true;
                }
            }
        }
        if (update) {
            this.stage.update();
        }
    }


    function initCells() {
        for (var y = 0; y < rows; y++) {
            this.cells.push([]);
            for (var x = 0; x < cols; x++) {
                var cell = new Cell(this.stage, x, y);
                this.cells[y].push(cell);
            }
        }
    }


})();