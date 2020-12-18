var config = require("./config.json");
module.exports = function () {
    var greet = document.createElement("div");
    greet.textContent = config.greetText;
    console.log(greet);
    console.log("greetz");
    return greet;
}
