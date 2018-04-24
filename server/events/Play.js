import * as CardActions from '../CardActions'
import _ from 'lodash'

class PlayEvent {
  constructor(game, socket) {
    socket.on('play', args => {
      let card = _.find(socket.player.hand, {id: args.handID})
      if(!card || socket.player.hand.indexOf(card)==-1) return    

      socket.emit('play', card)

      game.deck.push(card)
      game.updateDeckSize()      
      socket.player.hand.splice(socket.player.hand.indexOf(card), 1)

      if(card.OnPlay) eval('CardActions.' + card.OnPlay)(game, socket, card)
 
      socket.emit('hand', socket.player.hand)
      game.checkHand(socket)

      let topCard = game.getCard(args.deckID)
      if(!topCard || game.deck.indexOf(topCard)===-1) return

      let nextIndex = game.deck.indexOf(topCard)+1
      socket.emit('deck', nextIndex>=game.deck.length ? game.deck[0] : game.deck[nextIndex])
    })
  }
}

export default PlayEvent