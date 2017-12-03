$(document).ready(function() {
    $("button.submit").on("click", function() {
        $(form).ajaxSubmit({
            type:"POST",
            data: $(form).serialize(),
            url:"process.php",
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