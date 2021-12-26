$(document).ready(function() {
    searcher();
});

function searcher() {
    $(".searchBar input").on("keyup", function(e) {
        var target = $(e.currentTarget),
            term = target.val();
        if (target.val().length != 0) {
            searchFilter(term)
        } else {
            $(".box, ul, li").show();
            $(".rightList").show();
            $(".leftList").show();
        }
    });
}

function showEmAll() {
    $(".repBody .box, ul, li").show();
    $(".leftList").show();
    $(".rightList").show();
}

function searchFilter(key) {
    key = key.toLowerCase();
    showEmAll();
    var indexes = $(".repBody ul").each(function() {
        var target = $(this),
            dKey = target.data("key").toLowerCase(),
            visibleOne = false;
        if (dKey.indexOf(key) == -1) {
            target.find("li").each(function() {
                var text = $(this).text().toLowerCase();
                if (text.indexOf(key) == -1) {
                    $(this).hide();
                } else {
                    $(this).show();
                    visibleOne = true;
                }
            });
        } else {
            target.show();
            target.find("li").show();
        }
        target.find("li:visible").length == 0 ? target.hide() : target.show();
       // Show the boxes
        if (visibleOne) {
            target.parents(".box").show();
            target.parents(".leftList").show();
            target.parents(".rightList").show();
        }
        // Hide the boxes
        if (target.parents(".box .leftList").find("li:visible").length == 0) {
            target.parents(".box .leftList").hide();
            $(target.parents(".box .rightList")).css("float", "left");
        }
        if (target.parents(".box .rightList").find("li:visible").length == 0) {
            target.parents(".box .rightList").hide();
        } 
        if (target.parents(".box").find("li:visible").length == 0) {
            target.parents(".box").hide();
        }
    });
}