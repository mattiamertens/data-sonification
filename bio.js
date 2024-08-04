import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const pic_dots = d3.select(".dots")

d3.json("assets/bio.json").then(dataDots =>{
    updateDots(dataDots);
    $('.cerchio').first().addClass('active');
})

function updateDots(dataDots){

    const node = pic_dots
        .selectAll("div")
        .data(dataDots)
        .enter().append("div")
        .attr("class", "cerchio")
        .on("click", function(event, d){
            $('.about-img').attr('src', 'assets/pics/resized/'+d.Foto+'.jpg');
            $('.bio-text')[0].innerHTML = d.Bio;
            $(this).addClass('active');
            $(this).siblings().removeClass('active');
        });

}
