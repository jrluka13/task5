import React, { useEffect, useState } from "react";
import "./index.css";
import pen from "./pen.png";
import eraser from "./eraser.png";
import textFormat from "./text-format.png";
import writing from "./writing.png";
import axios from "axios";
export const Board = () => {
  const [stateImg, setStateImg] = useState({
    pen: pen,
    wash: eraser,
    text: textFormat,
    note: writing,
  });
  const [objCurves, setobjCurves] = useState();
  const [objWash, setobjWash] = useState();
  const [textState, setTextState] = useState();
  const [noteState, setNoteState] = useState();

  let objectCurves = {};

  useEffect(() => {
    axios
      .get("https://task5-ca3bb-default-rtdb.firebaseio.com/curves.json")
      .then((response) => {
        if (response.data == null) {
        } else {
          setobjCurves(response.data);
          setobjWash(Object.values(response.data));
        }
      });
    axios
      .get("https://task5-ca3bb-default-rtdb.firebaseio.com/textarea.json")
      .then((response) => {
        setTextState(response.data);
      });

    axios
      .get("https://task5-ca3bb-default-rtdb.firebaseio.com/notes.json")
      .then((response) => {
        setNoteState(response.data);
      });
  }, []);
  useEffect(() => {
    let objOfCurves = {};
    for (let key in objCurves) {
      for (let value in Object.keys(objCurves[key])) {
        objOfCurves[Object.keys(objCurves[key])[value]] = Object.values(
          objCurves[key]
        )[0];
      }
    }

    let canvas = document.getElementById("board");
    var ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let key in objOfCurves) {
      ctx.moveTo(objOfCurves[key][0].x, objOfCurves[key][0].y);
      for (let i = 0; i < objOfCurves[key].length; i++) {
        ctx.lineTo(objOfCurves[key][i].x - 0.5, objOfCurves[key][i].y - 0.5);
      }
    }

    ctx.stroke();
    ctx.closePath();
  }, objCurves);

  useEffect(() => {
    let mainDiv = document.getElementById("mainDiv");

    for (let value in textState) {
      let textarea = document.createElement("textarea");

      textarea.id = Object.keys(textState[value])[0];
      textarea.className = "info";

      textarea.value = Object.values(textState[value])[0];
      textarea.addEventListener("mousedown", (e) =>
        mouseDownOnTextarea(textarea, e)
      );
      textarea.addEventListener("change", (e) => changeText(textarea.id, e));
      mainDiv.appendChild(textarea);
    }
  }, textState);

  useEffect(() => {
    let arr = [];

    for (let value in noteState) {
      arr.push(Object.keys(noteState[value])[0]);
    }
    var unique = arr.filter((v, i, a) => a.indexOf(v) === i);
    for (let value in unique) {
      let btn = document.createElement("button");
      btn.innerText = "add task";
      btn.id = "btn" + unique[value];
      btn.className = "btn";
      let note = document.createElement("div");
      note.id = unique[value];
      note.className = "note";
      note.addEventListener("mousedown", (e) => mouseDownOnTextarea(note, e));
      document.getElementById("noteDiv").appendChild(note);
      document.getElementById(note.id).appendChild(btn);
      for (let value in noteState) {
        console.log(Object.values(noteState[value])[0]);
        let str = Object.values(noteState[value])[0];
        if (note.id === Object.keys(noteState[value])[0]) {
          document
            .getElementById(note.id)
            .insertAdjacentHTML("afterbegin", `<p>${str}</p>`);
        }
      }
    }
  }, noteState);

  function changeText(id, e) {
    let obj = { [id]: e.target.value };
    for (let value in textState) {
      if (Object.keys(textState[value])[0] === id) {
        textState[value][Object.keys(textState[value])[0]] = obj[id];
      }
    }
    axios
      .put(
        "https://task5-ca3bb-default-rtdb.firebaseio.com/textarea.json",
        textState
      )
      .then((response) => {
        console.log(response);
      });
  }
  function mouseDownOnTextarea(textarea, e) {
    var x = textarea.offsetLeft - e.clientX,
      y = textarea.offsetTop - e.clientY;
    function drag(e) {
      textarea.style.left = e.clientX + x + "px";
      textarea.style.top = e.clientY + y + "px";
    }
    function stopDrag() {
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", stopDrag);
    }
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
  }

  function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  const clickImgHundler = (e) => {
    let mainDiv = document.getElementById("mainDiv");
    let canvas = document.getElementById("board");
    var ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineWidth = 2;

    if (e.target.alt === "pen") {
      let rand = getRandomArbitrary(0, 1999999999);
      let arr = [];
      canvas.onmousemove = (e) => {
        var x = e.offsetX * 0.25;
        var y = e.offsetY * 0.25;
        if (e.buttons > 0) {
          arr.push({ x: x, y: y });

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 0.5, y - 0.5);
          ctx.stroke();
          ctx.closePath();

          objectCurves[rand] = arr;
        }
        canvas.onmouseup = (e) => {
          console.log(objectCurves);

          axios
            .post(
              "https://task5-ca3bb-default-rtdb.firebaseio.com/curves.json",
              objectCurves
            )
            .then((response) => {
              console.log(response);
            });
        };
      };
    } else if (e.target.alt === "wash") {
      let arr = [];
      canvas.onmousemove = (e) => {
        var x = e.offsetX * 0.25;
        var y = e.offsetY * 0.25;
        ctx.lineWidth = 3;

        if (e.buttons > 0) {
          arr.push({ x: x, y: y });
          ctx.globalCompositeOperation = "destination-out";
          ctx.fillStyle = "rgba(255,255,255,1)";
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 0.5, y - 0.5);
          ctx.stroke();
          ctx.closePath();
          ctx.globalCompositeOperation = "source-over";
        }
        canvas.onmouseup = (e) => {
          let postObj = {};
          console.log(arr);
          console.log(objWash);
          for (let value in objWash) {
            console.log(Object.keys(objWash[value]));
            console.log(Object.values(objWash[value])[0]);
            arr.forEach((arrItem) => {
              Object.values(objWash[value])[0].forEach((ItemObj) => {
                if (arrItem.x === ItemObj.x && arrItem.y === ItemObj.y) {
                  Object.values(objWash[value])[0].splice(
                    Object.values(objWash[value])[0].indexOf(ItemObj),
                    1
                  );
                  console.log(Object.values(objWash[value])[0]);
                }
              });
            });
            postObj[Object.keys(objWash[value])] = Object.values(
              objWash[value]
            )[0];
          }
          console.log(postObj);
          axios
            .delete(
              "https://task5-ca3bb-default-rtdb.firebaseio.com/curves.json"
            )
            .then((response) => {
              console.log(response);
              for (let key in postObj) {
                console.log({ [key]: postObj[key] });
                axios
                  .post(
                    "https://task5-ca3bb-default-rtdb.firebaseio.com/curves.json",
                    { [key]: postObj[key] }
                  )
                  .then((response) => {
                    console.log(response);
                  });
              }
            });
        };
      };
    } else if (e.target.alt === "text") {
      let textarea = null;
      let rand = getRandomArbitrary(0, 10000000);
      function mouseDownOnTextarea(e) {
        var x = textarea.offsetLeft - e.clientX,
          y = textarea.offsetTop - e.clientY;
        function drag(e) {
          textarea.style.left = e.clientX + x + "px";
          textarea.style.top = e.clientY + y + "px";
        }
        function stopDrag() {
          document.removeEventListener("mousemove", drag);
          document.removeEventListener("mouseup", stopDrag);
        }
        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", stopDrag);
      }
      canvas.onmousedown = () => {
        if (!textarea) {
          textarea = document.createElement("textarea");
          textarea.className = "info";
          textarea.id = "id" + rand;

          textarea.addEventListener("mousedown", mouseDownOnTextarea);
          mainDiv.appendChild(textarea);
        }
        document.getElementById("id" + rand).onchange = (e) => {
          let obj = { [rand]: e.target.value };
          axios
            .post(
              "https://task5-ca3bb-default-rtdb.firebaseio.com/textarea.json",
              obj
            )
            .then((response) => {
              console.log(response);
            });
          console.log(obj);
        };
      };
    } else if (e.target.alt === "note") {
      let btn = null;
      let note = null;
      function mouseDownOnNote(e) {
        var x = note.offsetLeft - e.clientX,
          y = note.offsetTop - e.clientY;
        function drag(e) {
          note.style.left = e.clientX + x + "px";
          note.style.top = e.clientY + y + "px";
        }
        function stopDrag() {
          document.removeEventListener("mousemove", drag);
          document.removeEventListener("mouseup", stopDrag);
        }
        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", stopDrag);
      }
      canvas.onmousedown = () => {
        if (!note) {
          let arr = [];
          let rand = getRandomArbitrary(0, 10000000);
          btn = document.createElement("button");
          btn.innerText = "add task";
          btn.id = "btn" + rand;
          btn.className = "btn";
          note = document.createElement("div");
          note.className = "note";
          note.id = rand;
          note.addEventListener("mousedown", mouseDownOnNote);
          document.getElementById("noteDiv").appendChild(note);
          document.getElementById(note.id).appendChild(btn);
          document.getElementById(btn.id).onclick = () => {
            let task = prompt("Enter your task:");
            arr.push({ [note.id]: task });
            document
              .getElementById(note.id)
              .insertAdjacentHTML("afterbegin", `<p>${task}</p>`);

            axios
              .post(
                "https://task5-ca3bb-default-rtdb.firebaseio.com/notes.json",
                arr[arr.length - 1]
              )
              .then((response) => {
                console.log(response);
              });
          };
        }
      };
    }
  };
  return (
    <div>
      <div style={{ overflow: "hidden" }}>
        <div className="external">
          {Object.keys(stateImg).map((key, index) => {
            return (
              <p key={index}>
                <img
                  style={{ cursor: "pointer" }}
                  src={stateImg[key]}
                  alt={key}
                  onClick={clickImgHundler}
                />
              </p>
            );
          })}
        </div>
        <div id="noteDiv"></div>
        <div id="mainDiv"></div>
        <canvas className="board" id="board"></canvas>
      </div>
    </div>
  );
};
