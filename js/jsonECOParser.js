myMap = new Map();

array.forEach((element) => {
  myMap.set(element.fen, element);
});

const mapArray = Array.from(myMap.entries());

// Convert the array to a string representation using JSON.stringify
const mapString = JSON.stringify(mapArray, null, 2);

// Create a Blob containing the text
const blob = new Blob([mapString], { type: "application/json" });

// Create a download link
const a = document.createElement("a");
a.href = URL.createObjectURL(blob);
a.download = "myMap.json";
a.textContent = "Download Map";

// Append the link to the document
document.body.appendChild(a);
