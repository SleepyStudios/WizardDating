class DisconnectEvent {
  constructor(game, socket) {
    socket.on('disconnect', () => {
      console.log(socket.player.name + " left the game")
      game.io.sockets.emit('playercount', game.playercount())    
      game.io.sockets.emit('playerleft', socket.player.name)            
    })
  }
}

export default DisconnectEvent
