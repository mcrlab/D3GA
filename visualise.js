function getColor(i) {
    var colors = [
        [254, 224, 201],
        [240, 186, 149],
        [158, 120, 95],
        [94, 62, 42],
        [128, 130, 133],
        [243, 247, 248],
        [255, 244, 80],
        [247, 143, 49],
        [238, 49, 45],
        [177, 28, 84],
        [106, 37, 105],
        [239, 91, 161],
        [181, 185, 53],
        [137, 183, 127],
        [17, 170, 88],
        [128, 201, 210],
        [38, 189, 207],
        [26, 115, 186]
    ];

    var i = Math.floor(Math.random() * colors.length);
    var c = "rgb(" + colors[i][0] + "," + colors[i][1] + "," + colors[i][2] + ")";
    return c;
}

var w = window.innerWidth,
    h = window.innerHeight;

var svg = d3.select("#body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

window.onresize = function() {
    w = window.innerWidth;
    h = window.innerHeight;
    svg.attr("width", w)
        .attr("height", h);

};

var nodes = d3.range(1).map(function() {
        return {
            radius: Math.random() * 15 + 4
        };
    }),
    force;


force = d3.layout.force()
    .gravity(0.05)
    .charge(function(d, i) {
        return i ? 0 : -5000;
    })
    .nodes(nodes)
    .size([w, h]);


var root = nodes[0];
root.radius = 50;
root.fixed = true;

force.start();


svg.selectAll("circle")
    .data(nodes.slice(1))
    .enter().append("svg:circle")
    .attr("r", function(d) {
        return d.radius;
    })
    .style("fill", function(d, i) {
        return getColor();
    });


svg.selectAll("path")
.data(nodes.slice(1))
.enter().append('svg:path').attr('d', "M412.201,311.406c0.021,0,0.042,0,0.063,0c0.067,0,0.135,0,0.201,0c4.052,0,6.106-0.051,8.168-0.102c2.053-0.051,4.115-0.102,8.176-0.102h0.103c6.976-0.183,10.227-5.306,6.306-11.53c-3.988-6.121-4.97-5.407-8.598-11.224c-1.631-3.008-3.872-4.577-6.179-4.577c-2.276,0-4.613,1.528-6.48,4.699c-3.578,6.077-3.26,6.014-7.306,11.723C402.598,306.067,405.426,311.406,412.201,311.406")
      .attr('transform', 'scale(' + 100 + ') translate( 0, 0)')
      .style("fill", function(d, i) {
        return getColor();
        });
  

force.on("tick", function(e) {
    var q = d3.geom.quadtree(nodes),
        i = 0,
        n = nodes.length;

    while (++i < n) {
        q.visit(collide(nodes[i]));
    }

    svg.selectAll("circle")
        .attr("cx", function(d) {
            return d.x;
        })
        .attr("cy", function(d) {
            return d.y;
        });
});


function add() {
    nodes.push({
        radius: Math.random() * 4 + 4
    })
    svg.selectAll("circle")
        .data(nodes.slice(1))
        .enter().append("svg:circle")
        .attr("r", function(d) {
            return d.radius - 2;
        })
        .style("fill", function(d, i) {
            return getColor(i % 3);
        });
    force.start();

}


function remove() {
    nodes.pop();
    svg.selectAll("circle")
        .data(nodes.slice(1))
        .exit().remove();
    force.start();
}


svg.on("mousemove", function() {
    var p1 = d3.svg.mouse(this);
    root.px = p1[0];
    root.py = p1[1];
    force.resume();
});


function collide(node) {
    var r = node.radius + 8,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
                y = node.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = node.radius + quad.point.radius + 10;
            if (l < r) {
                l = (l - r) / l * .5;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
            }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
}




gapi.analytics.ready(function() {

    gapi.analytics.auth.authorize({
        container: 'embed-api-auth-container',
        clientid: '255627075968-fs78r32me2ld9vv24c7f9894c9olflj5.apps.googleusercontent.com'
    });

    var activeUsers = new gapi.analytics.ext.ActiveUsers({
        container: 'active-users-container',
        pollingInterval: 5
    });

    activeUsers.once('success', function() {

        this.on('change', function(data) {
            if (data.delta > 0) {
                console.log("adding " + data.delta);
                for (var i = 0; i < data.delta; i++) {
                    add();
                }
            } else if (data.delta < 0) {
                console.log("removing " + (data.delta * -1));
                for (var i = 0; i < (data.delta * -1); i++) {
                    remove();
                }

            }

        });
    });

    var viewSelector = new gapi.analytics.ext.ViewSelector2({
            container: 'view-selector-container',
        })
        .execute();

    viewSelector.on('viewChange', function(data) {
        activeUsers.set(data).execute();
    });


});