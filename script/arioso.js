$(document).ready(function() {
    tmplLoad();
});

function tmplLoad() {
    $.when(
        $.get('tmpl/header.html', function(data) {
            $('.headerRow').html(data);
        }),
        $.get('tmpl/leftCol.html', function(data) {
            $('.leftCol').html(data);
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
    $("a[href='"+location+"']").addClass("active");
}