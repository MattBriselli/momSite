$(document).ready(function() {
    toolbarStyler();
    $(window).resize(heightSetter);
    $(window).trigger("resize");
});

function toolbarStyler() {
    var location = window.location.href.split("/");
    location = location[location.length-1];
    location ?
        $(".headerRow a[href='"+location+"']").parent().parent().addClass("active") :
        $(".headerRow a[href='index.html']").parent().parent().addClass("active");

    $(".mobileHead .fa-bars").click(function() {
        $(".mobileMenu").toggleClass("open");
        $(".centerCol").toggleClass("col-sm-8 col-sm-11");
    });
}

function heightSetter() {
    var winHeight = $(window).height(),
        winWidth = $(window).width(),
        // May be 0 on pages that don't have a footerRow
        footHeight = $("div:not(.hidden) .footerRow:not(.mock)").outerHeight(),
        buffer = footHeight == undefined ? 20 : 30;

    footHeight = footHeight == undefined ? 50 : footHeight;
    var total = winHeight - footHeight - buffer;

    $(".bodyRow").height(total);
    $(".lowerBody").height(total - 60);

    if ($(".active .headLink a[href='index.html']").length == 1) {
        $(".lowerBody").height(total - 75);
        if (winWidth <= 950) {
            console.log(winWidth);
            $(".footerRow").css("display", "flex");
            $(".footerRow").parent().addClass("shown").removeClass("hidden");
        } else {
            $(".footerRow").hide();
            $(".footerRow").parent().removeClass("shown").addClass("hidden");
        }
    }

    var centerWid = $(".centerCol").width();
    var centerAdj = Math.min(400, centerWid - 40);
    var heightRange = centerAdj / 313;


    $(".mobileHead img").width(centerAdj);
    $(".mobileHead img").height(heightRange * 45);
}