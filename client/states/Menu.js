class Menu extends Phaser.State {
  constructor() {
    super()
    this.music
  }

  preload() {
    this.load.image('background', 'assets/sprites/bg.png')
    this.load.image('logo', 'assets/sprites/logo.png')
    this.load.spritesheet('button', 'assets/sprites/button.png', 80, 50)

    this.load.audio('music', 'assets/audio/Klockworx.mp3')   
    
    this.add.plugin(PhaserInput.Plugin)      
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
  }

  create() {
    // background
    let bg = this.add.sprite(0, 0, 'background')
    bg.width = this.game.width
    bg.height = this.game.height

    if(!this.music) this.music = this.add.audio('music', 0.4, true)
    this.music.play()
    
    // join button
    this.button = this.add.button(this.world.centerX+90, this.world.centerY+83, 'button', this.joinGame, this, 1, 0, 2, 0)
   
    // input
    this.name = this.add.inputField(this.world.centerX-(200/2)-(80/2)-10, this.world.centerY+90, {
      font: '18px Arial',
      width: 200,
      height: 18,
      padding: 10,
      max: "10",
      placeHolder: "Your name"
    })

    // logo
    let logo = this.add.image(0, 0, 'logo')
    logo.x = this.game.width/2 - logo.width/2
    logo.y = this.game.height/2 - logo.height/2 - 100

    // left
    let style = { font: 'bold 20px Arial', fill: '#222', align: 'left' }    
    let l = this.add.text(40, this.game.height-60, "Swipe left (left arrow key) to ignore a card", style)
    l.addColor('#FF5864', 12)
    l.addColor('#222', 26)

    // right
    let r = this.add.text(40, this.game.height-60, "Swipe right (right arrow key) to pickup a card", style)
    r.x = this.game.width - r.width - r.x
    r.addColor('#FF5864', 13)
    r.addColor('#222', 28)

    // middle
    let m = this.add.text(0, this.game.height-60, "Match three cards in your hand to score", style)
    m.x = this.game.width/2 - m.width/2
    m.addColor('#FF5864', 6)
    m.addColor('#222', 12)
  }
  
  joinGame() {
    if(this.name.value.length>0) {
        this.state.start('Game', true, false, {name: this.name.value})
    }
}

  update() {
    if(this.input.keyboard.isDown(Phaser.KeyCode.ENTER)) { 
      if(this.name.value.length>0) {
        this.state.start('Game', true, false, {name: this.name.value})
      }
    }
  }
}

export default Menu