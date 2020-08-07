const LoadEvent = {
	__handlers:[],
	addHandler:function(handler, priority = 10){
		if(typeof handler != "function")
			return console.warn(new Error("LoadEvent.addHandler accepts only the function"));

		LoadEvent.__handlers.push([priority, handler]);
	},
	__init:function(){
		addEventListener("load", ()=>LoadEvent.__handlers.sort((a,b)=> a[0] > b[0] ? 1 : -1).forEach(handle=>handle[1]()));
	}
};
LoadEvent.__init();