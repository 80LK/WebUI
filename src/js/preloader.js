LoadEvent.addHandler(()=>{
	let preloader = document.getElementById("preloader");
	if(preloader){
		preloader.remove();
		delete preloader;
	}

	document.body.classList.remove("loading");
}, 9999)