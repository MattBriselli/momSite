$(document).ready(function() {
    tmplLoad();
    toolbarStyler();
});

function tmplLoad() {
    $(".headerRow").load("tmpl/header.html");
    $(".leftCol").load("tmpl/leftCol.html");
    $(".footerRow").load("tmpl/footer.html");
}

function toolbarStyler() {
    var location = window.location.href.split("/");
    location = location[location.length-1];
    $("a[href='"+location+"']").addClass("active");
}