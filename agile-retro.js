//TODO
//CSS
//DELETING NOTES
//DELETING LINES
//EDITING LINES
//REORDERING??
//Propogate Note Location
var Notes = new Meteor.Collection("notes"),
    boardid,
    noteno=0
    clientid;

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}



if (Meteor.isClient) {
    var boardid=10,
        clientid=makeid();
   
   Template.main.allnotes=function(){
   return Notes.find({board:'board','note':{"$exists":false}});
   }

   Template.main.rendered=function(){
       $(".note").draggable();
}
   Template.main.events({
    'click #add': function(e) {
        //TODO: Make this largest noteid +1
        var boardNoteCount=getNoteCount('board');//Notes.find({board:'board'}).count(),
        noteId='inp-'+(boardNoteCount);
        Notes.insert({id:noteId,title:"New Note",board:'board',notecount:boardNoteCount+1});
         }

   });


  Template.notes.messages=function(){
       var messages =  Notes.find({board:'board',id:this.id,note:{"$exists":true}});
       return messages
  }

  Template.notes.noteid=function(){
    return  this.id;
  }
  Template.notes.notedivid=function(){
    return  this.id;
  }

  Template.notes.title=function(){
   var note =  Notes.findOne({board:'board',id:this.id,note:{"$exists":false}});
   return note.title;
  }
    Template.main.noteid=function(){
    return "note-"+this.id;
  }


  Template.notes.events({
    'mouseup .note': function(e){
    var current=Notes.findOne({board:'board',id:e.currentTarget.id,note:{"$exists":false}});
    alert($('#'+e.currentTarget.id).offset().top);
    $('#'+e.currentTarget.id).css({'position':'absolute', 'left':'200px','top':'200px'});

    },
    'keyup .newline': function(e) {

        var noteno=getNoteLineCount('board',e.target.id),
        code = (e.keyCode ? e.keyCode : e.which);
        if(code == 13) {
              noteno+=1;
              $('#'+e.target.id).val("");
         }
        var current=Notes.findOne({clientid:clientid,noteno:noteno,id:e.target.id,board:'board','note':{"$exists":true}});

               
                
 if (current==null) {
           Notes.insert({clientid:clientid,noteno:noteno,id:e.target.id,board:'board',note : e.currentTarget.value});
       }
       else{
            Notes.update({_id:current._id},{ $set: { note :  e.currentTarget.value }});
       }

       if(code == 13) {
            $('#'+e.target.id).val("");
         }   
          }
               

  });
}


if (Meteor.isServer) {
  Meteor.startup(function () {
  
  });
}


//////GENERIC HELPER METHODS/////////
var getNoteLineCount=function(boardid,id){
var note=Notes.findOne({board:boardid,id:id,'note':{"$exists":true}},{sort: {'noteno': -1}});
if (note==null)
{
 return 0;
}
return note.noteno
}

var getNoteCount=function(boardid){
var note=Notes.findOne({board:boardid,'note':{"$exists":false}},{sort: {'notecount': -1}});
if (note==null)
{
 return 0;
}
return (note.notecount)

}


