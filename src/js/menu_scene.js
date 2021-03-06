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
