$(document).ready(function() {
    toolbarStyler();
});

function toolbarStyler() {
    var location = window.location.href.split("/");
    location = location[location.length-1];
    location ?
        $(".headerRow a[href='"+location+"']").addClass("active") :
        $(".headerRow a[href='index.html']").addClass("active");

    $(".mobileHead .fa-bars").click(function() {
        $(".mobileMenu").toggleClass("open");
        $(".centerCol").toggleClass("col-sm-8 col-sm-11");
    })
}