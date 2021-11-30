//constants
const URLS = {videoGameSales:'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json',
              movieSales:'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json',
              kickStartPledges:'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json'
};

const FILL_COLORS = {
        //colors taken from the free code camp treemap,parallel array with the categories
        /*               3%        12%       21%       30%         39%        48%       57%       66%  */
        videoGames:{ //2600       Wii      NES       GB
            colors:['#d2d2d2','#4c92c3','#ade5a1','#ffc993','#bed2ed','#ff993e','#56b356','#de5253','#d1c0dd','#e992ce','#a985ca','#ffadab','#d0b0a9','#a3786f','#f9c5db','#999999','#c9ca4e','#e2e2a4'],
            categories: ['2600','Wii','NES','GB','DS','X360','PS3','PS2','SNES','GBA','PS4','3DS','N64','PS','XB','PC','PSP','XOne']
        }
};


//CONSTANTS to control the heatMap, acts as a form of options as well
const CONSTANTS = {
    URLS:URLS,
    SVG_WRAPPER_ID:'#graphWrapper',
    HEIGHT:570,
    WIDTH:960,
    LEGEND_W:300,
    LEGEND_H:200,
    COLORS:FILL_COLORS
};

//The heatMap class
class TreeMap{
    constructor(dataSet){
        
        
        //instantiate class variables
        this._instantVar(dataSet);
        
        //build the toolTip
        this._buildToolTip();

        //build the graph
        this._buildGraph(this.vgSales);

        //Color Legend
        this._buildLegend();
    }
    
    //instantitate variables
    _instantVar(dataSet){
        
        this.vgSales = dataSet.vgSales[0];
        this.mvSales = dataSet.mvSales[0];
        this.kickPledges = dataSet.kickPledges[0];
        
    }
    
    //builds a toolTip, places a div on the body
    _buildToolTip(){
        d3.select('body')
        .append('div')
        .attr('id','tooltip')
        .style('opacity',0);
    }
    
    //Builds the graph
    _buildGraph(jsonFile){
        
        
        //build the svg element
        let svg = d3.select('#graphWrapper')
            .append('svg')
            .attr('width',CONSTANTS.WIDTH)
            .attr('height',CONSTANTS.HEIGHT);
        
        let root = d3.hierarchy(jsonFile).sum((d)=>{return d.value}).sort((a,b)=>{return b.value-a.value});
        d3.treemap().size([960,570]).paddingOuter(0.6)(root);
     
        
        //build treemap
        svg.selectAll('g')
            .data(root.leaves())
            .enter()
            .append('g')
            .attr('class','dataG')
            .attr('transform',d=>'translate('+d.x0+','+ d.y0 +')')
            .append('rect')
            .attr('x',(d)=>{return 0})
            .attr('y',(d)=>{return 0})
            .attr('width',(d)=>{return d.x1-d.x0})
            .attr('height',(d)=>{return d.y1-d.y0})
            .attr('class','tile')
            .attr('data-name',d=>d.data.name)
            .attr('data-category',d=>d.parent.data.name)
            .attr('data-value',d=>d.value)
            .style('stroke','white')
            .style('fill',(d)=>{return getColor(d.data.category)})
            .on('mouseover',addToolTip)
            .on('mouseout',removeToolTip);
        
        let allRects = svg.selectAll('rect').filter((d,i)=>i == 1);
        
        //call placeText function
        placeText(svg);
        
        //takes the svg object and the data, and loops thru all rects, adding in text boxes that ensure the text is in new lines
        function placeText(svg){
            //variables
            let length = svg.selectAll('.tile')._groups[0].length; //The number of rects present
            
            //loop thru each rect of the treeMap and place the texts
            for(let i = 0; i < length; i++){
                let activeRect = svg.selectAll('.dataG').filter((d,index)=>{return index == i});
                let name = activeRect.data()[0].data.name;
                let splitName = name.split(' ');               
                let text = activeRect.append('text');
                
                //attach the text boxes
                text.selectAll('tspan')
                    .data(splitName)
                    .enter()
                    .append('tspan')
                    .text(d=>d)
                    .attr('x',d=>5)
                    .attr('y',(d,index)=>10 * (index + 1))
                    .attr("font-size", "10px")
                    .attr("fill", "black")   
                text.on('mouseover',addToolTip)
                    .on('mouseout',removeToolTip);
            }
        }
            
        //returns the color that matches the category
        function getColor(category){
            let color = '';
            for(let i = 0; i < CONSTANTS.COLORS.videoGames.categories.length;i++){
                if(category == CONSTANTS.COLORS.videoGames.categories[i]){
                    color = CONSTANTS.COLORS.videoGames.colors[i];
                }
            }
            return color;
        }
        
        /*
        //draw counties
        svg.selectAll('path')
            .data(geoJson)
            .enter()
            .append('path')
            .attr('fill',(d,i)=>this._getColorIndex(d.id))
            .attr('class','county')
            .attr('data-fips',d=>{return this.education[this._getGeoJsonIndex(d.id)].fips})
            .attr('data-education',d=>{return this.education[this._getGeoJsonIndex(d.id)].bachelorsOrHigher})
            .attr('d',d3.geoPath())
            .on('mouseover',addToolTip)
            .on('mouseout',removeToolTip);
        */
        
        
        
        //adds the tool tip
        function addToolTip(d){
            let toolTip = d3.select('#tooltip');
            let xPos = d3.event.pageX;
            let yPos = d3.event.pageY;
            let leftPadding = 20;
            
            console.log(d);
            //need to find the right index, and assign the needed values, fips is ID in the education array
            toolTip.style('opacity',0.85);
            toolTip.attr('data-value',d.data.value)
            toolTip.html('Name: ' + d.data.name + '<br>Category: ' + d.data.category + '<br>Value:  ' + d.data.value);
            toolTip.style('left',d3.touches);
            toolTip.style('left',xPos + leftPadding + 'px');
            toolTip.style('top',yPos + 'px');
        }
        
        //removes the tool tip
        function removeToolTip(d,index){
            let toolTip = d3.select('#tooltip');
            toolTip.style('opacity',0);
        }  
    }
    
    //returns the index to use for a counties color
    _getColorIndex(countyID){
        //variables
        let loop = true;
        let i = 0;
        let color ='';
        
        //fips is the ID in the education array
        do{
            if(countyID == this.education[i].fips){
                loop = false;
                
                //find the color to use
                for(let j = 0; j < CONSTANTS.COLORS.boundries.length; j++){
                    let bachelorsOrHigher = Math.ceil(this.education[i].bachelorsOrHigher);
                    
                    if(j == 0){
                        if(bachelorsOrHigher < CONSTANTS.COLORS.boundries[j])
                            color = CONSTANTS.COLORS.colors[j];
                    }
                    if(j > 0){
                        if(bachelorsOrHigher >= CONSTANTS.COLORS.boundries[j - 1] && bachelorsOrHigher < CONSTANTS.COLORS.boundries[j]){
                            color = CONSTANTS.COLORS.colors[j];
                        }
                    }
                }
            }
            i++;
        }while(loop)
            return color;
    }
    
    
    
    //Builds the legend for the chart
    _buildLegend(){
        //build the svg element
        let svg = d3.select('#graphWrapper')
            .append('svg')
            .attr('class','legend')
            .attr('width',CONSTANTS.LEGEND_W)
            .attr('height',CONSTANTS.LEGEND_H);
        
        let legend = svg.append('g');

        legend.attr('id','legend');
        legend.attr('transform','translate(0,50)')
        
        //attach a g to the main g for each category/color, and attach the color/texts
        for(let i = 0,row = 0; i < CONSTANTS.COLORS.videoGames.categories.length;i++){
            let g = legend.append('g');
            
            if(i%3 == 0){
                g.attr('transform','translate(0,' + (row * 25)+ ')')
            }
            if(i%3 == 1){
                g.attr('transform','translate(100,' + (row * 25)+ ')')
            }
            if(i%3 == 2){
                g.attr('transform','translate(200,' + (row * 25)+ ')')
                row++;
            }
            g.append('text').text(CONSTANTS.COLORS.videoGames.categories[i]).attr('x',30).attr('y',0);
            g.append('rect')
                .attr('fill',CONSTANTS.COLORS.videoGames.colors[i])
                .attr('height',20)
                .attr('width',20)
                .attr('x',0)
                .attr('y',-15)
                .attr('class','legend-item');
            
            
        }
       

       
    }
}

$(document).ready(function (){
    let treeMap;
    //xhttp calls
    let xhttp = {
        url:CONSTANTS.URLS.videoGameSales,
        dataType:'json'
    };
    let xhttp2 = {
        url:CONSTANTS.URLS.movieSales,
        dataType:'json'
    };
    let xhttp3 = {
        url:CONSTANTS.URLS.kickStartPledges,
        dataType:'json'
    };

    let callBack = function (vgSales,mvSales,kickPledges) {
        let dataSet = {
            vgSales,
            mvSales,
            kickPledges
        };
         
        treeMap = new TreeMap(dataSet);
    }

    //make the xhttp call
    $.when($.get(xhttp),$.get(xhttp2),$.get(xhttp3)).done(callBack);
});