import { Chess } from "/chess.js";
import { Chessground } from "/node_modules/chessground/dist/chessground.js";
import Node from "./structures.js";

document.addEventListener("contextmenu", function (event) {
  event.preventDefault();
});

const origin = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const map = {};
let nodeC = { node: new Node(origin, map, {}) };

map[origin] = nodeC["node"];

let game = new Chess();
let orientation = "white";
const ground = Chessground(document.getElementById("cg-board"), {
  movable: {
    showDests: true,
    dests: toDests(game),
    free: false,
    disableContextMenu: false,
  },
});

ground.set({
  movable: { events: { after: updateUI(ground, game, nodeC) } },
});

$(".control-button").click((e) => {
  const obj = e.currentTarget.attributes[1];
  if (obj.name == "data-act") {
    switch (obj.nodeValue) {
      case "flip":
        orientation = orientation == "white" ? "black" : "white";
        ground.set({
          orientation: orientation,
        });
        break;
      case "prev":
        game.undo();
        nodeC["node"] = map[game.fen()];
        ground.set({ fen: game.fen(), highlight: { lastMove: false } });
        updateTurn(ground, game);
        updatePanels(nodeC, game);
        ground.redrawAll();
        break;
      case "first":
        game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        nodeC["node"] = map[game.fen()];
        ground.set({ fen: game.fen(), highlight: { lastMove: false } });
        updateTurn(ground, game);
        updatePanels(nodeC, game);
        ground.redrawAll();
        break;
    }
  }
});

$(".tabs-button").click((e) => {
  if (e.currentTarget.className === "tabs-button selected") {
    return;
  }

  $(".panels-container").empty();
  $(".tabs-button.selected").removeClass("selected");
  $(e.currentTarget).addClass("selected");
  updatePanels(nodeC, game);
});

const stockfish = new Worker(
  "/node_modules/stockfish/src/stockfish-nnue-16-single.js",
); // Path to the Stockfish.js script
const multipv = 5;
stockfish.postMessage("uci");
stockfish.postMessage(`setoption name multipv value ${multipv}`);
stockfish.postMessage("setoption name Threads value 3");
stockfish.postMessage("setoption name Use NNUE value true");
stockfish.onmessage = function (event) {
  const logMessage = event.data;
  if (logMessage.startsWith("info")) {
    // console.log(logMessage);
    let data = logMessage.split(" pv ");
    if (data.length < 2) {
      return;
    }
    const moves = data[1].slice(0, 69);
    const info = data[0].split(" ");
    const depth = info[2];
    const pv = info[6];
    const evalType = info[8];
    let evalValue = Number(info[9]);
    if (evalType != "mate") {
      evalValue /= 100;
      if (game.turn() != "w") {
        evalValue *= -1;
      }
      if (evalValue > 0) {
        evalValue = `+ ${evalValue}`;
      }
    }
    // console.log(depth);
    // console.log(moves);

    $(`#${pv}`).empty();

    const line = $("<div>");
    line.addClass("moves-line");
    line.text(moves);
    const evalDiv = $("<div>");
    evalDiv.text(evalValue);
    $(`#${pv}`).append(evalDiv);
    $(`#${pv}`).append(line);
    if (pv == 1) {
      $("#engine-depth").text(`Depth: ${depth}`);
    }
  }
};

$("#engine-toggle").change(function () {
  if ($(this).is(":checked")) {
    stockfish.postMessage("position fen " + game.fen());
    stockfish.postMessage("go");
  } else {
    stockfish.postMessage("stop");
  }
});
