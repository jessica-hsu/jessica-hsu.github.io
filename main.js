$(document).ready(function() {		//do this when document has finished loading
	$("#flip").click(function() {
		$("#panel").slideToggle("slow");
	});
	
	$('a').click(function() {
	    var href = $.attr(this, 'href');
	    $("html, body").animate({
	        scrollTop: $(href).offset().top
	    }, 1000, function () {
	        window.location.hash = href;
	    });
	    return false;
	});
	


});

