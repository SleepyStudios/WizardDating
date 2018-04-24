import _ from 'lodash'
import cards from './cards'
import {v4 as uuid} from 'uuid'

export const TransformCardInHand = (game, socket, card) => {
  let hand = socket.player.hand

  let newCard = _.cloneDeep(cards[_.random(0, cards.length-1)])
  newCard.id = uuid()

  let pos = _.random(0, hand.length-1)

  socket.emit('transform', {oldCard: hand[pos], newCard: newCard})
  hand[pos] = newCard
  socket.emit('hand', socket.player.hand)
}

export const AddDuplicate = (game, socket, card) => {
  let hand = socket.player.hand
  let newCard = _.cloneDeep(_.find(cards, {Name: card.Name})) 
  newCard.id = uuid()

  if(!game.isHandFull(socket)) {
    hand.push(newCard)
  } else {
    socket.emit('discard', newCard)    
    if(newCard.OnDiscard) eval(newCard.OnDiscard)(game, socket, newCard)
  }

  socket.emit('hand', socket.player.hand)
}

export const AddDuplicateTwins = (game, socket, card) => {
  let hand = socket.player.hand
  let newCard = _.cloneDeep(_.find(cards, {Name: card.Name})) 
  newCard.id = uuid()

  if(!game.willHandBeFull(socket)) {
    hand.push(newCard)
  } else {
    socket.emit('discard', newCard)    
    if(newCard.OnDiscard) eval(newCard.OnDiscard)(game, socket, newCard)
  }

  socket.emit('hand', socket.player.hand)
}

export const DiscardCard = (game, socket, card) => {
  let hand = socket.player.hand
  if(hand.length===0) return

  let pos = _.random(0, hand.length-1)
  let discarded = _.cloneDeep(hand[pos])
  hand.splice(pos, 1)
  
  socket.emit('discard', discarded)

  if(discarded.OnDiscard) eval(discarded.OnDiscard)(game, socket, discarded)

  socket.emit('hand', socket.player.hand)
}

export const ShuffleIntoDeck = (game, socket, card) => {
  let position = _.random(1, game.deck.length-1)
  game.deck.splice(position, 0, card)
  game.updateDeckSize()
}

export const TransformRandomCardInDeck = (game, socket, card) => {
  let position = _.random(1, game.deck.length-1)

  let newCard = _.cloneDeep(cards[_.random(0, cards.length-1)])
  newCard.id = uuid()

  game.deck[position] = newCard
}

export const TransformDuplicateInDeck = (game, socket, card) => {
  game.deck.forEach(deckCard => {
    if(deckCard.Name===card.Name) {
      deckCard = _.cloneDeep(cards[_.random(0, cards.length-1)])
      deckCard.id = uuid()
      return
    }
  })
}

export const TransformCardInDeck = (game, socket, card) => {
  let position = game.deck.indexOf(card)

  let newCard = _.cloneDeep(cards[_.random(0, cards.length-1)])
  newCard.id = uuid()
  game.deck[position] = newCard
}

export const HighlanderTransform = (game, socket, card) => {
  let hand = socket.player.hand

  let names = []
  hand.forEach(handCard => {
    names.push(handCard.Name)
  })

  if(names.length !== new Set(names).size) return

  let len = hand.length
  for(let i=0; i<len; i++) {
    let newCard = _.cloneDeep(cards[_.random(0, cards.length-1)])
    newCard.id = uuid()
    socket.emit('transform', {oldCard: hand[i], newCard: newCard})
    
    hand[i] = newCard
  }

  socket.player.hand = hand

  socket.emit('hand', socket.player.hand)
}

export const ShuffleHandIntoDeck = (game, socket, card) => {
  let hand = socket.player.hand

  hand.forEach(handCard => {
    let position = _.random(1, game.deck.length-1)
    game.deck.splice(position, 0, handCard)
    game.updateDeckSize()    
  })
}

export const AddThreeToDeck = (game, socket, card) => {
  let hand = socket.player.hand

  for(let i=0; i<3; i++) {
    card = _.cloneDeep(cards[_.random(0, cards.length-1)])
    card.id = uuid()
    game.deck.push(card)
    game.updateDeckSize()    
  }
}

export const HighlanderDuplicate = (game, socket, card) => {
  let hand = socket.player.hand

  let names = []
  hand.forEach(handCard => {
    names.push(handCard.Name)
  })

  if(names.length !== new Set(names).size) return

  let newCard = _.cloneDeep(card)
  newCard.id = uuid()
  
  if(!game.willHandBeFull(socket)) {
    hand.push(newCard)
  } else {
    socket.emit('discard', newCard)
    if(newCard.OnDiscard) eval(newCard.OnDiscard)(game, socket, newCard)
  }
  socket.emit('hand', socket.player.hand)
}

export const AddRandomCardToHand = (game, socket, card) => {
  let hand = socket.player.hand
  let newCard = _.cloneDeep(cards[_.random(0, cards.length-1)]) 
  newCard.id = uuid()

  if(!game.isHandFull(socket)) {
    hand.push(newCard)
  } else {
    socket.emit('discard', newCard)
    if(newCard.OnDiscard) eval(newCard.OnDiscard)(game, socket, newCard)
  }

  socket.emit('hand', socket.player.hand)
}

export const DiscardHand = (game, socket, card) => {
  let hand = socket.player.hand

  hand.forEach(handCard => {
    socket.emit('discard', handCard)
    if(handCard.OnDiscard) eval(handCard.OnDiscard)(game, socket, handCard)
  })

  hand = []
  socket.emit('hand', socket.player.hand)
}

export const TransformHand = (game, socket, card) => {
  let hand = socket.player.hand

  hand.forEach(handCard => {
    let newCard = _.cloneDeep(cards[_.random(0, cards.length-1)])
    newCard.id = uuid()

    socket.emit('transform', {oldCard: handCard, newCard: newCard})
    
    handCard = newCard
  })

  socket.emit('hand', socket.player.hand)
}

export const ShuffleRandomIntoDeck = (game, socket, card) => {
  let position = _.random(1, game.deck.length-1)

  let shuffledCard = _.cloneDeep(cards[_.random(0, cards.length-1)])
  shuffledCard.id = uuid()
  game.deck.splice(position, 0, shuffledCard)
  game.updateDeckSize()  
}

export const RefillHand = (game, socket, card) => {
  let hand = socket.player.hand
  let missingCards = game.MAX_HAND_SIZE-hand.length+1

  for(let i=0; i<missingCards; i++) {
    let newCard = _.cloneDeep(cards[_.random(0, cards.length-1)])
    newCard.id = uuid()
    hand.push(newCard)
  }

  if(hand.length>game.MAX_HAND_SIZE) hand.splice(hand.length-1, 1)

  socket.emit('hand', socket.player.hand)
}

export const DiscardAndReplace = (game, socket, card) => {
  let hand = socket.player.hand
  if(hand.length<1) return
  
  let pos = _.random(0, hand.length-1)
  let discarded = _.cloneDeep(hand[pos])
  hand.splice(pos, 1)  

  socket.emit('discard', discarded)
  if(discarded.OnDiscard) eval(discarded.OnDiscard)(game, socket, discarded)

  hand.push(card)

  socket.emit('hand', socket.player.hand)  
}

export const DiscardAndReplaceRandom = (game, socket, card) => {
  let hand = socket.player.hand
  if(hand.length<1) return

  let pos = _.random(0, hand.length-1)
  let oldCard = _.cloneDeep(hand[pos])

  socket.emit('discard', hand[pos])
  hand.splice(pos, 1)
  if(oldCard.OnDiscard) eval(oldCard.OnDiscard)(game, socket, hand[pos])
  
  let newCard = _.cloneDeep(cards[_.random(0, cards.length-1)])
  newCard.id = uuid()

  if(!game.isHandFull(socket)) {
    hand.push(newCard)
  } else {
    socket.emit('discard', newCard)    
    if(newCard.OnDiscard) eval(oldCard.OnDiscard)(game, socket, hand[pos])
  }

  socket.emit('hand', socket.player.hand)  
}

export const DuplicateRandomCard = (game, socket, card) => {
  let hand = socket.player.hand
  let pos = _.random(0, hand.length-1)

  let newCard = _.cloneDeep(hand[pos])
  newCard.id = uuid()

  if(game.willHandBeFull(socket)) {
    socket.emit('discard', newCard)
    if(newCard.OnDiscard) eval(newCard.OnDiscard)(game, socket, newCard)
  } else {
    hand.push(newCard)
  }

  socket.emit('hand', socket.player.hand)  
}

export const DiscardDuplicates = (game, socket, card) => {
  let hand = socket.player.hand
  let pos = _.random(0, hand.length-1)

  hand.forEach(handCard => {
    let filteredCards = _.filter(hand, {Name: handCard.Name})
    if(filteredCards.length>1) {
      for(let i=1; i<filteredCards.length; i++) hand.splice(hand.indexOf(filteredCards[i]), 1)
    }
  })

  socket.emit('hand', socket.player.hand)  
}

export const ShuffleForUniquesTotal = (game, socket, card) => {
  let hand = socket.player.hand

  let names = []
  hand.forEach(handCard => {
    names.push(handCard.Name)
  })

  let len = new Set(names).size
  for(let i=0; i<len; i++) {
    let newCard = _.cloneDeep(cards[_.random(0, cards.length-1)])
    newCard.id = uuid()
    game.deck.push(newCard)

    game.updateDeckSize()    
  }
}