var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
$(document).ready(function() {
    if (isSafari) {
        // document.body.classList.add('safari-only-testing');
        $('.single-song').addClass('single-song-safari');
    }
});