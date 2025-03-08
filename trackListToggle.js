// TRACKLIST TOGGLE
var showTracks = document.getElementsByClassName('show-tracks')[0];
var hideTracks = document.getElementsByClassName('visibilityToggle')[0];
var wrapperLength = document.getElementsByClassName('cta-wrapper')[0].offsetHeight + 16;
var slideAmount = wrapperLength + 16;

$(showTracks).on('click', function(){
    $('.track-container').addClass('container-visible');
    console.log(wrapperLength);
    
    
    setTimeout(() => {
        $('.track-container').css({
            "-webkit-transform": `translate(-0%, -${wrapperLength}px)`
        });
    }, 50);
    console.log('showing tracks');
});

$(hideTracks).on('click', function(){
    $('.track-container').css({
        "-webkit-transform":`translate(-0%, ${wrapperLength}px)`
    });
    
    setTimeout(() => {
        $('.track-container').removeClass('container-visible');
    }, 200);
    console.log('hiding tracks');
});