import Game from './states/Game'
import Menu from './states/Menu'

class App extends Phaser.Game {
  constructor() {
    super(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO)

    this.state.add('Game', Game)
    this.state.add('Menu', Menu)
    this.state.start('Menu')
  }
}

new App()
