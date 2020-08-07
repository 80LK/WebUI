LoadEvent.addHandler(()=>{
	let preloader = document.getElementById("preloader");
	if(preloader)
		preloader.remove();
		setTimeout(preloader.remove.bind(preloader), 3000)

	document.body.classList.remove("loading");
}, 9999)