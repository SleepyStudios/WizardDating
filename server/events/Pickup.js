import _ from 'lodash'
import * as CardActions from '../CardActions'

class PickupEvent {
  constructor(game, socket) {
    socket.on('pickup', id => {
      let card = game.getCard(id)

      if(!card || game.deck.indexOf(card)===-1) return
      if(socket.player.hand.length>=game.MAX_HAND_SIZE) return
      
      if(card.OnPickup) eval('CardActions.' + card.OnPickup)(game, socket, card)
      socket.player.hand.push(card)      

      let nextIndex = game.deck.indexOf(card)+1
      game.deck.splice(game.deck.indexOf(card), 1)

      socket.emit('pickup', card)

      socket.emit('hand', socket.player.hand)
      game.checkHand(socket)
      
      socket.emit('deck', nextIndex>=game.deck.length ? game.deck[0] : game.deck[nextIndex])
    })
  }
}

export default PickupEvent