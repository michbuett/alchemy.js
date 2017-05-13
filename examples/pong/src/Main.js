// module Main

exports.renderGameState = function renderGameState(s) {
  return function() {
    // console.log('renderGameState', s);
    updatePos(s.ball);
    updatePos(s.paddle1);
    updatePos(s.paddle2);
    updateScore(s.score);
  };
};

function updatePos(o) {
  var el = document.getElementById(o.id);

  el.setAttribute('class', o.css);
  el.setAttribute('style', [
    'left:' + (o.x | 0) + 'px;',
    'top:' + (o.y | 0) + 'px;',
  ].join(''));
}

function updateScore(s) {
  document.getElementById('score').innerHTML = s.player1 + ' : ' + s.player2;
}
