var element = "";
var MathEditor = function (mathjax,placeholder) {
    var self = this;
    self.MathJax = mathjax;
    
    // Initialize math jax component
    
        
    //    self.placeholder = placeholder;
    //    self.init();
    //    $(self.editor).focus();
    //});

    /*****************Variable Devlarations******************/    
    self.mathChanged = true;
    self.mathElementList = [];    
    self.editor = null;
    self.placeholder = placeholder;
    self.mathQueue = "$ ({ x + y })^ 2 \\pm   \\Big ({ p \\over q} - \\sqrt{ z } \\Big )^ 3  $";
    self.lastCursorPos = 0;
    self.elementCount = 0;
    self.parser = null;    
    self.basicMathSymbols = []
    self.QUEUE = mathjax.Hub.queue;
    self.math = null;
    /*************End Variable Declaration*******************/


    ///
    // Load all symbols
    ///
    self.getAllbasicMathSymbols = function () {
        var symbols = [];
        symbols.push(['equality', '=', '=']);
        symbols.push(['inequality', '&#8800;', '\\\\ne']);
        symbols.push(['greater than', '>', '\\\\gt']);
        symbols.push(['less than', '<', '\\\\lt']);
        symbols.push(['greater than or equal to', '&#8805;', '\\\\ge']);
        symbols.push(['less than or equal to', '&#8804;', '\\\\le']);
        symbols.push(['parentheses start', '(', '(']);
        symbols.push(['parentheses end', ')', ')']);
        symbols.push(['brackets start', '[', '[']);
        symbols.push(['brackets end', ']', ']']);
        symbols.push(['addition', '+', '+']);
        symbols.push(['subtraction', '-', '-']);
       
        //symbols.push(['minus - plus', ')']);
        symbols.push(['multiplication', '*', '\\\\ast']);
        symbols.push(['multiplication', '&#215;', '\\\\times']);
        symbols.push(['division', '/', '/']);
        symbols.push(['division', '&#247;', '\\\\div']);
        symbols.push(['division', '&#247;', '\\\\sqrt{\\\\phantom{x}}']);
        symbols.push(['division', '&#247;', '\\\\phantom{x} \\\\over \\\\phantom{y}']);

        return symbols;
    }
    
    ///
    // load the toolbar
    ///
    self.loadToolbar = function () {
        var colStart = '<div class="col-md-12">'
        var colEnd = '</div>'
        var tabs = '<ul class="nav nav-tabs"><li class="active"><a href="#basic" data-toggle="tab">Basic</a></li></ul>';
        var basicTools = '<div id="myTabContent" class="tab-content"><div class="tab-pane fade active in" id="basic"><div class="btn-toolbar"><div class="btn-group" style="font-family:MathJax_Math-italic" id="BasicSymbols"></div></div></div></div>'
        var holder = '<div class="well" style="margin-top:5px" id="math-editor" tabindex=1></div>'

        var editor = colStart + tabs + basicTools + holder + colEnd;
        $(self.placeholder).append(editor);

        // load basic toolbar
        var basic = self.getAllbasicMathSymbols();
        $.each(basic, function (key, value) {
            var button = '<button type="button" onclick="addSymbol(\'' + value[2] + '\')" class="btn btn-default" data-toggle="tooltip" data-placement="left" title="' + value[0] + '">' + value[1] + '</button>';
            $("#BasicSymbols").append(button);
        });

        
    }    

    self.init = function () {

        // cancel the backspace event as it is required for the editor to 
        // delete the previous math
        $(window).keydown(function (e) {
            if (e.keyCode == 8) e.preventDefault();
        })       
        

        // load all the toolbars which includes basic math etc
        // the design is dependent upon the bootstrap 
        // Also create a matheditor place holder inside the container        
        self.loadToolbar();

        // set the editor to math editor created in the previous step
        self.editor = $("#math-editor");
        
        // intialize the tex parse (work need to be done)
        self.parser = TeXParser();

        self.MathJax.Hub.Queue(["Typeset", self.MathJax.Hub, "math-editor"]);

        self.QUEUE.Push(function () {
            math = self.MathJax.Hub.getAllJax("math-editor")[0];
            //box = document.getElementById("box");
            //  SHOWBOX(); // box is initially hidden so the braces don't show
        });

        // load the starting math in the math editor
        self.updateMath();

        // bind various events required for the math editor
        $(self.editor).keypress(function (e) {
            self.mathChanged = true;
            self.processInput(e.which);
        })

        $(self.editor).keydown(function (e) {
            self.onKeyDown(e.keyCode);
        })

        $("body").click(function (e) {
            var x = e.pageX - this.offsetLeft;
            var y = e.pageY - this.offsetTop;
            var elem = document.elementFromPoint(x, y)

            var id = "#" + $(elem).attr("id");
            self.lastCursorPos = self.mathElementList.indexOf(id) == -1 ? 0 : self.mathElementList.indexOf(id);            
            self.showCursor(self.lastCursorPos);

        });
    };

    self.showCursor = function (pos) {

        if (self.mathChanged) {
            var mathElements = $(self.editor).find($("span[class^='mi'],span[class^='mn'],span[class^='mphantom'],span[class^='mo'],span[class^='msqrt'],span[class^='mfrac']"));           
            self.mathElementList = [];
            $.each(mathElements, function (t, i) {
                if ($(i).text().length > 0) {                    
                    var id = "#" + $(i).attr("id");
                    self.mathElementList.push(id);
                    $(id).removeClass("selection");
                }
            });
            self.elementCount = self.mathElementList.length;
            self.mathChanged = false;            
        }
        else {
            $.each(self.mathElementList, function (t, i) {                
                $(i).removeClass("selection");                
            });
        }
        if ($(self.editor).is(':focus')) {
            $(self.mathElementList[pos]).addClass("selection");
            //alert("hello");
        } else {
            $(self.mathElementList[pos]).removeClass("selection");
        }
        
       
        
    }    

    self.onKeyDown = function (keyCode) {
        if (keyCode == 37) {
            if (self.lastCursorPos - 1 >= 0) {
                self.lastCursorPos--;
                self.showCursor(self.lastCursorPos);
            }
        }
        else if (keyCode == 39) {
            if (self.lastCursorPos + 1 < self.elementCount) {
                self.lastCursorPos++;
                self.showCursor(self.lastCursorPos);
            }
        }
        else if (keyCode == 46 || keyCode == 8) {
            
            // delete the whole element which is at the current cursor position
            var elem = $(self.mathElementList[self.lastCursorPos]).remove();
            if (self.lastCursorPos > self.mathElementList.length - 1 || keyCode == 8) { self.lastCursorPos--; }
            if (self.lastCursorPos < 0 && keyCode == 8) { self.lastCursorPos = 0; }
            self.lastCursorPos;
            self.mathChanged = true;
            self.showCursor(self.lastCursorPos);
            

        }
    }

    self.processInput = function (input) {
        //var string = self.mathQueue.replace(/\\/g, '*').replace(/\$/g, "*").replace(/\{/g,"*")   //self.mathQueue.replace ("\\Big", "").replace("\\over","").replace("\\frac","").replace("\\pm","");
        //var allTokens = $(string).split(" ");
        ////console.log(self.mathQueue);
        //var val = self.mathQueue.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\\\$&")
        //console.log("data - " + data);
        ////var tokens = [];
        ////var i = -1;
        ////var newStr = "";
        //while (i++ <= self.mathQueue.length) {
        //    var lastchar = self.mathQueue.charAt(i - 1);
        //    var c = self.mathQueue.charAt(i);
        //    if (lastchar != '\\') { console.log(i) };


        //    if (c.match(/^[a-zA-Z0-9]+$/)) {
        //        //console.log(c);
        //    }
        //}
        
        

        //var string = self.mathQueue.replace(/\\/g, '*').replace(/\$/g) //self.mathQueue.replace ("\\Big", "").replace("\\over","").replace("\\frac","").replace("\\pm","");

        //var val = self.mathQueue.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\\\$&")


        //var tokens = self.mathQueue.split(' ');
        //var chars = "";
        //$.each(tokens, function (t, k) {
        //    if(k.match(/\\/g))
        //    {
                
        //    }
        //    if (c.match(/^[a-zA-Z0-9]+$/)) {
        //        //        //console.log(c);
        //        //    }
        //});
        //var i = -1;
        //while (i++ <= self.mathQueue.length) {
        //    var lastchar = self.mathQueue.charAt(i - 1);
        //    var c = self.mathQueue.charAt(i);
        //    console.log(j);
        //    if (lastchar == '\\') {
        //        var j = i;
        //        for(i = 0)
        //        while (1) {
        //            var ch = self.mathQueue.charAt(j);
        //            console.log(ch);
        //            if (ch != ' ' || ch != '}' || ch != ')' || ch != '{' || ch != '(') {
        //                j++;
        //            }
        //            else {
        //                break;
        //            }

        //        }
        //    }
        //    else {


        //        if (c.match(/^[a-zA-Z0-9]+$/)) {
        //            console.log(c);
        //        }
        //    }
        //}

        console.log(input);
        
    }

    self.updateMath = function () {
        self.QUEUE.Push(HIDEBOX, ["Text", self.math, "\\displaystyle{" + self.mathQueue + "}"], SHOWBOX);
        //$(self.editor).html(self.mathQueue);
        ////var math = MathJax.Hub.getAllJax("math-editor")[0];
        ////self.MathJax.Hub.Queue(["Text", math, "x+1"]);
        //self.MathJax.Hub.Queue(["Typeset", self.MathJax.Hub, "math-editor"], function () { console.log(self.mathQueue); $(self.editor).focus(); self.showCursor(0);});
        //self.MathJax.Hub.Typeset("math-editor", function () { console.log(self.editor);  });
    }

    addSymbol = function (tex) {
        self.mathQueue = "$" + tex + "$";
        self.updateMath();
    }

    var HIDEBOX = function () { }
    var SHOWBOX = function () { }

};





