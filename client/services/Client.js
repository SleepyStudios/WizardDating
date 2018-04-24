import Game from '../states/Game'
import _ from 'lodash'

class Client {
  constructor(game, name) {
    this.socket = io.connect()
    this.game = game
    this.name = name

    this.socket.on('disconnect', () => {
      setTimeout(() => {
        location.reload()        
      }, 5000)
    })

    let cardW = 200
    let cardH = 292

    let deckX = game.world.width/2 - cardW/2
    let deckY = game.world.height/2 - cardH

    this.socket.on('hand', hand => {
      let offset = 20
      this.clearHand()
  
      for(let i=0; i<hand.length; i++) {        
        let x = game.world.width/2 - (cardW*hand.length + offset*hand.length)/2 + (i*(cardW+offset)) + offset/2
        let y = 0
        let card = this.makeCard(x, y, hand[i])
        card.input.useHandCursor = true

        card.events.onInputDown.add(() => {
          this.play(card, game.deck.data.id)

          card.isTweening = true
          game.add.tween(card).to({ x: deckX, y: deckY, alpha: 0 }, 300, Phaser.Easing.Linear.None, true)    

          game.play.play()          
        }, this)
  
        game.hand.push(card)        
      }
    })

    this.socket.on('deck', deck => {
      // if(game.deck!=null) game.deck.kill()

      let x = game.world.width/2 - cardW/2
      let y = game.world.height/2 - cardH
      game.deck = this.makeCard(x, y, deck)
      game.deck.bringToTop()
    })

    this.socket.on('pickup', card => {
      this.addText("Picked up '" + card.Name + "'", "#FD297B")
      game.pickup.play()

      game.add.tween(game.deck).to({ y: game.world.height+1000, alpha: 0 }, 500, Phaser.Easing.Linear.None, true)
      game.swipe.play()
    })

    this.socket.on('discard', card => {
      this.addText("Discarded '" + card.Name + "'", "#666")
      game.crumple.play()

      let dupe = _.find(game.hand, {data: {id: card.id}})

      let x, y
      if(dupe) {
        x = dupe.x
        y = dupe.y
        let discardedCard = this.makeCard(x, y, card)

        let tween = game.add.tween(discardedCard).to({ y: -1000, alpha: 0 }, 500, Phaser.Easing.Linear.None, true)
        tween.onUpdateCallback(() => {
          discardedCard.bringToTop()
        }, this)
      }

      // side one
      x = game.world.width/2 + cardW*0.75
      y = game.world.height/2 - cardH
      card.Text += "\n\n [Discarded]"
      let discardedBig = this.makeCard(x, y, card)
      discardedBig.tint = 0xFEEEEE   

      let tweenBig = game.add.tween(discardedBig).to({ alpha: 0 }, 300, Phaser.Easing.Linear.None, true, 2000)
    })

    this.socket.on('transform', args => {
      this.addText("'" + args.oldCard.Name + "' transformed to '" + args.newCard.Name + "'", "#388FE2")
      game.transform.play()      
    })

    this.socket.on('decksize', size => {
      if(!game.deckSize) {
        let style = { font: 'bold 18px Arial', fill: '#FF5864', align: 'left' }
        game.deckSize = game.add.text(30, 30, "Global deck size: " + size + " cards", style)
      } else {
        game.deckSize.text = "Global deck size: " + size + " cards"
      }
    })

    this.socket.on('playercount', size => {
      if(!game.playerCount) {
        let style = { font: 'bold 18px Arial', fill: '#FD297B', align: 'left' }
        game.playerCount = game.add.text(30, 110, size + " " + (size==1 ? "player" : "players") + " online", style)
      } else {
        game.playerCount.text = size + " " + (size==1 ? "player" : "players") + " online"
      }
    })

    this.socket.on('play', card => {
      this.addText("Played '" + card.Name + "'", "#61E064")
    })

    this.socket.on('score', args => {
      this.addText(args.name + (args.name===this.name ? " (you)" : "") + " scored! Their new score is: " + args.score, "#FFBF00")

      if(args.name===this.name) {
        this.addText("You've been dealt a new hand", "FFBF00")
        game.score.play()

        game.hand.forEach(card => {
          let newCard = this.makeCard(card.x, game.world.height - 150, card.data)
          
          newCard.isTweening = true
          game.add.tween(newCard).to({ x: deckX, y: deckY, alpha: 0 }, 300, Phaser.Easing.Linear.None, true)    
        })
      }
    })

    this.socket.on('playerjoin', name => {
      this.addText(name + " joined the game", "black")
    })

    this.socket.on('playerleft', name => {
      this.addText(name + " left the game", "black")
    })

    this.socket.on('leaderboard', text => {
      if(!game.leaderboard) {
        let style = { font: 'bold 18px Arial', fill: '#FF5864', align: 'left' }
        game.leaderboard = game.add.text(30, 190, text, style)
      } else {
        game.leaderboard.text = text
      }
    })
  }

  requestJoin() {
    this.socket.emit('newplayer', this.name)
  }

  clearHand() {
    this.game.hand.forEach(card => {
      if(!card.isTweening) card.kill()
    })
    this.game.hand = []
  }

  makeCard(x, y, data) {
    let card = this.game.add.sprite(x, y, 'card')
    card.inputEnabled = true
    card.data = data

    // name
    let nameStyle = { font: 'bold 20px Arial', fill: '#FF5864', align: 'center', wordWrap: true, wordWrapWidth: 180 }
    let name = this.game.add.text(0, 0, data.Name, nameStyle)
    name.x = Math.round(card.width/2 - name.width/2)
    name.y = 50
    name.lineSpacing = -6
    card.addChild(name)

    // description
    let textStyle = { font: '16px Arial', fill: 'black', align: 'center', wordWrap: true, wordWrapWidth: 180 }        
    let text = this.game.add.text(0, 0, data.Text, textStyle)
    text.x = Math.round(card.width/2 - text.width/2)
    text.y = 120
    text.lineSpacing = -6

    // keyword
    text.addColor('#FF5864', 0)
    
    switch(data.Text.split(' ')[1]) {
      case "Play:":
        text.addColor('#000', 8)
        break
      case "Pickup:":
        text.addColor('#000', 10)
        break
      case "Swipe:":
        text.addColor('#000', 9)
        break
      case "Discard:":
        text.addColor('#000', 11)
        break
    }

    if(data.Text.indexOf('[Discarded]')!=-1) text.addColor('#FF5864', data.Text.indexOf('[Discarded]'))

    card.addChild(text)
    return card
  }

  swipe(id) {
    this.socket.emit('swipe', id)
  }

  pickup(id) {
    this.socket.emit('pickup', id)
  }

  play(card, deckID) {
    this.socket.emit('play', {handID: card.data.id, deckID: deckID})
  }

  addText(text, colour) {
    this.game.text.forEach(t => {
      t.y+=75
    })

    let style = { font: 'bold 18px Arial', fill: colour, align: 'left' }
    let newText = this.game.add.text(30, 30, text, style)
    newText.x = Math.round(this.game.world.width - newText.width - 30)   
    newText.autoCull = true
    this.game.text.push(newText)
  }
}

export default Client