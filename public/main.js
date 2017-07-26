$(document)
    .ready(function() {

        // fix main menu to page on passing
        $('.main.menu').visibility({
            type: 'fixed'
        });
        $('.overlay').visibility({
            type: 'fixed',
            offset: 80
        });

        // lazy load images
        $('.image').visibility({
            type: 'image',
            transition: 'vertical flip in',
            duration: 500
        });

        // show dropdown on hover
        $('.main.menu  .ui.dropdown').dropdown({
            on: 'hover'
        });

    });


var socket = io();
socket.on('new title', function(text) {
    console.log(text);
    var str = `<div class="ui piled segment">\
         <h4 class="ui header">$"new title: "</h4>\
        <p>${text.body}</p>`
    $('#reqs').append(str);
});

var socket = io();
