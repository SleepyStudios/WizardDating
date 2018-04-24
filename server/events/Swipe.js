import * as CardActions from '../CardActions'

class SwipeEvent {
  constructor(game, socket) {
    socket.on('swipe', id => {
      let card = game.getCard(id)

      if(!card || game.deck.indexOf(card)===-1) return
      if(card.OnSwipe) eval('CardActions.' + card.OnSwipe)(game, socket, card)

      game.checkHand(socket)

      let nextIndex = game.deck.indexOf(card)+1
      socket.emit('deck', nextIndex>=game.deck.length ? game.deck[0] : game.deck[nextIndex])
    })
  }
}

export default SwipeEvent