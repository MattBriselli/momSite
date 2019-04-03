$(document).ready(function() {
    searcher();

});

function searcher() {
    $(".searchBar input").on("keyup", function(e) {
        var target = $(e.currentTarget),
            term = target.val();
        target.val().length != 0 ? searchFilter(term) : $(".box, ul, li").show();
    });
}

function searchFilter(key) {
    key = key.toLowerCase();
    $(".repBody .box, ul, li").show();
    var indexes = $(".repBody ul").each(function() {
        var target = $(this),
            dKey = target.data("key").toLowerCase();
        if (dKey.indexOf(key) == -1) {
            target.find("li").each(function() {
                var text = $(this).text().toLowerCase();
                text.indexOf(key) == -1 ? $(this).hide() : $(this).show();
            });
        } else {
            target.show();
            target.find("li").show();
        }
        target.find("li:visible").length == 0 ? target.hide() : target.show();
        if (target.parents(".box").find("li:visible").length == 0) {
            // console.log("hiding: " + target.parents(".box"));
            target.parents(".box").hide();
        } else {
            // console.log("else: " + target.parents(".box"));
            // console.log(target.parents(".box").find("li:visible"));
            target.parents(".box").show();
        }
    });

}