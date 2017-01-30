(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var PlayScene = require('./play_scene.js');
var MenuScene = require('./menu_scene.js');
var WinScene = require('./win_scene.js');


var BootScene = {
  preload: function () {
    // load here assets required for the loading screen
    this.game.load.spritesheet('button', 'images/buttons.png', 168, 70);
    this.game.load.image('logo', 'images/phaser.png');
    this.game.load.image('preloader_bar', 'images/preloader_bar.png');
    this.game.load.audio('selectFx', 'sounds/selectFx.wav');
    this.game.load.audio('menu', 'sounds/menu.mp3');
  },

  create: function () {
    this.game.state.start('menu');
  }
};


var PreloaderScene = {
  preload: function () {
    this.loadingBar = this.game.add.sprite(0, 240, 'preloader_bar');
    this.loadingBar.anchor.setTo(0, 0.5);
    this.load.setPreloadSprite(this.loadingBar);

    // TODO: load here the assets for the game
    
    this.load.onLoadStart.add(this.loadStart, this);
    this.game.load.image('pepper', 'images/pepper.png');
    this.game.load.image('background', 'images/background.png');
    this.game.load.image('goal', 'images/winLine.png');
    this.game.load.image('blank', 'images/blank.png');
    this.game.load.image('pause', 'images/pause.png');
    this.game.load.spritesheet('player', 'images/Leon.png', 32, 64);
    this.game.load.image('knife', 'images/Cuchillo.png');
    this.game.load.spritesheet('enemy', 'images/Gamba.png', 32, 64);
    this.game.load.image('plat', 'images/Platforms.png');
    this.game.load.tilemap('tilemap', 'images/map.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image("tiles", "images/tiles.png");
    this.game.load.image('win', 'images/win.png');

    this.game.load.audio('knifeFx1', 'sounds/cuchillo1Fx.wav');
    this.game.load.audio('frenesiFx', 'sounds/frenesiFx.wav');
    this.game.load.audio('saltoFx', 'sounds/saltoFx.wav');
    this.game.load.audio('selectFx', 'sounds/selectFx.wav');
    this.game.load.audio('enemyFx', 'sounds/GoathelmFx.wav');
    this.game.load.audio('dieFx', 'sounds/dieFx.wav');

    this.game.load.audio('frenesi', 'sounds/frenesi.mp3');
    this.game.load.audio('game', 'sounds/game.mp3');
    this.game.load.audio('win', 'sounds/win.mp3');

    this.load.onLoadComplete.add(this.loadComplete, this);
  },

  create: function(){},

  loadStart: function () {
    //this.game.state.start('play');
    console.log("Game Assets Loading ...");
  },

  loadComplete: function () {
    this.game.state.start('play');
  },

  update: function(){
    this._loadingBar
  }
};


window.onload = function () {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('menu', MenuScene);
  game.state.add('play', PlayScene);
  game.state.add('win', WinScene);

  game.state.start('boot');
};

},{"./menu_scene.js":2,"./play_scene.js":3,"./win_scene.js":4}],2:[function(require,module,exports){
var MenuScene = {

    create: function () {

        this.music = this.game.add.audio('menu', 1, true);
	this.music.play();

        var logo = this.game.add.sprite(this.game.world.centerX, 
                                        this.game.world.centerY, 
                                        'logo');
	logo.scale.y=0.9;
        logo.anchor.setTo(0.5, 0.5);
        var buttonStart = this.game.add.button(this.game.world.centerX, 
                                               500, 
                                               'button', 
                                               this.actionOnClick, 
                                               this, 2, 1, 0);
        buttonStart.anchor.set(0.5);
        var textStart = this.game.add.text(0, 0, "Start");
        textStart.font = 'Sniglet';
        textStart.anchor.set(0.5);
        buttonStart.addChild(textStart);
    },
    
    actionOnClick: function(){
	this.fx = this.game.add.audio('selectFx');
	this.fx.play();
	
        this.game.state.start('preloader');
	this.music.stop();
	
    } 
};

module.exports = MenuScene;

},{}],3:[function(require,module,exports){
'use strict';

var PlayScene = {
  entities: {},
  toDelete: {},
  toAdd: {},
  paused: false,
  fx: undefined,
  music: [],

  create: function () {
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      // A�adimos el background
      this.background = this.game.add.tileSprite(-30, 532, 16000, 500, 'background'); 

      // A�adimos el tilemap y el yileset
      this.map = this.add.tilemap('tilemap');
      this.map.addTilesetImage('tiles', 'tiles');
      // Creamos los layer del tilemap y las plataformas
      this.pauseButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
      this.pauseControl = false;
      this.goMenu =this.game.input.keyboard.addKey(Phaser.Keyboard.M);

      // Creamos los enemigos y configuramos la escena

      this.start();
      this.music[0] = this.game.add.audio('game', 0.6, true);
      this.music[0].play();
      this.music[1] = this.game.add.audio('frenesi', 1, true);
      this.music[1].play();
      this.music[1].pause();
      this.configure();

   
  },
  update: function(){
    
     for (var i in this.toDelete){
        if(this.entities[i] !== undefined){
	   delete this.entities[i];
	}
     }
     this.toDelete = {};
     for (var i in this.toAdd){
	     
        this.entities[i]=this.toAdd[i];
     }
     this.toAdd = {};
     if(!this.paused){
        for(var i in this.entities){
           this.entities[i].update();
        }
        for(var i in this.entities){
	   for(var j in this.entities){
	      if (this.physics.arcade.collide(this.entities[i].sprite, this.entities[j].sprite)){
	     	      this.entities[i].onCollide(this.entities[j]);
	      }
           }
        }
     }
  },
  start: function(){
      if (this.noFirst){
      	   this.game.fx = this.game.add.audio('dieFx');
	   this.game.fx.play();
      }
                  this.map.createLayer('GroundLayer');
      this.toAdd.player = new Player('player', this.add.sprite(96, 832, 'player'), this);
      this.toAdd.enemy1 = new Enemy('enemy1', this.add.sprite(768, 864, 'enemy'), this);
      this.toAdd.enemy2 = new Enemy('enemy2', this.add.sprite(1440, 864, 'enemy'), this);
      this.toAdd.enemy3 = new Enemy('enemy3', this.add.sprite(2560, 864, 'enemy'), this);
      this.toAdd.enemy4 = new Enemy('enemy4', this.add.sprite(122*32, 26*32, 'enemy'), this);
      this.toAdd.enemy5 = new Enemy('enemy5', this.add.sprite(223*32, 28*32, 'enemy'), this);
      this.toAdd.enemy6 = new Enemy('enemy6', this.add.sprite(266*32, 27*32, 'enemy'), this);
      this.toAdd.enemy7 = new Enemy('enemy7', this.add.sprite(238*32, 10*32, 'enemy'), this);
      this.toAdd.enemy8 = new Enemy('enemy8', this.add.sprite(325*32, 25*32, 'enemy'), this);
      this.toAdd.enemy9 = new Enemy('enemy9', this.add.sprite(365*32, 19*32, 'enemy'), this);
      this.toAdd.enemy10 = new Enemy('enemy10', this.add.sprite(436*32, 34*32, 'enemy'), this);
      this.toAdd.enemy11 = new Enemy('enemy11', this.add.sprite(463*32, 11*32, 'enemy'), this);
      this.toAdd.goal = new Goal('goal', this.add.sprite(495*32, 27*32, 'goal'), this);
      this.toAdd.pepper = new Goal('pepper', this.add.sprite(252*32, 10*32, 'pepper'), this);

      this.toAdd.ground = new Entity('ground', this.add.physicsGroup(), this);
      this.map.createFromObjects('GroundObjects', 13, 'blank',1,true,false, this.toAdd.ground.sprite);

      this.toAdd.ground.sprite.setAll('body.immovable', true);
      this.toAdd.death = new Entity('death', this.map.createLayer('Death'), this);
      this.toAdd.platforms = new Entity('platforms', this.add.physicsGroup(), this);
      this.map.createFromObjects('Platforms', 10, 'plat',1,true,false, this.toAdd.platforms.sprite);
      this.toAdd.platforms.sprite.setAll('body.immovable', true);
      this.toAdd.platforms.sprite.setAllChildren('body.checkCollision.down', false);
      this.toAdd.platforms.sprite.setAllChildren('body.checkCollision.left', false);
      this.toAdd.platforms.sprite.setAllChildren('body.checkCollision.right', false);
      for(var i = 0; i < this.toAdd.platforms.sprite.children.length;i++){
         this.toAdd.platforms.sprite.children[i].scale.x = this.toAdd.platforms.sprite.children[i].ancho;
      }
      for(var i = 0; i < this.toAdd.ground.sprite.children.length;i++){
         this.toAdd.ground.sprite.children[i].scale.x = this.toAdd.ground.sprite.children[i].ancho;
	 this.toAdd.ground.sprite.children[i].scale.y = this.toAdd.ground.sprite.children[i].alto;
      }
      this.toAdd.death.deathly = true;
      this.map.setCollisionBetween(1, 16000, true, 'Death');
      this.noFirst = true;
  },

  configure: function(){
     // Start the Arcade Physics systems
     this.game.world.setBounds(0, 0, 16000, 1120);
     
     this.game.stage.backgroundColor = '#a9f0ff';

  },
  render: function(){

     	if (this.pauseButton.isDown && !this.pauseControl){
	   this.pauseControl = true;
	}
	if (!this.pauseButton.isDown && this.pauseControl){
	   this.fx = this.game.add.audio('selectFx');
	   this.fx.play();
           if (!this.game.paused){	  
	      this.game.paused = true;
	      this.pauseImage = this.game.add.image(this.game.camera.x,this.game.camera.y,'pause');
	   }
	   else{
	      this.game.paused = false;
	      if(this.pauseImage)
	         this.pauseImage.kill();
	   }
	   this.pauseControl = false;
	}
	if(this.game.paused && this.goMenu.isDown){
	   this.music[0].stop();
	   this.game.world.setBounds(0,0, 800, 640);
	   this.game.paused = false;
	   this.game.stage.backgroundColor = '#000000';
	   this.game.state.start('menu');
	   this.game.fx = this.game.add.audio('selectFx');
	   this.game.fx.play();
	   
	}
  }
  
};
  // Entidades---------------------------------------------------------------------
  // Prototipo
  function Entity(name, sprite, self){
     this._game = self;
     this.name = name;
     this.sprite = sprite;
     this.components = [];
  }

  Entity.prototype.update = function(){
     for(var i = 0; i < this.components.length;i++){
        this.components[i].update(this);
     }
  }
  Entity.prototype.onCollide = function(collider){
     for(var i = 0; i < this.components.length;i++){
        this.components[i].onCollide(collider, this);
     }
  }
  // Player
  function Player(name, sprite, self){	  
     Entity.call(this, name, sprite, self);
     this.anim = 'stand';
     this.sprite.animations.add('walk', [0,1,2,3], 12, true); 
     this.sprite.animations.add('attack', [6,7], 6, false); 
     this.sprite.animations.add('jump', [4, 5], 2, false); 
     this.sprite.animations.add('stand', [0], 12, false); 
     this.components.push(new Die(self));
     self.game.physics.arcade.enable(this.sprite);
        
     this.sprite.body.gravity.y = 0;
     this.sprite.body.gravity.x = 0
     this.sprite.body.inmovable = true;
     this.components.push(new Controller(self));
     self.camera.follow(this.sprite);
  }
  Player.prototype = Object.create(Entity.prototype);
  Player.prototype.constructor = Entity;
  // Enemigo
  function Enemy(name, sprite, self){	  
     Entity.call(this, name, sprite, self);
     this.sprite.animations.add('walk', [0,1,2,3], 12, true);
     self.game.physics.arcade.enable(this.sprite);
     this.deathly = true;
     this.components.push(new Move(self));
     this.sprite.animations.play('walk');
  }
  Enemy.prototype = Object.create(Entity.prototype);
  Enemy.prototype.constructor = Entity;
  // Pimiento
  function Pepper(name, sprite, self){	  
     Entity.call(this, name, sprite, self);
     self.game.physics.arcade.enable(this.sprite);
     this.components.push(new PowerUp(self));
  }
  Pepper.prototype = Object.create(Entity.prototype);
  Pepper.prototype.constructor = Entity;
  // Cuchillo
  function Knife(name, sprite, direction, self){
     Entity.call(this, name, sprite, self);
     self.game.physics.arcade.enable(this.sprite);
     this.direction = direction;
     this.sprite.body.inmovable = true;
     this.kill = true;
     this.components.push(new Throw(self, direction));
  }
  Knife.prototype = Object.create(Entity.prototype);
  Knife.prototype.constructor = Entity;
  // Meta
  function Goal(name, sprite, self){
     Entity.call(this, name, sprite, self);
     self.game.physics.arcade.enable(this.sprite);
  }
  Goal.prototype = Object.create(Entity.prototype);
  Goal.prototype.constructor = Entity;
  // Componentes-------------------------------------------------------------------
  function Controller(self){
     this._game = self;
     this._speed = 250;
     this._jumpSpeed = 570;
     this.fireFrec = 20;
     this.cursors = self.game.input.keyboard.createCursorKeys();
     this.jumpButton = self.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
     this.attackButton = self.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
     this.direction = 'rigth';
     this.waitFire = 0;
     this.jump = false;
     this.first = 0;
     this.frenesi = 0;
     this.update = function(entity){

           // Actiualiza la gravedad y el movimiento
        entity.sprite.body.velocity.x = 0;
	if (this.first < 5){
	   this.first++;
	   entity.sprite.body.velocity.y = 0;
	}
	else{
           entity.sprite.body.velocity.y = entity.sprite.body.velocity.y + (this._game.time.elapsed/10) * 9.8;
	if (entity.sprite.body.velocity.y > 50) this.jump = false;

	// Control de animaci�n
	switch(entity.anim){
		case 'stand':
			entity.sprite.animations.play('stand');
			break;
		case 'walk':
			entity.sprite.animations.play('walk');
			break;
		case 'jump':
			entity.sprite.animations.play('jump');
			break;
		case 'attack':
			entity.sprite.animations.play('attack');
			break;

	}
	if (this.frenesi <= 0){
	   this.speed = 250;
	   this.fireFrec = 20;
	   entity.sprite.tint = 0xFFFFFF;
	   if(this._game.music[1].isPlaying){
	      this._game.music[1].pause();
	      this._game.music[0].restart();
	   }
	}
	else {
	   entity.sprite.tint = Math.random() * 0xffffff;
	   this.frenesi--;
	}
           // Gestion del movimiento
        if (this.cursors.left.isDown){
           entity.sprite.body.velocity.x = this._speed*-(this._game.time.elapsed/10);
	   this.direction = 'left';
	   entity.sprite.scale.x = -1;
	   if (this.jump)
	   entity.anim = 'walk';
        }
        else if (this.cursors.right.isDown){
           entity.sprite.body.velocity.x = this._speed*(this._game.time.elapsed/10);
	   this.direction = 'right';
	   entity.sprite.scale.x = 1;
	   if (this.jump)
	   entity.anim = 'walk';
        }
	else if (this.jumpButton.isUp, this.attackButton.isUp && this.jump) {
		entity.anim = 'stand';
	}
           // Gestion del salto

        if (this.jumpButton.isDown && this.jump){
           entity.sprite.body.velocity.y = this._jumpSpeed*-1;
           this.jump = false;
	   entity.anim = 'jump';
	   
	   if(!this._game.fx || this._game.fx.key !== 'saltoFx')
	   this._game.fx = this._game.add.audio('saltoFx');
	   this._game.fx.play();
	   
	}
           // Gestion del ataque
        this.waitFire++;

	if (this.attackButton.isDown && this.waitFire >= this.fireFrec){
	   entity.anim = 'attack';
	   this._game.fx = this._game.add.audio('knifeFx1', 0.5);
	   this._game.fx.play();
	   if (this._game.entities.knife === undefined){
               this._game.toAdd.knife = new Knife('knife', this._game.add.sprite(entity.sprite.x, entity.sprite.y-30,'knife'), this.direction, this._game);
	   }
	   else if (this._game.entities.knife1 === undefined){
	      
     	      this._game.toAdd.knife1 = new Knife('knife1', this._game.add.sprite(entity.sprite.x, entity.sprite.y-30,'knife'), this.direction, this._game);
	   }
	   else if (this._game.entities.knife2 === undefined){
	      
              this._game.toAdd.knife2 = new Knife('knife2', this._game.add.sprite(entity.sprite.x, entity.sprite.y-30,'knife'), this.direction, this._game);
	   }
	   else if (this._game.entities.knife3 === undefined){
	      
              this._game.toAdd.knife3 = new Knife('knife3', this._game.add.sprite(entity.sprite.x, entity.sprite.y-30,'knife'), this.direction, this._game);
	   }
	   this.waitFire = 0;
	}
        }
     };
     this.onCollide = function(collider, entity){
        // Si el jugador choca con el mapa la gravedad ya no le afecta
        if(collider.name === 'platforms' && entity.sprite.body.touching.down ){	
           entity.sprite.body.velocity.y = 0;
           this.jump = true;	   
        }
	else if(collider.name === 'ground' && entity.sprite.body.touching.down){
	   entity.sprite.body.velocity.y = 0;
           this.jump = true;
	}

	else if (collider.name === 'goal'){
           this._game.stage.backgroundColor = '#000000';
	   this._game.world.setBounds(0,0, 800, 600);
	   this._game.music[0].stop();
	   this._game.music[1].stop();
	   this._game.state.start('win');

	}
	else if (collider.name === 'pepper'){
	   this.frenesi = 700;
	   this._speed = 300;
	   this.fireFrec = 10;
	   this._game.entities[collider.name].sprite.destroy();
	   this._game.toDelete[collider.name] = true;
	   this._game.fx = this._game.add.audio('frenesiFx', 0.5);
	   this._game.fx.play();
	   this._game.music[0].pause();
	   this._game.music[1].restart();
	}
     };
  }

  function Die(self){
     this._game = self;
     this.update = function(entity){
     };
     this.onCollide = function(collider, entity){
        if (collider.deathly){

 	   for(var i in this._game.entities){
	      if(this._game.entities[i].name !== 'platforms' && this._game.entities[i].name !== 'ground'){
	      	 this._game.entities[i].sprite.destroy();
	         this._game.toDelete[i] = true;
	      }
	      else this._game.toDelete[i] = true;
	   }

	   this.restart();
	}
     };
     this.restart = function(){
	this._game.start();
     };
  }
  function Move(self){
     this._game = self;
     this.speed = -1000;
     this.turn = 0;
     this.direction = 'rigth';
     this.update = function(entity){
	this.turn++;
	entity.sprite.body.velocity.x = this.speed*(this._game.time.elapsed/100);
        if (this.turn > 90){
	   entity.sprite.scale.x *= -1;
	   this.turn = 0;
	   this.speed*=-1;
	}
     }
     this.onCollide = function(collider, entity){
        if(collider.kill){
	   this._game.toDelete[entity.name] = true;
	   entity.sprite.destroy();
	   this._game.fx = this._game.add.audio('enemyFx');
	   this._game.fx.play();
	}
     };
  }
  function PowerUp(self){
     this._game = self;
     this.update = function(entity){
	
     };
     this.onCollide = function(collider, entity){
	
     };
  }
  function Throw(self, direction){
     this._game = self;
     if (direction === 'left'){
        this.speedX = -500;
     }
     else this.speedX = 500;
     this.speedY = -1500;
     this.knifeLife = 0;
     this.update = function(entity){
	this.knifeLife++;
	entity.sprite.body.velocity.x = this.speedX *  (this._game.time.elapsed/10);
        entity.sprite.body.velocity.y = this.speedY + (this._game.time.elapsed)* 9.8;
	this.speedY = entity.sprite.body.velocity.y;
	entity.sprite.angle+= 10*(this.speedX/500);
	if (this.knifeLife > 100){
	   entity.sprite.destroy();
	   this._game.toDelete[entity.name] = true;
	}
	if (this._game.physics.arcade.collide(entity.sprite, this._game.entities['ground'].sprite)){
	   entity.sprite.destroy();
	   this._game.toDelete[entity.name] = true;}
	else if (this._game.physics.arcade.collide(entity.sprite, this._game.entities['platforms'].sprite)){
		   entity.sprite.destroy();
	   this._game.toDelete[entity.name] = true;}
     }
     this.onCollide = function(collider, entity){
/*	entity.sprite.renderable = false;
        this._game.toDelete[entity.name] = true;*/
     };
  }


module.exports = PlayScene;

},{}],4:[function(require,module,exports){
var WinScene = {
    create: function () {

        this.music = this.game.add.audio('win', 1, true);
	this.music.play(); 
        var logo = this.game.add.sprite(this.game.world.centerX, 
                                        this.game.world.centerY, 
                                        'win');
        logo.anchor.setTo(0.5, 0.5);
        var buttonStart = this.game.add.button(this.game.world.centerX, 
                                               this.game.world.centerY, 
                                               'button', 
                                               this.actionOnClick, 
                                               this, 2, 1, 0);
        buttonStart.anchor.set(0.5);
        var textStart = this.game.add.text(0, 0, "To menu");
        textStart.font = 'Sniglet';
        textStart.anchor.set(0.5);
        buttonStart.addChild(textStart);
    },
    
    actionOnClick: function(){
       this.fx = this.game.add.audio('selectFx');
       this.fx.play();    
       this.game.state.start('menu');
       this.music.stop();
    } 
};

module.exports = WinScene;

},{}]},{},[1]);
