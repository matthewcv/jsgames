(function($) {

    var app;
    $(function() {

        app = Sammy("body", sammyconfig);


    });

    function sammyconfig() {
        this.get("/", index);
        this.get("/home", index);
        this.get("/home/index", index);
    }

    function index(parameters) {
        
    }

})(jQuery)