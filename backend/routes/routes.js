const mongoose = require('mongoose');
const express = require('express');
const expressValidator = require('express-validator');
const models = require('../models/models');
const User = models.User;
const Community = models.Community;
const Item = models.Item;
const Request = models.Request;
const router = express.Router();

// POST create new community
// Create a new community in the database
// Req.body receives: name, description, owner (oid)
router.post('/community', (req, res) => {
  // Create the new community from the model
  var newUser = mongoose.Types.ObjectId(req.body.owner);
  const newCommunity = new Community({
    name: req.body.name,
    description: req.body.description,
    users: [newUser],
    items: [],
    requests: []
  });
  // Save the community to the database
  newCommunity.save()
  .then(community => {
    res.json({ success: true, response: community });
  })
  .catch(err => {
    console.log("Error saving community", err);
    res.json({ success: false, failure: err });
  });
});

// POST create new user
// Adds existing user to community object
// Req.body receives: username, communityId
router.post('/user', (req, res) => {
  User.findOne({username: req.body.username}, (err, user) => {
    Community.findById(req.body.communityId)
    .then(community => {
      // If the user already exists in the community, send an error
      if (community.users.indexOf(user._id) !== -1) {
        console.log("Error: user already exists");
        res.json({ success: true, response: community });
      } else {
        // Otherwise, push the valid user id into the community users array then update in database
        const newUsers = [...community.users];
        newUsers.push(user._id);
        community.update({ users: newUsers })
        .then((result) => {
          community.users = newUsers;
          // Send back the community json object with the updated array
          res.json({ success: true, response: community });
        });
      }
    })
    .catch(error => {
      console.log(error);
      res.json({ success: false, failure: error });
    });
  });
});

// POST create new item
// Update both commmunity and item sections of database
// Req.body receives: name, imgURL, owner, communityId
router.post('/item', (req, res) => {
  // Create the new item from the model
  const newItem = new Item({
    name: req.body.name,
    imgURL: req.body.imgURL,
    owner: req.body.owner
  });

  // Save the new item to the database,
  // also update the community to include this item
  newItem.save()
  .then(item => {
    Community.findById(req.body.communityId)
    .then(community => {
      const resultItemsArray = [...community.items];
      resultItemsArray.push(item._id);
      // Push the item id into the community items array then update in database
      community.update({ items: resultItemsArray })
      .then(result => {
        community.items = resultItemsArray;
        console.log("You created an item in the commmunity!");
        User.findById(req.body.owner)
        .then((user) => {
          user.stats[0] = user.stats[0] + 1;
          user.save()
          .then(() => {
            // Send back the community json object with the updated array
            return res.json({ success: true, response: community });
          });
        });
      });
    });
  })
  .catch(err => {
    console.log(err);
    return res.json({ success: false, failure: err });
  });
});

// POST delete an item
// Update both commmunity and item sections of database
// Req.body receives: itemId, communityId
router.post('/item-delete', ( req, res ) => {
  Community.findById(req.body.communityId)
  .then(foundCommunity => {
    console.log("FOUND THE RIGHT COMMUNITY", foundCommunity.items);
    let index = false;
    for (var i = 0; i < foundCommunity.items.length; i++) {
      console.log("HELLO HERE", typeof req.body.itemId);
      if (req.body.itemId === JSON.parse(JSON.stringify(foundCommunity.items[i]))) {
        index = i;
        console.log("REMOVING THE ITEM OF INDEX", index);
      } else {
        console.log("SOMETHING'S WRONG", JSON.stringify(foundCommunity.items[i]));
      }
    }
    if (index !== false) {
      const itemCopy = foundCommunity.items;
      itemCopy.splice(index, 1);
      console.log("ITEM COPY HERE", itemCopy);
      foundCommunity.update({ items: itemCopy })
      .then((resp) => {
        Item.findById(req.body.itemId)
        .remove()
        .then((result) => {
          foundCommunity.items = itemCopy;
          console.log("UPDATED ITEMS", foundCommunity.items);
          return res.json({ success: true, response: foundCommunity });
        });
      });
    }
  })
  .catch((err) => {
    console.log(err);
    return res.json({ success: false, failure: err });
  });
});

// POST create new request
// Create a new request within the community
// update both the community and the request section of database
// Req.body receives: owner, text, communityId
router.post('/request', (req, res) => {
  // Create the new request from the modal
  const newRequest = new Request({
    requester: req.body.requester,
    text: req.body.text,
    datePosted: req.body.datePosted
  });

  // Save the new request in database
  newRequest.save()
  .then(request => {
    console.log('1');
    Community.findById(req.body.communityId)
    .then(community => {
      console.log('2');
      const resultRequestArray = [...community.requests];
      resultRequestArray.push(request._id);
      // Push the request id into the community requests array then update in database
      community.update({requests: resultRequestArray})
      .then(result => {
        console.log('3');
        community.requests = resultRequestArray;
        console.log("Request added to database");
        // Send back the community json object with the updated array
        return res.json({ success: true, response: community });
      })
      .catch((e) => {
        console.log(e);
      });
    })
    .catch((e) => {
      console.log('second', e);
    });
  })
  .catch(err => {
    console.log(err);
    return res.json({ success: false, failure: "database error" });
  });
});

// GET all users
// Used to pull usernames from database for username search
router.get('/users', (req, res) => {
  User.find({})
  .then((users) => {
    res.json({success: true, users: users});
  })
  .catch((err) => {
    res.json({success: false, failure: err});
  });
});

router.get('/users/:username', (req, res) => {
  User.findOne({username: req.params.username})
  .then((user) => {
    res.json({sucess: true, user: user});
  })
  .catch((err) => {
    res.json({success: false, failure: err});
  });
});


// GET profile page
// Retrieves user information from database for their profile
// Req.params.id is user's database id
router.get('/profile/:id', (req, res) => {
  let userObject = {};
  const id = req.params.id;
  User.findById(req.params.id)
  .then( userProfile => {
    userObject = JSON.parse(JSON.stringify(userProfile));
    return Community.find({ users: { $all: [id] } });
  })
  .then((communities) => {
    console.log("COMMS", communities);
    console.log("USER OBJECT", userObject);
    userObject['communities'] = JSON.parse(JSON.stringify(communities));
    console.log("USER OBJECT2", userObject);
    return res.json({success: true, user: userObject});
  })
  .catch( err =>
    res.json({ success: false, failure: err })
  );
});

// GET all communities
// Retrieves all the communities in the database for the users to search through
router.get('/communities/all', (req, res) => {
  console.log("COMMUNITIES ALL");
  Community.find({})
  .then((communities) => {
    return res.json({success: true, communities: communities});
  })
  .catch(err => {
    console.log(err);
    return res.json({success: false, failure: err});
  });
});

// GET communities
// Retrieves all the communities belonging to a specific user
// Req.params.id is user's database id
router.get('/communities/:id', (req, res) => {
  const id = req.params.id;
  Community.find({ users: { $all: [id] } })
  .then((communities) => {
    if (!communities) {
      return res.json({success: false, failure: "community does not exist"});
    }
    console.log("Successfully sent community data", communities);
    return res.json(communities);
  })
  .catch(err => {
    console.log(err);
    return res.json({success: false, failure: err});
  });
});

// GET specific community information
// Used for Community Profile information
router.get('/community/:communityId', (req, res) => {
  // Find the community by the given id and populate arrays of Object ids
  Community.findById(req.params.communityId)
  .populate('users')
  .populate('items')
  .populate('requests')
  .then((community) => {
    if (!community) {
      console.log("Community does not exist");
      return res.json({ success: false, failure: "Community does not exist" });
    }
    // Send the community json object
    return Item.populate(community.items, {path: 'owner'})
    .then((result) => {
      Request.populate(community.requests, {path: 'owner'})
      .then((result) => {
        console.log("COMMUNITY!!!", community);
        return res.json({success: true, community: community});
      });
    });
  })
  .catch(err => {
    console.log(err);
    res.json({ success: false, failure: err });
    return;
  });
});

// GET edit user profile
// Retrieves user information from database,
// feeds form for users to edit their profile
router.get('/edit-profile/:id', (req, res) => {
  User.findById(req.params.id)
  .then( profile => {
    res.json({success: true, profile});
  })
  .catch( err => {
    res.json({success: false, failure: err});
  });
});

// POST edit user profile
// Updates user model in database with user information from body
// Req.body receives: fName, lName, email; Req.params: id
router.post('/edit-profile/:id', (req, res) => {
  User.findById(req.params.id)
  .then( profile => {
    profile.fName = req.body.fName;
    profile.lName = req.body.lName;
    profile.email = req.body.email;
    profile.save()
    .then(() => {
      res.json({ success: true });
    });
  })
  .catch((err) => {
    res.json({success: false, failure: err});
  });
});

// GET edit community profile
// Retrieves community information from database,
// feeds form for users to edit the community's profile
router.get('/edit-community/:communityId', (req, res) => {
  Community.findById(req.params.communityId)
  .then( community => {
    res.json({success: true, community: community });
  })
  .catch( err => {
    res.json({success: false, failure: err});
  });
});

// POST edit community profile
// Updates community model in database with community information from body
// Req.body receives: name, description; Req.params: communityId
router.post('/edit-community/:communityId', (req, res) => {
  Community.findById(req.params.communityId)
  .then( community => {
    community.name = req.body.name;
    community.description = req.body.description;
    community.save()
    .then(() => {
      res.json({ success: true, community });
    });
  })
  .catch((err) => {
    res.json({ success: false, failure: err });
  });
});

// POST user stats
// Used to calculate user's posted items
// Req.params.id: user id
router.get('/calculate-stats/:id', (req, res) => {
  User.findById(req.params.id)
  .then((user) => {
    console.log("USER: ", user.fName);
    Item.find({ owner: req.params.id })
    .then((item) => {
      console.log("ITEMS", item);
      user.stats[0] = item.length;

      user.save()
      .then(() => {
        res.json({ success: true, given: item.length });
      });
    });
  })
  .catch((err) => {
    res.json({ success: false, failure: err });
  });
});

module.exports = router;
