(function() {

    window.gol = {};

    function refreshGrid(grid, alive) {
        //grid is the whole universe with living and dead cells
        //alive is the coordinates of living cells.  All others will be dead.

        //make everything dead
        for (var y = 0; y < grid.length; y++) {
            var row = grid[y];
            for (var x = 0; x < row.length; x++) {
                row[x] = false;
            }
        }
        
        //make the alive ones alive
        for (var i = 0; i < alive.length; i++) {
            var x = alive[i][0], y = alive[i][1];
            grid[y][x] = true;
        }
    }


    window.gol.Game = function(rows, cols, init) {
        this.rows = rows;
        this.cols = cols;
        this.grid = new Array(rows);
        for (var i = 0; i < rows; i++) {
            this.grid[i] = new Array(cols);
        }        
        
        //set the initial live cells
        refreshGrid(this.grid, init);
        

        this.life = function() {
            var newliving = [];
            for (var y = 0; y < this.rows; y++) {
                for (var x = 0; x < this.cols; x++) {
                    var ln = this.countLivingNeighbors(x, y);
                    //am I dead or alive
                    var alive = this.grid[y][x];
                    if (alive && (ln === 2 || ln === 3)) {
                        newliving.push([x, y]); //stays alive
                    }
                    if (!alive && ln === 3) {
                        newliving.push([x, y]);//becomes alive
                    }
                    //all others are dead
                }

            }
            refreshGrid(this.grid, newliving);
            return this.grid;

        };

        this.countLivingNeighbors = function(x, y) {
            var living = 0;
            //look for neighbors in this order N, NE, E, SE, S, SW, W, NW
            //N neighbor
            if (y > 0 && this.grid[y - 1][x]) living++;
            //NE neighbor
            if (y > 0 && x < this.cols - 1 && this.grid[y - 1][x + 1]) living++;
            //E neighbor
            if (x < this.cols - 1 && this.grid[y][x + 1]) living++;
            //SE neighbor
            if (x < this.cols - 1 && y < this.rows - 1 && this.grid[y + 1][x + 1]) living++;
            //S neighbor
            if (y < this.rows + 1 && this.grid[y + 1][x]) living++;
            //SW neighbor
            if (y < this.rows + 1 && x > 0 && this.grid[y + 1][x - 1]) living++;
            //W neighbor
            if (x > 0 && this.grid[y][x - 1]) living++;
            //NW neighbor
            if (x > 0 && y > 0 && this.grid[y - 1][x - 1]) living++;

            return living;
        };


    };


    /*

    Any live cell with fewer than two live neighbours dies, as if caused by under-population.
    Any live cell with two or three live neighbours lives on to the next generation.
    Any live cell with more than three live neighbours dies, as if by overcrowding.
    Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

   x ->  0 1 2 3 4 5 6 7 8 9 ......
 y
 | 
 ▼      
 0       0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
 1       0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
 2       0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
 3       0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
 4       0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
 5       0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
 6       0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
 7       0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
 8       0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
 9       0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
    
    
    
    */

})();