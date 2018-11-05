var ESEndPointURL = "https://search-devday2018-pxd3jcj3xwwz7ondkzqxcjbnfa.ap-northeast-1.es.amazonaws.com";
var APIGatewayURL = "https://jm3vl4r2kf.execute-api.ap-northeast-1.amazonaws.com/dev";

var table;
var cz = 0.5;
var seach_number = "";
var image_info = [];
var image_index = 0;
var image_length = 0;
var player_timer;
var elem_body;

// videos information parameters using elasticsearch
var es_vod_search_filter = {
    "from" : 0,
    "size" : 1,
    "query": {
        "bool": {
            "filter": {
                "range": {
                    "Sourceframe": {
                        "gte": 0,
                        "lte": 1000
                    }
                }
            }
        }
    },
    "sort": [
        {
            "Sourceframe": {
            "order": "asc"
            }
        }
    ]
}

function get_es_search_filter(range_min = 80, range_max = 100) {
    seach_number = $("#person_number").val().toString();
    return {
        "from" : 0,
        "size" : 10000,
        "query": {
            "bool": {
                "must": {
                    "match": {
                        "DetectedText":seach_number
                    }
                },
                "filter": {
                    "range": {
                        "Confidence": {
                            "gte": range_min,
                            "lte": range_max
                        }
                    }
                }
            }
        },
        "sort": [
            {
                "_index": {
                    "order": "asc"
                },
                "Sourceframe": {
                    "order": "asc"
                }
            }
        ]
    }
}

// Search number in Video
function search_person_number() {
    seach_number = $("#person_number").val().toString();
    $("#id_name").text( seach_number + "번 사람에 대한 검색 정보");

    $.ajax({
        method: "POST",
        url: ESEndPointURL + "/_search",
        crossDomain: true,  
        async: true,
        data: JSON.stringify(get_es_search_filter(80, 100)),
        dataType : 'json',
        contentType: 'application/json',
    }).done(function(data) {
        done_search_person_number(data);
    }).fail(function(data) {
        fail_search_person_number(data);
    });
}

function done_search_person_number( data ) {
    table.clear();
    if (data.hits.total === 0) {
        console.log(data);
        table.draw();
    }
    else {
        $.each(data.hits.hits, function(i, recv_data) {
            console.log(recv_data._source);
            image_url = recv_data._source.ImageUrl;
            drawImage(i, image_url, recv_data._source.Left, recv_data._source.Top, recv_data._source.Width, recv_data._source.Height, recv_data._source.DetectedText+" ("+ (Math.round( recv_data._source.Confidence * 100)/100) +"%)");
            table.row.add(
                [
                    recv_data._source.DetectedText,
                    recv_data._index,
                    recv_data._source.Sourceframe,
                    "<a href='"+image_url+"' target='_blank'><canvas id='myCanvas_"+i+"' width='"+(1280*cz)+"' height="+(720*cz)+" >Your browser does not support the HTML5 canvas tag.</canvas></a>",
                ]
            );
        });
        table.draw();
    }
}

function fail_search_person_number( data ) {
    table.clear();
    console.log(data);
    table.draw();
}

// draw rectangle for person information over canvas
function drawImage(i, url, x, y, w, h, text){   
    var img = new Image();
    img.onload = function(){
        console.log( this.width+' '+ this.height );
        var rx = this.width*cz;
        var ry = this.height*cz;
        var c=document.getElementById("myCanvas_"+i);
        var ctx=c.getContext("2d");
        ctx.drawImage(img,0,0, rx, ry);
        ctx.font = "bold " + (36*cz) + "px Arial";
        ctx.fillStyle = "orange";
        ctx.fillText(text, rx*x-3, ry*y-10);
        var canvas = document.getElementById("myCanvas_"+i);
        var context = canvas.getContext('2d');
        context.beginPath();
        context.rect(rx*x-3, ry*y-3, rx*w+9, ry*h+9);
        context.lineWidth = 6;
        context.strokeStyle = 'red';
        context.stroke();
    };
    img.src = url;
}


// Get Videos information
function search_video_info() {
    $.ajax({
        method: "GET",
        url: ESEndPointURL + "/_all",
        crossDomain: true,
        async: true
    }).done(function(data) {
        done_search_video_info(data);
    }).fail(function(data) {
        fail_search_video_info(data);
    });
}

function done_search_video_info(data) {
    console.log(data);
    table.clear();
    $.each(data, function(i, recv_data) {
        if (i === ".kibana") {
            return true;
        }
        $.ajax({
            method: "POST",
            url: ESEndPointURL + "/" + i + "/_search",
            crossDomain: true,  
            async: true,
            data: JSON.stringify(es_vod_search_filter),
            dataType : 'json',
            contentType: 'application/json',
        }).done(function( image_info ) {
            console.log(image_info);
            $.each(image_info.hits.hits, function(i, recv_data) {
                console.log(recv_data._source);
                table.row.add(
                    [
                        "<a href='"+recv_data._source.ImageUrl+"' target='_blank'><img id='image_"+i+"'src='"+recv_data._source.ImageUrl+"' class='img-thumbnail' /></a>",
                        recv_data._index,
                        recv_data._source.VideoLength,
                        recv_data._source.SourceVid
                    ]
                ).draw();
            });
        });                    

    });
}

function fail_search_video_info(data) {
    console.log(data);
}


// Crop the video for specific user
function search_crop_video_info() {
    elem_body = $(".panel-body");
    seach_number = $("#person_number").val().toString();
    $("#id_name").text( seach_number + "번 사람에 대한 검색 정보");
    elem_body.empty();

    $.ajax({
        method: "GET",
        url: APIGatewayURL + "?UserNumber="+$("#person_number").val(),
        crossDomain: true,
        async: true,
        contentType: 'application/json'
    }).done(function(data) {
        done_search_crop_video_info(data);
    }).fail(function(data) {
        fail_search_crop_video_info(data);
    });
}

function done_search_crop_video_info(data) {
    if (data.success_code === true) {
        $.each(data.object, function(i, value) {
            var new_elem = "<h3><a href='https://s3." + data.region_name + ".amazonaws.com/" + data.bucket_name + "/" + value.key_name + "'>" + value.file_name + "</a> 클립 동영상</h3>\
                <video id='my-video-" + i + "' controls preload='auto' width='640' height='360' data-setup='{}'>\
                    <source src='https://s3." + data.region_name + ".amazonaws.com/" + data.bucket_name + "/" + value.key_name + "' type='video/mp4'>\
                    <p class='vjs-no-js'>To view this video please enable JavaScript, and consider upgrading to a web browser that<a href='https://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a>\
                    </p>\
                </video>";
            elem_body.append(new_elem);
        });
    }
    else {
        console.log(data);
        search_crop_video();
    }
}

function fail_search_crop_video_info(data) {
    console.log("에러가 발생했습니다. Lambda 함수를 확인해 주세요.");
    console.log(data);
}

function search_crop_video() {
    elem_body = $(".panel-body");
    seach_number = $("#person_number").val().toString();
    $.ajax({
        method: "POST",
        url: ESEndPointURL + "/_search",
        crossDomain: true,  
        async: true,
        data: JSON.stringify(get_es_search_filter(80, 100)),
        dataType : 'json',
        contentType: 'application/json'
    }).done(function( data ) {
        if( data.hits.hits.length > 5) {
            elem_body.append("<p>[" + seach_number + "] 번에 대한 이미지는 존재하지만 아직 클립 동영상이 만들어지지 않았습니다.</p>");
            elem_body.append('<button type="button" class="btn btn-primary" onclick="request_crop('+ seach_number +')">[' + seach_number + "] 번에 대한 클립 동영상 제작 요청하기" + '</button>');
        }
        else {
            elem_body.append("<p>[" + seach_number + "] 해당 번호의 사람은 존재하지 않습니다.</p>");
        }
    }).fail(function( data ) {
        console.log(data);
    });
}

function request_crop(request_number) {
    elem_body = $(".panel-body");
    elem_body.empty();
    var user_data = {
        "UserNumber" : request_number
    }            
    elem_body.append("<h3>비디오를 제작중입니다. 잠시만 기다려 주세요.</h3>");
    $.ajax({
        method: "POST",
        url: APIGatewayURL,
        data: JSON.stringify(user_data),
        contentType: 'application/json; charset=utf-8',
    }).done(function( data ) {
        console.log("Job Success");
        console.log(data);
        setTimeout(search_crop_video_info, 12000);
    }).fail(function( data ) {
        console.log("Job fail");
        console.log(data);
        setTimeout(search_crop_video_info, 1000);
    });
}


function search_animation_person_number() {
    seach_number = $("#person_number").val().toString();
    $("#id_name").text( seach_number + "번 사람에 대한 검색 정보");

    $.ajax({
        method: "POST",
        url: ESEndPointURL + "/_search",
        crossDomain: true,  
        async: true,
        data: JSON.stringify(get_es_search_filter(70, 100)),
        dataType : 'json',
        contentType: 'application/json',
    }).done(function( data ) {
        if (data.hits.total === 0) {
            console.log(data);
        }
        else {
            video_length = data.hits.hits.length;
            image_info = [];
            $.each(data.hits.hits, function(i, recv_data) {
                image_info[i] = recv_data._source;
            });
            image_length = image_info.length;
            console.log(image_info);
            console.log(image_length);
            drawAnimationImage(0);
        }
    }).fail(function( data ) {
        console.log(data);
    });
}

// draw rectangle for person information over canvas
function drawAnimationImage(i) {
    cz_re = 1;
    url = image_info[i].ImageUrl;
    x = image_info[i].Left;
    y = image_info[i].Top;
    w = image_info[i].Width;
    h = image_info[i].Height;
    text = image_info[i].DetectedText + " ("+ (Math.round( image_info[i].Confidence * 100)/100) +"%)";

    var img = new Image();
    img.onload = function() {
        var rx = this.width*cz_re;
        var ry = this.height*cz_re;
        var canvas=document.getElementById("myCanvas");
        var context=canvas.getContext("2d");
        context.drawImage(img,0,0, rx, ry);
        context.font = "bold " + (36*cz_re) + "px Arial";
        context.fillStyle = "orange";
        context.fillText(text, rx*x-3, ry*y-10);
        context.beginPath();
        context.rect(rx*x-3, ry*y-3, rx*w+9, ry*h+9);
        context.lineWidth = 6;
        context.strokeStyle = 'red';
        context.stroke();
    };

    img.src = url;
    console.log(i + "번째 이미지 ");
}

// 이미지 파일들을 재생하는 로직
function image_play_forward() {
    // 기존 재생중인 타어미가 있을 경우 제거
    remove_image_timer();
    player_timer = setInterval(image_step_forward, $("#timer_ms").val());
    $("#bt_play").addClass('disabled');
    $("#bt_stop").removeClass('disabled');
}

// 이미지 파일들을 멈추는 로직
function image_stop() {
    remove_image_timer();
    $("#bt_stop").addClass('disabled');
    $("#bt_play").removeClass('disabled');
}

// 다음 이미지 파일
function image_step_forward() {
    if (++image_index >= image_length) {
        image_index = 0;
    }
    drawAnimationImage(image_index);
}

// 이전 이미지 파일
function image_step_backward() {
    if (--image_index < 0) {
        image_index = image_length - 1;
    }
    drawAnimationImage(image_index);
}

// 반복 타이머 제거
function remove_image_timer() {
    clearInterval(player_timer);
}

$(document)
    .ajaxStart(function () {
        $('#my-spinner').show();
    })
    .ajaxStop(function () {
        $('#my-spinner').hide();
});