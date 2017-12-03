$(document).ready(function() {
    $(".bottom img").tipsy({ gravity: "s" });

    $("button.submit").on("click", function() {
        $(".bottom .form").ajaxSubmit({
            type: "POST",
            data: $(".bottom .form").serialize(),
            url: "process.php",
            success: function() {
                $('#contact :input').attr('disabled', 'disabled');
                $('#contact').fadeTo( "slow", 0.15, function() {
                    $(this).find(':input').attr('disabled', 'disabled');
                    $(this).find('label').css('cursor','default');
                    $('#success').fadeIn();
                });
            },
            error: function() {
                $('#contact').fadeTo( "slow", 0.15, function() {
                    $('#error').fadeIn();
                });
            }
        });
    });
});