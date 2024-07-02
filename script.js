const width=840;
const height=680;
let fdata=[];
const margin={top:20,bot:20,left:20,right:5};
const svgWidth = width-margin.left-margin.right;
const svgHeight =height-margin.top-margin.bot;
const container = d3.select('body')
                        .append('div')
                        .style('width',width+'px')
                        .style('height',height+'px');

container.append('text').text('Doping in Professional Bicycle Racing').attr('class','title').attr('id','title');

const svgContainer=container.append('div').attr('class','svg-container');

const svg = svgContainer.append('svg').style('width',svgWidth+20).attr('class','svg').style('height',svgHeight+10);

const toolTip = d3.select('body').append('div').attr('class','tooltip').attr('id','tooltip')

window.onload=()=>{
    fetchData()
}

async function fetchData(){
    try{
        const response =await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json');
        fdata = await response.json();
        drawScatterPlot();
    }catch(e){
        console.log(e);
    }
}

function drawScatterPlot(){
    const years = fdata.map(d=>d.Year);

const tickValuesForYear =d3.range(d3.min(years),d3.max(years)).filter(val=>val%2===0);

const xAxisScale=d3.scaleLinear().domain([d3.min(years)-1,d3.max(years)]).range([0,svgWidth-40]);

const xAxis = d3.axisBottom(xAxisScale).tickValues(tickValuesForYear).tickFormat(d3.format('d'))

svg.append('g')
    .call(xAxis)
    .attr('transform',`translate(${55},${svgHeight-20})`).attr('id','x-axis');

const time = fdata.map(d=>d.Time).map(time=>{
    const [minutes,seconds]=time.split(':').map(Number);
    return minutes*60+seconds;
});


const yAxisScale =d3.scaleLinear().domain([d3.min(time),d3.max(time)]).range([0,svgHeight-55]);

const yAxis = d3.axisLeft(yAxisScale).tickFormat(d=>{
    const minutes = Math.floor(d/60);
    const seconds = d%60;
    return `${minutes}:${seconds.toString().padStart(2,'0')}`;
})

svg.append('g')
    .call(yAxis)
    .attr('transform',`translate(55,35)`).attr('id','y-axis')

svg.selectAll('circle')
    .data(fdata)
    .enter()
    .append('circle')
    .attr('cx',d=>xAxisScale(d.Year)+55)
    .attr('cy',(d,i)=>yAxisScale(time[i]+10))
    .attr('index',(d,i)=>i)
    .attr('r','6')
    .attr('class','dot')
    .attr('data-xvalue',(d,_)=>d.Time)
    .attr('data-yvalue',(d,_)=>d.Year)
    .attr('fill',d=>{
        if(d.Doping.length){
            return '#46F7D7';
        }
        return 'orange'
    }).style('opacity','0.8')
    .attr('stroke','black')
    .on('mouseover',(e)=>{
        const index = e.target.getAttribute('index');
        const rider=fdata[index];
        const sx = e.target.getAttribute('cx');
        const sy = e.target.getAttribute('cy');

        toolTip.html(
            rider.Name+": "+rider.Nationality+'<br>'+
            "Year: "+rider.Year+', '+'Time: '+rider.Time+(rider.Doping ? '<br><br>'+rider.Doping:"")
        ).style('left',(e.pageX+10+'px')).style('top',(e.pageY-10+'px')).transition(900).style('opacity','0.9').attr('data-year',e.target.getAttribute('data-xvalue'))
        
    
    }).on('mouseout',()=>{
        toolTip.transition(900).style('opacity','0')
    })
}

svg.append('text').text('Time in Minutes')
                    .attr('x',-200)
                    .attr('y',15)
                    .attr('transform','rotate(-90)')
                    .style('font-family',"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
                    .style('font-weight','600').attr('id','legend');

svg.append('rect').attr('width',15)
                .attr('height',15)
                .attr('x',svgWidth)
                .attr('y',svgHeight-330)
                .attr('fill','orange');

svg.append('rect').attr('width',15)
                .attr('height',15)
                .attr('x',svgWidth)
                .attr('y',svgHeight-310)
                .attr('fill','#46F7D7');

svg.append('text').text('No Doping Allegations')
                    .attr('x',svgWidth-170)
                    .attr('y',svgHeight-319)
                    .style('font-family',"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif");

svg.append('text').text('Riders With Doping Allegations')
                    .attr('x',svgWidth-230)
                    .attr('y',svgHeight-300)
                    .style('font-family',"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif");

