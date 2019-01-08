"use strict"
const Conversation = require('../models/Conversation'),  
      Message = require('../models/Message'),
      User = require('../models/User');


exports.getConversations = function(req, res, next) {  
  // Only return one message from each conversation to display as snippet
  Conversation.find({ participants: req.user._id })
    .select('_id')
    .exec(function(err, conversations) {
      if (err) {
        res.send({ error: err });
        return next(err);
      }
      if(conversations.length===0) {
        return res.status(200).json({ message: "No conversations yet" });
      }

      // Set up empty array to hold conversations + most recent message
      let fullConversations = [];
      conversations.forEach(function(conversation) {
        Message.find({ 'conversationId': conversation._id })
          .sort('-createdAt')
          .limit(1)
          .populate({
            path: "author",
            select: "profile.firstName profile.lastName"
          })
          .exec(function(err, message) {
            if (err) {
              res.send({ error: err });
              return next(err);
            }
            fullConversations.push(message);
            if(fullConversations.length === conversations.length) {
              return res.status(200).json({ conversations: fullConversations });
            }
          });
      });
  });
}

exports.getConversation = function(req, res, next) { 
  //populating the conversation with clients
  Conversation.findOne({"_id":req.params.conversationID}, (err, conversation) =>{
    if(err){throw err;}
    var participants = conversation.participants;
    //validate current user is one of the partcipants
    var validated = false;
    if(req.user){
      for(var i = 0; i < participants.length; i++){
        if(participants[i] == req.user._id.toString()){
          validated = true;

          //get all participants information except current user
          var length = participants.length;
          var participantsInfo = [];
          participants.forEach((partcipant)=>{
            User.findOne(partcipant, (err, user)=>{
              length--;
              if(err){throw err;}
              if(user && user._id.toString() != req.user._id.toString()){
                var participantInfo = [];
                participantInfo.push(user._id);
                participantInfo.push(user.profile.name || "");
                participantInfo.push(user.profile.picture || "");
                participantsInfo.push(participantInfo);
              }
              if(length == 0){
                //populating the conversation with messages
                Message.find({ "conversationId":req.params.conversationID})
                  .select('createdAt body author')
                  .sort('-createdAt')
                  .populate({
                    path: 'author',
                    select: 'profile.firstName profile.lastName'
                  })
                  .exec(function(err, messages) {
                    if (err) {
                      res.send({ error: err });
                      return next(err);
                    }
                    res.render('chat', {messages: messages, participants: participantsInfo, currentUser: req.user});
                    //res.status(200).json({ conversation: messages });
                });
              }
            }); 
          }); //end of foreach
        }
      }//end of for
      //current user is not one of the particpants of the conversation
    }//end of if(req.user)
    if(!validated){
      res.status(400).json({error: "ERROR! You do not have permission to access this conversation!"});
    }//end of if(!validated)

  });//end of Conversation.findOne

}


/**
 *  new conversations can be initiated by clicking "message" button on the user  
 *  1. client x clicks "message" to client y 
 *  2. a new Conversation z is created containing participants x and y
 *  3. a new message is created with z's id and what x has written
 */
exports.newConversation = function(req, res, next) { 
  console.log(req.params);
  console.log(req.params.recipient); 
  if(!req.params.recipient) {
    res.status(422).send({ error: 'Please choose a valid recipient for your message.' });
    return next();
  }

  if(!req.body.composedMessage) {
    res.status(422).send({ error: 'Please enter a message.' });
    return next();
  }

  //check if there exists a conversation between two clients
  Conversation.find({ participants: req.user._id })
    .select('_id')
    .exec(function(err, conversations) {
      if (err) {
        res.send({ error: err });
        return next(err);
      }
      if(conversations.length!=0) {
        var length = conversations.length-1;
        conversations.forEach((convo)=>{
          length--;
          var temp = [req.user._id, req.params.recipient];
          if(convo.participants === temp){
            res.redirect('/chat/', convo._id);
          }
          if(length == 0){  //there does not exist a conversation between these two participants
            const conversation = new Conversation({
              participants: [req.user._id, req.params.recipient]
            });

            conversation.save(function(err, newConversation) {
              if (err) {
                res.send({ error: err });
                return next(err);
              }
              
              const message = new Message({
                conversationId: newConversation._id.toString(),
                body: req.body.composedMessage,
                author: req.user._id
              });

              message.save(function(err, newMessage) {
                if (err) {
                  res.send({ error: err });
                  return next(err);
                }
                //TODO: redirect to conversation page or stay where the user is?
                res.redirect('/chat/'+conversation.id.toString());
              });
            });
          }
        });
      }else{
        const conversation = new Conversation({
          participants: [req.user._id, req.params.recipient]
        });

        conversation.save(function(err, newConversation) {
          if (err) {
            res.send({ error: err });
            return next(err);
          }
          
          const message = new Message({
            conversationId: newConversation._id.toString(),
            body: req.body.composedMessage,
            author: req.user._id
          });

          message.save(function(err, newMessage) {
            if (err) {
              res.send({ error: err });
              return next(err);
            }
            //TODO: redirect to conversation page or stay where the user is?
            res.redirect('/chat/'+conversation.id.toString());
          });
        });
      }
    });
}


exports.sendReply = function(req, res, next) {  
  console.log('in send reply');
  console.log(req.body);
  const reply = new Message({
    conversationId: req.params.conversationId,
    body: req.body.msg,
    author: req.user._id
  });

  reply.save(function(err, sentReply) {
    if (err) {
      res.send({ error: err });
      return next(err);
    }
    return(next);
  });
}

exports.addMember = (req, res, next) =>{
  var newMemberEmail = req.body.new_member.toString();
  //TODO: change query type
  User.findOne({'email': newMemberEmail}, (err, user) => {
    if(err){  //user not found
      throw err;
    }
    if(!user){
      res.send('No such user found');
    }else{
      //append a new participant to current participant array
      Conversation.findOne({"_id":req.params.conversationId}, (err, conversation) =>{
        if(err){throw err;}
        //if there are only two people in the private conversation, create a new group conversation
        if(conversation.participants.length == 2){
          //TODO: test this
          var p = conversation.participants;
          p.push(user._id);
          const newConvo = new Conversation({
            participants: p
          });

          newConvo.save(function(err, newConversation) {
            if (err) {
              res.send({ error: err });
              return next(err);
            }
            res.redirect('/chat/'+newConversation._id)
          });
        }else{
          conversation.participants.push(user._id);
          conversation.save((err, updatedConvo)=>{
            if(err){throw err;}
            res.status(200).send("member added sucess!");
          });
        }
      });
    }
  });
};

//TODO: delete member

// DELETE Route to Delete Conversation
exports.deleteConversation = function(req, res, next) {  
  Conversation.findOneAndRemove({
    $and : [
            { '_id': req.params.conversationId }, { 'participants': req.user._id }
           ]}, function(err) {
        if (err) {
          res.send({ error: err });
          return next(err);
        }

        res.status(200).json({ message: 'Conversation removed!' });
        return next();
  });
}

// PUT Route to Update Message
exports.updateMessage = function(req, res, next) {  
  Conversation.find({
    $and : [
            { '_id': req.params.messageId }, { 'author': req.user._id }
          ]}, function(err, message) {
        if (err) {
          res.send({ error: err});
          return next(err);
        }

        message.body = req.body.composedMessage;

        message.save(function (err, updatedMessage) {
          if (err) {
            res.send({ error: err });
            return next(err);
          }

          res.status(200).json({ message: 'Message updated!' });
          return next();
        });
  });
}