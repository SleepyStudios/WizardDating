import DisconnectEvent from './Disconnect'
import cards from '../cards'
import _ from 'lodash'
import SwipeEvent from './Swipe'
import PickupEvent from './Pickup'
import PlayEvent from './Play'
import {v4 as uuid} from 'uuid'

class NewPlayerEvent {
  constructor(game, socket) {
    socket.on('newplayer', name => {
      socket.player = {
        id: uuid(),
        hand: game.genHand(),
        name: name,
        score: 0
      }
      
      console.log(name + " joined the game")  
      game.io.sockets.emit('playerjoin', name)                

      socket.emit('hand', socket.player.hand)
      socket.emit('deck', game.deck[0]) 
      socket.emit('decksize', game.deck.length)
      game.io.sockets.emit('playercount', game.playercount())    
      
      game.updateLeaderboard(socket)
      game.io.sockets.emit('leaderboard', game.getLeaderboard())            

      new DisconnectEvent(game, socket)
      new PlayEvent(game, socket)
      new SwipeEvent(game, socket)
      new PickupEvent(game, socket)
    })
  }
}

export default NewPlayerEvent
