//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
//require own module
const date = require(__dirname + "/date.js");

const app = express();

// use ejs as app's view engine - https://github.com/mde/ejs/wiki/Using-EJS-with-Express
app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-lucia:test123@cluster0.hjaev.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Wake up in the morning"
});

const item2 = new Item({
  name: "Get up from the bed"
});

const item3 = new Item({
  name: "Make yourself a cup of tea"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {


  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Items successfully inserted");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });


});

app.get("/:customlistName", function(req, res) {
  const customListName = _.capitalize(req.params.customlistName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (foundList) {
        // show the existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      } else {
        // create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
    }
  });


});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Item removed successfully");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({
        name: listName
      }, {
        $pull: {
          items: {
            _id: checkedItemId
          }
        }
      },
      function(err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      });
  }
});

app.post("/work", function(req, res) {
  workItems.push(item);

  res.redirect("/");
});


app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started successfully");
});
