LoadEvent.addHandler(function(){
	document.querySelectorAll(".input-group").forEach( group => {
		group.querySelectorAll("input, .select").forEach( e => {
			e.addEventListener("focus", (ev) => {console.log(ev); group.classList.add("focus")} )
			e.addEventListener("blur", () => group.classList.remove("focus") )
		})
	})
});