/// <reference path="../jquery-1.10.2.intellisense.js" />


var MathCharacters = function () {
    var self = this;
    self.mathQueue = ""
    self.basicMathSymbols = []
    self.MathJax = null;


    self.init = function (mathjax) {
        // add all basic math symbols
        self.basicMathSymbols = self.getAllbasicMathSymbols();
        self.MathJax = mathjax;
    };
    
    self.bindBasicSymbols = function (element) {

        var basic = self.getAllbasicMathSymbols();
        $.each(basic, function (key, value) {
            var button = '<button type="button" onclick="(\'' + value[2] + '\')" class="btn btn-default" data-toggle="tooltip" data-placement="left" title="' + value[0] + '">' + value[1] + '</button>';
            $(element).append(button);
        });
    };

    self.getAllbasicMathSymbols = function () {
        var symbols = [];
        symbols.push(['equality', '=','=']);
        symbols.push(['inequality', '&#8800;','\\\\ne']);
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
        symbols.push(['plus - minus', '&#177;', '\\\\pm']);
        //symbols.push(['minus - plus', ')']);
        symbols.push(['multiplication', '*', '\\\\ast']);
        symbols.push(['multiplication', '&#215;', '\\\\times']);
        symbols.push(['division', '/', '/']);
        symbols.push(['division', '&#247;', '\\\\div']);
        symbols.push(['division', '&#247;', '\\\\sqrt{\\\\phantom{x}}']);
        symbols.push(['division', '&#247;', '\\\\phantom{x} \\\\over \\\\phantom{y}']);

        return symbols;
    }

    getSymbol = function (symbol) {
        self.mathQueue += symbol;
        var math = "$" + self.mathQueue + "$";
        console.log(self.mathQueue);
        document.getElementById("editor").innerHTML = math;
        self.MathJax.Hub.Queue(["Typeset", self.MathJax.Hub, "editor"]);
    }

    
}

var TeXParser = function () {
    var self = this;
    self.texString = "";

    self.append = function (symbol, inGroup) {
        var currentTex = self.texString;
        if (inGroup) {
            // check the last character
            var lastChar = currentTex.charAt(currentTex.length-1);
            if (lastChar == '}') {
                var secondLastChar = currentTex.charAt(currentTex.length - 2);
                //if()
            }
        }
    };

    self.append = function (symbol) {        
        var block = "{" + synbol + "}";
        self.texString += block;       
    };

    self.insert = function (pos, symbol) {
        var output = [self.texString.slice(0, pos), symbol, self.texString.slice(pos)].join('');
        self.texString = output;
    }

    self.isVariable = function(char){
        
    }
}






