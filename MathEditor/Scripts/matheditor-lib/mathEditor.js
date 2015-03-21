var MathEditor = function () {
    var self = this;
    self.editor = null;    
    self.mathQueue = "$\\phantom x$";
    self.lastCursorPos = 0;
    self.elementCount = 0;
    self.parser = null;
    self.MathJax = null;
    

    self.init = function (element, mathjax, initialMath) {
        self.MathJax = mathjax;
        self.editor = element;
        self.parser = TeXParser();
        self.updateMath();
        
        $(element).keypress(function (e) {
            self.processInput(e.which);
        })

        $(element).keydown(function (e) {
            self.onKeyDown(e.which);
        })

        
    };

    self.showCursor = function (pos) {
        var mathElements = $(self.editor).find($("span[class^='mi'],span[class^='mo'],span[class^='mn'],span[class^='mfrac'],span[class^='mphantom']"));
        var idList = [];
        $(mathElements).length;
        $.each(mathElements, function (t, i) {
            if ($(i).text().length > 0) {
                
                var id = "#" + $(i).attr("id");
                idList.push($(i));
                $(id).removeClass("selection");
            }

            //if()
        });

        self.elementCount = idList.length;            
        $(idList[pos]).addClass("selection");     
    }

    self.onKeyDown = function (keyCode) {
        console.log(keyCode);
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
    }

    self.processInput = function (input) {

        
    }

    self.updateMath = function () {
        $(self.editor).html(self.mathQueue);
        
        self.MathJax.Hub.Typeset("editor", function () { self.showCursor(0) });
    }

    self.animateCursor = function () {
        //animate the cursor
    }

};

//(function ($) {
//    $.fn.mathEditor = function (options) {
        
//    };
//}(jQuery));