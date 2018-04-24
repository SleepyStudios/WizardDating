import ConnectionEvent from './events/Connection'
import cards from './cards'
import _ from 'lodash'
import {v4 as uuid} from 'uuid'

class Game {
  constructor(app) {
    this.io = require('socket.io')(app)    
    this.MAX_HAND_SIZE = 5
    this.deck = this.genDeck()
    this.leaderboard = []

    new ConnectionEvent(this) 
  }

  genDeck() {
    let deck = []
    let initialDeckSize = 15
    for(let i=0; i<initialDeckSize; i++) {
      let card = _.cloneDeep(cards[_.random(0, cards.length-1)])
      card.id = uuid()

      deck.push(card)
    }
    return deck
  }

  isHandFull(socket) {
    return socket.player.hand.length===this.MAX_HAND_SIZE
  }

  willHandBeFull(socket) {
    return socket.player.hand.length+1>=this.MAX_HAND_SIZE
  }

  genHand() {
    let hand = []

    while(hand.length===0 || hand[0].Name===hand[1].Name) {
      hand = []
      for(let i=0; i<2; i++) {
        let card = _.cloneDeep(cards[_.random(0, cards.length-1)])
        card.id = uuid()
        hand.push(card)
      }
    }

    return hand
  }

  checkHand(socket) {
    for(let i=0; i<socket.player.hand.length; i++) {
      let card = socket.player.hand[i]
      let filteredList = _.filter(socket.player.hand, {Name: card.Name})
      if(filteredList.length===3) {
        socket.player.score++
        this.updateLeaderboard(socket)

        this.io.sockets.emit('score', {name: socket.player.name, score: socket.player.score})
        this.io.sockets.emit('leaderboard', this.getLeaderboard())                    
        
        socket.player.hand = this.genHand()
        socket.emit('hand', socket.player.hand)
        return
      }
    }
  }

  getCard(id) {
    return _.find(this.deck, {id: id})
  }

  rand(low, high) {
    return Math.floor(Math.random() * (high - low) + low)
  }

  playercount() {
    return this.io.engine.clientsCount
  }

  updateLeaderboard(socket) {
    let player = socket.player
    let leaderboardPlayer = _.find(this.leaderboard, {id: player.id})

    if(leaderboardPlayer) {
      leaderboardPlayer.score++
    } else {
      this.leaderboard.push({
        id: player.id,
        name: player.name,
        score: 0
      })
    }
  }

  getLeaderboard() {
    let arr = _.reverse(_.sortBy(this.leaderboard, 'score'))
    
    let text = "LEADERBOARD \n"
    for(let i=0; i<arr.length; i++) {
      text+=arr[i].name + ": " + arr[i].score + "\n"
    }
    return text
  }

  updateDeckSize() {
    this.io.sockets.emit('decksize', this.deck.length)                        
  }
}

export default Game
