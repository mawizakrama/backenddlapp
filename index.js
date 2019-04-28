const express = require("express");
const bodyParser = require("body-parser");
const io = require("socket.io");
const firebase = require("firebase");
const app = express();
const server = require("http").createServer(app);
const webSocket = io(server);

app.use(bodyParser.json());

firebase.initializeApp({
  apiKey: "AIzaSyBSotxoQCHFHN-S0D62INrmqm-xqhWwKMc",
  authDomain: "dlapp-2208.firebaseapp.com",
  databaseURL: "https://dlapp-2208.firebaseio.com",
  projectId: "dlapp-2208",
  storageBucket: "dlapp-2208.appspot.com",
  messagingSenderId: "1085165063272"
});

app.post("/learnerRegister", (req, res) => {
  if (
    req.body === undefined ||
    req.body === null ||
    req.body === "{}" ||
    req.body.email === undefined ||
    req.body.email === null ||
    req.body.email === "" ||
    req.body.password === undefined ||
    req.body.password === null ||
    req.body.password === "" ||
    req.body.fullname === undefined ||
    req.body.fullname === null ||
    req.body.fullname === "" ||
    req.body.cpassword === undefined ||
    req.body.cpassword === null ||
    req.body.cpassword === "" ||
    req.body.phone === undefined ||
    req.body.phone === null ||
    req.body.phone === ""
  ) {
    res.json({ message: "All Fields are Required" });
  } else {
    if (req.body.password === req.body.cpassword) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(req.body.email, req.body.password)
        .then(data => {
          if (data.user.uid !== undefined) {
            data.user
              .updateProfile({
                displayName: req.body.fullname
              })
              .then(() => {
                data.user
                  .sendEmailVerification()
                  .then(() => {
                    firebase
                      .database()
                      .ref("users/learner/" + data.user.uid)
                      .set({
                        email: data.user.email,
                        full_name: req.body.fullname,
                        phone: req.body.phone
                      });
                  })
                  .catch(err3 => res.json(err3));
              })
              .catch(err2 => res.json(err2));
          }
          res.json({
            message: "Registration Successfull!",
            user: newUser.user
          });
        })
        .catch(err => {
          res.json(err);
        });
    } else {
      res.json({ message: "Password does not match!" });
    }
  }
});

app.post("/instructorRegister", (req, res) => {
  if (
    req.body === undefined ||
    req.body === null ||
    req.body === "{}" ||
    req.body.email === undefined ||
    req.body.email === null ||
    req.body.email === "" ||
    req.body.password === undefined ||
    req.body.password === null ||
    req.body.password === "" ||
    req.body.fullname === undefined ||
    req.body.fullname === null ||
    req.body.fullname === "" ||
    req.body.cpassword === undefined ||
    req.body.cpassword === null ||
    req.body.cpassword === "" ||
    req.body.phone === undefined ||
    req.body.phone === null ||
    req.body.phone === "" ||
    req.body.institute === "" ||
    req.body.institute === undefined ||
    req.body.institute === null
  ) {
    res.json({ message: "All Fields are Required" });
  } else {
    if (req.body.password === req.body.cpassword) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(req.body.email, req.body.password)
        .then(data => {
          if (data.user.uid !== undefined) {
            data.user
              .updateProfile({
                displayName: req.body.fullname
              })
              .then(() => {
                data.user
                  .sendEmailVerification()
                  .then(() => {
                    firebase
                      .database()
                      .ref("users/instructor/" + data.user.uid)
                      .set({
                        email: data.user.email,
                        full_name: req.body.fullname,
                        phone: req.body.phone,
                        instituteId: req.body.institute
                      });
                  })
                  .catch(err3 => res.json(err3));
              })
              .catch(err2 => res.json(err2));
          }
          res.json({
            message: "Registration Successfull!",
            user: newUser.user
          });
        })
        .catch(err => {
          res.json(err);
        });
    } else {
      res.json({ message: "Password does not match!" });
    }
  }
});

app.post("/learnerLogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    if (user.user.uid !== undefined) {
      await firebase
        .database()
        .ref("users/learner/" + user.user.uid)
        .on("value", snapshot => {
          if (
            snapshot.val() !== undefined &&
            snapshot.val().email == user.user.email
          ) {
            const resUser = {
              uid: snapshot.key,
              fullname: snapshot.val().fullname,
              email: snapshot.val().email,
              phone: snapshot.val().phone
            };
            res.json({ message: "Login Successfull", user: resUser });
          } else {
            res.json({
              message: "Email or Password is incorrect!"
            }).statusCode = 401;
          }
        });
    }
  } catch (e) {
    res.json(e);
  }
});

app.post("/instructorLogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    if (user.user.uid !== undefined) {
      await firebase
        .database()
        .ref("users/instructor/" + user.user.uid)
        .on("value", snapshot => {
          if (
            snapshot !== undefined &&
            snapshot.val() !== undefined &&
            snapshot.val() !== null &&
            snapshot.val().email !== undefined &&
            snapshot.val().email !== undefined &&
            snapshot.val().email == user.user.email
          ) {
            res.json({ message: "Login Successfull", user: snapshot.key });
          } else {
            res.json({
              message: "Email or Password is incorrect!"
            }).statusCode = 401;
          }
        });
    }
  } catch (e) {
    res.json(e);
  }
});

app.get("/getInstitutes", (req, res) => {
  firebase
    .database()
    .ref("/Institutes")
    .on("value", snapshot => {
      let items = [];
      snapshot.forEach(child => {
        items.push({
          name: child.val().name,
          _key: child.key
        });
      });
      res.json(items);
    });
});

app.get("/getLessons", (req, res) => {
  firebase
    .database()
    .ref("/Lessons")
    .on("value", snapshot => {
      let lessons = [];
      snapshot.forEach(child => {
        lessons.push({
          name: child.val().name,
          _key: child.key
        });
      });
      res.json(lessons);
    });
});

app.post("/updateInsLocation", (req, res) => {
  if (req.body.iid === "" || req.body.lat === "" || req.body.lng === "") {
    res.json({ status: 400, message: "All Fields are Required!" });
  } else {
    firebase
      .database()
      .ref("users/instructor/" + req.body.iid)
      .on(
        "value",
        snapshot => {
          let instructor = snapshot.val();
          instructor.latitude = req.body.lat;
          instructor.longitude = req.body.lng;
          firebase
            .database()
            .ref("users/instructor/" + req.body.iid)
            .set(instructor)
            .then(() => console.log("Updated!"))
            .catch(err2 => console.log(err2));
        },
        err => res.json(err)
      );
  }
});

webSocket.on("connection", socket => {
  console.log("A New user has connected :D");

  socket.on("disconnect", () => {
    console.log("A user has disconnected :(");
  });

  socket.on("started", message => {
    console.log(message);
  });

  socket.on("request_ins", information => {
    let user = {};
    firebase
      .database()
      .ref("/users/learner/" + information.uid)
      .on("value", snapshot => {
        user = snapshot.val();
        user.latitude = information.lat;
        user.longitude = information.lng;
        firebase
          .database()
          .ref("/users/learner/" + information.uid)
          .set(user);
        socket.emit("newLearner", user);
      });
  });
});

let port = process.env.PORT || 3000;

server.listen(port, () => console.log("Server Started at port " + port));
