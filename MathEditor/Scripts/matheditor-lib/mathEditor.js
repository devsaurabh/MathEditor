var MathEditor = function (mathjax,placeholder) {
    var self = this;
    self.MathJax = mathjax;   

   

    /*****************Variable Devlarations******************/    
    self.mathChanged = true;
    self.mathElementList = [];    
    self.editor = null;
    self.placeholder = placeholder;    
    self.lastCursorPos = 0;
    self.elementCount = 0;
    self.parser = null;    
    self.basicMathSymbols = []
    self.QUEUE = mathjax.Hub.queue;
    self.math = null;
    
    
    self.bufferEditor = null;
    self.mathQueue = null;
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
        var holder = '<div class="well math-editor" style="margin-top:5px" visibility:hidden; id="math-editor" tabindex=1></div>'
        var buffer = '<div id="MathBuffer" class="well math-editor" style="margin-top:5px" visibility:hidden; tabindex=2></div>'

        var editor = colStart + tabs + basicTools + holder + buffer + colEnd;
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
        self.bufferEditor = $("#MathBuffer")

        // intialize the tex parse (work need to be done)
        self.parser = new TeXParser();
        $(self.editor).html(self.parser.getTeXString());
        self.parser.getTextAtPos();

        //MathJax.Hub.Queue(["Typeset", MathJax.Hub, "math-editor"], function () { self.showCursor(0)});

        self.QUEUE.Push(function () {
            self.updateMath();
            self.math = self.MathJax.Hub.getAllJax("math-editor")[0];
           
        });

        self.MathJax.Hub.Register.MessageHook("End Process", self.updateMath);

        // load the starting math in the math editor
        //self.updateMath();

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
            console.log(mathElements);
            self.mathElementList = [];
            $.each(mathElements, function (t, i) {
                if ($(i).text().length > 0) {                    
                    var id = "#" + $(i).attr("id");
                    if ($(id).parent().parent().hasClass("mphantom") == false) {
                        self.mathElementList.push(id);
                     
                    }
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
        console.log(self.math);
        $(self.editor).focus();
        self.showCursor(self.lastCursorPos);
    }

    addSymbol = function (tex) {
        
        self.mathChanged = true;
        self.parser.insert(self.lastCursorPos, tex);
        var rawString = self.parser.getTeXString().replace(/\$/g, "");
        //self.QUEUE.Push(["Text", math, rawString]);
        self.MathJax.Hub.Queue(["Text", self.math, rawString]);       
    }

   
};

var TeXParser = function () {
    var self = this;
    self.texString = "$ ( x + y ) ^2 \\pm \\Big( { p \\over q } - \\sqrt { \\phantom{x} } \\Big) ^3 $";    
    self.newLineChar = "\\phantom { x }";    

    //self.append = function (symbol, inGroup) {
    //    var currentTex = self.texString;
    //    if (inGroup) {
    //        // check the last character
    //        var lastChar = currentTex.charAt(currentTex.length - 1);
    //        if (lastChar == '}') {
    //            var secondLastChar = currentTex.charAt(currentTex.length - 2);
    //            //if()
    //        }
    //    }
    //};

    self.append = function (symbol, position) {

        var block = "{" + synbol + "}";
        self.texString += block;
    };

    self.insert = function (pos, symbol) {
        var allTokens = self.getAllTokens();
        var validTokens = allTokens.filter(function (tk) { return tk[2] == true; });
        var matchToken = validTokens[pos];
        console.log(matchToken);
        //alert((matchToken[1]));
        var modToken = [symbol, matchToken[1], false];
        allTokens[modToken[1]] = modToken;
        
        var str = ""
        $.each(allTokens, function (a, b) {
            str += " " + b[0];
        });
        self.texString = str;
    }
    

    self.getTeXString = function () {
        
        var rawString = self.texString.replace(/\$/g, "")
        if (rawString.length == 0) {
           return "$" + self.newLineChar + "$";
        }
        else {
            return "$" + rawString + self.newLineChar + "$";
        }
        //return self.texString;
    }

   

    self.getTextAtPos = function (pos) {
        var allTokens = self.getAllTokens();
        var validTokens = allTokens.filter(function (tk) { return  tk[2] == true; });        
    }

    self.getAllTokens = function () {
        var rawString = self.texString;
        var allTokens = [];
        $.each(rawString.split(' '), function (a, b) {            
            if (b != "$" && b != " " && b != "{" && b != "}" && b != "[" && b != "]") {
                allTokens.push([b, a, true]);
            }
            else {
                allTokens.push([b, a, false]);
            }
        });
        return allTokens;
    }

    self.getGroups = function () {
        var rawString = self.texString.replace(/\$/g, "")
        var allTokens = [];
        $.each(rawString.split(' '), function (a, b) {
            
            //b = b.replace("{", "").replace("}", "").replace("[", "").replace("]", "");
            if (b != "" || b != " " || b != "{" || b != "}" || b != "[" || b != "]") {
                allTokens.push([b, a, true])
            }
            else {
                allTokens.push([b, a, false])
            }
        });

        console.log(allTokens);
    }
}




