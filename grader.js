#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var rest = require('restler');


var assertFileExists = function(infile) {

	var instr = infile.toString();
	if(!fs.existsSync(instr)) {
		console.log("%s does not exist.Exiting.", instr);
		process.exit(1);

	}
	return instr;
};

var cheerioHtmlFile = function(htmlfile) {
	return cheerio.load(fs.readFileSync(htmlfile));
};


var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile));
};

var CompareHTMLToChecks = function($, checks) {
	var out = {};
	for(var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;

}
	return out;
};

var checkHtmlURL = function(htmlurl, checksfile) {
	rest.get(htmlurl).on('complete', function(data, response) {
		var checks = loadChecks(checksfile).sort();
		$ = cheerio.load(data);
		var out = CompareHTMLToChecks($, checks);
	 	var outJson = JSON.stringify(out, null, 4);
		console.log(outJson);		

});
};


var checkHtmlFile = function(htmlfile, checksfile) {
	$ = cheerioHtmlFile(htmlfile);	
	var checks = loadChecks(checksfile).sort();
	return CompareHTMLToChecks($, checks);
};



var clone = function(fn) {
	return fn.bind({});
}

if(require.main == module) {
	program
		.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
		.option('-f, --file <html_file>', 'Path to html file', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <http_url>', 'URL Path')
		.parse(process.argv);

	if(program.file) {
		var checkJson = checkHtmlFile(program.file, program.checks);
		outJson = JSON.stringify(checkJson, null, 4);
		console.log(outJson);
	}	
	
	if(program.url) {
		var checkJson = checkHtmlURL(program.url,program.checks);
	}		
} else {


}
