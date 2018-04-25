import Client from '../services/Client'
import _ from 'lodash'

class Game extends Phaser.State {
  constructor() {
    super()

    this.hand = []
    this.deck = null
    this.text = []
  }

  init(args) {
    this.client = new Client(this, args.name)
  }

  preload() {
    this.stage.disableVisibilityChange = true

    this.load.image('background', 'assets/sprites/bg.png')
    this.load.image('card', 'assets/sprites/card.png')

    this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

    this.load.audio('swipe', 'assets/audio/swipe.wav')
    this.load.audio('crumple', 'assets/audio/crumple.wav')
    this.load.audio('transform', 'assets/audio/transform.wav')
    this.load.audio('pickup', 'assets/audio/pickup.wav')
    this.load.audio('play', 'assets/audio/play.wav')
    this.load.audio('score', 'assets/audio/score.wav')
  }

  create() {
    let bg = this.add.sprite(0, 0, 'background')
    bg.width = this.game.width
    bg.height = this.game.height

    this.swipe = this.add.audio('swipe', 0.5)
    this.crumple = this.add.audio('crumple')
    this.transform = this.add.audio('transform')
    this.pickup = this.add.audio('pickup')
    this.play = this.add.audio('play')
    this.score = this.add.audio('score')  
    
    this.client.requestJoin()

    // left to ignore
    let left = this.input.keyboard.addKey(Phaser.Keyboard.LEFT)
    left.onDown.add(() => {
      if(this.deck==null) return
      let oldCard = this.client.makeCard(this.deck.x, this.deck.y, this.deck.data)

      this.add.tween(oldCard).to({ x: -500, y: this.deck.y+200, angle: -80, alpha: 0 }, 500, Phaser.Easing.Linear.None, true)   
      this.swipe.play()

      this.client.swipe(this.deck.data.id)
    }, this)

    // right to pickup
    let right = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
    right.onDown.add(() => {
      this.client.pickup(this.deck.data.id)
    }, this)
  }

  update() {
    for(let i=0; i<this.hand.length; i++) {
      if(this.hand[i].input.pointerOver()) {
        this.hand[i].y = this.world.height - 300
      } else {
        this.hand[i].y = this.world.height - 150
      }
    }
  }
}

export default Game