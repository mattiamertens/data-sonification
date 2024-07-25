import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const width = document.documentElement.clientWidth;
const height = document.documentElement.clientHeight;

const pic_dots = d3.select(".dots")
    // .attr("width", width)
    // .attr("height", height)
    // .attr("viewBox", `${-width/2} ${-height/2} ${width} ${height}`)
    // .attr("preserveAspectRatio", "xMinYMin meet");

d3.json("assets/bio.json").then(dataDots =>{
    updateDots(dataDots);
})

function updateDots(dataDots){

    // const node = pic_dots.append("div")
    //     .attr("class", "cerchio")
    //     .selectAll("div")
    //     .data(dataDots)
    //     .enter().append("div")

    const node = pic_dots
        .selectAll("div")
        .data(dataDots)
        .enter().append("div")
        .attr("class", "cerchio")
        .on("click", function(event, d){
            console.log(d);
            $('.about-img').attr('src', 'assets/pics/resized/'+d.Foto+'.jpg');
            $('.bio-text')[0].innerHTML = d.Bio;
        });

}