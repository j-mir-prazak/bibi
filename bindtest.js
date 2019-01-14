//modules declaration
var spawner = require('child_process')
var StringDecoder = require('string_decoder').StringDecoder
var events = require('events')
var fs = require('fs')
var schedule = require('node-schedule')
var omx = require('node-mplayer')

var pids = new Array()

//clean up
process.on('SIGHUP',  function(){ console.log('\nCLOSING: [SIGHUP]'); process.emit("SIGINT"); })
process.on('SIGINT',  function(){
	 console.log('\nCLOSING: [SIGINT]');
	 for (var i = 0; i < pids.length; i++) {
		console.log("KILLING: " + pids[i])
		process.kill(-pids[i])
 	}
	 process.exit(0);
 })
process.on('SIGQUIT', function(){ console.log('\nCLOSING: [SIGQUIT]'); process.emit("SIGINT"); })
process.on('SIGABRT', function(){ console.log('\nCLOSING: [SIGABRT]'); process.emit("SIGINT"); })
process.on('SIGTERM', function(){ console.log('\nCLOSING: [SIGTERM]'); process.emit("SIGINT"); })

var pids = new Array();

function cleanPID(pid) {
	var pid = pid || false
	for (var i = 0; i < pids.length; i++) {
		if ( pids[i] == pid ) pids.splice(i, 1)
	}
}

var ttys = new Array()

function ls(search) {
	var search=search || false
	var ls = spawner.spawn("bash", new Array("-c", "ls " + search), {detached: true})
	var decoder = new StringDecoder('utf-8')

	pids.push(ls["pid"])

	ls.stdout.on('data', (data) => {
	  var string = decoder.write(data)
		string=string.split(/\r?\n/)
		for( var i = 0; i < string.length; i++) {
			if ( string[i].length > 0 && typeof ttys[string[i]] === "undefined") {
				var tty = {
					"tty":string[i],
					"confirmed":false,
					"position":i+1,
					"catstarted":false
				}
				ttys[string[i]] = tty
			}
		}
	});
	//not final state!
	ls.stderr.on('data', (data) => {
	  // console.log(`stderr: ${data}`)
	  // var string = decoder.write(data)
		// string = string.replace(/\r?\n$/, "")
		// if ( string.match(/^ls: cannot access/)) console.log(search + " not found")
		// return false
	});
	ls.on('close', (beta, code) => {
		console.log(code)
		console.log(beta)
		cleanPID(ls["pid"])
		if (code == 0) {
			for ( i in ttys ) {
				if ( ! ttys[i]["catstarted"] ) {
					// console.log(ttys[i])
				}
				else "nothing to cat"
			}
		}
		else {
			console.log(search + ' not to be found')
		}
	}.bind(null, "alfa"));
	return ls;
}

ls("/home/debian/Downloads/")
