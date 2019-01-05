$(document).ready(function() {
    toolbarStyler();
    heightSetter();
    $(window).resize(heightSetter);
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

function heightSetter() {
    var winHeight = $(window).height(),
        footHeight = $(".footerRow").height(),
        headHeight = 45,
        buffer = 30,
        total = winHeight - (footHeight == null ? 0 : footHeight) - headHeight - buffer;
    $(".bodyRow").height(total);
}