var CANVAS_WIDTH = 640;
var CANVAS_HEIGHT = 480;
var FPS = 60;
var updateRate = 60;
var startSpeed = 5.0;
var speed = startSpeed;
var score = 0;
var running = false;
var gameOverBool = false;
var shadowAlpha = 0.1;
var SCOREMODE = 0;
var distance0 = 0;

var scoreElement = document.getElementById("score");
var canvasElement = $("<canvas width='" + CANVAS_WIDTH +
    "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvas = canvasElement.get(0).getContext("2d");
canvasElement.appendTo(document.getElementById("game"));

var instructions = "Instructions:<br> > Use left/right arrow or A/D keys to control your character <br> > Press up arrow or W to speed up";
var instructionElement = $("<p id='instructions'>"+instructions+"</p>");
//instructionElement.appendTo(document.getElementById("game"));
drawStartScreen();

var obstacles =	 [];
var followers = [];

setInterval(function() {
    if (running) {
        update();
    }
}, 1000 / updateRate);
setInterval(function() {
    if (running) {
        draw();
    }
}, 1000 / FPS);
setInterval(function() {
    if (keydown.space && !running){
			reset();
	}
	if(keydown.p && !gameOverBool){
		running = !running;
	}
}, 100);

var player = {
    color: "#508494",
    trail: [],
    width: 10,
    height: 10,
    x: CANVAS_WIDTH / 2 - 10,
    y: (CANVAS_HEIGHT / 2),
    xVelocity: 0.0,
    yVelocity: 0.0,
    maxXSpeed: 5,
    maxYSpeed: 15,
    draw: function() {
		this.trail.forEach(function(particle) {
            particle.draw();
        });
		
        canvas.fillStyle = this.color;
        canvas.fillRect(this.x, this.y, this.width, this.height);
		
		canvas.globalAlpha = shadowAlpha;
		for(var i=0; i < 5; i++){
			canvas.fillRect(this.x+i, this.y+i, this.width, this.height);
		}
		canvas.globalAlpha = 1;
    },

    updateTrail: function() {
        this.trail = this.trail.filter(function(trailParticle) {
            return trailParticle.active;
        });
		
		this.trail.push(Particle({}, this));

        this.trail.forEach(function(trailParticle) {
            trailParticle.update();
            trailParticle.move(0, speed);
        });
    },

    move: function() {
        this.xVelocity = this.xVelocity.clamp(0 - this.maxXSpeed, this.maxXSpeed);
        this.yVelocity = this.yVelocity.clamp(0 - this.maxYSpeed, this.maxYSpeed);
		
        this.x += this.xVelocity;
        this.y += this.yVelocity;
        this.x = this.x.clamp(0, CANVAS_WIDTH - this.width);
        this.y = this.y.clamp(0, CANVAS_HEIGHT - this.height);
        this.updateTrail();
    },

    midpoint: function() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
};

function Particle(I, obj) {
    I = I || {};
    I.active = true;
    I.maxAge = 100;
    I.age = I.maxAge;
    I.color = "#323232";
    I.size = obj.width / 3;
    I.x = obj.midpoint().x;
    I.y = obj.midpoint().y;

    I.draw = function() {
        var tempsize = 0
        tempsize = I.age / I.maxAge * I.size;
        if (tempsize > .1) {
            canvas.globalAlpha = I.age / (I.maxAge * 1.1);
            canvas.beginPath();
            canvas.fillStyle = I.color;
            canvas.arc(I.x, I.y, tempsize, 0, 2 * Math.PI, false);
            canvas.fill();
            canvas.globalAlpha = 1;
        }
    }

    I.update = function() {
        I.age--;
        if (I.age < 0)
            I.active = false;
    }

    I.move = function(x0, y0) {
        I.x += x0;
        I.y += y0;
        if (I.y > CANVAS_HEIGHT)
            I.active = false;
    }

    return I;
}

function Follower(I) {
    I = I || {};
	I.trail = [];
    I.safe = true;
    I.active = true;
    I.dangers = [];
    I.color = "#d44a27";
    I.width = 12;
    I.height = 12;
    I.x = Math.random() * CANVAS_WIDTH;
    I.y = CANVAS_HEIGHT + 50;
    I.xVelocity = 0.0;
    I.yVelocity = 0.0;
    I.maxXSpeed = 5;
    I.maxYSpeed = 10;
    I.draw = function() {
		this.trail.forEach(function(particle) {
            particle.draw();
        });
		
        canvas.fillStyle = I.color;
        canvas.fillRect(I.x, I.y, I.width, I.height);
		
		canvas.globalAlpha = shadowAlpha;
		for(var i=0; i < 5; i++){
			canvas.fillRect(this.x+i, this.y+i, this.width, this.height);
		}
		canvas.globalAlpha = 1;
    }

    I.move = function() {
        I.xVelocity = I.xVelocity.clamp(0 - I.maxXSpeed, I.maxXSpeed);
        I.yVelocity = I.yVelocity.clamp(0 - I.maxYSpeed, I.maxYSpeed);

        I.x += I.xVelocity;
        I.y += I.yVelocity;
        I.x = I.x.clamp(0, CANVAS_WIDTH - I.width);
        //I.y = I.y.clamp(0, CANVAS_HEIGHT + 50);
		I.updateTrail();
    }

    I.midpoint = function() {
            return {
                x: I.x + I.width / 2,
                y: I.y + I.height / 2
            };
        },

    I.avoid = function(obstacle) {
            var distance = obstacle.midpoint().x - I.midpoint().x;
            var time = 0.5 * Math.abs(obstacle.midpoint().y - I.midpoint().y);
            I.xVelocity -= 0.5 * (distance / time);

            if (I.x > CANVAS_WIDTH - I.width - 20)
                I.xVelocity -= 2;
            if (I.x < 0 + 20)
                I.xVelocity += 2;
        },

    I.checkSafe = function() {
            var vectors = [];
            var px = I.midpoint().x;
            var py = I.midpoint().y

            var r1 = line(px, py, 0 + px, py - 300);
            var r2 = line(px, py, -35 + px, py - 50);
            var r3 = line(px, py, 35 + px, py - 50);
            var r4 = line(px, py, -20 + px, py - 240);
            var r5 = line(px, py, 20 + px, py - 240);
            vectors.push(r1);
            vectors.push(r2);
            vectors.push(r3);
            vectors.push(r4);
            vectors.push(r5);

            var tempSafe = true;
            obstacles.forEach(function(obstacle) {
                vectors.forEach(function(vect) {
                    //drawRay(vect);
                    var r = rectangle(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    var l = line(vect.x1, vect.y1, vect.x2, vect.y2);
                    if (isIntersecting(r, l)) {
                        tempSafe = false;
                        I.avoid(obstacle);
                    }
                });
            });
            if (tempSafe) {
                if (I.y < CANVAS_HEIGHT) {
                    var distanceToPlayer = Math.sqrt(Math.pow(player.x - I.x, 2) + Math.pow(player.y + I.y , 2));
                    var acceleration = distanceToPlayer/3;
                    
                    if (I.x < player.x)
                        I.xVelocity += 0.04; // = 0.75
                    else if (I.x > player.x)
                        I.xVelocity += -0.04; // = 0.75
                    else
                        I.xVelocity = 0;
                }

                if (I.y < player.y)
                    I.yVelocity = 0.3;
                else if (I.y > player.y)
                    I.yVelocity = -0.3;
                else
                    I.yVelocity = 0;

                followers.forEach(function(follower) {
                    var dist = Math.sqrt(Math.pow(follower.x - I.x, 2) + Math.pow(follower.y - I.y, 2));
                    if (Math.abs(dist) < 30) {
                        if (I.x < follower.x)
                            I.xVelocity = -0.3;
                        else if (I.x > follower.x)
                            I.xVelocity = 0.3;
                    }
                });
            }
        }
	
	I.updateTrail = function() {
        I.trail = I.trail.filter(function(trailParticle) {
            return trailParticle.active;
        });
		
		I.trail.push(Particle({}, I));

        I.trail.forEach(function(trailParticle) {
            trailParticle.update();
            trailParticle.move(0, speed);
        });
    }
    
	return I;
}

function Obstacle(I) {
    I = I || {};
    I.active = true;
    I.color = "#3e221d";
    I.width = 35;
    I.height = 35;
    I.x = Math.random() * (CANVAS_WIDTH - I.width);
    I.y = -35;
	
	I.type = 0;
	I.moveLimit = (Math.random()*50)+50;
	I.moved = 0;
	I.direction = 1;
	
	//Type #0 = general block
	//Type #1 = moving block
	//Type #2 = gravity block
	//Type #3 = fake block
	var rand = Math.random();
	if(score > 5 && rand < 0.1){
		I.type = 1;
		I.color = "#104454";
	}
	if(score > 30 && rand < 0.01){
		I.type = 2;
		I.color = "#000000";
	}
	
	I.update = function(){
		if(I.type == 1){
			if(I.moved > I.moveLimit || I.moved < 0)
				I.direction*=-1;
			I.x += I.direction;
			I.moved += I.direction;
		}
		else if(I.type == 2){
			var strength = 1000;
			
			var dist = Math.sqrt(Math.pow(player.midpoint().x-I.midpoint().x, 2)+Math.pow(player.midpoint().y-I.midpoint().y, 2))/2;
			var pull = strength/(Math.pow(dist,2)-200)+0.1;
			//console.log("d: " + dist);
			//console.log("p: " + pull);
			if (I.midpoint().x < player.midpoint().x)
				player.xVelocity -= pull;
			else if (I.midpoint().x > player.midpoint().x)
				player.xVelocity += pull;
				
			if (I.midpoint().y < player.midpoint().y)
				speed += pull/7;
			/*else if (I.y > player.y)
				speed -= pull;*/
			
			speed = speed.clamp(0, 20);
				
			/*followers.forEach( function(follower){
				dist = Math.sqrt(Math.pow(follower.x-I.x, 2)+Math.pow(follower.y-I.y, 2));
				pull = (1/dist)*strength;
				
				if (I.x < follower.x)
					follower.xVelocity -= pull;
				else if (I.x > follower.x)
					follower.xVelocity += pull;
			});*/
		}
	}
	
    I.draw = function() {
        canvas.fillStyle = I.color;
        canvas.fillRect(I.x, I.y, I.width, I.height);
		
		/*if(I.type == 2){
			canvas.beginPath();
			canvas.strokeStyle = "#000";
			canvas.arc(I.midpoint().x, I.midpoint().y, 100, 0, 2 * Math.PI, false);
			canvas.stroke();
		}*/
				
		canvas.globalAlpha = shadowAlpha;
		for(var i=0; i < 5; i++){
			canvas.fillRect(this.x+i, this.y+i, this.width, this.height);
		}
		canvas.globalAlpha = 1;
    }

    I.midpoint = function() {
        return {
            x: I.x + I.width / 2,
            y: I.y + I.height / 2
        };
    }

    I.move = function(x0, y0) {
        I.x += x0;
        I.y += y0;
        if (I.y > CANVAS_HEIGHT)
            I.active = false;
    }

    return I;
};

function line(p1, p2, p3, p4) {
    return {
        x1: p1,
        y1: p2,
        x2: p3,
        y2: p4
    };
}

function rectangle(rx, ry, rw, rh) {
    return {
        x1: rx,
        y1: ry,
        x2: rx + rw,
        y2: ry,
        x3: rx,
        y3: ry + rh,
        x4: rx + rw,
        y4: ry + rh,
    };
}

function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    var x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    var y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    if (isNaN(x) || isNaN(y)) {
        return false;
    } else {
        if (x1 >= x2) {
            if (!(x2 <= x && x <= x1)) {
                return false;
            }
        } else {
            if (!(x1 <= x && x <= x2)) {
                return false;
            }
        }
        if (y1 >= y2) {
            if (!(y2 <= y && y <= y1)) {
                return false;
            }
        } else {
            if (!(y1 <= y && y <= y2)) {
                return false;
            }
        }
        if (x3 >= x4) {
            if (!(x4 <= x && x <= x3)) {
                return false;
            }
        } else {
            if (!(x3 <= x && x <= x4)) {
                return false;
            }
        }
        if (y3 >= y4) {
            if (!(y4 <= y && y <= y3)) {
                return false;
            }
        } else {
            if (!(y3 <= y && y <= y4)) {
                return false;
            }
        }
    }
    return true;
}

function isIntersecting(rect, line) {
    var intersect = false;
    if (lineIntersect(rect.x1, rect.y1, rect.x2, rect.y2, line.x1, line.y1, line.x2, line.y2))
        intersect = true;
    if (lineIntersect(rect.x2, rect.y2, rect.x3, rect.y3, line.x1, line.y1, line.x2, line.y2))
        intersect = true;
    if (lineIntersect(rect.x3, rect.y3, rect.x4, rect.y4, line.x1, line.y1, line.x2, line.y2))
        intersect = true;
    if (lineIntersect(rect.x4, rect.y4, rect.x1, rect.y1, line.x1, line.y1, line.x2, line.y2))
        intersect = true;
    return intersect;
}

function drawRay(ray) {
    canvas.beginPath();
    canvas.moveTo(ray.x1, ray.y1);
    canvas.lineTo(ray.x2, ray.y2);
    canvas.stroke();
}

var repeat = 0;
function update() {
    if (keydown.right || keydown.d) {
        player.xVelocity += 1;
    }
    if (keydown.left || keydown.a) {
        player.xVelocity -= 1;
    }
    if (keydown.up || keydown.w) {
        if(speed < player.maxYSpeed)
            speed += 0.3;
        
        followers.forEach(function(follower) {
            follower.y += 2;
        });
    }
    if (!keydown.up && !keydown.w && speed > startSpeed) {
        speed -= 0.1;
		/*followers.forEach(function(follower) {
            follower.y -= 2;
        });*/
    }
    player.move();
    updateFollowers();
    updateObstacles();
    handleFriction();
    handleCollisions();
	repeat++;
	/*if(repeat%60 == 0)
		score++;*/
	distance0 += speed;
	score = Math.floor(distance0/(startSpeed*100));
}

function updateObstacles() {
    obstacles = obstacles.filter(function(obstacle) {
        return obstacle.active;
    });

    if (Math.random() < 0.1) {
        obstacles.push(Obstacle());
    }
	obstacles.forEach(function(obstacle) {
        obstacle.update();
    });
    obstacles.forEach(function(obstacle) {
        obstacle.move(0, speed);
    });
}

function updateFollowers() {
    //var initial = followers.length;
    followers = followers.filter(function(follower) {
        return follower.active;
    });
	if(SCOREMODE == 1)
		score += initial - followers.length;

    if (followers.length < 3) {
        followers.push(Follower());
    }

    followers.forEach(function(follower) {
        follower.checkSafe();
        follower.move();
    });
}

function draw() {
    canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.fillStyle = "#ffddc7";
    canvas.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
    canvas.fillStyle = "black";
    canvas.font = "30px Arial";
    canvas.fillText(score, 10, 30);

    player.draw();

    followers.forEach(function(follower) {
        follower.draw();
    });

    obstacles.forEach(function(obstacle) {
        obstacle.draw();
    });
}

function handleFriction() {
    var friction = 0.6;
    if (Math.abs(player.xVelocity) <= friction) {
        player.xVelocity = 0;
    } else {
        if (player.xVelocity > 0)
            player.xVelocity -= friction;
        if (player.xVelocity < 0)
            player.xVelocity += friction;
    }

    if (Math.abs(player.yVelocity) <= friction) {
        player.yVelocity = 0;
    } else {
        if (player.yVelocity > 0)
            player.yVelocity -= friction;
        if (player.yVelocity < 0)
            player.yVelocity += friction;
    }
}

function collides(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function handleCollisions() {
    obstacles.forEach(function(obstacle) {
        if (collides(player, obstacle)) {
            gameOver();
        }
        followers.forEach(function(follower) {
            if (collides(follower, obstacle)) {
                follower.active = false;
            }
            if (collides(player, follower)) {
                gameOver();
            }
        });
    });
}

function reset() {
	obstacles = [];
	followers = [];
	player.trail = [];
	player.x = CANVAS_WIDTH / 2 - 10;
	player.y = CANVAS_HEIGHT/2;
	score = 0;
	distance0 = 0;
	speed = startSpeed;
	running = true;
}

function gameOver() {
	running = false;
	var gameOverWidth = 200;
	var gameOverHeight = 100;
	var gameOverX = CANVAS_WIDTH/2 - (gameOverWidth/2);
	var gameOverY = 50;
	canvas.fillStyle = "#52B3D9";
    canvas.fillRect(gameOverX, gameOverY, gameOverWidth, gameOverHeight);
	canvas.fillStyle = "#34495E";
	canvas.font = "30px Arial";
	canvas.fillText("Game Over!", gameOverX+18, gameOverY+35);
	canvas.fillText("Score: " + score, gameOverX+35, gameOverY+65);
	canvas.font = "10px Arial";
	canvas.fillText("Press 'space' to try again", gameOverX+40, gameOverY+90);
}

function drawStartScreen() {
	canvas.fillStyle = "#ffddc7";
    canvas.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	var gameStartWidth = 400;
	var gameStartHeight = 300;
	var gameStartX = CANVAS_WIDTH/2 - (gameStartWidth/2);
	var gameStartY = 50;
	canvas.fillStyle = "#52B3D9";
    canvas.fillRect(gameStartX, gameStartY, gameStartWidth, gameStartHeight);
	canvas.fillStyle = "#34495E";
	
	canvas.font = "30px Arial";
	canvas.fillText("Obstacle Avoidance Test", gameStartX+18, gameStartY+35);
	canvas.font = "20px Arial";
	canvas.fillText("Instructions: ", gameStartX+20, gameStartY+60);
	canvas.font = "13px Arial";
	canvas.fillText("  >Avoid the obstacles as you race away from the red blocks.", gameStartX+20, gameStartY+80);
	canvas.fillText("  >Make sure stay away from the red AI that will track you down.", gameStartX+20, gameStartY+100);
	
	canvas.font = "20px Arial";
	canvas.fillText("Controls: ", gameStartX+20, gameStartY+130);
	canvas.font = "13px Arial";
	canvas.fillText("  >Use a/d or left/right keys to control your character.", gameStartX+20, gameStartY+150);
	canvas.fillText("  >w and up keys will speed you up to help escape your followers", gameStartX+20, gameStartY+170);
}
