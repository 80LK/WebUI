LoadEvent.addHandler(function(){
	document.querySelectorAll(".btn").forEach(
	el => el.addEventListener("click", function(e){
		let span = document.createElement("span");
		span.classList.add("btn--wave");
		let root = e.target.closest(".btn");

		let box = root.getBoundingClientRect();

		span.style.left = (e.pageX - window.pageXOffset - box.left) + "px";
		span.style.top = (e.pageY - window.pageYOffset - box.top) + "px";

		this.appendChild(span);
		setTimeout(()=>span.remove(), 1200)
	}))
});