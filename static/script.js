function finished(original) {
  trackTime = false
  try {document.getElementById("cursor").remove()}
  catch (e) {}

  wpm, raw, accuracy = updateStats()
  saveScore(original, wpm, raw, accuracy)
}

async function fetchGlobalStatistics() {
  var a = await fetch("/scores/get")
  var b = await a.json()
  console.log(b)
  document.getElementById("totalTaken").innerHTML = b.tests_taken
  document.getElementById("highestWpm").innerHTML = b.highest_wpm
  document.getElementById("highestRaw").innerHTML = b.highest_raw
  document.getElementById("averageWpm").innerHTML = b.average_wpm
  document.getElementById("averageRaw").innerHTML = b.average_raw 
  document.getElementById("averageAccuracy").innerHTML = b.average_accuracy+"%"
}

function saveScore(original, wpm, raw, accuracy) {
  var sequence = []
  for (word of document.getElementsByClassName("words-container")[0].children) {
    for (char of word.children) {
      if (char.style.background == "rgb(108, 254, 132)") {
        sequence.push(0) // green
      } else if (char.style.background == "rgb(254, 113, 113)") {
        sequence.push(1) // red
      } else {
        sequence.push(2) // yellow
      }
    }
  }
  fetch("/scores/save", {
    method: "POST",
    body: JSON.stringify({
      original_sequence: original,
      wpm: parseInt(wpm.innerHTML),
      raw: parseInt(raw.innerHTML),
      accuracy: accuracy,
      sequence: sequence.join("")
    }),
    headers: {"Content-type": "application/json; charset=UTF-8"}
  })
    .then(response => response.json())
    .then(response => {
      document.getElementById("shareLink").innerHTML = window.location.href.split("?")[0]+"share/"+response.id
      document.getElementById("shareContainer").style.display = "block"
    })
}

function copyLink() {
  navigator.clipboard.writeText(document.getElementById("shareLink").innerHTML);
  document.getElementsByClassName("link")[0].style.color = "#6cfe84"
  document.getElementsByClassName("link")[0].innerHTML = "Copied!"
}

function updateStats() {
  var t = document.getElementById("timer")
  var m = parseInt(t.innerHTML.split(":")[0])
  var s = parseInt(t.innerHTML.split(":")[1])

  var totalTime = m*60+s
  var correct = 0
  var incorrect=  0

  for (word of document.getElementsByClassName("words-container")[0].children) {
    for (char of word.children) {
      if (char.style.background == "rgb(254, 113, 113)") {
        incorrect += 1
      } else if (char.style.background == "rgb(108, 254, 132)" || char.style.background == "rgb(238, 254, 118)") {
        correct += 1
      }
    }
  }

  var wpm = Math.round((correct/5)/(totalTime/60))
  var raw = Math.round(((correct+incorrect)/5)/(totalTime/60))
  var accuracy = Math.round(correct/(correct+incorrect)*100)
    
  document.getElementById("wpm").innerHTML = wpm
  document.getElementById("raw").innerHTML = raw
  document.getElementById("accuracy").innerHTML = accuracy+"%"

  return wpm, raw, accuracy
}

function updateCursor(x, original) {
  try {
    var e = document.getElementById(x).getBoundingClientRect();
    var c = document.getElementById("cursor")
    c.style.top = e.top+"px"
    c.style.left = e.left+"px"
  } catch (e) {finished(original)}
}

function timer() {
  if (trackTime) {
    var t = document.getElementById("timer")
    var minutes = parseInt(t.innerHTML.split(":")[0])
    var seconds = parseInt(t.innerHTML.split(":")[1])
    seconds += 1
    if (seconds == 60) {
      minutes += 1
      seconds = 0
    }
    if (minutes < 10 && seconds < 10) {
      t.innerHTML = "0"+minutes+":0"+seconds
    } else if (minutes < 10) {
      t.innerHTML = "0"+minutes+":"+seconds
    } else if (seconds < 10) {
      t.innerHTML = "0"+minutes+":0"+seconds
    } else {
      t.innerHTML = minutes+":"+seconds
    }
  }
}

function loadWords(words) {
  var x = 0
  for (word of words) {
    var e = document.createElement("span")
    for (char of word.split("")) {
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
    
    document.getElementsByClassName("words-container")[0].append(e)
  }
  document.getElementById(x-1).remove()
}

function check(current, cursor, original) {
  if (current.style.background == "rgb(254, 190, 190)") {
    current.style.background = "#eefe76"
  } else {
    current.style.background = "#6cfe84"
  }
  if (cursor+1 == original.length) {finished(original)}
  else {updateCursor(cursor+1, original)}
}

function runOnload(words) {
  var original = words
  var words = original.split(" ")
    
  loadWords(words)
  updateCursor(0, original)
  
  document.onkeypress = function (e) {
    if (trackTime) {
      if (cursor == 0) {
        timer()
        setInterval(timer, 1000)
        setInterval(updateStats, 500)
      }
      var current = document.getElementById(cursor)
      if (e.key == current.innerHTML) {
        check(current, cursor, original)
        cursor += 1
      } else if (current.innerHTML == "&nbsp;" && e.key == " ") {
        check(current, cursor, original)
        cursor += 1
      } else {
        current.style.background = "#fe7171"
        cursor += 1
        updateCursor(cursor, original)
      }
    }
  }

  document.onkeydown = function(e) {
    if (trackTime) {
      if (e.key == "Backspace") {
        var previous = document.getElementById(cursor)
        if (previous.style.background == "rgb(254, 190, 190)") {
          previous.style.background = "#febebe"
        } else {
          previous.style.background = ""
        }
  
        if (cursor != 0) {
          cursor -= 1;
          var current = document.getElementById(cursor)
          if (current.style.background == "rgb(254, 113, 113)") {
            current.style.background = "#febebe"
          }
          updateCursor(cursor, original)
        }
      }
    }
  }
}
