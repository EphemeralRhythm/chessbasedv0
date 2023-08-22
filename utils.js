let soundPath = "sounds/standard/";
let moveSound = "Move.ogg";
let captureSound = "Capture.ogg";
let checkSound = "Check.ogg";

const ecoMap = {};
array.forEach((element) => {
  ecoMap[element.fen] = element;
});
ecoName = "";

const toDests = (chess) => {
  const dests = new Map();
  chess.moves({ verbose: true }).forEach((move) => {
    const existingSources = dests.get(move.from) || []; // Get existing sources or create an empty array
    existingSources.push(move.to); // Append the current source to the array
    dests.set(move.from, existingSources);
  });
  return dests;
};

const toColor = (chess) => {
  return chess.turn() === "w" ? "white" : "black";
};

const updatePanels = (nodeC, chess) => {
  const mode = $(".tabs-button.selected")[0].attributes[1].nodeValue;
  const node = nodeC["node"];
  switch (mode) {
    case "notation":
      console.log(ecoMap[node.fen]);
      if (ecoMap[node.fen]) {
        ecoName = ecoMap[node.fen].eco + ": " + ecoMap[node.fen].name;
      }
      $(".panels-container").empty();
      const name = $("<div>");
      name.addClass("opening-name");
      name.text(ecoName);
      const pgn = chess.pgn();
      const pgnDiv = $("<div>");
      pgnDiv.addClass("variations-container");
      pgnDiv.text(pgn);
      $(".panels-container").append(name);
      $(".panels-container").append(pgnDiv);

      break;
    case "repertoire":
      $(".panels-container").empty();
      const table = $("<table>");
      table.addClass("explorer-table");

      const tbody = $("<tbody>");
      tbody.addClass("explorer-tbody");

      for (const move in node.neighbors) {
        const row = $("<tr>");
        row.addClass("explorer-line");
        row.attr("data-act", move);
        const m = $("<td>");

        const cell = $("<cell>");
        cell.text(move);
        m.append(cell);
        row.append(m);

        tbody.append(row);
      }

      table.append(tbody);
      $(".panels-container").append(table);
  }
};
const updateTurn = (cg, chess) => {
  cg.set({
    check: chess.inCheck(),
    turnColor: toColor(chess),
    fen: chess.fen(),
    movable: {
      color: toColor(chess),
      dests: toDests(chess),
    },
  });
};
const updateUI = (cg, chess, nodeC) => {
  return (orig, dest) => {
    const move = chess.move({ from: orig, to: dest });

    let node = nodeC["node"];
    node.add(move.san);
    let next = node.map[move.after] || new Node(move.after, node.map, {});
    nodeC["node"] = next;

    if (move.san.includes("+") && soundPath != "sounds/standard/") {
      const audio = new Audio(soundPath + checkSound);
      audio.play();
    } else if (move.san.includes("x")) {
      const audio = new Audio(soundPath + captureSound);
      audio.play();
    } else {
      const audio = new Audio(soundPath + moveSound);
      audio.play();
    }

    updateTurn(cg, chess);
    updatePanels(nodeC, chess);
  };
};
