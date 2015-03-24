var mathmlEditor = function () {
    var self = this;
    self.editor = null;
    self.editMode = false;
    self.oldData = null;
    self.mathQueue = "";
    self.lastCursorPos = 0;
    

    self.init = function (jQueryElement) {
        
        self.editor = $(jQueryElement);
        $(self.editor).bind("keydown", function (event) { self.onKeyDown(event.keyCode); });
        $(jQueryElement).bind("click", function (e) {           
            if (self.editMode == false) {
                var x = e.pageX - this.offsetLeft;
                var y = e.pageY - this.offsetTop;
                var elem = document.elementFromPoint(e.pageX - window.pageXOffset, e.pageY - window.pageYOffset)
                if (elem != null || elem != undefined) {
                    
                    var className = $(elem).attr("class");
                    console.log(className);
                    if (className != undefined && className.substring(0, 1) == 'm') {
                        self.editMode = true;
                        self.oldData = elem;


                        var width = $(elem).width() + 4;
                        var height = $(elem).height() + 4;
                        var fontfamily = $(elem).css("font-family");
                        var fontsize = $(elem).css("font-size");
                        var left = $(elem).css("left");
                        var top = $(elem).css("top");
                        
                        var inputElement = "<input id='math-editor' style='display:inline; position:static; width: " + width + "px; height: " + height +
                            "px;font-size: " + fontsize + "; font-family: " + fontfamily +
                            "; left: " + left + "; top: " + top + "; vertical-align:0;  line-height:normal' onblur='removeEditor()' type='text' value='" + $(elem).html() + "'/>"
                       
                        
                        $(elem).replaceWith(inputElement)
                        //$("#math-editor").css(allStyles)
                        $('#math-editor').focus();
                    }
                }
            }
        });
    }

    self.showCursor = function () {

    };

    self.getTotalLength = function () {
        return self.mathQueue.replace('{', '').replace('}','');
    }

    
    self.onKeyDown = function (keyCode) {
        console.log(keyCode);
        if (keyCode == 37) {
            self.lastCursorPos--;
        }
        else if (keyCode == 39) {
            self.lastCursorPos++;
        }
        
    }

    removeEditor = function () {
        if (self.oldData != undefined) {
            $(self.oldData).html($('#math-editor').val())
            $('#math-editor').replaceWith(self.oldData);
            self.editMode = false;
        }
    };

}


