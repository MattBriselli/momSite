$(document).ready(function() {
    searcher();
});

function searcher() {
    $(".searchBar input").on("keyup", function(e) {
        var target = $(e.currentTarget),
            term = target.val();
        target.val().length != 0 ?
            searchFilter(term) :
            $("ul, li").show();
    });
}

function searchFilter(key) {
    key = key.toLowerCase();
    var indexes = $(".repBody ul").each(function() {
        var target = $(this),
            dKey = target.data("key").toLowerCase();
        if (dKey.indexOf(key) == -1) {
            target.find("li").each(function() {
                var text = $(this).text().toLowerCase();
                text.indexOf(key) == -1 ?
                    $(this).hide() :
                    $(this).show();
            });
        } else {
            target.show();
            target.find("li").show();
        }
        target.find("li:visible").length == 0 ?
            target.hide() : target.show();
    });
}