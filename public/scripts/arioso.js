$(document).ready(function() {
    toolbarStyler();
    $(window).resize(heightSetter);
    $(window).trigger("resize");
    // setTimeout(function() {$(window).trigger("resize")}, 1000);
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
        // May be 0 on pages that don't have a footerRow
        footHeight = $(".footerRow:not(.mock)").outerHeight(),
        headRow = $(".headerRow").height(),
        mobileHeadRow = $(".mobileHead").height(),
        buffer = 100;

    var headHeight = (headRow == undefined || headRow == null || headRow == 0) 
        ? mobileHeadRow : headRow;
    footHeight = footHeight == undefined ? 50 : footHeight;

    var total = winHeight - footHeight - headHeight - buffer;
    console.log('win', winHeight, $(document).height());
    console.log('foot', footHeight);
    console.log('head', headHeight);
    console.log('total', total);
    $(".bodyRow").height(total);
}