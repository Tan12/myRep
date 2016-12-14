function route(handle, pathname, response, postData){
	console.log("about to route a request for " + pathname);
	if(typeof handle[pathname] === 'function'){
		handle[pathname](response, postData);
	} else{
		console.log("no request handle found for " + pathname);
	    response.writeHead(404, {"Content-Type" : "text/plian"});
	    response.write("404 not found");
	    response.end();
	}
}

exports.route = route;