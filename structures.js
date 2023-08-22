import { Chess } from "/chess.js";
// import { pgnParser } from "/node_modules/pgn-parser/src/pgn-parser";
// const { Chess } = require("chess.js");
// const pgnParser = require("pgn-parser");

class Node {
  constructor(fen, map, neighbors) {
    this.fen = fen;
    this.neighbors = neighbors || {};
    this.map = map;
    // format: (move (str)) => fen
  }
  add(move) {
    move = move.replaceAll(".", "");
    // console.log(move);
    const game = new Chess();
    game.load(this.fen);
    game.move(move);
    const fen = game.fen();
    const exists = this.map[fen];
    if (exists) {
      this.neighbors[move] = exists;
    } else {
      const nextNode = new Node(fen, this.map);
      this.neighbors[move] = nextNode;
      this.map[fen] = nextNode;
    }
    return this.neighbors[move];
  }
}
function createGraph(pgn, currentNode, map) {
  const moves = pgn.moves;

  for (let i = 0; i < moves.length; i++) {
    const moveInfo = moves[i];
    let move = moveInfo.move;
    move = move.replaceAll(".", "");
    if (!currentNode.neighbors[move]) {
      let game = new Chess();
      game.load(currentNode.fen);
      game.move(move);
      const newFen = game.fen();

      let newNode;
      if (!map[newFen]) {
        newNode = new Node(newFen, map, {});
        map[newFen] = newNode;
      } else {
        newNode = map[newFen];
      }

      currentNode.neighbors[move] = newNode;
      map[newFen] = newNode;

      if (moveInfo.ravs) {
        for (const rav of moveInfo.ravs) {
          createGraph({ moves: rav.moves }, currentNode, map);
        }
      }
    }

    currentNode = currentNode.neighbors[move];
  }
}
// const Parse = (map, pgn) => {
//   startingPos = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
//   rootNode = map[startingPos];
//   if (!rootNode) {
//     throw new Error("Invalid map: No root node");
//   }
//   const [result] = pgnParser.parse(pgn);
//   createGraph(result, rootNode, map);
//   // const moves = result["moves"];
// };
// const root = new Node(
//   "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
//   {},
//   {},
// );
// root.map[root.fen] = root;
// Parse(
//   root.map,
//   '[White "me"]\n[Black "you"]\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 (3. ...Nf6 {is the two knights})(3. ...f5 4. d3 (4. d4) Nf6 5. O-O {is stupid}) 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O Nge7 *',
// );
//
// console.log(
//   root.map["r1bqkbnr/pppp2pp/2n5/4pp2/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4"],
// );

// console.log(
//   root.map["r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3"],
// );

export default Node;
