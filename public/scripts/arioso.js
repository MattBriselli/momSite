$(document).ready(function() {
    toolbarStyler();
});

function tmplLoad() {
    $.when(
        $.get('tmpl/header.html', function(data) {
            $('body').prepend(data);
        }),
        $.get('tmpl/leftCol.html', function(data) {
            $('.bodyRow').prepend(data);
        }),
        $.get('tmpl/footer.html', function(data) {
            $('.footerRow').html(data);
        }),
        $.Deferred(function(deferred) {
            $(deferred.resolve);
        })
    ).done(function() {
        toolbarStyler();
    });
}

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