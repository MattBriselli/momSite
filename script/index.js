$(document).ready(function() {
    toolbarStyler();
});

function toolbarStyler() {
	var location = window.location.href.split("/");
    location = location[location.length-1];
    $("a[href='"+location+"']").addClass("active");
}s