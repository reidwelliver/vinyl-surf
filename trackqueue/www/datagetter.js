var SSR = [];
var apikey = "AIzaSyAztbAWiJbAnn6JQ5hJ5oLEDYf7eW2mY0k";


var socket = io.connect(':12381/track');






//Could merge, like having the button
function OutputResults(object_to_output) {

  SSR["0"].Title = document.getElementById("Theonlyform").elements[1].value;
  //gets name of playlist for output

//done here
 console.log(SSR);
socket.emit('message',
    SSR["0"]
  );
    document.getElementById('box1').innerHTML="<textarea rows='40' cols='100'>"+JSON.stringify(SSR) +"</textarea>";
}



function YoutubeInfo(id) {


  var form_fields = document.getElementById("Theonlyform");

  test_url = form_fields.elements[0].value;

  //I don't know why I keep doing this
  var working_url = test_url ;

  //this is for that library
  var uri = new URI(working_url);
  var hostname = uri.domain();
  var ending;
  var video_id;

  if(hostname =="youtube.com") {

       ending = uri.search(true);

      //this splits the youtube url and gives everything after the v.
      //produces this ZEvQOPUHGH8 from www.youtube.com/watch?v=ZEvQOPUHGH8
      //this is also where the part of the future array
      //where it indicates which API it need

      video_id = ending["v"];



  }

  //you know what's cool? youtube has two urls
  else if(hostname =="youtu.be") {

      //and the other one doesn't contain the v part
       ending = uri.segment(0);
       video_id = ending;
  }



    //yeah I'm not sure why youtube uses data.data. their json is weird
    $.getJSON('https://www.googleapis.com/youtube/v3/videos?id='+video_id+'&key='+apikey+'&part=snippet,contentDetails,status')
                //ytitle is the id of the area the title goes on the main page


              .done(function(data,status,xhr) {

                //gets the title, embedableness and length in an iso format
                var ytitle = data.items[0].snippet.title;
                var longness = data.items[0].contentDetails.duration;
                var embedableness = data.items[0].status.embeddable;
                if (embedableness == false){

                  console.log("That won't work homes");

                }

                //dear google, iso formats are cool and all but I need
                //seconds, thisremoves the PT from the string
                var minusPT = longness.substr(2);


                //Other fun fact, it doesn't just return 0 for missing
                //fields so you gotta check 'em all
                var hour = minusPT.search("H");
                var minute=minusPT.search("M");
                var second=minusPT.search("S");
                var has_time= 0;
                var total_seconds = 0;

                //checks to see if that part of the string excists
                if(hour != "-1") {
                    var hour_split = minusPT.split("H");
                    has_time= 1;
                }

                if(minute != "-1") {
                    var minute_split = minusPT.split("M");
                    has_time = has_time + 2;
                }

                if(second != "-1") {
                    var second_split = minusPT.split("S");
                    has_time = has_time + 4;
                }


                //converts to seconds for any combination!
                switch(has_time) {
                    case 7:
                        var hour_to_seconds = parseInt(hour_split[0])*60*60;
                        var minute_to_seconds = parseInt(minute_split[0].substr(2))*60;
                        var seconds = parseInt(second_split[0].substr(5));
                        total_seconds = hour_to_seconds+minute_to_seconds+seconds;
                        break;
                    case 6:
                        var minute_to_seconds = parseInt(minute_split[0])*60;
                        var seconds = parseInt(second_split[0].substr(2));
                        total_seconds = minute_to_seconds+seconds;

                        break;
                    case 5:
                        var hour_to_seconds = parseInt(hour_split[0])*60*60;
                        var seconds = parseInt(second_split[0].substr(2));
                        total_seconds = hour_to_seconds+seconds;

                        break;
                    case 4:
                        var seconds = parseInt(second_split[0]);
                        total_seconds = seconds;
                        break;
                    case 3:
                        var hour_to_seconds = parseInt(hour_split[0])*60*60;
                        var minute_to_seconds = parseInt(minute_split[0].substr(2))*60;
                        total_seconds = hour_to_seconds+seconds;

                        break;
                    case 2:
                        var minute_to_seconds = parseInt(minute_split[0])*60;
                        total_seconds = minute_to_seconds;

                        break;
                    case 1:
                        var hour_to_seconds = parseInt(hour_split[0])*60*60;
                        total_seconds = hour_to_seconds;

                        break;


                }

                var video_data = {id: video_id, title: ytitle, length: total_seconds, embed: embedableness };
                editTitle(video_data);






        })
}
function editTitle(VIDEODATA){

  document.getElementById("Theonlyform").elements[1].value = VIDEODATA["title"];
  document.getElementById('Message').innerHTML="Edit the title before hitting the other button to send";

  SSR.push({
  "URL" : VIDEODATA.id,
   "Title" : VIDEODATA.title,
   "Length" : VIDEODATA.length
   });



}
