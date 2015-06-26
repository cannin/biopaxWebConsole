$(document).ready(function() {
    // Setup editors
    outputCm = CodeMirror(document.getElementById("output"), {
        lineNumbers: true,
        mode: { name: "groovy"},
        value: "Output Panel: Script output appears here"
    });

    owlfileCm = CodeMirror(document.getElementById("owlfile"), {
        lineNumbers: true,
        mode: { name: "xml"},
        submitFunction: function() {
            jQuery(".load-file").click();
        },
        styleActiveLine: true
    });

    editor = CodeMirror.fromTextArea(document.getElementById('script'), {
        height: "100%",
        width: "100%",
        continuousScanning: 500,
        lineNumbers: true,
        textWrapping: false,
        mode: { name: "groovy"},
        submitFunction: function() {
            jQuery("#executeButton").click();
        },
        styleActiveLine: true
    });

    warningText = '<!-- NOTE: This is a viewer only; files must be loaded in the script and changes made here are not saved. -->\n';

    // Default content
    jQuery("#script").load("./data/sample.groovy", function(text) {
        editor.setValue(text);
    });

    var owlFilename = "./data/akt_signaling_pathway.owl";
    filenameText = "<!-- FILE: " + owlFilename + " -->\n";

    jQuery("#owl-file-contents").load(owlFilename, function(text) {
        owlfileCm.setValue(warningText + filenameText + text);
    });

    // Sample files
    $("#akt_signaling_pathway").click(function(event) {
        var owlFilename = "./data/akt_signaling_pathway.owl";
        filenameText = "<!-- FILE: " + owlFilename + " -->\n";

        jQuery("#owl-file-contents").load(owlFilename, function(text) {
            owlfileCm.setValue(warningText + filenameText + text);
        });
    });
    $("#biopax3-short-metabolic-pathway").click(function(event) {
        var owlFilename = "./data/biopax3-short-metabolic-pathway.owl";
        filenameText = "<!-- FILE: " + owlFilename + " -->\n";

        jQuery("#owl-file-contents").load(owlFilename, function(text) {
            owlfileCm.setValue(warningText + filenameText + text);
        });
    });

    $("#fanconi_anemia_reactome").click(function(event) {
        var owlFilename = "./data/fanconi_anemia_reactome.owl";
        filenameText = "<!-- FILE: " + owlFilename + " -->\n";

        jQuery("#owl-file-contents").load(owlFilename, function(text) {
            owlfileCm.setValue(warningText + filenameText + text);
        });
    });

    $("#intrinsic_apoptosis_reactome").click(function(event) {
        var owlFilename = "./data/intrinsic_apoptosis_reactome.owl";
        filenameText = "<!-- FILE: " + owlFilename + " -->\n";

        jQuery("#owl-file-contents").load(owlFilename, function(text) {
            owlfileCm.setValue(warningText + filenameText + text);
        });
    });

    $("#raf_map_kinase_cascade_reactome").click(function(event) {
        var owlFilename = "./data/raf_map_kinase_cascade_reactome.owl";
        filenameText = "<!-- FILE: " + owlFilename + " -->\n";

        jQuery("#owl-file-contents").load(owlFilename, function(text) {
            owlfileCm.setValue(warningText + filenameText + text);
        });
    });

    // Run script
    $("#executeButton").click(function(event) {
        $.ajax({
            type: "POST",
            url: "/executor.groovy",
            data: { script: editor.getValue() },
            dataType: "json",
            complete: function (xhr, status) {
                if (status === 'error' || !xhr.responseText) {
                    alert("Error interacting with the server: " + status);
                } else {
                    var data;
                    try {
                        data = $.parseJSON(xhr.responseText);
                    } catch (e) {
                        alert("Impossible to parse JSON response: " + e);
                        data = {executionResult: "", outputText: "", stacktraceText: ""};
                    }

                    if (data.outputText.length > 0) {
                        outputCm.setValue(data.outputText);
                    } else if (data.stacktraceText.length > 0) {
                        outputCm.setValue(data.stacktraceText);
                    } else {
                        outputCm.setValue("ERROR: Output could not be parsed");
                    }
                }
            }
        });
    });

    // Resize editors
    // Taken from: http://jsfiddle.net/xBjnY/122/
    window.onresize = resize;
    resize();

    function resize() {
        var h = (window.innerHeight || (window.document.documentElement.clientHeight || window.document.body.clientHeight));
        var divHeight = 20 + $("#div_left").height();//20=body padding:10px
        $("#content").css({ "min-height": h - divHeight + "px" });
        $("#div_vertical").css({ "height": h - divHeight + "px" });
        $("#LeftPanel").css({ "height": h - divHeight + "px" });
        $("#RightPanel").css({
            "height": h - divHeight + "px",
            "width": $("#content").width() - $("#LeftPanel").width() - $("#div_vertical").width() + "px"
        });
    }

    jQuery.resizable = function(resizerID, vOrH){
        jQuery('#' + resizerID).bind("mousedown", function(e){
            var start = e.pageY;
            if(vOrH=='v') start = e.pageX;
            jQuery('body').bind("mouseup", function(){
                jQuery('body').unbind("mousemove");
                jQuery('body').unbind("mouseup");

            });
            jQuery('body').bind("mousemove", function(e){
                var end = e.pageY;
                if(vOrH=='v') end = e.pageX;
                if(vOrH=='h'){
                    jQuery('#' + resizerID).prev().height(jQuery('#' + resizerID).prev().height()+ (end-start));
                    jQuery('#' + resizerID).next().height(jQuery('#' + resizerID).next().height()- (end-start));
                }
                else{
                    jQuery('#' + resizerID).prev().width(jQuery('#' + resizerID).prev().width()+ (end-start));
                    jQuery('#' + resizerID).next().width(jQuery('#' + resizerID).next().width()- (end-start));
                }
                start = end;
            });
        });
    }

    jQuery.resizable('div_vertical', "v");
    jQuery.resizable('div_right', "h");
    jQuery.resizable('div_left', "h");

    var $loading = $('#loadingDiv').hide();

    // NOTE: waitingDialog from waitingDialog.js
    $(document)
        .ajaxStart(function () {
            //$loading.show();
            waitingDialog.show('Running ...', { dialogSize: 'sm', progressType: 'info' });
        })
        .ajaxStop(function () {
            //$loading.hide();
            waitingDialog.hide();
        });

    //$('#textarea-container').tooltip({
    //    animated: 'fade',
    //    placement: 'right'
    //});
    //
    //$('#output').tooltip({
    //    animated: 'fade',
    //    placement: 'right'
    //});
    //
    //$('#owlfile').tooltip({
    //    animated: 'fade',
    //    placement: 'left'
    //});
    //
    //$('#snippets').tooltip({
    //    animated: 'fade',
    //    placement: 'left'
    //});
});
