//TODO
//[x] CSS
//[x] DELETING NOTES
//[x] DELETING LINES
//[x] EDITING TITLES
//[x] EDITING LINES
//[?] REORDERING??
//[x] Propogate Note Location
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
       $(".note").resizable();
       $(".note").draggable({ containment: "content" });
    }
    Template.main.created=function(){
        setInterval(runInterval,2000);
    }
   Template.main.events({
    'click #add': function(e) {
        var boardNoteCount=getNoteCount('board');
        noteId='inp-'+(boardNoteCount);
        var left=Math.floor(Math.random()*100)+300;
        Notes.insert({id:noteId,title:"New Note",height: '300px',width:'300px',left:'100px',top:'100px',board:'board',notecount:boardNoteCount+1});
         }

   });


  Template.notes.messages=function(){
       var messages =  Notes.find({board:'board',id:this.id,note:{"$exists":true,"$ne" : ""}});
       return messages
  }

  Template.notes.noteid=function(){
    return  this.id;
  }

  Template.notes.leftposition=function(){
       var note =  Notes.findOne({board:'board',id:this.id,note:{"$exists":false}});
       return note.left;

  }
  
  Template.notes.topposition=function(){
       var note =  Notes.findOne({board:'board',id:this.id,note:{"$exists":false}});
        return note.top;

  }
  Template.notes.height=function(){
       var note =  Notes.findOne({board:'board',id:this.id,note:{"$exists":false}});
    return note.height;

  }
  Template.notes.width=function(){
       var note =  Notes.findOne({board:'board',id:this.id,note:{"$exists":false}});
        return note.width;

  }

Template.notes.style=function(){
     var note =  Notes.findOne({board:'board',id:this.id,note:{"$exists":false}});

    return "min-height:"+ note.height+"; left:"+note.left+";  min-width:"+note.width+"; top:"+note.top;
}

  Template.notes.notedivid=function(){
    return  this.id;
  }

  Template.notes.title=function(){
   var note =  Notes.findOne({board:'board',id:this.id,note:{"$exists":false}});
   return note.title;
  }
  Template.notes.lineid=function(){
    return this.id;
  }
    Template.main.noteid=function(){
    return "note-"+this.id;
  }


  Template.notes.events({
    'mouseup .note': function(e){
    var current=Notes.findOne({board:'board',id:e.currentTarget.id,note:{"$exists":false}}),
        heightpx=parseInt($('#'+e.currentTarget.id).height())-21+'px',
        widthpx=$('#'+e.currentTarget.id).width()+'px',
        toppx=$('#'+e.currentTarget.id).offset().top+'px',
        leftpx=$('#'+e.currentTarget.id).offset().left+'px';
    if(current.height!= heightpx || current.width!= widthpx || current.left != leftpx || current.top != toppx)
        {
        Notes.update({_id:current._id},{ $set: { 'height':heightpx,'width':widthpx,'top':toppx,'left' : leftpx }});

        }

    },
    'keyup .newline': function(e) {

        var noteno=getNoteLineCount('board',e.target.id),
        code = (e.keyCode ? e.keyCode : e.which);
        if(code == 13) {
            if(e.currentTarget.value.trim()!="")
            {
              noteno+=1;
              $('input#'+e.currentTarget.id).val("");
            }
         }
        var current=Notes.findOne({clientid:clientid,noteno:noteno,id:e.target.id,board:'board','note':{"$exists":true}});

 if (current==null) {
           Notes.insert({clientid:clientid,noteno:noteno,id:e.target.id,board:'board',note : e.currentTarget.value});
       }
       else{
            Notes.update({_id:current._id},{ $set: { note :  e.currentTarget.value }});
       }

       if(code == 13) {
            $('input#'+e.currentTarget.id).val("");
         }   
          },
    'mouseup .del':function(e){
        var a=e.target.parentNode.parentNode.parentNode.id;
        var notes=Notes.find({id:a,board:'board'});
        notes.forEach(function(note){
        Notes.remove({_id:note._id});
        });
    
    },
    'mouseup .del-line':function(e){
    var lineno=e.target.parentNode.id.substring(5),
        noteid=e.target.parentNode.parentNode.parentNode.id;
    var currentLine=Notes.findOne({noteno:parseInt(lineno),id:noteid,board:'board'});
    if(currentLine!=null)
        Notes.remove({_id:currentLine._id});


    },
    'dblclick .title':function(e){
    $("#"+e.target.parentNode.parentNode.id+" .edit-title").show();
    $("#"+e.target.parentNode.parentNode.id+" .title-editor").focus();
    $("#"+e.target.parentNode.parentNode.id+" .title").hide();
    },
    'keypress .title-editor':function(e){
       var code = (e.keyCode ? e.keyCode : e.which);
       if(code ==13)
       {
            var current=Notes.findOne({id:e.target.parentNode.parentNode.parentNode.id,board:'board','note':{"$exists":false}});
             Notes.update({_id:current._id},{ $set: { title :  e.currentTarget.value }});


       }
       else if(code ==27)
       {
    $("#"+e.target.parentNode.parentNode.parentNode.id+" .edit-title").hide();
    $("#"+e.target.parentNode.parentNode.parentNode.id+" .title").show();
 
        }
    },
        'dblclick .line':function(e){
    var editor='#'+e.target.parentNode.parentNode.id+'.note #edit-'+e.target.id.substring(5);

    $(editor).show();
    var text=$(e.currentTarget).text();
    $(editor+" .line-editor").val(text.substring(0,text.length-1)).focus();
    $("#"+e.target.parentNode.parentNode.id+" #"+e.target.id+".line").hide();
    },
    'keypress .line-editor':function(e){
       var code = (e.keyCode ? e.keyCode : e.which);
       var linenumber=e.target.parentNode.id.substring(5);
       if(code ==13)
       {
            var current=Notes.findOne({noteno:parseInt(linenumber),id:e.target.parentNode.parentNode.parentNode.id,board:'board','note':{"$exists":true}});
             Notes.update({_id:current._id},{ $set: { note :  e.currentTarget.value }});
            $("#"+e.target.parentNode.id).hide();
           $("#"+e.target.parentNode.parentNode.parentNode.id+" .line").show();


       }
       else if(code ==27)
       {
    $("#"+e.target.parentNode.parentNode.parentNode.id+" .edit-line").hide();
    $("#"+e.target.parentNode.parentNode.parentNode.id+" .line").show();
 
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

var runInterval=function(){
       $(".note").resizable("destroy");
       $(".note").resizable();
       $(".note").draggable({ containment: "content" });
    }
