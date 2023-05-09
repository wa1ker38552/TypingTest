async function loadTest(id) {
  var wordsContainer = document.getElementsByClassName("words-container")[0]
  var a = await fetch("/scores/get/"+id)
  var b = await a.json()
  var x = 0
  
  for (word of b.original.split(" ")) {
    var e = document.createElement("span")
    for (char of word) {
      var c = document.createElement("span")
      c.innerHTML = char
      c.id = x
      x += 1
      e.append(c)
    }
    var c = document.createElement("span")
    c.innerHTML = "&nbsp;"
    c.id = x
    x += 1
    e.append(c)
    
    wordsContainer.append(e)
  }

  for (var i=0; i<b.sequence.length; i++) {
    if (b.sequence[i] == 0) {
      document.getElementById(i).style.background = "#6cfe84"
    } else if (b.sequence[i] == 1) {
      document.getElementById(i).style.background = "#fe7171"
    } else {
      document.getElementById(i).style.background = "#eefe76"
    }
  }

  document.getElementById("wpm").innerHTML = b.wpm
  document.getElementById("raw").innerHTML = b.raw
  document.getElementById("accuracy").innerHTML = b.accuracy+"%"
}
