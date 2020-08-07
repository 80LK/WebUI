LoadEvent.addHandler(function(){
	let span;
	
	function hideWave(e){
		if(!span) return;
		
		span.classList.add("btn--wave--hidding");
		setTimeout((function(){
			this.remove();
		}).bind(span), 500);
		span = null;
	}

	document.querySelectorAll(".btn").forEach(
	el => {

		el.addEventListener('mousedown', function(e){
			span = document.createElement("span");
			span.classList.add("btn--wave");

			let box = this.getBoundingClientRect();

			span.style.setProperty("--radius", (Math.ceil(box.width > box.height ? box.width : box.height) * 2) + "px");

			span.style.left = (e.pageX - window.pageXOffset - box.left) + "px";
			span.style.top = (e.pageY - window.pageYOffset - box.top) + "px";

			this.appendChild(span);
		}, false);

		el.addEventListener('mouseup', hideWave, false);
		el.addEventListener('mouseleave', hideWave, false);
	})
});